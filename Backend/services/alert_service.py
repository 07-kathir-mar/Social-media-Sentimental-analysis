import re
from collections import Counter
from datetime import datetime

from pymongo import DESCENDING
from pymongo.collection import Collection

from config import ALERTS_HISTORY_COLLECTION, COMMENTS_PROCESSED_COLLECTION
from db import get_database


STOPWORDS = {
    "the",
    "is",
    "and",
    "a",
    "to",
    "of",
    "it",
    "this",
    "that",
    "with",
    "for",
    "are",
    "was",
    "have",
    "has",
    "from",
    "they",
    "them",
    "their",
    "users",
    "user",
    "about",
}

REASON_GROUPS = {
    "delivery": {"delivery", "shipping", "shipment", "delay", "dispatch", "logistics"},
    "support": {"support", "service", "agent", "help", "refund", "response"},
}

TAG_MAPPING = {
    "delivery": ["Logistics"],
    "support": ["Customer Service"],
}

TITLE_MAPPING = {
    "delivery": "Shipping delay conversation is accelerating",
    "support": "Customer complaints rising rapidly",
}


class AlertService:
    def __init__(self):
        database = get_database()
        self.comments_processed: Collection = database[COMMENTS_PROCESSED_COLLECTION]
        self.alerts_history: Collection = database[ALERTS_HISTORY_COLLECTION]

    def get_alerts(self, brand: str) -> dict:
        normalized_brand = brand.strip()
        query = {"brand": {"$regex": f"^{normalized_brand}$", "$options": "i"}}
        raw_alerts = list(self.alerts_history.find(query, {"_id": 0}))
        alerts = sorted(
            [self._normalize_alert(item, normalized_brand) for item in raw_alerts],
            key=lambda item: self._alert_sort_key(item.get("created_at")),
            reverse=True,
        )[:12]

        return {
            "current": alerts[:2],
            "history": alerts[2:12],
        }

    def check_and_store_alert(self, brand: str) -> None:
        normalized_brand = brand.strip()
        query = {"brand": {"$regex": f"^{normalized_brand}$", "$options": "i"}}
        comments = list(
            self.comments_processed.find(query).sort("created_at", DESCENDING).limit(20)
        )

        if not comments:
            return

        negative_streak = 0
        streak_comments: list[dict] = []

        for comment in comments:
            if str(comment.get("sentiment", "")).lower() != "negative":
                break
            negative_streak += 1
            streak_comments.append(comment)

        alert_type = self._resolve_alert_type(negative_streak)
        if alert_type is None:
            return

        reason = self._extract_reason(streak_comments)
        latest_comment_time = comments[0].get("created_at") or datetime.utcnow()

        alert = {
            "brand": comments[0].get("brand", normalized_brand),
            "type": alert_type,
            "title": self._build_title(reason),
            "description": self._build_description(reason),
            "tags": self._build_tags(reason),
            "count": negative_streak,
            "created_at": latest_comment_time,
        }

        self._store_alert(alert)

    def _resolve_alert_type(self, negative_streak: int) -> str | None:
        if negative_streak >= 8:
            return "critical"
        if negative_streak >= 5:
            return "high"
        if negative_streak >= 3:
            return "medium"
        return None

    def _extract_reason(self, comments: list[dict]) -> str:
        counter = Counter()

        for comment in comments:
            cleaned = re.sub(r"[^\w\s]", " ", str(comment.get("text", "")).lower())
            words = [
                word
                for word in cleaned.split()
                if word and word not in STOPWORDS and len(word) > 2
            ]
            counter.update(self._normalize_reason(word) for word in words)

        if not counter:
            return "general"

        return counter.most_common(1)[0][0]

    def _normalize_reason(self, word: str) -> str:
        for reason, variants in REASON_GROUPS.items():
            if word in variants:
                return reason
        return word

    def _build_title(self, reason: str) -> str:
        if reason in TITLE_MAPPING:
            return TITLE_MAPPING[reason]
        normalized = reason.replace("_", " ").strip()
        if not normalized or normalized == "general":
            return "Customer complaints rising rapidly"
        return f"{normalized.title()} complaints rising rapidly"

    def _build_description(self, reason: str) -> str:
        normalized = reason.replace("_", " ").strip() or "general"
        return (
            "Negative mention velocity increasing. "
            f"Users frequently reporting issues related to '{normalized}'."
        )

    def _build_tags(self, reason: str) -> list[str]:
        return TAG_MAPPING.get(reason, ["General"])

    def _normalize_alert(self, alert: dict, brand: str) -> dict:
        created_at = alert.get("created_at") or alert.get("timestamp") or datetime.utcnow()
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            except ValueError:
                created_at = datetime.utcnow()
        title = alert.get("title")
        description = alert.get("description")

        if not title and alert.get("message"):
            title = "Customer complaints rising rapidly"
            description = alert["message"]

        return {
            "brand": alert.get("brand", brand),
            "type": str(alert.get("type") or "medium").lower(),
            "title": title or "Customer complaints rising rapidly",
            "description": description or "Negative mention velocity increasing.",
            "tags": alert.get("tags") or ["General"],
            "count": int(alert.get("count", 0)),
            "created_at": created_at,
        }

    def _store_alert(self, alert: dict) -> None:
        existing = self.alerts_history.find_one(
            {
                "brand": alert["brand"],
                "type": alert["type"],
                "title": alert["title"],
                "count": alert["count"],
                "created_at": alert["created_at"],
            }
        )

        if existing:
            return

        self.alerts_history.insert_one(alert)

    def _alert_sort_key(self, value: datetime | None) -> float:
        if not value:
            return 0.0
        try:
            return value.timestamp()
        except (AttributeError, OSError, OverflowError, ValueError):
            return 0.0


alert_service = AlertService()

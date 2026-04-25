from datetime import datetime, timedelta
from typing import Any, Dict, List

from pymongo.collection import Collection

from config import SENTIMENT_12H_COLLECTION
from db import get_database


class ThoughtsService:
    def __init__(self):
        database = get_database()
        self.sentiment_col: Collection = database[SENTIMENT_12H_COLLECTION]
        self.zones_col: Collection = database["sentimental_zones"]

    def get_custom_analysis(
        self, brand: str, from_time: datetime, to_time: datetime
    ) -> Dict[str, Any]:
        query = {
            "brand": {"$regex": f"^{brand.strip()}$", "$options": "i"},
            "start_time": {"$gte": from_time},
            "end_time": {"$lte": to_time},
        }
        records = list(self.sentiment_col.find(query).sort("start_time", 1))

        if not records:
            return {
                "graph": [],
                "explanation": {
                    "summary": "No sentiment_12h records were found for the selected period.",
                    "trend": "stable",
                },
            }

        graph = [
            {
                "time": self._format_graph_time(record),
                "score": float(record.get("avg_score", 0.0)),
                "shortLabel": self._format_short_label(record),
            }
            for record in records
        ]

        explanation_parts = [
            str(record.get("explanation", "")).strip()
            for record in records
            if str(record.get("explanation", "")).strip()
        ]
        summary = " ".join(explanation_parts) or "No explanation is available for this period."

        return {
            "graph": graph,
            "explanation": {
                "summary": summary,
                "trend": self._determine_trend(records),
            },
        }

    def update_sentimental_zones(self, brand: str) -> List[Dict[str, Any]]:
        brand_value = brand.strip()
        start_cutoff = datetime.utcnow() - timedelta(days=180)
        query = {
            "brand": {"$regex": f"^{brand_value}$", "$options": "i"},
            "start_time": {"$gte": start_cutoff},
        }
        records = list(self.sentiment_col.find(query).sort("start_time", 1))

        zones: List[Dict[str, Any]] = []
        if len(records) < 3:
            self.zones_col.delete_many({"brand": {"$regex": f"^{brand_value}$", "$options": "i"}})
            return zones

        window_size = 3
        current_zone: Dict[str, Any] | None = None

        for index in range(len(records) - window_size + 1):
            window = records[index:index + window_size]
            window_scores = [float(item.get("avg_score", 0.0)) for item in window]
            avg_window_score = sum(window_scores) / len(window_scores)
            zone_type = self._classify_zone(avg_window_score)

            if current_zone and current_zone["zone_type"] == zone_type:
                current_zone["end_time"] = window[-1]["end_time"]
                current_zone["scores"].append(avg_window_score)
            else:
                if current_zone:
                    zones.append(self._finalize_zone(current_zone))

                current_zone = {
                    "brand": brand_value,
                    "zone_type": zone_type,
                    "start_time": window[0]["start_time"],
                    "end_time": window[-1]["end_time"],
                    "scores": [avg_window_score],
                }

        if current_zone:
            zones.append(self._finalize_zone(current_zone))

        self.zones_col.delete_many({"brand": {"$regex": f"^{brand_value}$", "$options": "i"}})
        if zones:
            self.zones_col.insert_many(zones)

        return zones

    def get_sentimental_zones(self, brand: str) -> List[Dict[str, Any]]:
        query = {"brand": {"$regex": f"^{brand.strip()}$", "$options": "i"}}
        zones = list(self.zones_col.find(query, {"_id": 0}).sort("start_time", 1))
        if zones:
            return zones
        return self.update_sentimental_zones(brand)

    def get_thoughts(self, brand: str) -> List[Dict[str, Any]]:
        zones = self.get_sentimental_zones(brand)
        return [
            {
                "topic": zone["zone_type"].lower(),
                "sentiment": zone["zone_type"],
                "summary": zone["summary"],
                "count": 1,
            }
            for zone in zones
        ]

    def _determine_trend(self, records: List[Dict[str, Any]]) -> str:
        first_score = float(records[0].get("avg_score", 0.0))
        last_score = float(records[-1].get("avg_score", 0.0))
        delta = last_score - first_score
        threshold = 0.05

        if delta > threshold:
            return "positive"
        if delta < -threshold:
            return "negative"
        return "stable"

    def _classify_zone(self, avg_score: float) -> str:
        if avg_score > 0.3:
            return "Positive"
        if avg_score < -0.3:
            return "Negative"
        return "Neutral"

    def _finalize_zone(self, zone: Dict[str, Any]) -> Dict[str, Any]:
        avg_score = sum(zone["scores"]) / len(zone["scores"])
        return {
            "brand": zone["brand"],
            "zone_type": zone["zone_type"],
            "start_time": zone["start_time"],
            "end_time": zone["end_time"],
            "avg_score": avg_score,
            "summary": self._build_zone_summary(zone["zone_type"], avg_score),
        }

    def _build_zone_summary(self, zone_type: str, avg_score: float) -> str:
        if zone_type == "Positive":
            return f"Strong positive sentiment period with an average score of {avg_score:.2f}."
        if zone_type == "Negative":
            return f"Sustained negative sentiment period with an average score of {avg_score:.2f}."
        return f"Balanced sentiment period with an average score of {avg_score:.2f}."

    def _format_graph_time(self, record: Dict[str, Any]) -> str:
        start_time = record.get("start_time")
        end_time = record.get("end_time")
        if isinstance(start_time, datetime) and isinstance(end_time, datetime):
            return f"{start_time.isoformat()} to {end_time.isoformat()}"
        return str(record.get("time_window") or start_time or "")

    def _format_short_label(self, record: Dict[str, Any]) -> str:
        start_time = record.get("start_time")
        if isinstance(start_time, datetime):
            return start_time.strftime("%d %b %H:%M")
        return str(record.get("time_window") or "")


thoughts_service = ThoughtsService()

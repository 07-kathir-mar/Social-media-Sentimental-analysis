from datetime import datetime, timedelta
from typing import Any

from pymongo.collection import Collection

from config import SENTIMENT_12H_COLLECTION
from db import get_database


class ForecastService:
    def __init__(self):
        database = get_database()
        self.sentiment_12h: Collection = database[SENTIMENT_12H_COLLECTION]

    def get_forecast(self, brand: str) -> dict[str, Any]:
        points = self._fetch_recent_points(brand)
        return self._build_forecast(points, scenario=None)

    def get_forecast_simulation(self, brand: str, scenario: str) -> dict[str, Any]:
        points = self._fetch_recent_points(brand)
        return self._build_forecast(points, scenario=scenario)

    def _fetch_recent_points(self, brand: str) -> list[dict]:
        query = {"brand": {"$regex": f"^{brand.strip()}$", "$options": "i"}}
        return list(self.sentiment_12h.find(query).sort("start_time", -1).limit(7))

    def _build_forecast(self, points: list[dict], scenario: str | None) -> dict[str, Any]:
        if not points:
            return {
                "graph": [],
                "explanation": {
                    "title": "Forecast unavailable",
                    "summary": "Not enough sentiment_12h data is available to generate a forecast.",
                    "drivers": [],
                },
            }

        ordered_points = list(reversed(points))
        score_series = [self._extract_sentiment_value(point) for point in ordered_points]
        trend = self._determine_trend(score_series)
        last_score = score_series[-1]
        step = self._trend_step(score_series, trend)
        shift = 0.2 if scenario else 0.0
        future_graph = []

        anchor_time = self._extract_point_time(ordered_points[-1]) or datetime.utcnow()
        current_score = last_score

        for index in range(14):
            current_score = self._next_score(current_score, step, trend, index)
            adjusted_score = max(-1.0, min(1.0, current_score + shift))
            target_date = anchor_time + timedelta(days=index + 1)
            future_graph.append(
                {
                    "id": f"forecast-{index + 1}",
                    "date": target_date.isoformat(),
                    "day": target_date.strftime("%b %d"),
                    "fullDate": target_date.strftime("%A, %B %d, %Y"),
                    "score": self._normalize_score(adjusted_score),
                }
            )

        explanation = self._build_explanation(trend, scenario)
        return {
            "graph": future_graph,
            "explanation": explanation,
        }

    def _extract_sentiment_value(self, point: dict) -> float:
        avg_score = point.get("avg_score")
        if isinstance(avg_score, (int, float)) and -1.0 <= float(avg_score) <= 1.0:
            return float(avg_score)

        normalized_score = point.get("normalized_score")
        if isinstance(normalized_score, (int, float)):
            return max(-1.0, min(1.0, float(normalized_score)))

        if isinstance(avg_score, (int, float)):
            return max(-1.0, min(1.0, float(avg_score)))

        return 0.0

    def _extract_point_time(self, point: dict) -> datetime | None:
        return point.get("created_at") or point.get("start_time") or point.get("end_time")

    def _determine_trend(self, score_series: list[float]) -> str:
        if len(score_series) < 2:
            return "stable"

        delta = score_series[-1] - score_series[0]
        if delta > 0.08:
            return "increasing"
        if delta < -0.08:
            return "decreasing"
        return "stable"

    def _trend_step(self, score_series: list[float], trend: str) -> float:
        if len(score_series) < 2:
            return 0.03

        raw_step = abs((score_series[-1] - score_series[0]) / max(len(score_series) - 1, 1))
        if trend == "stable":
            return max(0.02, raw_step)
        return max(0.03, raw_step)

    def _next_score(self, current_score: float, step: float, trend: str, index: int) -> float:
        if trend == "increasing":
            return min(1.0, current_score + step)
        if trend == "decreasing":
            return max(-1.0, current_score - step)

        direction = 1 if index % 2 == 0 else -1
        return max(-1.0, min(1.0, current_score + direction * min(step, 0.04)))

    def _normalize_score(self, avg_score: float) -> int:
        return int((avg_score + 1) * 50)

    def _build_explanation(self, trend: str, scenario: str | None) -> dict[str, Any]:
        if trend == "increasing":
            title = "Forecast points to continuing positive momentum"
            summary = "Recent sentiment_12h points are rising, so the projection continues upward over the next 14 days."
            drivers = [
                {
                    "name": "Delivery",
                    "impact": "+6 pts",
                    "desc": "Improving operational tone supports the upward direction in the forecast.",
                },
                {
                    "name": "Product Quality",
                    "impact": "+3 pts",
                    "desc": "Steadier product discussion helps maintain positive carry-over.",
                },
            ]
        elif trend == "decreasing":
            title = "Forecast suggests pressure may continue"
            summary = "Recent sentiment_12h points are falling, so the projection extends that downward movement over the next 14 days."
            drivers = [
                {
                    "name": "Delivery",
                    "impact": "-6 pts",
                    "desc": "Operational complaints are the clearest source of downward pressure.",
                },
                {
                    "name": "Product Quality",
                    "impact": "-1 pt",
                    "desc": "Mixed quality discussion adds smaller negative drag to the outlook.",
                },
            ]
        else:
            title = "Forecast remains broadly stable"
            summary = "Recent sentiment_12h points are stable, so the projection keeps a slight oscillation around the current level."
            drivers = [
                {
                    "name": "Delivery",
                    "impact": "+1 pt",
                    "desc": "Operational discussion is steady and not forcing a large directional move.",
                },
                {
                    "name": "Product Quality",
                    "impact": "-1 pt",
                    "desc": "Minor variance in product discussion creates small day-to-day movement.",
                },
            ]

        if scenario:
            title = f"{title} under {scenario.replace('_', ' ')}"
            summary = (
                f"{summary} A deterministic +10 point scenario shift was applied for '{scenario}'."
            )

        return {
            "title": title,
            "summary": summary,
            "drivers": drivers,
        }


forecast_service = ForecastService()

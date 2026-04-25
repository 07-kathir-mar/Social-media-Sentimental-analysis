import math
import re
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
        points = self._fetch_training_points(brand)
        return self._build_forecast(points, scenario=None)

    def get_forecast_simulation(self, brand: str, scenario: str) -> dict[str, Any]:
        points = self._fetch_training_points(brand)
        return self._build_forecast(points, scenario=scenario)

    def _fetch_training_points(self, brand: str) -> list[dict]:
        query = {"brand": {"$regex": f"^{re.escape(brand.strip())}$", "$options": "i"}}
        return list(self.sentiment_12h.find(query).sort("start_time", 1))

    def _build_forecast(self, points: list[dict], scenario: str | None) -> dict[str, Any]:
        series = self._prepare_series(points)
        if len(series) < 4:
            return {
                "graph": [],
                "explanation": {
                    "title": "Forecast unavailable",
                    "summary": "At least four sentiment_12h points are required before the forecast model can train reliably.",
                    "drivers": [],
                },
            }

        timestamps = [point["time"] for point in series]
        values = [point["value"] for point in series]
        model = self._fit_holt_linear(values)
        scenario_profile = self._interpret_scenario(scenario, values)
        graph = self._generate_future_graph(
            anchor_time=timestamps[-1],
            model=model,
            scenario_profile=scenario_profile,
            horizon_days=30,
        )

        return {
            "graph": graph,
            "explanation": self._build_explanation(
                values=values,
                model=model,
                scenario=scenario,
                scenario_profile=scenario_profile,
                history_points=len(values),
            ),
        }

    def _prepare_series(self, points: list[dict]) -> list[dict[str, Any]]:
        series: list[dict[str, Any]] = []
        for point in points:
            point_time = self._extract_point_time(point)
            if not point_time:
                continue

            series.append(
                {
                    "time": point_time,
                    "value": self._extract_sentiment_value(point),
                }
            )

        return sorted(series, key=lambda item: item["time"])

    def _fit_holt_linear(self, values: list[float]) -> dict[str, float]:
        if len(values) == 1:
            return {
                "alpha": 0.5,
                "beta": 0.3,
                "level": values[0],
                "trend": 0.0,
                "mse": 0.0,
            }

        best_model: dict[str, float] | None = None
        candidates = [0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85]

        for alpha in candidates:
            for beta in candidates:
                model = self._run_holt_pass(values, alpha, beta)
                if best_model is None or model["mse"] < best_model["mse"]:
                    best_model = model

        return best_model or self._run_holt_pass(values, 0.5, 0.3)

    def _run_holt_pass(self, values: list[float], alpha: float, beta: float) -> dict[str, float]:
        level = values[0]
        trend = values[1] - values[0] if len(values) > 1 else 0.0
        squared_errors = []

        for actual in values[1:]:
            forecast = level + trend
            squared_errors.append((actual - forecast) ** 2)

            previous_level = level
            level = alpha * actual + (1 - alpha) * forecast
            trend = beta * (level - previous_level) + (1 - beta) * trend

        mse = sum(squared_errors) / max(len(squared_errors), 1)
        return {
            "alpha": alpha,
            "beta": beta,
            "level": level,
            "trend": trend,
            "mse": mse,
        }

    def _generate_future_graph(
        self,
        anchor_time: datetime,
        model: dict[str, float],
        scenario_profile: dict[str, Any],
        horizon_days: int,
    ) -> list[dict[str, Any]]:
        graph = []
        level = float(model["level"])
        trend = float(model["trend"])
        level_shift = float(scenario_profile["level_shift"])
        trend_shift = float(scenario_profile["trend_shift"])

        for step in range(1, horizon_days + 1):
            predicted_sentiment = level + (trend * step)
            scenario_sentiment = level_shift + (trend_shift * step)
            adjusted_sentiment = max(-1.0, min(1.0, predicted_sentiment + scenario_sentiment))
            target_date = anchor_time + timedelta(days=step)

            graph.append(
                {
                    "id": f"forecast-{step}",
                    "date": target_date.isoformat(),
                    "day": target_date.strftime("%b %d"),
                    "fullDate": target_date.strftime("%A, %B %d, %Y"),
                    "score": self._normalize_score(adjusted_sentiment),
                }
            )

        return graph

    def _extract_sentiment_value(self, point: dict) -> float:
        avg_score = point.get("avg_score")
        if isinstance(avg_score, (int, float)) and -1.0 <= float(avg_score) <= 1.0:
            return float(avg_score)

        normalized_score = point.get("normalized_score")
        if isinstance(normalized_score, (int, float)):
            normalized_value = float(normalized_score)
            if 0.0 <= normalized_value <= 1.0:
                return max(-1.0, min(1.0, (normalized_value * 2) - 1))
            return max(-1.0, min(1.0, normalized_value))

        if isinstance(avg_score, (int, float)):
            return max(-1.0, min(1.0, math.tanh(float(avg_score) / 5)))

        return 0.0

    def _extract_point_time(self, point: dict) -> datetime | None:
        return point.get("start_time") or point.get("created_at") or point.get("end_time")

    def _normalize_score(self, avg_score: float) -> int:
        return int(round((avg_score + 1) * 50))

    def _interpret_scenario(self, scenario: str | None, values: list[float]) -> dict[str, Any]:
        volatility = self._series_volatility(values)
        base_magnitude = max(0.03, min(0.12, volatility * 1.8 + 0.03))

        if not scenario or not scenario.strip():
            return {
                "level_shift": 0.0,
                "trend_shift": 0.0,
                "impact_label": "+0 pts",
                "summary": "",
                "driver_name": "Scenario effect",
                "driver_desc": "No what-if scenario was applied to the trained forecast.",
            }

        normalized = scenario.strip().lower()
        tokens = re.findall(r"[a-z_]+", normalized)

        positive_weights = {
            "improved": 1.6,
            "improve": 1.6,
            "better": 1.4,
            "faster": 1.2,
            "excellent": 1.6,
            "great": 1.4,
            "good": 1.1,
            "recovery": 1.5,
            "resolved": 1.4,
            "support": 0.9,
            "delivery": 0.7,
            "quality": 0.8,
            "service": 0.8,
            "launch": 0.8,
        }
        negative_weights = {
            "delay": 1.5,
            "delayed": 1.5,
            "worse": 1.6,
            "bad": 1.2,
            "poor": 1.4,
            "complaint": 1.3,
            "complaints": 1.3,
            "issue": 1.2,
            "issues": 1.2,
            "damage": 1.2,
            "damaged": 1.2,
            "slow": 1.1,
            "late": 1.1,
            "refund": 1.0,
            "cancel": 1.0,
            "broken": 1.3,
        }

        positive_score = sum(positive_weights.get(token, 0.0) for token in tokens)
        negative_score = sum(negative_weights.get(token, 0.0) for token in tokens)
        net_score = positive_score - negative_score
        direction = 1 if net_score > 0 else -1 if net_score < 0 else 0
        intensity = min(1.0, abs(net_score) / 3.0)

        if direction == 0:
            return {
                "level_shift": 0.0,
                "trend_shift": 0.0,
                "impact_label": "+0 pts",
                "summary": f"The scenario '{scenario}' did not map clearly to positive or negative pressure, so the trained forecast was left unchanged.",
                "driver_name": "Scenario effect",
                "driver_desc": "No strong sentiment direction was detected in the what-if text.",
            }

        level_shift = direction * base_magnitude * intensity
        trend_shift = direction * (base_magnitude / 8) * intensity
        total_points_impact = int(round((level_shift * 50) + (trend_shift * 15 * 50)))
        impact_label = f"{total_points_impact:+d} pts"
        direction_text = "positive" if direction > 0 else "negative"
        summary = (
            f"The scenario '{scenario}' was interpreted as a {direction_text} operational change, "
            f"so the fitted time-series forecast was adjusted by {impact_label} over the 30-day horizon."
        )

        return {
            "level_shift": level_shift,
            "trend_shift": trend_shift,
            "impact_label": impact_label,
            "summary": summary,
            "driver_name": "Scenario effect",
            "driver_desc": "The what-if text changes both the forecast level and the future slope instead of applying a flat static line.",
        }

    def _series_volatility(self, values: list[float]) -> float:
        if len(values) < 2:
            return 0.05

        differences = [abs(values[index] - values[index - 1]) for index in range(1, len(values))]
        return sum(differences) / len(differences)

    def _build_explanation(
        self,
        values: list[float],
        model: dict[str, float],
        scenario: str | None,
        scenario_profile: dict[str, Any],
        history_points: int,
    ) -> dict[str, Any]:
        recent_window = values[-12:] if len(values) >= 12 else values
        recent_delta = recent_window[-1] - recent_window[0] if len(recent_window) > 1 else 0.0
        slope = float(model["trend"])
        mse = float(model["mse"])

        if slope > 0.01:
            title = "Forecast shows improving sentiment momentum"
            trend_summary = "The fitted Holt trend is positive, so the next 30 days keep moving upward unless new negative signals appear."
            momentum_driver = {
                "name": "Trend momentum",
                "impact": f"+{max(1, int(round(slope * 50 * 7)))} pts",
                "desc": "Recent 12-hour sentiment windows are rising often enough for the model to continue a positive slope.",
            }
        elif slope < -0.01:
            title = "Forecast shows continuing downside pressure"
            trend_summary = "The fitted Holt trend is negative, so the next 30 days keep leaning downward unless sentiment stabilizes."
            momentum_driver = {
                "name": "Trend momentum",
                "impact": f"{min(-1, int(round(slope * 50 * 7)))} pts",
                "desc": "Recent 12-hour sentiment windows are soft enough for the model to continue a negative slope.",
            }
        else:
            title = "Forecast is mostly stable"
            trend_summary = "The fitted Holt trend is close to flat, so the next 30 days are projected around the current sentiment level."
            momentum_driver = {
                "name": "Trend momentum",
                "impact": "+0 pts",
                "desc": "The recent 12-hour windows are not directional enough to justify a steep forecast slope.",
            }

        recovery_driver = {
            "name": "Recent 12h history",
            "impact": f"{int(round(recent_delta * 50)):+d} pts",
            "desc": f"The model trained on {history_points} stored sentiment_12h points derived from historical comments, using the latest windows to estimate the future path.",
        }
        confidence_driver = {
            "name": "Model fit",
            "impact": f"MSE {mse:.3f}",
            "desc": "Lower fit error means the recent history is easier to project with a classical level-and-trend model.",
        }

        drivers = [momentum_driver, recovery_driver, confidence_driver]
        summary = (
            "This forecast is generated from the stored sentiment_12h time series using a classical Holt linear trend model. "
            f"{trend_summary}"
        )

        if scenario:
            title = f"{title} under what-if simulation"
            if scenario_profile["summary"]:
                summary = f"{summary} {scenario_profile['summary']}"
            drivers = [
                {
                    "name": scenario_profile["driver_name"],
                    "impact": scenario_profile["impact_label"],
                    "desc": scenario_profile["driver_desc"],
                },
                *drivers,
            ]

        return {
            "title": title,
            "summary": summary,
            "drivers": drivers,
        }


forecast_service = ForecastService()

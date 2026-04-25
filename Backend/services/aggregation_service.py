import math
from collections import defaultdict

from pymongo import UpdateOne
from pymongo.collection import Collection

from config import COMMENTS_PROCESSED_COLLECTION, SENTIMENT_12H_COLLECTION
from db import get_database
from services.explanation_service import ExplanationService
from utils.time_windows import floor_to_12h_window


class AggregationService:
    def __init__(self, explanation_service: ExplanationService | None = None):
        database = get_database()
        self.comments_processed: Collection = database[COMMENTS_PROCESSED_COLLECTION]
        self.sentiment_12h: Collection = database[SENTIMENT_12H_COLLECTION]
        self.explanation_service = explanation_service or ExplanationService()

    def aggregate_sentiment(self, brand: str | None = None) -> dict:
        grouped_comments: dict[tuple[str, object, object], list[dict]] = defaultdict(list)

        query = {"brand": brand} if brand else {}

        for comment in self.comments_processed.find(query):
            start_time, end_time = floor_to_12h_window(comment["created_at"])
            key = (comment["brand"], start_time, end_time)
            grouped_comments[key].append(comment)

        operations = []

        for (brand, start_time, end_time), comments in grouped_comments.items():
            final_scores = [float(comment["final_score"]) for comment in comments]
            avg_score = sum(final_scores) / len(final_scores)
            normalized_score = math.tanh(avg_score / 5)
            positive_count = sum(
                1 for comment in comments if str(comment.get("sentiment", "")).lower() == "positive"
            )
            negative_count = sum(
                1 for comment in comments if str(comment.get("sentiment", "")).lower() == "negative"
            )
            neutral_count = sum(
                1 for comment in comments if str(comment.get("sentiment", "")).lower() == "neutral"
            )

            if positive_count > negative_count:
                explanation = "Positive sentiment driven by customer satisfaction and product quality."
            elif negative_count > positive_count:
                explanation = "Negative sentiment driven by complaints about delivery or service."
            else:
                explanation = "Mixed sentiment with balanced positive and negative feedback."

            operations.append(
                UpdateOne(
                    {
                        "brand": brand,
                        "start_time": start_time,
                        "end_time": end_time,
                    },
                    {
                        "$set": {
                            "avg_score": avg_score,
                            "normalized_score": normalized_score,
                            "volume": len(comments),
                            "explanation": explanation,
                            "brand": brand,
                        }
                    },
                    upsert=True,
                )
            )

        if operations:
            self.sentiment_12h.bulk_write(operations)

        return {"aggregated_count": len(operations)}

    def get_sentiment_graph(self, brand: str) -> list[dict]:
        cursor = self.sentiment_12h.find({"brand": brand}).sort("start_time", 1)
        return [
            {
                "timestamp": item["start_time"],
                "normalized_score": float(item["normalized_score"]),
                "explanation": item["explanation"],
            }
            for item in cursor
        ]


aggregation_service = AggregationService()

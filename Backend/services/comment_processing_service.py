from pprint import pformat

from pymongo import ASCENDING
from pymongo.collection import Collection

from config import (
    COMMENTS_PROCESSED_COLLECTION,
    COMMENTS_UNIFIED_COLLECTION,
    RAW_TWITTER_COMMENTS_COLLECTION,
)
from db import get_database
from services.sentiment_service import sentiment_model_service


class CommentProcessingService:
    def __init__(self):
        database = get_database()
        self.comments_unified: Collection = database[COMMENTS_UNIFIED_COLLECTION]
        self.raw_twitter_comments: Collection = database[RAW_TWITTER_COMMENTS_COLLECTION]
        self.comments_processed: Collection = database[COMMENTS_PROCESSED_COLLECTION]

    def process_comments(self, brand: str | None = None) -> dict:
        processed_count = 0
        skipped_count = 0

        fetch_query = self._build_brand_query(brand)
        source_collection = self.comments_unified
        source_collection_name = COMMENTS_UNIFIED_COLLECTION

        fetched_comments = list(source_collection.find(fetch_query).sort("_id", ASCENDING))
        if not fetched_comments:
            source_collection = self.raw_twitter_comments
            source_collection_name = RAW_TWITTER_COMMENTS_COLLECTION
            fetched_comments = list(
                source_collection.find(fetch_query).sort("_id", ASCENDING)
            )

        print(f"[process-comments] database=sentiment_analysis_db")
        print(f"[process-comments] collection={source_collection_name}")
        print(f"[process-comments] query={pformat(fetch_query)}")
        print(f"[process-comments] fetched_count={len(fetched_comments)}")
        print(
            "[process-comments] sample_document="
            f"{pformat(fetched_comments[0]) if fetched_comments else None}"
        )

        for raw_comment in fetched_comments:
            comment = self._normalize_comment(raw_comment)
            dedupe_query = {
                "text": comment["text"],
                "platform": comment["platform"],
                "created_at": comment["created_at"],
                "brand": comment["brand"],
            }

            if self.comments_processed.find_one(dedupe_query):
                skipped_count += 1
                continue

            processed_comment = sentiment_model_service.analyze_comment(comment)
            self.comments_processed.insert_one(processed_comment)
            processed_count += 1

        return {
            "processed_count": processed_count,
            "skipped_count": skipped_count,
        }

    def _build_brand_query(self, brand: str | None) -> dict:
        if not brand:
            return {}
        return {"brand": {"$regex": f"^{brand.strip()}$", "$options": "i"}}

    def _normalize_comment(self, comment: dict) -> dict:
        created_at = comment.get("created_at", comment.get("timestamp"))
        return {
            "text": str(comment["text"]).strip(),
            "platform": comment.get("platform") or "twitter",
            "created_at": created_at,
            "score": float(comment.get("score") or 0.0),
            "brand": str(comment["brand"]).strip(),
        }


comment_processing_service = CommentProcessingService()

from pymongo import ASCENDING, MongoClient

from config import (
    COMMENTS_PROCESSED_COLLECTION,
    COMMENTS_UNIFIED_COLLECTION,
    DATABASE_NAME,
    MONGO_URI,
    SENTIMENT_12H_COLLECTION,
)

client = MongoClient(MONGO_URI)
database = client[DATABASE_NAME]


def get_database():
    return database


def ensure_indexes():
    database[COMMENTS_UNIFIED_COLLECTION].create_index(
        [("brand", ASCENDING), ("created_at", ASCENDING), ("platform", ASCENDING)]
    )
    database[COMMENTS_PROCESSED_COLLECTION].create_index(
        [("brand", ASCENDING), ("created_at", ASCENDING), ("platform", ASCENDING)]
    )
    database[COMMENTS_PROCESSED_COLLECTION].create_index(
        [
            ("text", ASCENDING),
            ("platform", ASCENDING),
            ("created_at", ASCENDING),
            ("brand", ASCENDING),
        ],
        unique=True,
    )
    database[SENTIMENT_12H_COLLECTION].create_index(
        [("brand", ASCENDING), ("start_time", ASCENDING), ("end_time", ASCENDING)],
        unique=True,
    )

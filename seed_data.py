from datetime import datetime, timedelta
from math import tanh

from pymongo import MongoClient


MONGO_URI = "mongodb://localhost:27017"
DATABASE_NAME = "sentiment_analysis_db"

BRAND = "Nike"


def build_comments_processed(now: datetime) -> list[dict]:
    recent_negative_texts = [
        "Nike delivery is very slow and my order still has no update",
        "Customer support is terrible and nobody resolved my issue",
        "Packaging was damaged and the product arrived in bad shape",
        "Very poor service experience with Nike this week",
        "Nike shipping delays keep getting worse every day",
        "Support agents are not helpful and the response time is awful",
        "My package arrived late and the box was badly damaged",
        "Nike delivery problems are ruining the buying experience",
        "Customer service never followed up on my complaint",
        "The shipment delay and poor support are very frustrating",
    ]

    older_mixed_comments = [
        ("Nike shoes feel premium and very comfortable to wear", "Positive", 3.8, 1.6),
        ("The latest product drop looks solid and the launch went smoothly", "Positive", 3.4, 1.2),
        ("Nike customer service helped me quickly last month", "Positive", 3.1, 1.0),
        ("The product quality is reliable and worth the price", "Positive", 3.6, 1.4),
        ("Nike delivery timing was acceptable for my previous order", "Positive", 2.2, 0.7),
        ("The new colors are nice but not a huge upgrade", "Neutral", 0.0, 0.0),
        ("People are comparing Nike with competitors before buying", "Neutral", 0.0, 0.0),
        ("The campaign is getting attention but opinions are mixed", "Neutral", 0.0, 0.0),
        ("Some users like the update while others want more features", "Neutral", 0.0, 0.0),
        ("Packaging looked fine although delivery updates were limited", "Neutral", 0.0, 0.0),
        ("Nike support solved an older return issue after some waiting", "Positive", 2.7, 0.9),
        ("The product update improved performance for regular users", "Positive", 3.0, 1.1),
    ]

    documents = []

    for index, (text, sentiment, strength, final_score) in enumerate(older_mixed_comments):
        created_at = now - timedelta(hours=36 + (len(older_mixed_comments) - index) * 2)
        documents.append(
            {
                "text": text,
                "platform": "twitter",
                "created_at": created_at,
                "score": round(abs(final_score) + 1.5, 2),
                "brand": BRAND,
                "sentiment": sentiment,
                "strength": strength,
                "final_score": final_score,
            }
        )

    for index, text in enumerate(recent_negative_texts):
        created_at = now - timedelta(minutes=(len(recent_negative_texts) - index - 1) * 7)
        strength = round(-4.6 - (index % 3) * 0.1, 2)
        final_score = round(-1.8 - index * 0.08, 2)
        documents.append(
            {
                "text": text,
                "platform": "twitter",
                "created_at": created_at,
                "score": round(2.5 + index * 0.15, 2),
                "brand": BRAND,
                "sentiment": "Negative",
                "strength": strength,
                "final_score": final_score,
            }
        )

    return sorted(documents, key=lambda item: item["created_at"])


def build_sentiment_12h(now: datetime) -> list[dict]:
    avg_scores = [
        -0.55,
        -0.5,
        -0.46,
        -0.4,
        -0.34,
        -0.28,
        -0.22,
        -0.15,
        -0.05,
        0.04,
        0.12,
        0.2,
        0.29,
        0.38,
        0.47,
        0.56,
        0.62,
        0.68,
    ]

    explanations = [
        "Users complaining about delivery delays",
        "Customer frustration remains high because support responses are slow",
        "Negative mentions continue around damaged packaging and shipment timing",
        "Delivery complaints still dominate conversation",
        "Customer sentiment remains weak due to service issues",
        "Complaints are easing slightly but logistics concerns continue",
        "Negative sentiment softening as fewer damaged package reports appear",
        "Customer sentiment stabilizing after fewer support complaints",
        "Users still mention delays but tone is less severe",
        "Customer sentiment improving due to better logistics",
        "Users noticing more reliable updates on shipment status",
        "Positive response to improved delivery communication",
        "Customer sentiment improving due to better logistics",
        "Positive response to product updates and smoother delivery",
        "Stronger positive reaction as service complaints decrease",
        "Positive response to product updates",
        "Customer confidence rising with better support turnaround",
        "Positive response to product updates and improved logistics",
    ]

    start_time = now - timedelta(hours=(len(avg_scores) - 1) * 12)
    documents = []

    for index, avg_score in enumerate(avg_scores):
        created_at = start_time + timedelta(hours=index * 12)
        window_end = created_at + timedelta(hours=12)
        documents.append(
            {
                "brand": BRAND,
                "time_window": f"{created_at.isoformat()} to {window_end.isoformat()}",
                "avg_score": avg_score,
                "normalized_score": round(tanh(avg_score), 4),
                "explanation": explanations[index],
                "created_at": created_at,
                "start_time": created_at,
                "end_time": window_end,
                "volume": 12 + (index % 5),
            }
        )

    return documents


def build_alerts_history(now: datetime) -> list[dict]:
    return [
        {
            "brand": BRAND,
            "type": "critical",
            "title": "Shipping delay conversation is accelerating",
            "description": "Negative mention velocity increasing. Users frequently reporting issues related to 'delivery'.",
            "tags": ["Logistics"],
            "count": 9,
            "created_at": now - timedelta(minutes=18),
        },
        {
            "brand": BRAND,
            "type": "high",
            "title": "Customer complaints rising rapidly",
            "description": "Negative mention velocity increasing. Users frequently reporting issues related to 'support'.",
            "tags": ["Customer Service"],
            "count": 6,
            "created_at": now - timedelta(hours=3),
        },
        {
            "brand": BRAND,
            "type": "medium",
            "title": "Packaging complaints rising rapidly",
            "description": "Negative mention velocity increasing. Users frequently reporting issues related to 'packaging'.",
            "tags": ["General"],
            "count": 4,
            "created_at": now - timedelta(hours=9),
        },
    ]


def build_sentimental_zones(now: datetime) -> list[dict]:
    base_start = now - timedelta(days=9)
    return [
        {
            "brand": BRAND,
            "zone_type": "Negative",
            "start_time": base_start,
            "end_time": base_start + timedelta(days=3),
            "avg_score": -0.38,
            "summary": "Sustained negative sentiment period with recurring delivery and support complaints.",
        },
        {
            "brand": BRAND,
            "zone_type": "Neutral",
            "start_time": base_start + timedelta(days=3),
            "end_time": base_start + timedelta(days=6),
            "avg_score": 0.04,
            "summary": "Balanced sentiment period as complaints eased and recovery began.",
        },
        {
            "brand": BRAND,
            "zone_type": "Positive",
            "start_time": base_start + timedelta(days=6),
            "end_time": base_start + timedelta(days=9),
            "avg_score": 0.46,
            "summary": "Strong positive sentiment period driven by better logistics and product response.",
        },
    ]


def main() -> None:
    client = MongoClient(MONGO_URI)
    database = client[DATABASE_NAME]

    comments_processed = database["comments_processed"]
    sentiment_12h = database["sentiment_12h"]
    alerts_history = database["alerts_history"]
    sentimental_zones = database["sentimental_zones"]

    comments_processed.delete_many({})
    sentiment_12h.delete_many({})
    alerts_history.delete_many({})
    sentimental_zones.delete_many({})

    now = datetime.utcnow()

    comments_processed.insert_many(build_comments_processed(now))
    sentiment_12h.insert_many(build_sentiment_12h(now))
    alerts_history.insert_many(build_alerts_history(now))
    sentimental_zones.insert_many(build_sentimental_zones(now))

    print("Data seeded successfully")


if __name__ == "__main__":
    main()

import random
from collections import Counter
from datetime import datetime, timedelta

from pymongo import MongoClient


MONGO_URI = "mongodb://localhost:27017"
DATABASE_NAME = "sentiment_analysis_db"
BRAND = "Nike"

TOTAL_COMMENTS = 2000
TOTAL_POINTS = 120
PLATFORM_CHOICES = (
    ["twitter"] * 50
    + ["instagram"] * 30
    + ["reddit"] * 20
)

NEGATIVE_TEXTS = [
    "Delivery was delayed and frustrating",
    "Customer support is terrible",
    "Very poor quality and bad stitching",
    "The shipment took too long and the experience was disappointing",
    "Packaging arrived damaged and the item looked cheap",
    "Support team was unhelpful and slow to respond",
    "Bad stitching and weak material quality",
    "The product felt overpriced for this quality",
    "Delivery updates were missing and confusing",
    "Terrible return process and poor service",
]

POSITIVE_TEXTS = [
    "Amazing comfort and great quality",
    "Loved the design and fast delivery",
    "Excellent product, highly recommend",
    "Very comfortable fit and premium feel",
    "Customer support was quick and helpful",
    "Fast shipping and excellent packaging",
    "The product quality exceeded my expectations",
    "Really impressed with the comfort and finish",
    "Smooth delivery and great overall experience",
    "The new design looks fantastic and feels durable",
]

NEUTRAL_TEXTS = [
    "Product is okay for the price",
    "Average experience overall",
    "The item works as expected but nothing special",
    "Delivery was acceptable and the quality seems average",
    "Support response was standard and the issue was resolved",
    "The design is decent but not very exciting",
    "It is fine for regular use",
    "Mixed experience with delivery and product quality",
]

NEGATIVE_EXPLANATIONS = [
    "Users complaining about delivery delays",
    "Customer frustration driven by poor support experiences",
    "Negative reaction to quality issues and stitching complaints",
    "Strong complaint volume around logistics and damaged packaging",
]

MIXED_EXPLANATIONS = [
    "Mixed reactions from customers",
    "Balanced discussion with both praise and complaints",
    "Customer sentiment remains split across support and product quality",
    "Conversations are mixed as recovery begins",
]

POSITIVE_EXPLANATIONS = [
    "Positive response due to improved service",
    "Customers reacting well to better delivery performance",
    "Positive response due to improved product quality",
    "Support and logistics improvements are lifting sentiment",
]


def choose_sentiment(day_offset: int) -> str:
    if day_offset < 20:
        return random.choices(
            ["Negative", "Positive", "Neutral"],
            weights=[70, 15, 15],
            k=1,
        )[0]
    if day_offset < 40:
        return random.choices(
            ["Negative", "Positive", "Neutral"],
            weights=[40, 40, 20],
            k=1,
        )[0]
    return random.choices(
        ["Positive", "Negative", "Neutral"],
        weights=[70, 15, 15],
        k=1,
    )[0]


def random_comment_text(sentiment: str) -> str:
    if sentiment == "Positive":
        return random.choice(POSITIVE_TEXTS)
    if sentiment == "Negative":
        return random.choice(NEGATIVE_TEXTS)
    return random.choice(NEUTRAL_TEXTS)


def random_score(sentiment: str) -> float:
    if sentiment == "Positive":
        return round(random.uniform(0.3, 1.0), 3)
    if sentiment == "Negative":
        return round(random.uniform(-1.0, -0.3), 3)
    return round(random.uniform(-0.2, 0.2), 3)


def generate_comments_processed(now: datetime) -> list[dict]:
    comments = []

    for _ in range(TOTAL_COMMENTS):
        day_offset = random.randint(0, 59)
        time_offset_seconds = random.randint(0, (24 * 60 * 60) - 1)
        created_at = now - timedelta(days=(59 - day_offset), seconds=time_offset_seconds)
        sentiment = choose_sentiment(day_offset)
        score = random_score(sentiment)

        comments.append(
            {
                "text": random_comment_text(sentiment),
                "platform": random.choice(PLATFORM_CHOICES),
                "created_at": created_at,
                "score": score,
                "brand": BRAND,
                "sentiment": sentiment,
                "strength": round(abs(score), 3),
                "final_score": score,
            }
        )

    comments.sort(key=lambda item: item["created_at"])
    return comments


def build_segment_scores(start: float, end: float, points: int, jitter: float) -> list[float]:
    values = []
    for index in range(points):
        progress = index / max(points - 1, 1)
        baseline = start + (end - start) * progress
        noisy = baseline + random.uniform(-jitter, jitter)
        values.append(round(max(-1.0, min(1.0, noisy)), 3))
    return values


def explanation_for_score(score: float) -> str:
    if score <= -0.25:
        return random.choice(NEGATIVE_EXPLANATIONS)
    if score < 0.15:
        return random.choice(MIXED_EXPLANATIONS)
    return random.choice(POSITIVE_EXPLANATIONS)


def generate_sentiment_12h(now: datetime) -> list[dict]:
    start_time = now - timedelta(hours=(TOTAL_POINTS - 1) * 12)
    first_segment = build_segment_scores(-0.7, -0.2, 40, 0.04)
    second_segment = build_segment_scores(-0.2, 0.1, 40, 0.03)
    third_segment = build_segment_scores(0.1, 0.8, 40, 0.05)
    scores = first_segment + second_segment + third_segment

    documents = []

    for index, avg_score in enumerate(scores):
        point_start = start_time + timedelta(hours=index * 12)
        point_end = point_start + timedelta(hours=12)
        documents.append(
            {
                "brand": BRAND,
                "time_window": f"{point_start.isoformat()} to {point_end.isoformat()}",
                "avg_score": avg_score,
                "normalized_score": round((avg_score + 1) / 2, 4),
                "explanation": explanation_for_score(avg_score),
                "created_at": point_start,
                "start_time": point_start,
                "end_time": point_end,
                "volume": random.randint(10, 50),
            }
        )

    return documents


def print_comment_summary(comments: list[dict]) -> None:
    sentiment_counts = Counter(item["sentiment"] for item in comments)
    platform_counts = Counter(item["platform"] for item in comments)

    print("comments_processed summary")
    print("  total:", len(comments))
    print("  sentiments:", dict(sentiment_counts))
    print("  platforms:", dict(platform_counts))


def main() -> None:
    random.seed(42)

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
    comments = generate_comments_processed(now)
    sentiment_points = generate_sentiment_12h(now)

    comments_processed.insert_many(comments)
    sentiment_12h.insert_many(sentiment_points)

    print_comment_summary(comments)
    print("sentiment_12h summary")
    print("  total:", len(sentiment_points))
    print("  first_score:", sentiment_points[0]["avg_score"])
    print("  last_score:", sentiment_points[-1]["avg_score"])
    print("database counts")
    print("  comments_processed:", comments_processed.count_documents({}))
    print("  sentiment_12h:", sentiment_12h.count_documents({}))
    print("  alerts_history:", alerts_history.count_documents({}))
    print("  sentimental_zones:", sentimental_zones.count_documents({}))


if __name__ == "__main__":
    main()

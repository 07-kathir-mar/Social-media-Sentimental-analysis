import math


def compute_strength(sentiment: str, confidence: float) -> float:
    if sentiment == "Positive":
        return confidence * 5
    if sentiment == "Negative":
        return -1 * confidence * 5
    return 0.0


def compute_final_score(strength: float, engagement_score: float) -> float:
    adjusted_score = max(float(engagement_score), 0.0)
    return strength * math.log(adjusted_score + 1)

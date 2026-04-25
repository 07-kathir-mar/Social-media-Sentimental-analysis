from scipy.special import softmax
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from config import SENTIMENT_MODEL_NAME
from services.scoring_service import compute_final_score, compute_strength


class SentimentModelService:
    def __init__(self):
        self.tokenizer = None
        self.model = None
        self.labels = ["Negative", "Neutral", "Positive"]

    def analyze_comment(self, comment: dict) -> dict:
        self._ensure_loaded()
        text = str(comment["text"]).strip()
        encoded = self.tokenizer(text, return_tensors="pt", truncation=True)
        output = self.model(**encoded)
        scores = softmax(output.logits.detach().numpy()[0])
        sentiment_index = int(scores.argmax())
        sentiment = self.labels[sentiment_index]
        confidence = float(scores[sentiment_index])
        strength = compute_strength(sentiment, confidence)
        final_score = compute_final_score(strength, comment["score"])

        return {
            "text": text,
            "platform": comment["platform"],
            "created_at": comment["created_at"],
            "score": float(comment["score"]),
            "brand": comment["brand"],
            "sentiment": sentiment,
            "strength": strength,
            "final_score": final_score,
        }

    def _ensure_loaded(self) -> None:
        if self.tokenizer is not None and self.model is not None:
            return

        try:
            self.tokenizer = AutoTokenizer.from_pretrained(SENTIMENT_MODEL_NAME)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                SENTIMENT_MODEL_NAME
            )
        except Exception as exc:
            raise RuntimeError(
                "Sentiment model could not be loaded. Make sure the Hugging Face model is available locally or that network access is allowed."
            ) from exc


sentiment_model_service = SentimentModelService()

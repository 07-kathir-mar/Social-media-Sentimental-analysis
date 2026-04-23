from scipy.special import softmax
from transformers import AutoModelForSequenceClassification, AutoTokenizer

MODEL_NAME = "cardiffnlp/twitter-roberta-base-sentiment"
LABELS = ["Negative", "Neutral", "Positive"]

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)


def analyze(text):
    cleaned_text = str(text).strip()
    if not cleaned_text:
        raise ValueError("Text is required.")

    encoded = tokenizer(cleaned_text, return_tensors="pt")
    output = model(**encoded)
    scores = softmax(output.logits.detach().numpy()[0])
    sentiment_index = int(scores.argmax())

    return {
        "text": cleaned_text,
        "label": LABELS[sentiment_index],
        "confidence": float(scores[sentiment_index]),
        "negative": float(scores[0]),
        "neutral": float(scores[1]),
        "positive": float(scores[2]),
    }


if __name__ == "__main__":
    sample_text = "This product is amazing and the experience feels smooth."
    print(analyze(sample_text))

from flask import Flask, jsonify, render_template_string, request
from scipy.special import softmax
from transformers import AutoModelForSequenceClassification, AutoTokenizer

MODEL = "cardiffnlp/twitter-roberta-base-sentiment"

tokenizer = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForSequenceClassification.from_pretrained(MODEL)

labels = ["Negative", "Neutral", "Positive"]

app = Flask(__name__)

SHOWCASE_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sentiment Model Showcase</title>
  <style>
    :root {
      --bg: #0f172a;
      --panel: rgba(15, 23, 42, 0.82);
      --panel-border: rgba(148, 163, 184, 0.16);
      --text: #e2e8f0;
      --muted: #94a3b8;
      --accent: linear-gradient(135deg, #22c55e, #f59e0b, #ef4444);
      --shadow: 0 24px 80px rgba(15, 23, 42, 0.45);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: Arial, Helvetica, sans-serif;
      color: var(--text);
      background:
        radial-gradient(circle at top left, rgba(34, 197, 94, 0.18), transparent 28%),
        radial-gradient(circle at top right, rgba(245, 158, 11, 0.18), transparent 26%),
        radial-gradient(circle at bottom, rgba(239, 68, 68, 0.18), transparent 30%),
        #020617;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .shell {
      width: min(1080px, 100%);
      background: var(--panel);
      border: 1px solid var(--panel-border);
      border-radius: 28px;
      box-shadow: var(--shadow);
      overflow: hidden;
      backdrop-filter: blur(18px);
    }

    .hero {
      padding: 28px 28px 16px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.12);
    }

    .eyebrow {
      display: inline-block;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      color: #f8fafc;
      font-size: 12px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    h1 {
      margin: 18px 0 10px;
      font-size: clamp(30px, 5vw, 52px);
      line-height: 1.05;
    }

    .hero p {
      margin: 0;
      max-width: 720px;
      color: var(--muted);
      line-height: 1.7;
    }

    .grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 0;
    }

    .pane {
      padding: 28px;
    }

    .pane + .pane {
      border-left: 1px solid rgba(148, 163, 184, 0.12);
    }

    label {
      display: block;
      margin-bottom: 12px;
      font-size: 14px;
      color: #cbd5e1;
    }

    textarea {
      width: 100%;
      min-height: 220px;
      border: 1px solid rgba(148, 163, 184, 0.16);
      background: rgba(2, 6, 23, 0.84);
      color: #f8fafc;
      border-radius: 22px;
      padding: 18px;
      font: inherit;
      line-height: 1.7;
      resize: vertical;
      outline: none;
    }

    textarea:focus {
      border-color: rgba(245, 158, 11, 0.5);
      box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.12);
    }

    .actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    button {
      border: 0;
      border-radius: 999px;
      padding: 14px 20px;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
    }

    .primary {
      background: var(--accent);
      color: #020617;
    }

    .secondary {
      background: rgba(255, 255, 255, 0.06);
      color: #e2e8f0;
      border: 1px solid rgba(148, 163, 184, 0.16);
    }

    .status {
      min-height: 24px;
      margin-top: 16px;
      color: #fca5a5;
      font-size: 14px;
    }

    .card {
      border: 1px solid rgba(148, 163, 184, 0.16);
      background: rgba(2, 6, 23, 0.56);
      border-radius: 24px;
      padding: 20px;
    }

    .result-head {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      margin-bottom: 18px;
    }

    .pill {
      padding: 10px 14px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 700;
      border: 1px solid rgba(148, 163, 184, 0.18);
      background: rgba(255, 255, 255, 0.05);
    }

    .muted {
      color: var(--muted);
      font-size: 14px;
    }

    .score-row {
      margin-top: 16px;
    }

    .score-label {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .bar {
      height: 10px;
      background: rgba(148, 163, 184, 0.14);
      border-radius: 999px;
      overflow: hidden;
    }

    .fill {
      height: 100%;
      width: 0;
      background: var(--accent);
      border-radius: inherit;
      transition: width 0.35s ease;
    }

    .empty {
      color: var(--muted);
      line-height: 1.7;
    }

    @media (max-width: 840px) {
      .grid {
        grid-template-columns: 1fr;
      }

      .pane + .pane {
        border-left: 0;
        border-top: 1px solid rgba(148, 163, 184, 0.12);
      }
    }
  </style>
</head>
<body>
  <div class="shell">
    <div class="hero">
      <span class="eyebrow">ML Showcase</span>
      <h1>Sentiment Model Demo</h1>
      <p>Enter any comment, run the local model, and inspect the predicted sentiment with confidence scores. This page is only for checking whether the model is working correctly.</p>
    </div>

    <div class="grid">
      <section class="pane">
        <label for="comment">Comment</label>
        <textarea id="comment">This product is amazing and the experience feels smooth.</textarea>
        <div class="actions">
          <button id="analyzeBtn" class="primary">Analyze Sentiment</button>
          <button id="sampleBtn" class="secondary" type="button">Load Sample</button>
        </div>
        <div id="status" class="status"></div>
      </section>

      <section class="pane">
        <div class="card" id="resultCard">
          <div id="emptyState" class="empty">Run the model to see the sentiment label and the positive, neutral, and negative scores here.</div>

          <div id="resultState" style="display: none;">
            <div class="result-head">
              <div>
                <div class="muted">Predicted sentiment</div>
                <h2 id="label" style="margin: 8px 0 0; font-size: 32px;"></h2>
              </div>
              <div class="pill" id="confidence">0.0%</div>
            </div>

            <div class="muted">Submitted text</div>
            <p id="submittedText" style="line-height: 1.7;"></p>

            <div class="score-row">
              <div class="score-label"><span>Positive</span><span id="positiveText">0%</span></div>
              <div class="bar"><div class="fill" id="positiveBar"></div></div>
            </div>

            <div class="score-row">
              <div class="score-label"><span>Neutral</span><span id="neutralText">0%</span></div>
              <div class="bar"><div class="fill" id="neutralBar"></div></div>
            </div>

            <div class="score-row">
              <div class="score-label"><span>Negative</span><span id="negativeText">0%</span></div>
              <div class="bar"><div class="fill" id="negativeBar"></div></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>

  <script>
    const analyzeBtn = document.getElementById("analyzeBtn");
    const sampleBtn = document.getElementById("sampleBtn");
    const commentInput = document.getElementById("comment");
    const statusEl = document.getElementById("status");
    const emptyState = document.getElementById("emptyState");
    const resultState = document.getElementById("resultState");

    const setBar = (id, value) => {
      const percent = (value * 100).toFixed(1) + "%";
      document.getElementById(id + "Bar").style.width = percent;
      document.getElementById(id + "Text").textContent = percent;
    };

    async function runAnalysis() {
      const text = commentInput.value.trim();
      if (!text) {
        statusEl.textContent = "Please enter a comment first.";
        return;
      }

      analyzeBtn.disabled = true;
      analyzeBtn.textContent = "Analyzing...";
      statusEl.textContent = "";

      try {
        const response = await fetch("/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Analysis failed.");
        }

        emptyState.style.display = "none";
        resultState.style.display = "block";
        document.getElementById("label").textContent = data.label;
        document.getElementById("confidence").textContent = (data.confidence * 100).toFixed(1) + "% confidence";
        document.getElementById("submittedText").textContent = data.text;

        setBar("positive", data.positive);
        setBar("neutral", data.neutral);
        setBar("negative", data.negative);
      } catch (error) {
        statusEl.textContent = error.message;
      } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze Sentiment";
      }
    }

    analyzeBtn.addEventListener("click", runAnalysis);
    sampleBtn.addEventListener("click", () => {
      commentInput.value = "The update is okay, but support took too long to answer.";
      statusEl.textContent = "";
    });
  </script>
</body>
</html>
"""


def analyze(text):
    encoded = tokenizer(text, return_tensors="pt")
    output = model(**encoded)
    scores = softmax(output.logits.detach().numpy()[0])
    sentiment_index = int(scores.argmax())

    return {
        "text": text,
        "label": labels[sentiment_index],
        "confidence": float(scores[sentiment_index]),
        "negative": float(scores[0]),
        "neutral": float(scores[1]),
        "positive": float(scores[2]),
    }


@app.get("/")
def index():
    return render_template_string(SHOWCASE_HTML)


@app.post("/analyze")
def analyze_sentiment():
    payload = request.get_json(silent=True) or {}
    text = str(payload.get("text", "")).strip()

    if not text:
        return jsonify({"error": "Text is required."}), 400

    return jsonify(analyze(text))


if __name__ == "__main__":
    app.run(debug=False, use_reloader=False, port=8000)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import ensure_indexes
from routes.sentiment import router as sentiment_router
from routes.thoughts_routes import router as thoughts_router

app = FastAPI(title="Sentiment Analysis Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    ensure_indexes()


app.include_router(sentiment_router)
app.include_router(thoughts_router)

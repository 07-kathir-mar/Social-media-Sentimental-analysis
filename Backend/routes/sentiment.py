from datetime import datetime

from fastapi import APIRouter, HTTPException, Query
from fastapi.concurrency import run_in_threadpool
from pymongo import DESCENDING

from config import COMMENTS_PROCESSED_COLLECTION, RAW_TWITTER_COMMENTS_COLLECTION
from db import get_database
from models.api import (
    AddCommentRequest,
    AggregateSentimentResponse,
    BrandScopedRequest,
    ProcessCommentsResponse,
    SentimentGraphResponse,
)
from services.aggregation_service import aggregation_service
from services.alert_service import alert_service
from services.comment_processing_service import comment_processing_service
from services.forecast_service import forecast_service
from services.thoughts_service import thoughts_service

router = APIRouter()
database = get_database()
raw_twitter_comments = database[RAW_TWITTER_COMMENTS_COLLECTION]
comments_processed = database[COMMENTS_PROCESSED_COLLECTION]


@router.post("/process-comments", response_model=ProcessCommentsResponse)
async def process_comments(payload: BrandScopedRequest | None = None):
    brand = payload.brand.strip() if payload and payload.brand else None
    result = await run_in_threadpool(comment_processing_service.process_comments, brand)
    if brand:
        await run_in_threadpool(alert_service.check_and_store_alert, brand)
    return ProcessCommentsResponse(**result)


@router.post("/aggregate-sentiment", response_model=AggregateSentimentResponse)
async def aggregate_sentiment(payload: BrandScopedRequest | None = None):
    brand = payload.brand.strip() if payload and payload.brand else None
    result = await run_in_threadpool(aggregation_service.aggregate_sentiment, brand)
    return AggregateSentimentResponse(**result)


@router.post("/add-comment")
async def add_comment(request: AddCommentRequest):
    comment = {
        "brand": request.brand,
        "text": request.text,
        "platform": request.platform,
        "timestamp": datetime.utcnow(),
        "score": None,
    }

    await run_in_threadpool(raw_twitter_comments.insert_one, comment)
    await run_in_threadpool(comment_processing_service.process_comments, request.brand)
    await run_in_threadpool(alert_service.check_and_store_alert, request.brand)
    await run_in_threadpool(aggregation_service.aggregate_sentiment, request.brand)

    return {"message": "Comment added and processed"}


@router.get("/get-comments")
async def get_comments(brand: str | None = Query(default=None)):
    query = (
        {"brand": {"$regex": f"^{brand.strip()}$", "$options": "i"}}
        if brand and brand.strip()
        else {}
    )

    comments = await run_in_threadpool(
        lambda: list(comments_processed.find(query).sort("created_at", DESCENDING).limit(20))
    )

    return [
        {
            "text": comment.get("text", ""),
            "brand": comment.get("brand", ""),
            "platform": comment.get("platform", "twitter"),
            "created_at": comment.get("created_at"),
            "sentiment": comment.get("sentiment", "Neutral"),
            "strength": comment.get("strength", 0),
        }
        for comment in comments
    ]


@router.get("/get-alerts")
async def get_alerts(brand: str = Query(..., min_length=1)):
    return await run_in_threadpool(alert_service.get_alerts, brand)


@router.get("/get-forecast")
async def get_forecast(brand: str = Query(..., min_length=1)):
    return await run_in_threadpool(forecast_service.get_forecast, brand)


@router.get("/get-forecast-simulation")
async def get_forecast_simulation(
    brand: str = Query(..., min_length=1),
    scenario: str = Query(..., min_length=1),
):
    return await run_in_threadpool(forecast_service.get_forecast_simulation, brand, scenario)


@router.get("/get-thoughts")
async def get_thoughts(brand: str = Query(..., min_length=1)):
    return await run_in_threadpool(thoughts_service.get_thoughts, brand)


@router.get("/get-sentiment-graph", response_model=SentimentGraphResponse)
async def get_sentiment_graph(brand: str = Query(..., min_length=1)):
    data = await run_in_threadpool(aggregation_service.get_sentiment_graph, brand)

    if not data:
        raise HTTPException(
            status_code=404,
            detail=f"No aggregated sentiment data found for brand '{brand}'.",
        )

    return SentimentGraphResponse(brand=brand, data=data)

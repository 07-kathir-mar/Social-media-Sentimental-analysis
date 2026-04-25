from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class BrandScopedRequest(BaseModel):
    brand: Optional[str] = None


class AddCommentRequest(BaseModel):
    brand: str
    text: str
    platform: str = "twitter"


class ProcessCommentsResponse(BaseModel):
    processed_count: int
    skipped_count: int


class AggregateSentimentResponse(BaseModel):
    aggregated_count: int


class SentimentGraphItem(BaseModel):
    timestamp: datetime
    normalized_score: float = Field(ge=-1.0, le=1.0)
    explanation: str


class SentimentGraphResponse(BaseModel):
    brand: str
    data: List[SentimentGraphItem]

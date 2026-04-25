from datetime import datetime

from fastapi import APIRouter, HTTPException, Query
from fastapi.concurrency import run_in_threadpool

from services.thoughts_service import thoughts_service

router = APIRouter()


def _parse_datetime(value: str) -> datetime:
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid datetime: {value}") from exc


@router.get("/get-custom-analysis")
async def get_custom_analysis(
    brand: str = Query(..., min_length=1),
    from_time: str = Query(...),
    to_time: str = Query(...),
):
    dt_from = _parse_datetime(from_time)
    dt_to = _parse_datetime(to_time)

    if dt_from > dt_to:
        raise HTTPException(status_code=400, detail="from_time must be earlier than to_time.")

    return await run_in_threadpool(thoughts_service.get_custom_analysis, brand, dt_from, dt_to)


@router.get("/get-sentimental-zones")
async def get_sentimental_zones(brand: str = Query(..., min_length=1)):
    return await run_in_threadpool(thoughts_service.get_sentimental_zones, brand)

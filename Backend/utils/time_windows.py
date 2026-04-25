from datetime import datetime, timedelta


def floor_to_12h_window(dt: datetime) -> tuple[datetime, datetime]:
    normalized = dt.replace(minute=0, second=0, microsecond=0)
    start_hour = 0 if normalized.hour < 12 else 12
    start_time = normalized.replace(hour=start_hour)
    end_time = start_time + timedelta(hours=12)
    return start_time, end_time

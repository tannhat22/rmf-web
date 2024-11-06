from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Query

from api_server import ros_time

from .models import Pagination

MAX_UNIX_TIMESTAMP_MS = 253402300799998


def pagination_query(
    limit: int | None = Query(None, gt=0, le=1000, description="defaults to 100"),
    offset: int | None = Query(None, ge=0, description="defaults to 0"),
    order_by: str | None = Query(
        None,
        description="common separated list of fields to order by, prefix with '-' to sort descendingly.",
    ),
) -> Pagination:
    limit = limit or 100
    offset = offset or 0
    return Pagination(
        limit=limit,
        offset=offset,
        order_by=order_by.split(",") if order_by else [],
    )


def time_between_query(alias: str, *, default: str | None = None):
    def dep(
        time_between: str | None = Query(
            default,
            alias=alias,
            description="""
            The period of request time to fetch, in unix millis.

            This can be either a comma separated string or a string prefixed with '-' to fetch the last X millis.

            Example:
                "1000,2000" - Fetch resources between unix millis 1000 and 2000.
                "-60000" - Fetch resources in the last minute.
            """,
        ),
        now: int = Depends(ros_time.now),
    ) -> tuple[datetime, datetime] | None:
        if time_between is None:
            return None
        try:
            if time_between.startswith("-"):
                period = (
                    datetime.fromtimestamp(
                        (now - int(time_between[1:])) / 1000, timezone.utc
                    ),
                    datetime.fromtimestamp(now / 1000, timezone.utc),
                )
            else:
                parts = time_between.split(",")
                start_time = int(parts[0])
                end_time = int(parts[1])

                # Kiểm tra giá trị hợp lệ
                if start_time < 0 or end_time < 0:
                    raise ValueError(f"Unix timestamps cannot be negative!")

                if end_time > MAX_UNIX_TIMESTAMP_MS:
                    end_time = MAX_UNIX_TIMESTAMP_MS

                period = (
                    datetime.fromtimestamp(start_time / 1000, timezone.utc),
                    datetime.fromtimestamp(end_time / 1000, timezone.utc),
                )
            return period

        except (ValueError, IndexError) as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid 'between' query format or value: {e} - {time_between}",
            )

    return dep

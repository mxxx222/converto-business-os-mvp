"""HTTP request timing middleware for Prometheus metrics."""

from __future__ import annotations

import time
from typing import Awaitable, Callable

from fastapi import Request, Response

from backend.app.core.metrics import record_request_metrics


async def timing_middleware(request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
    """Measure request duration, record metrics, and attach timing headers."""

    start = time.perf_counter()
    response = await call_next(request)
    duration = time.perf_counter() - start

    response.headers["x-request-duration-ms"] = f"{duration * 1000:.3f}"
    record_request_metrics(request, response, duration)

    return response

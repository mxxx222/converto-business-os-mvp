"""Performance middleware for FastAPI."""

from __future__ import annotations

import time
from collections.abc import Callable

import sentry_sdk
from fastapi import Request, Response


class PerformanceMiddleware:
    """Track request performance and add timing headers."""

    def __init__(self, app: Callable):
        self.app = app

    async def __call__(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()

        # Process request
        response = await call_next(request)

        # Calculate processing time
        process_time = time.time() - start_time

        # Add performance headers
        response.headers["X-Process-Time"] = f"{process_time:.3f}"
        response.headers["X-Powered-By"] = "Converto"

        # Log slow requests (>1s)
        if process_time > 1.0:
            sentry_sdk.capture_message(
                f"Slow request: {request.url.path} took {process_time:.2f}s",
                level="warning",
            )

        return response

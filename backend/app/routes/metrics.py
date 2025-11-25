"""Metrics routes for Prometheus."""

from fastapi import APIRouter
from fastapi.responses import Response

from backend.app.core.metrics import get_metrics, get_metrics_content_type

router = APIRouter()


@router.get("/metrics")
async def metrics() -> Response:
    """Prometheus metrics endpoint.
    
    Returns all Prometheus metrics in text format for scraping.
    Includes HTTP request metrics, OCR metrics, business metrics, etc.
    """
    return Response(
        content=get_metrics(),
        media_type=get_metrics_content_type()
    )
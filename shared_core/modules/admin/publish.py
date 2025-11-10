"""Admin event publishing utilities using the infrastructure bus.

This module provides high-level functions for publishing admin events
through the configured bus backend (Redis, Supabase, or in-memory).
"""

from __future__ import annotations

import logging
import time
from typing import Optional, Dict, Any

from .infra.bus import ActivityEvent, get_bus
from .infra.init import get_bus_config

# Import metrics for publish latency tracking
try:
    from backend.app.core.metrics import observe_publish_latency
except ImportError:
    # Fallback if metrics module not available
    def observe_publish_latency(tenant: str, event_type: str, duration_ms: float) -> None:
        pass

logger = logging.getLogger("converto.admin.publish")


async def publish_activity(
    activity_type: str,
    tenant_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    **kwargs: Any
) -> ActivityEvent:
    """Publish an activity event through the configured bus.
    
    Args:
        activity_type: Type of activity (e.g., "user_login", "ocr_completed")
        tenant_id: Tenant identifier (defaults to "default")
        details: Additional event details
        **kwargs: Additional event data to include in details
    
    Returns:
        The published ActivityEvent
    """
    # Start timing for performance monitoring
    start_time = time.perf_counter()
    
    # Create the event
    event = ActivityEvent(
        type=activity_type,
        tenant_id=tenant_id or "default",
        details=details or {},
        **kwargs
    )
    
    try:
        # Publish through the bus
        bus = get_bus()
        await bus.publish(event.tenant_id, event)
        
        # Calculate publish latency
        publish_time = (time.perf_counter() - start_time) * 1000  # Convert to ms
        
        # Record publish latency metric
        observe_publish_latency(event.tenant_id, activity_type, publish_time)
        
        # Log the event with performance metrics
        logger.info(
            f"Published {activity_type} for tenant {event.tenant_id}",
            extra={
                "event_type": "activity_published",
                "activity_type": activity_type,
                "tenant_id": event.tenant_id,
                "activity_id": event.id,
                "publish_latency_ms": round(publish_time, 2),
                "bus_type": get_bus_config()["bus_type"]
            }
        )
        
        return event
        
    except Exception as e:
        # Log publish failure
        logger.error(
            f"Failed to publish {activity_type}: {e}",
            extra={
                "event_type": "publish_error",
                "activity_type": activity_type,
                "tenant_id": event.tenant_id,
                "activity_id": event.id,
                "error": str(e)
            }
        )
        raise


async def list_activities(
    tenant_id: Optional[str] = None,
    limit: int = 100
) -> list[ActivityEvent]:
    """List recent activities for a tenant.
    
    Args:
        tenant_id: Tenant identifier (defaults to "default")
        limit: Maximum number of events to retrieve
    
    Returns:
        List of ActivityEvent objects
    """
    try:
        bus = get_bus()
        events = await bus.list(tenant_id or "default", limit)
        
        logger.debug(
            f"Retrieved {len(events)} activities for tenant {tenant_id or 'default'}",
            extra={
                "event_type": "activities_listed",
                "tenant_id": tenant_id or "default",
                "count": len(events),
                "limit": limit
            }
        )
        
        return events
        
    except Exception as e:
        logger.error(
            f"Failed to list activities: {e}",
            extra={
                "event_type": "list_error",
                "tenant_id": tenant_id or "default",
                "limit": limit,
                "error": str(e)
            }
        )
        return []


# Convenience functions for common activity types

async def publish_user_activity(
    activity: str,
    user_id: str,
    tenant_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
) -> ActivityEvent:
    """Publish user-related activity."""
    return await publish_activity(
        activity_type=f"user_{activity}",
        tenant_id=tenant_id,
        details=details or {},
        user_id=user_id
    )


async def publish_system_activity(
    activity: str,
    component: str,
    tenant_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
) -> ActivityEvent:
    """Publish system-related activity."""
    return await publish_activity(
        activity_type=f"system_{activity}",
        tenant_id=tenant_id,
        details=details or {},
        component=component
    )


async def publish_security_activity(
    activity: str,
    user_id: Optional[str] = None,
    tenant_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
) -> ActivityEvent:
    """Publish security-related activity."""
    return await publish_activity(
        activity_type=f"security_{activity}",
        tenant_id=tenant_id,
        details=details or {},
        user_id=user_id
    )


async def publish_api_activity(
    endpoint: str,
    method: str,
    status_code: int,
    response_time: Optional[float] = None,
    tenant_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
) -> ActivityEvent:
    """Publish API activity."""
    return await publish_activity(
        activity_type="api_call",
        tenant_id=tenant_id,
        details=details or {},
        endpoint=endpoint,
        method=method,
        status_code=status_code,
        response_time_ms=response_time
    )


# High-level event types for common admin scenarios

async def log_user_login(user_id: str, tenant_id: Optional[str] = None) -> ActivityEvent:
    """Log user login event."""
    return await publish_user_activity("login", user_id, tenant_id, {
        "ip_address": "masked",  # Don't log actual IP in production
        "user_agent": "admin-dashboard"
    })


async def log_ocr_completed(
    document_id: str,
    processing_time: float,
    tenant_id: Optional[str] = None
) -> ActivityEvent:
    """Log OCR processing completion."""
    return await publish_system_activity("ocr_completed", "ocr-service", tenant_id, {
        "document_id": document_id,
        "processing_time_ms": processing_time
    })


async def log_api_error(
    endpoint: str,
    method: str,
    error: str,
    tenant_id: Optional[str] = None
) -> ActivityEvent:
    """Log API error."""
    return await publish_api_activity(endpoint, method, 500, tenant_id=tenant_id, details={
        "error": error,
        "severity": "error"
    })


async def log_rate_limit_exceeded(
    endpoint: str,
    user_id: Optional[str] = None,
    tenant_id: Optional[str] = None
) -> ActivityEvent:
    """Log rate limit exceedance."""
    return await publish_activity(
        "rate_limit_exceeded",
        tenant_id=tenant_id,
        details={
            "endpoint": endpoint,
            "user_id": user_id,
            "limit_type": "admin_api"
        }
    )
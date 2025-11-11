"""
Celery tasks for Stripe webhooks processing

These tasks assume the FastAPI billing service verifies Stripe signatures and
passes sanitized event payloads to Celery. Tasks persist outcomes to Redis for
API Gateway polling and emit OpenTelemetry spans and Prometheus metrics.
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, Optional

import redis

from .celery_app import celery_app, tracer, TASK_COUNT, ACTIVE_TASKS


logger = logging.getLogger(__name__)


REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)


def _set_task_status(task_id: str, status: str, meta: Optional[Dict[str, Any]] = None) -> None:
    key = f"task_status:{task_id}"
    data = {"task_id": task_id, "status": status, "updated_at": datetime.utcnow().isoformat()}
    if meta:
        data.update(meta)
    redis_client.setex(key, 3600, json.dumps(data))


@celery_app.task(bind=True, name="infrastructure.async_tasks.billing_tasks.process_stripe_event")
def process_stripe_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
    """Dispatch Stripe event to specific handlers by type."""
    ACTIVE_TASKS.labels(queue=self.request.delivery_info.get("routing_key", "unknown")).inc()
    with tracer.start_as_current_span("process_stripe_event") as span:
        event_type = event.get("type", "unknown")
        span.set_attribute("stripe.event_type", event_type)
        _set_task_status(self.request.id, "running", {"event_type": event_type})

        try:
            obj = event.get("data", {}).get("object", {})
            if event_type == "invoice.payment_succeeded":
                result = handle_invoice_payment_succeeded(obj)
            elif event_type == "invoice.payment_failed":
                result = handle_invoice_payment_failed(obj)
            elif event_type == "customer.subscription.created":
                result = handle_subscription_created(obj)
            elif event_type == "customer.subscription.updated":
                result = handle_subscription_updated(obj)
            else:
                result = {"handled": False, "message": f"Unhandled event {event_type}"}

            TASK_COUNT.labels(task_name=self.name, status="SUCCESS").inc()
            _set_task_status(self.request.id, "completed", {"result": result})
            redis_client.setex(
                f"task_result:{self.request.id}", 3600, json.dumps({"task_id": self.request.id, "success": True, "result": result})
            )
            return result
        except Exception as e:
            logger.error(f"Stripe event processing failed: {e}")
            TASK_COUNT.labels(task_name=self.name, status="FAILURE").inc()
            _set_task_status(self.request.id, "failed", {"error": str(e)})
            redis_client.setex(
                f"task_result:{self.request.id}", 3600, json.dumps({"task_id": self.request.id, "success": False, "error": str(e)})
            )
            raise
        finally:
            ACTIVE_TASKS.labels(queue=self.request.delivery_info.get("routing_key", "unknown")).dec()


def handle_invoice_payment_succeeded(invoice: Dict[str, Any]) -> Dict[str, Any]:
    """Handle successful invoice payments (e.g., record revenue, extend subscription)."""
    # Placeholder implementation: persist an event log to Redis
    key = f"billing:invoice:{invoice.get('id','unknown')}:status"
    redis_client.setex(key, 86400, "payment_succeeded")
    return {"handled": True, "action": "marked_payment_succeeded", "invoice_id": invoice.get("id")}


def handle_invoice_payment_failed(invoice: Dict[str, Any]) -> Dict[str, Any]:
    key = f"billing:invoice:{invoice.get('id','unknown')}:status"
    redis_client.setex(key, 86400, "payment_failed")
    return {"handled": True, "action": "marked_payment_failed", "invoice_id": invoice.get("id")}


def handle_subscription_created(subscription: Dict[str, Any]) -> Dict[str, Any]:
    key = f"billing:subscription:{subscription.get('id','unknown')}:status"
    redis_client.setex(key, 86400, "created")
    return {"handled": True, "action": "subscription_created", "subscription_id": subscription.get("id")}


def handle_subscription_updated(subscription: Dict[str, Any]) -> Dict[str, Any]:
    key = f"billing:subscription:{subscription.get('id','unknown')}:status"
    redis_client.setex(key, 86400, "updated")
    return {"handled": True, "action": "subscription_updated", "subscription_id": subscription.get("id")}



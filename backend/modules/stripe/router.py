"""Stripe webhook handlers and integrations."""

from __future__ import annotations

import logging
import os
from typing import Any, Mapping

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status

from backend.modules.email.router import get_email_service
from backend.modules.email.triggers import EmailTriggers
from backend.app.core.metrics import add_revenue_eur

logger = logging.getLogger("converto.stripe")
router = APIRouter(prefix="/api/v1/stripe", tags=["stripe"])


STRIPE_EVENT_MAP = {
    "payment_intent.succeeded": "stripe.payment_succeeded",
    "invoice.payment_succeeded": "stripe.payment_succeeded",
    "payment_intent.payment_failed": "stripe.payment_failed",
    "invoice.payment_failed": "stripe.payment_failed",
}


def get_webhook_secret() -> str:
    secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="stripe_webhook_secret_missing",
        )
    return secret


def get_email_triggers(
    email_service=Depends(get_email_service),
) -> EmailTriggers:
    return EmailTriggers(email_service)


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    secret: str = Depends(get_webhook_secret),
    triggers: EmailTriggers = Depends(get_email_triggers),
):
    raw_body = await request.body()
    sig_header = request.headers.get("stripe-signature")
    if not sig_header:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="missing_signature")

    payload = raw_body.decode("utf-8")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload, sig_header=sig_header, secret=secret
        )
    except (ValueError, stripe.error.InvalidRequestError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="invalid_payload"
        ) from exc
    except stripe.error.SignatureVerificationError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid_signature"
        ) from exc

    await _dispatch_stripe_event(event, triggers)
    logger.info("stripe_webhook_processed", extra={"event_type": event.get("type")})
    return {"status": "processed"}


async def _dispatch_stripe_event(event: Mapping[str, Any], triggers: EmailTriggers) -> None:
    event_type = event.get("type", "")
    mapped_type = STRIPE_EVENT_MAP.get(event_type, f"stripe.{event_type}")
    payload = {
        "type": mapped_type,
        "data": event.get("data", {}),
    }

    # Track revenue for successful payment events
    try:
        _track_revenue_if_applicable(event)
    except Exception as exc:
        logger.warning(
            "stripe_revenue_tracking_failed",
            extra={"event_type": event_type, "detail": str(exc)},
        )
        # Don't fail the webhook processing if revenue tracking fails

    try:
        await triggers.on_webhook_received(payload)  # type: ignore[arg-type]
    except Exception as exc:
        logger.error(
            "stripe_webhook_trigger_failed",
            extra={"event_type": event_type, "detail": str(exc)},
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="trigger_error"
        ) from exc


def _track_revenue_if_applicable(event: Mapping[str, Any]) -> None:
    """Track revenue for successful payment events."""
    event_type = event.get("type", "")
    event_data = event.get("data", {})
    event_object = event_data.get("object", {})
    
    # Handle charge.succeeded events
    if event_type == "charge.succeeded":
        amount_cents = event_object.get("amount", 0)
        currency = (event_object.get("currency") or "eur").lower()
        customer_id = event_object.get("customer")
        
        if currency == "eur" and amount_cents and amount_cents > 0:
            amount_eur = amount_cents / 100.0
            tenant_id = _extract_tenant_from_metadata(event_object) or customer_id or "default"
            add_revenue_eur(tenant_id, amount_eur)
            logger.info(
                "revenue_tracked_charge",
                extra={
                    "tenant_id": tenant_id,
                    "amount_eur": amount_eur,
                    "charge_id": event_object.get("id"),
                },
            )
    
    # Handle invoice.paid events  
    elif event_type == "invoice.paid":
        amount_cents = event_object.get("amount_paid", 0)
        currency = (event_object.get("currency") or "eur").lower()
        customer_id = event_object.get("customer")
        
        if currency == "eur" and amount_cents and amount_cents > 0:
            amount_eur = amount_cents / 100.0
            tenant_id = _extract_tenant_from_metadata(event_object) or customer_id or "default"
            add_revenue_eur(tenant_id, amount_eur)
            logger.info(
                "revenue_tracked_invoice",
                extra={
                    "tenant_id": tenant_id,
                    "amount_eur": amount_eur,
                    "invoice_id": event_object.get("id"),
                },
            )
    
    # Handle checkout.session.completed events
    elif event_type == "checkout.session.completed":
        amount_cents = event_object.get("amount_total", 0)
        currency = (event_object.get("currency") or "eur").lower()
        customer_id = event_object.get("customer")
        
        if currency == "eur" and amount_cents and amount_cents > 0:
            amount_eur = amount_cents / 100.0
            tenant_id = _extract_tenant_from_metadata(event_object) or customer_id or "default"
            add_revenue_eur(tenant_id, amount_eur)
            logger.info(
                "revenue_tracked_checkout",
                extra={
                    "tenant_id": tenant_id,
                    "amount_eur": amount_eur,
                    "checkout_session_id": event_object.get("id"),
                },
            )


def _extract_tenant_from_metadata(event_object: Mapping[str, Any]) -> str | None:
    """Extract tenant ID from Stripe object metadata."""
    metadata = event_object.get("metadata", {})
    return metadata.get("tenant_id") or metadata.get("tenantId")

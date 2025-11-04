"""Stripe webhook handlers for Converto Business OS."""

import logging
import os

import stripe
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger("converto.stripe")

router = APIRouter(prefix="/api/v1/stripe", tags=["stripe"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not sig_header or not webhook_secret:
        raise HTTPException(status_code=400, detail="Missing stripe-signature or webhook secret")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload") from e
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature") from e

    # Handle different event types
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        logger.info(f"Checkout completed: {session.get('id')}")
        # Update user subscription status in database
        # await update_user_subscription(session)

    elif event["type"] == "customer.subscription.created":
        subscription = event["data"]["object"]
        logger.info(f"Subscription created: {subscription.get('id')}")
        # Activate user subscription

    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        logger.info(f"Subscription updated: {subscription.get('id')}")
        # Update subscription status

    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        logger.info(f"Subscription deleted: {subscription.get('id')}")
        # Cancel user subscription

    elif event["type"] == "invoice.payment_succeeded":
        invoice = event["data"]["object"]
        logger.info(f"Invoice paid: {invoice.get('id')}")
        # Confirm payment

    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        logger.warning(f"Invoice payment failed: {invoice.get('id')}")
        # Notify user of failed payment

    return JSONResponse({"status": "success"})


@router.get("/products")
async def get_products():
    """Get Stripe products and prices."""
    try:
        products = stripe.Product.list(limit=10)
        prices = stripe.Price.list(limit=10)
        return {
            "products": [p for p in products.data],
            "prices": [p for p in prices.data],
        }
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch products") from e

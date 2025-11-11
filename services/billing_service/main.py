"""
Billing Microservice - Handles subscriptions, payments, and billing logic
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Request
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import stripe
import os
import logging
from datetime import datetime, timedelta
from enum import Enum
from .pricing import PricingInputs, calculate_adaptive_pricing

app = FastAPI(title="Billing Service", version="1.0.0")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")


class PlanType(str, Enum):
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class SubscriptionRequest(BaseModel):
    tenant_id: str
    plan_type: PlanType
    email: str
    payment_method_id: Optional[str] = None


class SubscriptionResponse(BaseModel):
    subscription_id: str
    client_secret: Optional[str] = None
    status: str
    plan_type: PlanType
    current_period_end: datetime
    customer_id: str


class PaymentRequest(BaseModel):
    amount: int  # Amount in cents
    currency: str = "eur"
    customer_id: str
    description: Optional[str] = None


class PaymentResponse(BaseModel):
    payment_intent_id: str
    client_secret: str
    status: str
    amount: int


class UsageRequest(BaseModel):
    tenant_id: str
    feature: str
    quantity: int = 1


class UsageResponse(BaseModel):
    usage_recorded: bool
    current_usage: int
    limit: int
    exceeded: bool


# Mock subscription plans
PLANS = {
    PlanType.STARTER: {
        "price_id": "price_starter",
        "amount": 2900,  # €29/month
        "features": ["ocr_basic", "ai_chat", "receipts"],
        "limits": {
            "ocr_scans_per_month": 150,
            "ai_tokens_per_month": 150000,
            "users": 1
        }
    },
    PlanType.PROFESSIONAL: {
        "price_id": "price_professional", 
        "amount": 9900,  # €99/month
        "features": ["ocr_advanced", "ai_chat", "receipts", "analytics", "integrations"],
        "limits": {
            "ocr_scans_per_month": 500,
            "ai_tokens_per_month": 400000,
            "users": 5
        }
    },
    PlanType.ENTERPRISE: {
        "price_id": "price_enterprise",
        "amount": 29900,  # €299/month
        "features": ["ocr_unlimited", "ai_chat", "receipts", "analytics", "integrations", "api_access", "priority_support"],
        "limits": {
            "ocr_scans_per_month": -1,  # unlimited
            "ai_tokens_per_month": 1000000,
            "users": -1  # unlimited
        }
    }
}


@app.post("/billing/subscribe", response_model=SubscriptionResponse)
async def create_subscription(request: SubscriptionRequest, background_tasks: BackgroundTasks):
    """Create new subscription"""
    
    try:
        # Get plan details
        plan = PLANS.get(request.plan_type)
        if not plan:
            raise HTTPException(status_code=400, detail="Invalid plan type")
        
        # Create or get customer
        customer = await get_or_create_customer(request.tenant_id, request.email)
        
        # Create subscription
        subscription_params = {
            "customer": customer.id,
            "items": [{"price": plan["price_id"]}],
            "payment_behavior": "default_incomplete",
            "payment_settings": {"save_default_payment_method": "on_subscription"},
            "expand": ["latest_invoice.payment_intent"]
        }
        
        subscription = stripe.Subscription.create(**subscription_params)
        
        # Record subscription in database (background task)
        background_tasks.add_task(record_subscription, request.tenant_id, subscription.id, request.plan_type)
        
        return SubscriptionResponse(
            subscription_id=subscription.id,
            client_secret=subscription.latest_invoice.payment_intent.client_secret,
            status=subscription.status,
            plan_type=request.plan_type,
            current_period_end=datetime.fromtimestamp(subscription.current_period_end),
            customer_id=customer.id
        )
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Payment error: {str(e)}")


@app.post("/billing/payment", response_model=PaymentResponse)
async def create_payment(request: PaymentRequest):
    """Create one-time payment"""
    
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=request.amount,
            currency=request.currency,
            customer=request.customer_id,
            description=request.description,
            automatic_payment_methods={"enabled": True}
        )
        
        return PaymentResponse(
            payment_intent_id=payment_intent.id,
            client_secret=payment_intent.client_secret,
            status=payment_intent.status,
            amount=payment_intent.amount
        )
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Payment error: {str(e)}")


@app.post("/billing/usage", response_model=UsageResponse)
async def record_usage(request: UsageRequest, background_tasks: BackgroundTasks):
    """Record feature usage for billing"""
    
    try:
        # Get tenant's current plan and usage
        plan_type = await get_tenant_plan(request.tenant_id)
        plan = PLANS.get(plan_type)
        
        if not plan:
            raise HTTPException(status_code=404, detail="Tenant plan not found")
        
        # Get current usage
        current_usage = await get_current_usage(request.tenant_id, request.feature)
        limit = plan["limits"].get(f"{request.feature}_per_month", 0)
        
        # Check if limit would be exceeded
        new_usage = current_usage + request.quantity
        exceeded = limit > 0 and new_usage > limit
        
        # Record usage (background task)
        background_tasks.add_task(
            record_usage_event, 
            request.tenant_id, 
            request.feature, 
            request.quantity
        )
        
        return UsageResponse(
            usage_recorded=True,
            current_usage=new_usage,
            limit=limit,
            exceeded=exceeded
        )
        
    except Exception as e:
        logger.error(f"Usage recording failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Usage error: {str(e)}")


@app.get("/billing/plans")
async def list_plans():
    """List available subscription plans"""
    return {"plans": PLANS}


@app.get("/billing/tenant/{tenant_id}/usage")
async def get_tenant_usage(tenant_id: str):
    """Get current usage for tenant"""
    
    try:
        # Mock usage data - in production, query database
        usage = {
            "ocr_scans_per_month": 42,
            "ai_tokens_per_month": 12500,
            "ai_chat_queries_per_month": 15
        }
        
        plan_type = await get_tenant_plan(tenant_id)
        plan = PLANS.get(plan_type, PLANS[PlanType.STARTER])
        
        return {
            "tenant_id": tenant_id,
            "plan_type": plan_type,
            "usage": usage,
            "limits": plan["limits"]
        }
        
    except Exception as e:
        logger.error(f"Usage retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Usage error: {str(e)}")


@app.get("/billing/tenant/{tenant_id}/usage/timeseries")
async def get_usage_timeseries(tenant_id: str, days: int = 30):
    """Return mock daily usage timeseries for the tenant (last N days)."""
    try:
        from datetime import timedelta
        base = datetime.utcnow()
        series = []
        for i in range(days - 1, -1, -1):
            day = (base - timedelta(days=i)).date().isoformat()
            # Mock variability
            ocr = 20 + (i * 3) % 15
            tokens = 5000 + (i * 457) % 12000
            series.append({"date": day, "ocr_scans": ocr, "ai_tokens": tokens})
        return {"tenant_id": tenant_id, "days": days, "series": series}
    except Exception as e:
        logger.error(f"Timeseries retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Timeseries error")


@app.get("/billing/tenant/{tenant_id}/adaptive-pricing")
async def get_adaptive_pricing(tenant_id: str):
    """Compute adaptive pricing recommendation based on current usage."""
    try:
        usage_resp = await get_tenant_usage(tenant_id)
        plan_type = str(usage_resp["plan_type"])
        usage = usage_resp["usage"]
        inputs = PricingInputs(
            plan_type=plan_type,
            ocr_scans_month=int(usage.get("ocr_scans_per_month", 0)),
            ai_tokens_month=int(usage.get("ai_tokens_per_month", 0)),
            users=int(usage_resp["limits"].get("users", 1)),
        )
        result = calculate_adaptive_pricing(inputs)
        return result
    except Exception as e:
        logger.error(f"Adaptive pricing failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Adaptive pricing error")


@app.post("/billing/webhook")
async def stripe_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle Stripe webhooks"""
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event["type"] == "customer.subscription.created":
        subscription = event["data"]["object"]
        background_tasks.add_task(handle_subscription_created, subscription)
        
    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        background_tasks.add_task(handle_subscription_updated, subscription)
        
    elif event["type"] == "invoice.payment_succeeded":
        invoice = event["data"]["object"]
        background_tasks.add_task(handle_payment_succeeded, invoice)
        
    elif event["type"] == "invoice.payment_failed":
        invoice = event["data"]["object"]
        background_tasks.add_task(handle_payment_failed, invoice)
    
    return {"status": "success"}


@app.get("/billing/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "billing-service"}


# Helper functions
async def get_or_create_customer(tenant_id: str, email: str) -> stripe.Customer:
    """Get or create Stripe customer"""
    
    # Check if customer exists
    customers = stripe.Customer.list(email=email, limit=1)
    if customers.data:
        return customers.data[0]
    
    # Create new customer
    return stripe.Customer.create(
        email=email,
        metadata={"tenant_id": tenant_id}
    )


async def get_tenant_plan(tenant_id: str) -> PlanType:
    """Get tenant's current plan"""
    # Mock implementation - in production, query database
    return PlanType.PROFESSIONAL


async def get_current_usage(tenant_id: str, feature: str) -> int:
    """Get current usage for feature"""
    # Mock implementation - in production, query database
    return 42


# Background task functions
async def record_subscription(tenant_id: str, subscription_id: str, plan_type: PlanType):
    """Record subscription in database"""
    logger.info(f"Recording subscription: {tenant_id} -> {subscription_id} ({plan_type})")


async def record_usage_event(tenant_id: str, feature: str, quantity: int):
    """Record usage event in database"""
    logger.info(f"Recording usage: {tenant_id} -> {feature} (+{quantity})")


async def handle_subscription_created(subscription: dict):
    """Handle subscription created webhook"""
    logger.info(f"Subscription created: {subscription['id']}")


async def handle_subscription_updated(subscription: dict):
    """Handle subscription updated webhook"""
    logger.info(f"Subscription updated: {subscription['id']}")


async def handle_payment_succeeded(invoice: dict):
    """Handle successful payment webhook"""
    logger.info(f"Payment succeeded: {invoice['id']}")


async def handle_payment_failed(invoice: dict):
    """Handle failed payment webhook"""
    logger.info(f"Payment failed: {invoice['id']}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8004)

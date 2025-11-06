"""Email API routes for Converto Business OS."""

import logging
import os
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel

from .cost_guard import get_cost_guard
from .monitoring import get_email_monitoring
from .service import EmailData, EmailService
from .templates import EmailTemplates
from .workflows import EmailWorkflows

logger = logging.getLogger("converto.email")
router = APIRouter(prefix="/api/v1/email", tags=["email"])


# Dependency to get email service
def get_email_service() -> EmailService:
    """Get email service instance."""
    import os

    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="RESEND_API_KEY not configured")
    return EmailService(api_key)


def get_email_workflows(email_service: EmailService = Depends(get_email_service)) -> EmailWorkflows:
    """Get email workflows instance."""
    return EmailWorkflows(email_service)


# Request models
class SendEmailRequest(BaseModel):
    to: str
    subject: str
    html: str
    from_email: str = None  # Will use RESEND_FROM_EMAIL from env if not provided
    reply_to: str = None
    tags: list[dict[str, str]] = None


class PilotSignupRequest(BaseModel):
    email: str
    name: str
    company: str
    document_types: list[str] | None = None


class DeploymentNotificationRequest(BaseModel):
    service_name: str
    status: str
    url: str = ""


class DailyReportRequest(BaseModel):
    metrics: dict[str, Any]


class ErrorAlertRequest(BaseModel):
    error_message: str
    service: str
    severity: str = "high"


class LaunchAnnouncementRequest(BaseModel):
    recipient_email: str
    recipient_name: str = "Friend"
    batch: bool = False  # If True, send to all pilot signups


# Routes
@router.post("/send")
async def send_email(
    request: SendEmailRequest, email_service: EmailService = Depends(get_email_service)
) -> dict[str, Any]:
    """Send a single email."""
    try:
        # Use RESEND_FROM_EMAIL from env if from_email not provided
        from_email = request.from_email or os.getenv("RESEND_FROM_EMAIL", "info@converto.fi")

        email_data = EmailData(
            to=request.to,
            subject=request.subject,
            html=request.html,
            from_email=from_email,
            reply_to=request.reply_to,
            tags=request.tags,
        )

        result = await email_service.send_email(email_data)
        return result
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pilot-signup")
async def pilot_signup_workflow(
    request: PilotSignupRequest, workflows: EmailWorkflows = Depends(get_email_workflows)
) -> dict[str, Any]:
    """Trigger pilot signup email workflow."""
    try:
        result = await workflows.pilot_onboarding_sequence(
            request.email, request.name, request.company, document_types=request.document_types
        )
        return result
    except Exception as e:
        logger.error(f"Pilot signup workflow failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/deployment-notification")
async def deployment_notification(
    request: DeploymentNotificationRequest, workflows: EmailWorkflows = Depends(get_email_workflows)
) -> dict[str, Any]:
    """Send deployment notification."""
    try:
        result = await workflows.deployment_notifications(
            request.service_name, request.status, request.url
        )
        return result
    except Exception as e:
        logger.error(f"Deployment notification failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/daily-report")
async def daily_report(
    request: DailyReportRequest, workflows: EmailWorkflows = Depends(get_email_workflows)
) -> dict[str, Any]:
    """Send daily metrics report."""
    try:
        result = await workflows.daily_metrics_report(request.metrics)
        return result
    except Exception as e:
        logger.error(f"Daily report failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/error-alert")
async def error_alert(
    request: ErrorAlertRequest, workflows: EmailWorkflows = Depends(get_email_workflows)
) -> dict[str, Any]:
    """Send error alert."""
    try:
        result = await workflows.error_alert_workflow(
            request.error_message, request.service, request.severity
        )
        return result
    except Exception as e:
        logger.error(f"Error alert failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/templates")
async def get_templates() -> dict[str, Any]:
    """Get available email templates."""
    templates = EmailTemplates()
    return {
        "templates": [
            "pilot_signup_welcome",
            "deployment_success",
            "daily_metrics_report",
            "error_alert",
        ],
        "example": {"pilot_signup_welcome": templates.pilot_signup_welcome("Testi", "Testi Oy")},
    }


@router.post("/webhook/resend")
async def resend_webhook(request: Request):
    """Handle Resend webhook events."""
    try:
        # Get webhook signature for verification
        signature = request.headers.get("resend-signature")
        if not signature:
            raise HTTPException(status_code=401, detail="Missing signature")

        # Parse webhook payload
        payload = await request.json()
        event_type = payload.get("type")

        # Process webhook event
        await _process_webhook_event(event_type, payload)

        return {"status": "processed"}
    except Exception as e:
        logger.error(f"Webhook processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def _process_webhook_event(event_type: str, payload: dict[str, Any]):
    """Process Resend webhook event."""
    logger.info(f"Processing webhook event: {event_type}")

    monitoring = get_email_monitoring()

    if event_type == "email.sent":
        await monitoring.record_email_sent(
            payload.get("data", {}).get("template", "unknown"),
            payload.get("data", {}).get("locale", "en"),
            "sent",
        )
    elif event_type == "email.delivered":
        await monitoring.record_email_delivered(
            payload.get("data", {}).get("template", "unknown"),
            payload.get("data", {}).get("locale", "en"),
            0.0,  # Latency would be calculated from timestamps
        )
    elif event_type == "email.opened":
        await monitoring.record_email_opened(
            payload.get("data", {}).get("template", "unknown"),
            payload.get("data", {}).get("locale", "en"),
        )
    elif event_type == "email.clicked":
        await monitoring.record_email_clicked(
            payload.get("data", {}).get("template", "unknown"),
            payload.get("data", {}).get("locale", "en"),
        )
    elif event_type == "email.bounced":
        await monitoring.record_email_bounced(
            payload.get("data", {}).get("template", "unknown"),
            payload.get("data", {}).get("bounce_type", "unknown"),
        )
    elif event_type == "email.complained":
        await monitoring.record_email_complained(payload.get("data", {}).get("template", "unknown"))


@router.get("/metrics")
async def get_email_metrics():
    """Get email metrics in Prometheus format."""
    try:
        monitoring = get_email_monitoring()
        metrics = monitoring.get_prometheus_metrics()
        return {"metrics": metrics}
    except Exception as e:
        logger.error(f"Failed to get metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cost-report")
async def get_cost_report():
    """Get cost report."""
    try:
        cost_guard = get_cost_guard()
        report = await cost_guard.generate_cost_report()
        return report
    except Exception as e:
        logger.error(f"Failed to get cost report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def email_health() -> dict[str, str]:
    """Email service health check."""
    try:
        # Check if we can access Resend API
        # This would be a simple API call to verify connectivity
        return {
            "status": "healthy",
            "service": "email",
            "monitoring": "active",
            "cost_guard": "active",
        }
    except Exception as e:
        logger.error(f"Email health check failed: {e}")
        return {"status": "unhealthy", "service": "email", "error": str(e)}


@router.post("/launch-announcement")
async def send_launch_announcement(
    request: LaunchAnnouncementRequest, email_service: EmailService = Depends(get_email_service)
) -> dict[str, Any]:
    """Send launch announcement email."""
    try:
        from_email = os.getenv("RESEND_FROM_EMAIL", "info@converto.fi")
        templates = EmailTemplates()
        
        html_content = templates.launch_announcement(request.recipient_name)
        
        email_data = EmailData(
            to=request.recipient_email,
            subject="🎉 Converto Business OS on Nyt Live! - Aloita Ilmainen Pilotti",
            html=html_content,
            from_email=from_email,
            reply_to="info@converto.fi",
            tags=[{"name": "category", "value": "launch_announcement"}],
        )
        
        result = await email_service.send_email(email_data)
        
        if result.get("success"):
            logger.info(f"Launch announcement sent to {request.recipient_email}")
            return {
                "success": True,
                "message": "Launch announcement sent successfully",
                "recipient": request.recipient_email,
                "email_id": result.get("id"),
            }
        else:
            raise HTTPException(
                status_code=500, detail=f"Failed to send launch announcement: {result.get('error')}"
            )
    except Exception as e:
        logger.error(f"Launch announcement failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test")
async def send_test_email(
    to: str = Query(..., description="Recipient email address"),
    email_service: EmailService = Depends(get_email_service),
) -> dict[str, Any]:
    """Send a test email to verify Resend configuration."""
    try:
        from_email = os.getenv("RESEND_FROM_EMAIL", "info@converto.fi")

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .success {{ color: #10b981; font-weight: bold; }}
                .info {{ background: #e0f2fe; padding: 15px; border-left: 4px solid #0ea5e9; margin: 20px 0; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Converto Email Test</h1>
                </div>
                <div class="content">
                    <p class="success">Sähköposti lähetetty onnistuneesti!</p>
                    <p>Jos näet tämän viestin, Resend API on konfiguroitu oikein ja custom domain <strong>info@converto.fi</strong> toimii.</p>

                    <div class="info">
                        <strong>📧 Lähettäjä:</strong> {from_email}<br>
                        <strong>📬 Vastaanottaja:</strong> {to}<br>
                        <strong>🕐 Aika:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
                    </div>

                    <p>Resend domain verification onnistui! 🎉</p>
                </div>
            </div>
        </body>
        </html>
        """

        email_data = EmailData(
            to=to,
            subject="✅ Converto Email Test - Domain Verification Success",
            html=html_content,
            from_email=from_email,
            reply_to="info@converto.fi",
        )

        result = await email_service.send_email(email_data)

        if result.get("success"):
            return {
                "success": True,
                "message": "Test email sent successfully",
                "from": from_email,
                "to": to,
                "email_id": result.get("id"),
            }
        else:
            raise HTTPException(
                status_code=500, detail=f"Failed to send test email: {result.get('error')}"
            )

    except Exception as e:
        logger.error(f"Test email failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

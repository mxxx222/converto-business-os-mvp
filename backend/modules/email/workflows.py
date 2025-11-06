# 🔄 Email Workflows - Resend Automation

import asyncio
import hashlib
import logging
import time
from datetime import datetime
from typing import Any

import httpx

from backend.config import get_settings
from backend.modules.email.cost_guard import get_cost_guard
from backend.modules.email.monitoring import get_email_monitoring
from backend.modules.email.template_manager import get_template_manager

logger = logging.getLogger(__name__)
settings = get_settings()


class EmailWorkflow:
    """Base class for email workflows."""

    def __init__(self, name: str):
        self.name = name
        self.template_manager = get_template_manager()
        self.monitoring = get_email_monitoring()
        self.cost_guard = get_cost_guard()

        # Workflow configuration
        self.max_retries = 3
        self.retry_delay = 1.0  # seconds
        self.idempotency_window = 3600  # 1 hour

    async def send_email(
        self, template: str, recipient: str, locale: str = "fi", **kwargs
    ) -> dict[str, Any]:
        """Send email with monitoring and cost control."""
        start_time = time.time()

        # Check if email is allowed
        cost_check = await self.cost_guard.should_allow_email(template, recipient)
        if not cost_check["allowed"]:
            logger.warning(f"Email blocked: {cost_check['reason']} - {recipient}")
            return {
                "success": False,
                "error": cost_check["reason"],
                "message": cost_check["message"],
            }

        # Generate idempotency key
        idempotency_key = self._generate_idempotency_key(template, recipient, kwargs)

        # Check if we've already sent this email recently
        if await self._is_duplicate(idempotency_key):
            logger.info(f"Duplicate email prevented: {template} to {recipient}")
            return {"success": True, "duplicate": True, "message": "Email already sent recently"}

        # Render template
        try:
            email_data = self.template_manager.render_template(template, locale, **kwargs)
        except Exception as e:
            logger.error(f"Template rendering failed: {e}")
            return {"success": False, "error": "template_render_failed", "message": str(e)}

        # Send email with retries
        for attempt in range(self.max_retries):
            try:
                result = await self._send_via_resend(email_data, recipient, idempotency_key)

                if result["success"]:
                    # Record success metrics
                    latency = time.time() - start_time
                    await self.monitoring.record_email_sent(template, locale, "sent")
                    await self.monitoring.record_email_delivered(template, locale, latency)

                    # Store idempotency key
                    await self._store_idempotency_key(idempotency_key)

                    logger.info(f"Email sent successfully: {template} to {recipient}")
                    return result
                else:
                    logger.warning(
                        f"Email send failed (attempt {attempt + 1}): {result.get('error')}"
                    )

            except Exception as e:
                logger.error(f"Email send error (attempt {attempt + 1}): {e}")

            # Wait before retry
            if attempt < self.max_retries - 1:
                await asyncio.sleep(self.retry_delay * (2**attempt))  # Exponential backoff

        # All retries failed
        logger.error(
            f"Email send failed after {self.max_retries} attempts: {template} to {recipient}"
        )
        return {
            "success": False,
            "error": "max_retries_exceeded",
            "message": "Email send failed after maximum retries",
        }

    async def _send_via_resend(
        self, email_data: dict[str, Any], recipient: str, idempotency_key: str
    ) -> dict[str, Any]:
        """Send email via Resend API."""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {settings.resend_api_key}",
                        "Content-Type": "application/json",
                        "Idempotency-Key": idempotency_key,
                    },
                    json={
                        "from": email_data["from"],
                        "to": [recipient],
                        "subject": email_data["subject"],
                        "html": email_data["content"],
                        "reply_to": email_data["reply_to"],
                    },
                )

                response.raise_for_status()
                result = response.json()

                return {"success": True, "message_id": result.get("id"), "status": "sent"}

            except httpx.HTTPError as e:
                logger.error(f"Resend API error: {e}")
                return {"success": False, "error": "resend_api_error", "message": str(e)}

    def _generate_idempotency_key(
        self, template: str, recipient: str, kwargs: dict[str, Any]
    ) -> str:
        """Generate idempotency key for email."""
        content = f"{template}:{recipient}:{sorted(kwargs.items())}"
        return hashlib.sha256(content.encode()).hexdigest()

    async def _is_duplicate(self, idempotency_key: str) -> bool:
        """Check if email was already sent recently."""
        # In real implementation, this would check a database
        # For now, return False (no duplicates)
        return False

    async def _store_idempotency_key(self, idempotency_key: str):
        """Store idempotency key to prevent duplicates."""
        # In real implementation, this would store in database with TTL
        # For now, just log
        logger.info(f"Stored idempotency key: {idempotency_key}")


class PilotOnboardingWorkflow(EmailWorkflow):
    """Pilot onboarding email workflow."""

    def __init__(self):
        super().__init__("pilot_onboarding")
        self.follow_up_delays = [24 * 3600, 7 * 24 * 3600, 30 * 24 * 3600]  # 1d, 7d, 30d

    async def start_onboarding(
        self, user_name: str, user_email: str, locale: str = "fi", company: str = "Converto Business OS", document_types: list[str] | None = None
    ) -> dict[str, Any]:
        """Start pilot onboarding workflow."""
        logger.info(f"Starting pilot onboarding for {user_name} ({user_email})")

        # Send welcome email using pilot_signup_welcome template
        from backend.modules.email.templates import EmailTemplates

        templates = EmailTemplates()
        html_content = templates.pilot_signup_welcome(user_name, company, document_types)

        # Use EmailService directly to send email
        import os

        from backend.modules.email.service import EmailData, EmailService

        api_key = os.getenv("RESEND_API_KEY")
        if not api_key:
            logger.error("RESEND_API_KEY not configured")
            return {"success": False, "error": "RESEND_API_KEY not configured"}

        email_service = EmailService(api_key)
        email_data = EmailData(
            to=user_email,
            subject="🚀 Tervetuloa Converto Business OS:een!",
            html=html_content,
            from_email=os.getenv("RESEND_FROM_EMAIL", "info@converto.fi"),
            reply_to="info@converto.fi",
        )

        result = await email_service.send_email(email_data)

        # Also record metrics
        if result.get("success"):
            await self.monitoring.record_email_sent("pilot_signup_welcome", locale, "sent")
            logger.info(f"Pilot welcome email sent to {user_email}")

        if result["success"]:
            # Schedule follow-up emails
            await self._schedule_follow_ups(user_email, locale, user_name)

        return result

    async def _schedule_follow_ups(self, user_email: str, locale: str, user_name: str):
        """Schedule follow-up emails."""
        for i, delay in enumerate(self.follow_up_delays):
            # In real implementation, this would schedule with a task queue
            logger.info(f"Scheduled follow-up {i + 1} for {user_email} in {delay}s")

    async def send_follow_up(
        self, user_email: str, follow_up_number: int, locale: str = "fi"
    ) -> dict[str, Any]:
        """Send follow-up email."""
        template = f"pilot_onboarding_followup_{follow_up_number}"

        return await self.send_email(
            template=template,
            recipient=user_email,
            locale=locale,
            user_name="User",  # Would be fetched from database
            company_name="Converto Business OS",
        )


class DeploymentNotificationWorkflow(EmailWorkflow):
    """Deployment notification email workflow."""

    def __init__(self):
        super().__init__("deployment_notification")

    async def notify_deployment(
        self, service_name: str, status: str, recipient: str = "max@herbspot.fi", locale: str = "en"
    ) -> dict[str, Any]:
        """Send deployment notification."""
        logger.info(f"Sending deployment notification: {service_name} - {status}")

        return await self.send_email(
            template="deployment_notification",
            recipient=recipient,
            locale=locale,
            service_name=service_name,
            status=status,
            timestamp=datetime.now().isoformat(),
            deployment_url=f"https://dashboard.render.com/web/{service_name}",
        )

    async def notify_deployment_success(
        self, service_name: str, recipient: str = "max@herbspot.fi"
    ) -> dict[str, Any]:
        """Send deployment success notification."""
        return await self.notify_deployment(service_name, "success", recipient)

    async def notify_deployment_failure(
        self, service_name: str, error_message: str, recipient: str = "max@herbspot.fi"
    ) -> dict[str, Any]:
        """Send deployment failure notification."""
        return await self.send_email(
            template="deployment_notification",
            recipient=recipient,
            locale="en",
            service_name=service_name,
            status="failed",
            error_message=error_message,
            timestamp=datetime.now().isoformat(),
            deployment_url=f"https://dashboard.render.com/web/{service_name}",
        )


class ErrorAlertWorkflow(EmailWorkflow):
    """Error alert email workflow."""

    def __init__(self):
        super().__init__("error_alert")
        self.alert_thresholds = {"low": 1, "medium": 3, "high": 5, "critical": 10}

    async def send_error_alert(
        self,
        service_name: str,
        severity: str,
        error_message: str,
        recipient: str = "max@herbspot.fi",
        locale: str = "en",
    ) -> dict[str, Any]:
        """Send error alert."""
        logger.warning(f"Sending error alert: {service_name} - {severity} - {error_message}")

        return await self.send_email(
            template="error_alert",
            recipient=recipient,
            locale=locale,
            service_name=service_name,
            severity=severity,
            error_message=error_message,
            timestamp=datetime.now().isoformat(),
            alert_url=f"https://dashboard.render.com/web/{service_name}",
        )

    async def send_escalation_alert(
        self, service_name: str, error_message: str, recipient: str = "max@herbspot.fi"
    ) -> dict[str, Any]:
        """Send escalation alert for critical errors."""
        return await self.send_error_alert(
            service_name=service_name,
            severity="critical",
            error_message=error_message,
            recipient=recipient,
        )

    async def check_error_threshold(self, service_name: str, error_count: int) -> bool:
        """Check if error count exceeds threshold for alerting."""
        # In real implementation, this would check against historical data
        # For now, use simple thresholds
        if error_count >= self.alert_thresholds["critical"]:
            await self.send_escalation_alert(service_name, f"Error count: {error_count}")
            return True
        elif error_count >= self.alert_thresholds["high"]:
            await self.send_error_alert(service_name, "high", f"Error count: {error_count}")
            return True

        return False


# Workflow instances
pilot_onboarding = PilotOnboardingWorkflow()
deployment_notification = DeploymentNotificationWorkflow()
error_alert = ErrorAlertWorkflow()


class EmailWorkflows:
    """Container class for all email workflows."""

    def __init__(self, email_service=None):
        """Initialize workflows container."""
        self.pilot_onboarding = pilot_onboarding
        self.deployment_notification = deployment_notification
        self.error_alert = error_alert

        # Direct access to workflow instances
        self.onboarding = self.pilot_onboarding
        self.deployment = self.deployment_notification
        self.alert = self.error_alert

    async def start_pilot_onboarding(
        self, user_name: str, user_email: str, locale: str = "fi"
    ) -> dict[str, Any]:
        """Start pilot onboarding workflow."""
        return await pilot_onboarding.start_onboarding(user_name, user_email, locale)

    async def pilot_onboarding_sequence(
        self, email: str, name: str, company: str, locale: str = "fi", document_types: list[str] | None = None
    ) -> dict[str, Any]:
        """Pilot signup sequence - sends welcome email to new pilot signup."""
        logger.info(f"Pilot onboarding sequence for {name} ({email}) from {company}")
        return await pilot_onboarding.start_onboarding(name, email, locale, company, document_types)

    async def notify_deployment_success(
        self, service_name: str, recipient: str = "max@herbspot.fi"
    ) -> dict[str, Any]:
        """Notify deployment success."""
        return await deployment_notification.notify_deployment_success(service_name, recipient)

    async def notify_deployment_failure(
        self, service_name: str, error_message: str, recipient: str = "max@herbspot.fi"
    ) -> dict[str, Any]:
        """Notify deployment failure."""
        return await deployment_notification.notify_deployment_failure(
            service_name, error_message, recipient
        )

    async def send_error_alert(
        self,
        service_name: str,
        severity: str,
        error_message: str,
        recipient: str = "max@herbspot.fi",
    ) -> dict[str, Any]:
        """Send error alert."""
        return await error_alert.send_error_alert(service_name, severity, error_message, recipient)

    async def check_and_alert_errors(self, service_name: str, error_count: int) -> bool:
        """Check error count and send alert if needed."""
        return await error_alert.check_error_threshold(service_name, error_count)


# Convenience functions
async def start_pilot_onboarding(
    user_name: str, user_email: str, locale: str = "fi"
) -> dict[str, Any]:
    """Start pilot onboarding workflow."""
    return await pilot_onboarding.start_onboarding(user_name, user_email, locale)


async def notify_deployment_success(
    service_name: str, recipient: str = "max@herbspot.fi"
) -> dict[str, Any]:
    """Notify deployment success."""
    return await deployment_notification.notify_deployment_success(service_name, recipient)


async def notify_deployment_failure(
    service_name: str, error_message: str, recipient: str = "max@herbspot.fi"
) -> dict[str, Any]:
    """Notify deployment failure."""
    return await deployment_notification.notify_deployment_failure(
        service_name, error_message, recipient
    )


async def send_error_alert(
    service_name: str, severity: str, error_message: str, recipient: str = "max@herbspot.fi"
) -> dict[str, Any]:
    """Send error alert."""
    return await error_alert.send_error_alert(service_name, severity, error_message, recipient)


async def check_and_alert_errors(service_name: str, error_count: int) -> bool:
    """Check error count and send alert if needed."""
    return await error_alert.check_error_threshold(service_name, error_count)

"""Email service for Converto Business OS using Resend API."""

import logging
import os
from typing import Any

import httpx
from pydantic import BaseModel

logger = logging.getLogger("converto.email")

# Default from email from environment variable
DEFAULT_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "info@converto.fi")


class EmailData(BaseModel):
    """Email data model."""

    to: str
    subject: str
    html: str
    from_email: str = DEFAULT_FROM_EMAIL
    reply_to: str | None = None
    tags: list[dict[str, str]] | None = None


class EmailService:
    """Email service using Resend API."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.resend.com"
        self.client = httpx.AsyncClient(
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            timeout=30.0,
        )

    async def send_email(self, email_data: EmailData) -> dict[str, Any]:
        """Send email via Resend API."""
        try:
            payload = {
                "from": email_data.from_email,
                "to": [email_data.to],
                "subject": email_data.subject,
                "html": email_data.html,
            }

            if email_data.reply_to:
                payload["reply_to"] = email_data.reply_to

            if email_data.tags:
                payload["tags"] = email_data.tags

            response = await self.client.post(f"{self.base_url}/emails", json=payload)

            if response.status_code == 200:
                result = response.json()
                logger.info(f"Email sent successfully: {result.get('id')}")
                return {"success": True, "id": result.get("id")}
            else:
                error = response.text
                logger.error(f"Resend API error: {response.status_code} - {error}")
                return {"success": False, "error": error}

        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}")
            return {"success": False, "error": str(e)}

    async def send_bulk_emails(self, emails: list[EmailData]) -> dict[str, Any]:
        """Send multiple emails efficiently."""
        results = []
        for email in emails:
            result = await self.send_email(email)
            results.append(result)

        success_count = sum(1 for r in results if r.get("success"))
        return {
            "total": len(emails),
            "success": success_count,
            "failed": len(emails) - success_count,
            "results": results,
        }

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()

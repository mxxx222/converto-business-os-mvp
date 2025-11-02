"""Linear automation integrations - ROI MAXIMIZED.

Auto-creates Linear issues from:
- Sentry errors
- Deployment failures
- Customer feedback
- Critical alerts
"""

from __future__ import annotations

import logging
from typing import Any

from shared_core.modules.linear.client_optimized import get_linear_client_optimized

logger = logging.getLogger("converto.linear.automation")


class LinearAutomation:
    """Automation for Linear issue creation."""

    def __init__(self, team_id: str | None = None):
        """Initialize automation.

        Args:
            team_id: Default team ID for issues
        """
        self.team_id = team_id or ""
        self.client = None
        try:
            self.client = get_linear_client_optimized()
        except Exception as e:
            logger.warning(f"Linear client not available: {e}")

    async def create_from_sentry_error(
        self,
        error_title: str,
        error_message: str,
        error_url: str,
        environment: str = "production",
        team_id: str | None = None,
    ) -> dict[str, Any] | None:
        """Create Linear issue from Sentry error."""
        if not self.client:
            return None

        try:
            team = team_id or self.team_id
            if not team:
                # Try to get first team
                teams = await self.client.get_teams()
                if teams:
                    team = teams[0]["id"]
                else:
                    logger.error("No teams found in Linear")
                    return None

            title = f"[Sentry] {error_title}"
            description = f"""
**Error:** {error_message}

**Environment:** {environment}
**Sentry URL:** {error_url}

**Auto-created from Sentry error.**
"""

            issue = await self.client.create_issue(
                team_id=team,
                title=title,
                description=description,
                priority=1,  # High priority for errors
                label_ids=["bug"] if await self._get_label_id(team, "bug") else None,
            )

            logger.info(
                f"Created Linear issue from Sentry error: {issue.get('issue', {}).get('id')}"
            )
            return issue
        except Exception as e:
            logger.error(f"Failed to create Linear issue from Sentry: {e}")
            return None

    async def create_from_deployment(
        self,
        service_name: str,
        status: str,
        version: str,
        error_message: str | None = None,
        team_id: str | None = None,
    ) -> dict[str, Any] | None:
        """Create Linear issue from deployment failure."""
        if not self.client or status == "success":
            return None

        try:
            team = team_id or self.team_id
            if not team:
                teams = await self.client.get_teams()
                if teams:
                    team = teams[0]["id"]
                else:
                    return None

            title = f"[Deployment] {service_name} failed - {version}"
            description = f"""
**Service:** {service_name}
**Version:** {version}
**Status:** {status}

**Error:** {error_message or "Deployment failed"}

**Auto-created from deployment failure.**
"""

            issue = await self.client.create_issue(
                team_id=team,
                title=title,
                description=description,
                priority=1,  # High priority
                label_ids=["deployment"] if await self._get_label_id(team, "deployment") else None,
            )

            logger.info(f"Created Linear issue from deployment: {issue.get('issue', {}).get('id')}")
            return issue
        except Exception as e:
            logger.error(f"Failed to create Linear issue from deployment: {e}")
            return None

    async def create_from_customer_feedback(
        self,
        customer_name: str,
        feedback: str,
        email: str | None = None,
        team_id: str | None = None,
    ) -> dict[str, Any] | None:
        """Create Linear issue from customer feedback."""
        if not self.client:
            return None

        try:
            team = team_id or self.team_id
            if not team:
                teams = await self.client.get_teams()
                if teams:
                    team = teams[0]["id"]
                else:
                    return None

            title = f"[Feedback] {customer_name}"
            description = f"""
**Customer:** {customer_name}
**Email:** {email or "N/A"}

**Feedback:**
{feedback}

**Auto-created from customer feedback.**
"""

            issue = await self.client.create_issue(
                team_id=team,
                title=title,
                description=description,
                priority=2,  # Medium priority
                label_ids=["feedback"] if await self._get_label_id(team, "feedback") else None,
            )

            logger.info(f"Created Linear issue from feedback: {issue.get('issue', {}).get('id')}")
            return issue
        except Exception as e:
            logger.error(f"Failed to create Linear issue from feedback: {e}")
            return None

    async def _get_label_id(self, team_id: str, label_name: str) -> str | None:
        """Get label ID by name."""
        try:
            labels = await self.client.get_labels(team_id)
            for label in labels:
                if label["name"].lower() == label_name.lower():
                    return label["id"]
        except Exception:
            pass
        return None


# Global instance
_linear_automation: LinearAutomation | None = None


def get_linear_automation() -> LinearAutomation | None:
    """Get Linear automation instance."""
    global _linear_automation
    if _linear_automation is None:
        _linear_automation = LinearAutomation()
    return _linear_automation

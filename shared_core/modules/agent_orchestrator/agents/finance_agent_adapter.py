"""Adapter to make FinanceAgent compatible with Agent Orchestrator."""

import logging
from typing import Any

from shared_core.modules.finance_agent.service import FinanceAgentService

from ..agent_registry import Agent, AgentMetadata, AgentType

logger = logging.getLogger("converto.agent_orchestrator")


class FinanceAgentAdapter(Agent):
    """Adapter to make FinanceAgent compatible with Agent Orchestrator."""

    def __init__(self, tenant_id: str, user_id: str | None = None):
        self.tenant_id = tenant_id
        self.user_id = user_id
        self._service: FinanceAgentService | None = None

    @property
    def service(self) -> FinanceAgentService:
        """Get or create FinanceAgentService instance."""
        if self._service is None:
            self._service = FinanceAgentService(tenant_id=self.tenant_id, user_id=self.user_id)
        return self._service

    async def execute(self, input_data: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        """Execute FinanceAgent analysis.

        Args:
            input_data: Input data (receipt_data, category, vat_amount, etc.)
            context: Execution context (workflow state, etc.)

        Returns:
            FinanceAgent analysis result
        """
        try:
            # Get database session from context if available
            db = context.get("db")
            if not db:
                # In production, use dependency injection or pass db via context
                # For now, we'll use a session generator
                from shared_core.utils.db import get_session

                db = next(get_session(), None)
                if not db:
                    raise ValueError("Database session not available")

            # Analyze receipts
            days_back = input_data.get("days_back", 30)
            insights = self.service.analyze_receipts(db, days_back=days_back)

            # Convert insights to dict
            if insights:
                insights_data = [
                    {
                        "type": insight.type,
                        "title": insight.title,
                        "description": insight.description,
                        "confidence": insight.confidence,
                        "metadata": insight.metadata,
                    }
                    for insight in insights
                ]
            else:
                insights_data = []

            # Detect spending alerts
            alerts = self.service.detect_spending_alerts(db)
            alerts_data = [
                {
                    "type": alert.type,
                    "message": alert.message,
                    "severity": alert.severity,
                    "metadata": alert.metadata,
                }
                for alert in alerts
            ]

            return {
                "insights": insights_data,
                "alerts": alerts_data,
                "recommendations": [
                    "Monitor spending trends",
                    "Review recurring expenses",
                    "Optimize tax deductions",
                ],
            }

        except Exception as e:
            logger.error(f"FinanceAgent execution failed: {e}")
            raise

    def get_metadata(self) -> AgentMetadata:
        """Get FinanceAgent metadata."""
        from ..agent_registry import AgentMetadata

        return AgentMetadata(
            agent_id="finance_agent",
            agent_type=AgentType.FINANCE,
            name="Finance Agent",
            description="AI-powered financial advisor agent that analyzes spending, detects anomalies, and provides insights",
            version="1.0.0",
            capabilities=[
                "spending_analysis",
                "anomaly_detection",
                "tax_optimization",
                "spending_alerts",
                "financial_insights",
            ],
            input_schema={
                "type": "object",
                "properties": {
                    "receipt_data": {"type": "object", "description": "Receipt data"},
                    "category": {"type": "string", "description": "Receipt category"},
                    "vat_amount": {"type": "number", "description": "VAT amount"},
                    "days_back": {"type": "integer", "description": "Days to analyze"},
                },
            },
            output_schema={
                "type": "object",
                "properties": {
                    "insights": {"type": "array", "description": "Financial insights"},
                    "alerts": {"type": "array", "description": "Spending alerts"},
                    "recommendations": {"type": "array", "description": "Recommendations"},
                },
            },
            dependencies=[],  # FinanceAgent doesn't depend on other agents
            cost_per_request=0.001,  # Estimated cost per request
            avg_response_time_ms=2000,  # Average response time
        )

    async def validate_input(self, input_data: dict[str, Any]) -> bool:
        """Validate input data for FinanceAgent.

        Args:
            input_data: Input data to validate

        Returns:
            True if valid, False otherwise
        """
        # FinanceAgent accepts any input, validation happens in service layer
        return True

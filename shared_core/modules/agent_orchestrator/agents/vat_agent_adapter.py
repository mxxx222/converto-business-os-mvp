"""Adapter for VAT calculation agent."""

import logging
from typing import Any

from ..agent_registry import Agent, AgentMetadata, AgentType

logger = logging.getLogger("converto.agent_orchestrator")


class VATAgentAdapter(Agent):
    """Adapter for VAT calculation agent."""

    # Finnish VAT rates (as of 2025)
    VAT_RATES = {
        "standard": 0.24,  # 24% standard rate
        "reduced": 0.14,  # 14% reduced rate (food, books, etc.)
        "low": 0.10,  # 10% low rate (pharmaceuticals, etc.)
        "zero": 0.0,  # 0% zero rate
    }

    def __init__(self):
        pass

    async def execute(self, input_data: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        """Calculate VAT from receipt data.

        Args:
            input_data: Input data (receipt_data, total_amount, etc.)
            context: Execution context

        Returns:
            VAT calculation result
        """
        try:
            receipt_data = input_data.get("receipt_data", {})
            total_amount = input_data.get("total_amount") or receipt_data.get("total_amount")

            if not total_amount:
                raise ValueError("total_amount is required for VAT calculation")

            # Determine VAT rate
            vat_rate = self._determine_vat_rate(receipt_data, input_data)

            # Calculate VAT amounts
            # If total includes VAT: vat_amount = total * (vat_rate / (1 + vat_rate))
            # If total excludes VAT: vat_amount = total * vat_rate

            total_including_vat = float(total_amount)
            vat_amount = total_including_vat * (vat_rate / (1 + vat_rate))
            amount_excluding_vat = total_including_vat - vat_amount

            # Detect VAT rate from receipt if available
            detected_vat_rate = receipt_data.get("vat_rate") or vat_rate

            return {
                "vat_amount": round(vat_amount, 2),
                "vat_rate": detected_vat_rate,
                "amount_excluding_vat": round(amount_excluding_vat, 2),
                "amount_including_vat": round(total_including_vat, 2),
                "vat_category": self._get_vat_category(detected_vat_rate),
                "compliance": {
                    "finland": True,
                    "rate_valid_from": "2024-01-01",
                    "regulation": "Suomen ALV-laki",
                },
                "success": True,
            }

        except Exception as e:
            logger.error(f"VAT Agent execution failed: {e}")
            raise

    def _determine_vat_rate(
        self, receipt_data: dict[str, Any], input_data: dict[str, Any]
    ) -> float:
        """Determine VAT rate from receipt data.

        Args:
            receipt_data: Receipt data
            input_data: Additional input data

        Returns:
            VAT rate (0.0-1.0)
        """
        # Use explicit VAT rate if provided
        if "vat_rate" in input_data:
            return float(input_data["vat_rate"])

        # Check receipt data
        if "vat_rate" in receipt_data:
            return float(receipt_data["vat_rate"])

        # Detect from category
        category = receipt_data.get("category", "").lower()
        receipt_data.get("items", [])

        # Check if any items indicate reduced rate
        food_keywords = ["ruoka", "food", "kahvi", "leipä", "maito"]
        book_keywords = ["kirja", "book", "lehti", "magazine"]

        if any(keyword in category for keyword in food_keywords + book_keywords):
            return self.VAT_RATES["reduced"]

        # Default to standard rate
        return self.VAT_RATES["standard"]

    def _get_vat_category(self, vat_rate: float) -> str:
        """Get VAT category name from rate.

        Args:
            vat_rate: VAT rate (0.0-1.0)

        Returns:
            VAT category name
        """
        for category, rate in self.VAT_RATES.items():
            if abs(vat_rate - rate) < 0.01:
                return category
        return "standard"

    def get_metadata(self) -> AgentMetadata:
        """Get VAT Agent metadata."""
        from ..agent_registry import AgentMetadata

        return AgentMetadata(
            agent_id="vat_agent",
            agent_type=AgentType.VAT,
            name="VAT Agent",
            description="VAT calculation agent that calculates VAT amounts and rates according to Finnish tax regulations",
            version="1.0.0",
            capabilities=[
                "vat_calculation",
                "vat_rate_detection",
                "tax_compliance",
                "regulatory_compliance",
            ],
            input_schema={
                "type": "object",
                "properties": {
                    "receipt_data": {"type": "object", "description": "Receipt data"},
                    "total_amount": {"type": "number", "description": "Total amount"},
                    "vat_rate": {
                        "type": "number",
                        "description": "VAT rate (optional, will be detected)",
                    },
                },
                "required": ["total_amount"],
            },
            output_schema={
                "type": "object",
                "properties": {
                    "vat_amount": {"type": "number", "description": "VAT amount"},
                    "vat_rate": {"type": "number", "description": "VAT rate"},
                    "amount_excluding_vat": {
                        "type": "number",
                        "description": "Amount excluding VAT",
                    },
                    "amount_including_vat": {
                        "type": "number",
                        "description": "Amount including VAT",
                    },
                    "vat_category": {"type": "string", "description": "VAT category"},
                    "compliance": {"type": "object", "description": "Compliance information"},
                },
            },
            dependencies=[],
            cost_per_request=0.0,  # No API cost
            avg_response_time_ms=100,
        )

    async def validate_input(self, input_data: dict[str, Any]) -> bool:
        """Validate input data for VAT Agent.

        Args:
            input_data: Input data to validate

        Returns:
            True if valid, False otherwise
        """
        # Must have total_amount
        has_total = "total_amount" in input_data or (
            "receipt_data" in input_data and "total_amount" in input_data["receipt_data"]
        )

        return has_total



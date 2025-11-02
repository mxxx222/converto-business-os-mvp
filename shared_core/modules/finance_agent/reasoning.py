"""Reasoning Engine for FinanceAgent - GPT-based decision making."""

from __future__ import annotations

import json
import logging
import os
from typing import Any

from openai import OpenAI

logger = logging.getLogger("converto.finance_agent.reasoning")


class ReasoningEngine:
    """GPT-based reasoning engine for financial decisions."""

    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY not configured")
        self.client = OpenAI(api_key=api_key)
        self.model = "gpt-4o-mini"

    def analyze_financial_context(
        self,
        context_data: dict[str, Any],
        user_context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Analyze financial context and generate insights."""

        # Build system prompt
        system_prompt = """You are FinanceAgent, an AI financial advisor for Finnish small businesses.

Your role:
- Analyze spending patterns and identify anomalies
- Provide tax optimization recommendations
- Warn about cashflow risks
- Detect recurring costs and suggest savings
- Alert about legal/regulatory changes that affect the business

You must:
- Be specific and actionable
- Use Finnish business context (ALV, YEL, etc.)
- Provide clear recommendations
- Flag urgent issues immediately
"""

        # Build user prompt from context
        user_prompt = self._build_analysis_prompt(context_data, user_context)

        # Define function schema for structured output
        functions = [
            {
                "name": "generate_financial_insights",
                "description": "Generate financial insights and recommendations",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "insights": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "type": {
                                        "type": "string",
                                        "enum": [
                                            "spending_alert",
                                            "tax_optimization",
                                            "cashflow_warning",
                                            "pattern_detection",
                                            "savings_recommendation",
                                            "risk_assessment",
                                        ],
                                    },
                                    "title": {"type": "string"},
                                    "summary": {"type": "string"},
                                    "recommendation": {"type": "string"},
                                    "action_items": {
                                        "type": "array",
                                        "items": {"type": "string"},
                                    },
                                    "confidence": {"type": "number", "minimum": 0, "maximum": 1},
                                    "severity": {
                                        "type": "string",
                                        "enum": ["info", "warning", "critical"],
                                    },
                                },
                                "required": ["type", "title", "summary", "confidence"],
                            },
                        },
                    },
                    "required": ["insights"],
                },
            }
        ]

        try:
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                functions=functions,
                function_call={"name": "generate_financial_insights"},
                temperature=0.3,  # Lower temperature for more consistent financial advice
            )

            # Parse function call response
            message = response.choices[0].message
            if message.function_call:
                arguments = json.loads(message.function_call.arguments)
                return arguments
            else:
                logger.warning("No function call in GPT response")
                return {"insights": []}

        except Exception as e:
            logger.error(f"Reasoning engine failed: {e}")
            return {"insights": []}

    def _build_analysis_prompt(
        self,
        context_data: dict[str, Any],
        user_context: dict[str, Any] | None = None,
    ) -> str:
        """Build prompt from context data."""
        prompt_parts = []

        # Add receipt summary
        if "receipts" in context_data:
            receipts = context_data["receipts"]
            prompt_parts.append(f"Recent receipts ({len(receipts)} items):")
            for r in receipts[:10]:  # Limit to 10 most recent
                prompt_parts.append(
                    f"- {r.get('vendor', 'Unknown')}: €{r.get('total_amount', 0):.2f} on {r.get('receipt_date', 'N/A')}"
                )

        # Add spending patterns
        if "spending_by_category" in context_data:
            prompt_parts.append("\nSpending by category:")
            for cat, amount in context_data["spending_by_category"].items():
                prompt_parts.append(f"- {cat}: €{amount:.2f}")

        # Add alerts
        if "alerts" in context_data:
            prompt_parts.append("\nExisting alerts:")
            for alert in context_data["alerts"]:
                prompt_parts.append(f"- {alert}")

        # Add user context
        if user_context:
            prompt_parts.append(f"\nUser context: {json.dumps(user_context, indent=2)}")

        prompt_parts.append("\nAnalyze this financial data and provide actionable insights.")

        return "\n".join(prompt_parts)

    def classify_spending_pattern(
        self,
        transactions: list[dict[str, Any]],
    ) -> dict[str, Any]:
        """Classify spending patterns in transactions."""
        if not transactions:
            return {"pattern_type": "no_data", "description": "No transactions to analyze"}

        # Simple heuristics + GPT analysis
        context_str = json.dumps(transactions[:50], indent=2)  # Limit for Cross
        prompt = f"""Analyze these transactions and classify the spending pattern:

{context_str}

Classify as one of:
- recurring_payment: Regular monthly/periodic payments
- seasonal: Varies by season
- irregular: No clear pattern
- anomaly: Unusual spending

Return JSON with: pattern_type, description, confidence (0-1), examples (3-5 transaction IDs)."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a financial pattern analyzer. Return only valid JSON.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.2,
            )

            result = json.loads(response.choices[0].message.content)
            return result

        except Exception as e:
            logger.error(f"Pattern classification failed: {e}")
            return {"pattern_type": "unknown", "description": "Analysis failed"}

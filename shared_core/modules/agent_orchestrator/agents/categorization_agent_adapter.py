"""Adapter for receipt categorization agent."""

import logging
from typing import Any

from ..agent_registry import Agent, AgentMetadata, AgentType

logger = logging.getLogger("converto.agent_orchestrator")


class CategorizationAgentAdapter(Agent):
    """Adapter for receipt categorization agent using AI."""

    # Default categories for Finnish businesses
    DEFAULT_CATEGORIES = [
        "Ruoka ja juoma",
        "Toimistotarvikkeet",
        "Liikenne ja kuljetus",
        "Markkinointi ja mainonta",
        "Teknologia ja IT",
        "Koulutus ja kehitys",
        "Asuminen ja kiinteistöt",
        "Vakuutukset ja palvelut",
        "Vaatteet ja henkilökohtaiset",
        "Terveys ja hyvinvointi",
        "Viihde ja vapaa-aika",
        "Muu",
    ]

    def __init__(self):
        pass

    async def execute(self, input_data: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        """Categorize receipt based on merchant and items.

        Args:
            input_data: Input data (receipt_data, merchant_name, items)
            context: Execution context

        Returns:
            Categorization result
        """
        try:
            receipt_data = input_data.get("receipt_data", {})
            merchant_name = input_data.get("merchant_name") or receipt_data.get("merchant_name", "")
            items = input_data.get("items") or receipt_data.get("items", [])
            ocr_text = input_data.get("ocr_text") or receipt_data.get("ocr_text", "")

            # Use AI for categorization if available
            category, tags, confidence = await self._categorize_with_ai(
                merchant_name=merchant_name, items=items, ocr_text=ocr_text
            )

            # Fallback to rule-based if AI fails
            if not category or confidence < 0.5:
                category, tags = self._categorize_rule_based(merchant_name, items, ocr_text)
                confidence = 0.6

            return {
                "category": category,
                "tags": tags,
                "confidence": confidence,
                "merchant_name": merchant_name,
                "suggested_tags": self._suggest_tags(category, merchant_name, items),
                "success": True,
            }

        except Exception as e:
            logger.error(f"Categorization Agent execution failed: {e}")
            raise

    async def _categorize_with_ai(
        self, merchant_name: str, items: list[dict[str, Any]], ocr_text: str
    ) -> tuple[str | None, list[str], float]:
        """Categorize using AI (OpenAI).

        Args:
            merchant_name: Merchant name
            items: List of items
            ocr_text: OCR text

        Returns:
            Tuple of (category, tags, confidence)
        """
        try:
            # Try to use OpenAI if available
            import os

            openai_api_key = os.getenv("OPENAI_API_KEY")

            if not openai_api_key:
                return None, [], 0.0

            from openai import AsyncOpenAI

            client = AsyncOpenAI(api_key=openai_api_key)

            # Build context
            context = f"Merchant: {merchant_name}\n"
            if items:
                context += f"Items: {', '.join([item.get('name', '') for item in items[:5]])}\n"
            if ocr_text:
                context += f"Receipt text: {ocr_text[:500]}\n"

            prompt = f"""Categorize this Finnish business receipt into one of these categories:
{', '.join(self.DEFAULT_CATEGORIES)}

Receipt information:
{context}

Respond with JSON:
{{
  "category": "exact category name from the list",
  "tags": ["tag1", "tag2"],
  "confidence": 0.0-1.0
}}"""

            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=200,
            )

            import json

            result = json.loads(response.choices[0].message.content)

            return (
                result.get("category"),
                result.get("tags", []),
                float(result.get("confidence", 0.7)),
            )

        except Exception as e:
            logger.warning(f"AI categorization failed, using rule-based: {e}")
            return None, [], 0.0

    def _categorize_rule_based(
        self, merchant_name: str, items: list[dict[str, Any]], ocr_text: str
    ) -> tuple[str, list[str]]:
        """Categorize using rule-based logic.

        Args:
            merchant_name: Merchant name
            items: List of items
            ocr_text: OCR text

        Returns:
            Tuple of (category, tags)
        """
        text = (merchant_name + " " + ocr_text).lower()

        # Rule-based categorization
        if any(
            kw in text
            for kw in [
                "ruokakauppa",
                "prisma",
                "k-market",
                "s-market",
                "lidl",
                "food",
                "cafe",
                "ravintola",
            ]
        ):
            return "Ruoka ja juoma", ["ruoka", "ostokset"]

        if any(
            kw in text for kw in ["posti", "dhl", "ups", "matkahuolto", "buss", "taxi", "liikenne"]
        ):
            return "Liikenne ja kuljetus", ["kuljetus", "posti"]

        if any(kw in text for kw in ["kauppa", "verkkokauppa", "clas ohlson", "tokmanni"]):
            return "Toimistotarvikkeet", ["toimisto"]

        if any(kw in text for kw in ["telia", "dna", "elisa", "internet", "puhelin"]):
            return "Teknologia ja IT", ["it", "puhelin"]

        if any(kw in text for kw in ["hotelli", "majoitus", "hotel"]):
            return "Asuminen ja kiinteistöt", ["majoitus"]

        # Default
        return "Muu", ["muu"]

    def _suggest_tags(
        self, category: str, merchant_name: str, items: list[dict[str, Any]]
    ) -> list[str]:
        """Suggest additional tags based on category and context.

        Args:
            category: Receipt category
            merchant_name: Merchant name
            items: List of items

        Returns:
            List of suggested tags
        """
        tags = [category.lower()]

        # Add merchant-based tags
        if merchant_name:
            tags.append(merchant_name.lower().replace(" ", "-"))

        # Add item-based tags
        if items:
            for item in items[:3]:
                item_name = item.get("name", "").lower()
                if item_name:
                    tags.append(item_name[:20])

        return tags[:5]

    def get_metadata(self) -> AgentMetadata:
        """Get Categorization Agent metadata."""
        from ..agent_registry import AgentMetadata

        return AgentMetadata(
            agent_id="categorization_agent",
            agent_type=AgentType.CATEGORIZATION,
            name="Categorization Agent",
            description="AI-powered categorization agent that categorizes receipts using AI and rule-based logic",
            version="1.0.0",
            capabilities=[
                "receipt_categorization",
                "tag_generation",
                "ai_classification",
                "rule_based_classification",
            ],
            input_schema={
                "type": "object",
                "properties": {
                    "receipt_data": {"type": "object", "description": "Receipt data"},
                    "merchant_name": {"type": "string", "description": "Merchant name"},
                    "items": {"type": "array", "description": "List of receipt items"},
                    "ocr_text": {"type": "string", "description": "OCR text from receipt"},
                },
            },
            output_schema={
                "type": "object",
                "properties": {
                    "category": {"type": "string", "description": "Receipt category"},
                    "tags": {"type": "array", "description": "List of tags"},
                    "confidence": {"type": "number", "description": "Categorization confidence"},
                    "suggested_tags": {"type": "array", "description": "Suggested additional tags"},
                },
            },
            dependencies=["ocr_agent"],  # Depends on OCR for text
            cost_per_request=0.001,  # OpenAI API cost
            avg_response_time_ms=1500,
        )

    async def validate_input(self, input_data: dict[str, Any]) -> bool:
        """Validate input data for Categorization Agent.

        Args:
            input_data: Input data to validate

        Returns:
            True if valid, False otherwise
        """
        # Must have at least receipt_data or merchant_name
        has_data = (
            "receipt_data" in input_data
            or "merchant_name" in input_data
            or "ocr_text" in input_data
        )

        return has_data



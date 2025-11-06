"""Memory Layer for FinanceAgent - Embeddings and Vector Store."""

from __future__ import annotations

import logging
import os
import uuid
from typing import Any

from openai import OpenAI

logger = logging.getLogger("converto.finance_agent.memory")


class MemoryLayer:
    """Handles embeddings and vector store for FinanceAgent."""

    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id
        self.openai_client: OpenAI | None = None
        self.pinecone_index = None  # Will be initialized if Pinecone is configured
        self._initialize_clients()

    def _initialize_clients(self) -> None:
        """Initialize OpenAI and Pinecone clients."""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            self.openai_client = OpenAI(api_key=api_key)

        pinecone_api_key = os.getenv("PINECONE_API_KEY")
        pinecone_index_name = os.getenv("PINECONE_INDEX_NAME", "converto-finance-agent")

        if pinecone_api_key:
            try:
                import pinecone

                pinecone.init(
                    api_key=pinecone_api_key,
                    environment=os.getenv("PINECONE_ENVIRONMENT", "us-east1-gcp"),
                )
                self.pinecone_index = pinecone.Index(pinecone_index_name)
                logger.info(f"Pinecone initialized for tenant {self.tenant_id}")
            except ImportError:
                logger.warning("Pinecone not installed, vector store disabled")
            except Exception as e:
                logger.warning(f"Pinecone initialization failed: {e}")

    def create_embedding(self, text: str) -> list[float] | None:
        """Create embedding for text using OpenAI."""
        if not self.openai_client:
            return None

        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-3-small",
                input=text,
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Failed to create embedding: {e}")
            return None

    def store_memory(
        self,
        content_type: str,
        content_id: str,
        content_text: str,
        metadata: dict[str, Any] | None = None,
    ) -> str | None:
        """Store content in vector store."""
        embedding = self.create_embedding(content_text)
        if not embedding:
            return None

        # Create unique ID for this memory
        memory_id = str(uuid.uuid4())

        # Store in Pinecone if available
        if self.pinecone_index:
            try:
                self.pinecone_index.upsert(
                    [
                        (
                            memory_id,
                            embedding,
                            {
                                "tenant_id": self.tenant_id,
                                "content_type": content_type,
                                "content_id": content_id,
                                "content_text": content_text,
                                **(metadata or {}),
                            },
                        )
                    ]
                )
                logger.info(f"Stored memory {memory_id} in Pinecone")
                return memory_id
            except Exception as e:
                logger.error(f"Failed to store in Pinecone: {e}")

        # Fallback: return ID for database storage
        return memory_id

    def retrieve_context(
        self,
        query_text: str,
        top_k: int = 5,
        content_types: list[str] | None = None,
    ) -> list[dict[str, Any]]:
        """Retrieve relevant context from vector store."""
        if not self.pinecone_index:
            return []

        query_embedding = self.create_embedding(query_text)
        if not query_embedding:
            return []

        try:
            # Build filter
            filter_dict = {"tenant_id": {"$eq": self.tenant_id}}
            if content_types:
                filter_dict["content_type"] = {"$in": content_types}

            # Query receipts
            results = self.pinecone_index.query(
                vector=query_embedding,
                top_k=top_k,
                filter=filter_dict,
                include_metadata=True,
            )

            return [
                {
                    "id": match.id,
                    "score": match.score,
                    "metadata": match.metadata,
                }
                for match in results.matches
            ]
        except Exception as e:
            logger.error(f"Failed to retrieve context: {e}")
            return []

    def get_short_term_memory(self, days: int = 30) -> dict[str, Any]:
        """Get short-term memory (recent receipts and decisions)."""
        # This would query the database for recent data
        # For now, return structure
        return {
            "recent_receipts": [],  # Would query Receipt table
            "recent_decisions": [],  # Would query AgentDecision table
            "period_days": days,
        }



from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class ReviewTask:
    id: str
    url: str | None = None


class NotionReviewQueue:
    def __init__(self, notion_client: Any, database_id: str) -> None:
        self.notion = notion_client
        self.database_id = database_id

    async def create_review_task(self, receipt: Any) -> ReviewTask:
        # Minimal placeholder to avoid coupling to Notion SDK here.
        # Use your Notion client wrapper (shared_core.modules.notion.client) to implement.
        title = f"Receipt {getattr(receipt, 'id', '')} — {getattr(receipt, 'vendor', '')}"
        payload = {
            "parent": {"database_id": self.database_id},
            "properties": {
                "Name": {"title": [{"text": {"content": title}}]},
                "Amount": {"number": float(getattr(receipt, "total_amount", 0.0) or 0.0)},
                "Status": {"select": {"name": "Pending Review"}},
            },
        }
        # Replace with: page = await self.notion.create_page(...)
        page_id = "pending-impl"
        return ReviewTask(id=page_id, url=None)

    async def update_review_status(self, task_id: str, status: str) -> bool:
        # Replace with actual Notion page update.
        return bool(task_id and status)


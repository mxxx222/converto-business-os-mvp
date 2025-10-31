import os
import httpx
from typing import Dict, Any, Optional, List
from dataclasses import dataclass


@dataclass
class NotionConfig:
    token: str
    version: str = "2022-06-28"


class NotionClient:
    def __init__(self, config: NotionConfig):
        self.config = config
        self.headers = {
            "Authorization": f"Bearer {config.token}",
            "Content-Type": "application/json",
            "Notion-Version": config.version
        }
    
    async def create_page(self, parent_id: str, properties: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new page in Notion"""
        async with httpx.AsyncClient() as client:
            data = {
                "parent": {"page_id": parent_id},
                "properties": properties
            }
            response = await client.post(
                "https://api.notion.com/v1/pages",
                headers=self.headers,
                json=data
            )
            response.raise_for_status()
            return response.json()
    
    async def query_database(self, database_id: str, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Query a Notion database"""
        async with httpx.AsyncClient() as client:
            data = {}
            if filters:
                data["filter"] = filters
            
            response = await client.post(
                f"https://api.notion.com/v1/databases/{database_id}/query",
                headers=self.headers,
                json=data
            )
            response.raise_for_status()
            return response.json().get("results", [])
    
    async def update_page(self, page_id: str, properties: Dict[str, Any]) -> Dict[str, Any]:
        """Update a Notion page"""
        async with httpx.AsyncClient() as client:
            data = {"properties": properties}
            response = await client.patch(
                f"https://api.notion.com/v1/pages/{page_id}",
                headers=self.headers,
                json=data
            )
            response.raise_for_status()
            return response.json()
    
    async def get_page(self, page_id: str) -> Dict[str, Any]:
        """Get a Notion page"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.notion.com/v1/pages/{page_id}",
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()


def get_notion_client() -> NotionClient:
    """Get Notion client from environment variables"""
    config = NotionConfig(
        token=os.getenv("NOTION_API_KEY", "")
    )
    return NotionClient(config)

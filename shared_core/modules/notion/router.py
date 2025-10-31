from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from ..notion.client import get_notion_client, NotionClient
from ..notion.models import NotionPage

router = APIRouter(prefix="/api/v1/notion", tags=["notion"])


class NotionPageCreate(BaseModel):
    parent_id: str
    title: str
    content: Optional[str] = None
    properties: Optional[Dict[str, Any]] = None


class NotionDatabaseQuery(BaseModel):
    database_id: str
    filters: Optional[Dict[str, Any]] = None


@router.get("/pages")
async def list_pages(notion: NotionClient = Depends(get_notion_client)):
    """List all Notion pages"""
    try:
        # This would need to be implemented with a specific database
        return {"pages": [], "message": "Use query_database endpoint with specific database_id"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pages")
async def create_page(
    page_data: NotionPageCreate,
    notion: NotionClient = Depends(get_notion_client)
):
    """Create a new Notion page"""
    try:
        properties = page_data.properties or {}
        properties["title"] = {
            "title": [
                {
                    "text": {
                        "content": page_data.title
                    }
                }
            ]
        }
        
        page = await notion.create_page(page_data.parent_id, properties)
        return {"page": page}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/databases/query")
async def query_database(
    query_data: NotionDatabaseQuery,
    notion: NotionClient = Depends(get_notion_client)
):
    """Query a Notion database"""
    try:
        results = await notion.query_database(query_data.database_id, query_data.filters)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check(notion: NotionClient = Depends(get_notion_client)):
    """Check Notion connection health"""
    try:
        # Try to access user info to test connection
        return {"status": "healthy", "service": "notion"}
    except Exception as e:
        return {"status": "unhealthy", "service": "notion", "error": str(e)}

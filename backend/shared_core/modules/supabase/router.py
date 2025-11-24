from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from ..supabase.client import get_supabase_client, SupabaseClient
from ..supabase.models import SupabaseProject

router = APIRouter(prefix="/api/v1/supabase", tags=["supabase"])


class SupabaseProjectCreate(BaseModel):
    project_id: str
    name: str
    region: Optional[str] = None
    database_url: Optional[str] = None
    api_url: Optional[str] = None
    anon_key: Optional[str] = None
    service_role_key: Optional[str] = None


class SupabaseTableQuery(BaseModel):
    table: str
    filters: Optional[Dict[str, Any]] = None


@router.get("/projects")
async def list_projects(supabase: SupabaseClient = Depends(get_supabase_client)):
    """List all Supabase projects"""
    try:
        projects = await supabase.select("supabase_projects")
        return {"projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/projects")
async def create_project(
    project_data: SupabaseProjectCreate,
    supabase: SupabaseClient = Depends(get_supabase_client)
):
    """Create a new Supabase project"""
    try:
        project = await supabase.insert("supabase_projects", project_data.dict())
        return {"project": project}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query")
async def query_table(
    query_data: SupabaseTableQuery,
    supabase: SupabaseClient = Depends(get_supabase_client)
):
    """Query a Supabase table"""
    try:
        results = await supabase.select(query_data.table, query_data.filters)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check(supabase: SupabaseClient = Depends(get_supabase_client)):
    """Check Supabase connection health"""
    try:
        # Try to query a simple table to test connection
        await supabase.select("supabase_projects", {"is_active": True})
        return {"status": "healthy", "service": "supabase"}
    except Exception as e:
        return {"status": "unhealthy", "service": "supabase", "error": str(e)}

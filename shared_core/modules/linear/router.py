from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from ..linear.client import get_linear_client, LinearClient
from ..linear.models import LinearIssue

router = APIRouter(prefix="/api/v1/linear", tags=["linear"])


class LinearIssueCreate(BaseModel):
    team_id: str
    title: str
    description: Optional[str] = None


class LinearIssueQuery(BaseModel):
    team_id: Optional[str] = None
    state: Optional[str] = None


@router.get("/issues")
async def list_issues(
    team_id: Optional[str] = None,
    state: Optional[str] = None,
    linear: LinearClient = Depends(get_linear_client)
):
    """List Linear issues"""
    try:
        issues = await linear.get_issues(team_id, state)
        return {"issues": issues}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/issues")
async def create_issue(
    issue_data: LinearIssueCreate,
    linear: LinearClient = Depends(get_linear_client)
):
    """Create a new Linear issue"""
    try:
        issue = await linear.create_issue(
            issue_data.team_id,
            issue_data.title,
            issue_data.description
        )
        return {"issue": issue}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check(linear: LinearClient = Depends(get_linear_client)):
    """Check Linear connection health"""
    try:
        # Try to get issues to test connection
        await linear.get_issues()
        return {"status": "healthy", "service": "linear"}
    except Exception as e:
        return {"status": "unhealthy", "service": "linear", "error": str(e)}

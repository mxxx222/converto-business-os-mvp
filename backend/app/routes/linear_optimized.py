"""Linear API endpoints - ROI MAXIMIZED for paid subscription."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from shared_core.modules.linear.client_optimized import (
    LinearClientOptimized,
    get_linear_client_optimized,
)

router = APIRouter(prefix="/api/v1/linear", tags=["linear"])


class IssueCreate(BaseModel):
    team_id: str
    title: str
    description: str | None = None
    priority: int | None = None
    assignee_id: str | None = None
    label_ids: list[str] | None = None
    project_id: str | None = None
    due_date: str | None = None
    estimate: int | None = None


class IssueUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: int | None = None
    state_id: str | None = None
    assignee_id: str | None = None
    label_ids: list[str] | None = None
    project_id: str | None = None
    due_date: str | None = None


class CommentCreate(BaseModel):
    body: str


class ProjectCreate(BaseModel):
    name: str
    team_ids: list[str]
    description: str | None = None


# OPTIMIZED: Teams
@router.get("/teams")
async def list_teams(linear: LinearClientOptimized = Depends(get_linear_client_optimized)):
    """Get all teams."""
    try:
        teams = await linear.get_teams()
        return {"teams": teams}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# OPTIMIZED: Projects
@router.get("/projects")
async def list_projects(
    team_id: str | None = None, linear: LinearClientOptimized = Depends(get_linear_client_optimized)
):
    """Get projects."""
    try:
        projects = await linear.get_projects(team_id)
        return {"projects": projects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/projects")
async def create_project(
    project_data: ProjectCreate,
    linear: LinearClientOptimized = Depends(get_linear_client_optimized),
):
    """Create a new project."""
    try:
        project = await linear.create_project(
            name=project_data.name,
            team_ids=project_data.team_ids,
            description=project_data.description,
        )
        return {"project": project}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# OPTIMIZED: Issues
@router.get("/issues")
async def list_issues(
    team_id: str | None = None,
    state: str | None = None,
    assignee_id: str | None = None,
    label_ids: str | None = None,  # Comma-separated
    project_id: str | None = None,
    limit: int = 50,
    linear: LinearClientOptimized = Depends(get_linear_client_optimized),
):
    """Get Linear issues with advanced filtering."""
    try:
        label_ids_list = label_ids.split(",") if label_ids else None
        issues = await linear.get_issues(
            team_id=team_id,
            state=state,
            assignee_id=assignee_id,
            label_ids=label_ids_list,
            project_id=project_id,
            limit=limit,
        )
        return {"issues": issues}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/issues")
async def create_issue(
    issue_data: IssueCreate, linear: LinearClientOptimized = Depends(get_linear_client_optimized)
):
    """Create a new Linear issue with full options."""
    try:
        issue = await linear.create_issue(
            team_id=issue_data.team_id,
            title=issue_data.title,
            description=issue_data.description,
            priority=issue_data.priority,
            assignee_id=issue_data.assignee_id,
            label_ids=issue_data.label_ids,
            project_id=issue_data.project_id,
            due_date=issue_data.due_date,
            estimate=issue_data.estimate,
        )
        return {"issue": issue}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/issues/{issue_id}")
async def update_issue(
    issue_id: str,
    issue_data: IssueUpdate,
    linear: LinearClientOptimized = Depends(get_linear_client_optimized),
):
    """Update Linear issue."""
    try:
        issue = await linear.update_issue(
            issue_id=issue_id,
            title=issue_data.title,
            description=issue_data.description,
            priority=issue_data.priority,
            state_id=issue_data.state_id,
            assignee_id=issue_data.assignee_id,
            label_ids=issue_data.label_ids,
            project_id=issue_data.project_id,
            due_date=issue_data.due_date,
        )
        return {"issue": issue}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# OPTIMIZED: Comments
@router.post("/issues/{issue_id}/comments")
async def add_comment(
    issue_id: str,
    comment_data: CommentCreate,
    linear: LinearClientOptimized = Depends(get_linear_client_optimized),
):
    """Add comment to issue."""
    try:
        comment = await linear.add_comment(issue_id, comment_data.body)
        return {"comment": comment}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# OPTIMIZED: Labels
@router.get("/labels")
async def list_labels(
    team_id: str | None = None, linear: LinearClientOptimized = Depends(get_linear_client_optimized)
):
    """Get labels."""
    try:
        labels = await linear.get_labels(team_id)
        return {"labels": labels}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# OPTIMIZED: Users
@router.get("/users")
async def list_users(
    team_id: str | None = None, linear: LinearClientOptimized = Depends(get_linear_client_optimized)
):
    """Get users/assignees."""
    try:
        users = await linear.get_users(team_id)
        return {"users": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# OPTIMIZED: States
@router.get("/states")
async def list_states(
    team_id: str | None = None, linear: LinearClientOptimized = Depends(get_linear_client_optimized)
):
    """Get workflow states."""
    try:
        states = await linear.get_states(team_id)
        return {"states": states}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# OPTIMIZED: Analytics
@router.get("/teams/{team_id}/analytics")
async def get_team_analytics(
    team_id: str,
    start_date: str,
    end_date: str,
    linear: LinearClientOptimized = Depends(get_linear_client_optimized),
):
    """Get team analytics."""
    try:
        analytics = await linear.get_team_analytics(team_id, start_date, end_date)
        return {"analytics": analytics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check(linear: LinearClientOptimized = Depends(get_linear_client_optimized)):
    """Check Linear connection health."""
    try:
        await linear.get_teams()
        return {"status": "healthy", "service": "linear"}
    except Exception as e:
        return {"status": "unhealthy", "service": "linear", "error": str(e)}

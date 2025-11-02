"""Linear API Client - ROI MAXIMIZED for paid subscription.

Maximizes usage of Linear paid features:
- Teams & Projects management
- Workflow automation
- Issue updates & comments
- Labels & priorities
- Assignees & notifications
- Webhooks integration
- Analytics & reporting
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from typing import Any

import httpx

logger = logging.getLogger("converto.linear")


@dataclass
class LinearConfig:
    api_key: str
    base_url: str = "https://api.linear.app/graphql"


class LinearClientOptimized:
    """Optimized Linear client for maximum ROI."""

    def __init__(self, config: LinearConfig):
        self.config = config
        self.headers = {
            "Authorization": f"Bearer {config.api_key}",
            "Content-Type": "application/json",
        }

    async def query(self, query: str, variables: dict[str, Any] | None = None) -> dict[str, Any]:
        """Execute GraphQL query."""
        async with httpx.AsyncClient(timeout=30.0) as client:
            data = {"query": query, "variables": variables or {}}
            response = await client.post(self.config.base_url, headers=self.headers, json=data)
            response.raise_for_status()
            return response.json()

    # OPTIMIZED: Teams Management
    async def get_teams(self) -> list[dict[str, Any]]:
        """Get all teams."""
        query = """
        query GetTeams {
            teams {
                nodes {
                    id
                    name
                    key
                    description
                    private
                    members {
                        nodes {
                            id
                            name
                            email
                        }
                    }
                }
            }
        }
        """
        result = await self.query(query)
        return result.get("data", {}).get("teams", {}).get("nodes", [])

    # OPTIMIZED: Projects Management
    async def get_projects(self, team_id: str | None = None) -> list[dict[str, Any]]:
        """Get projects."""
        query = """
        query GetProjects($teamId: String) {
            projects(filter: {teams: {id: {eq: $teamId}}}) {
                nodes {
                    id
                    name
                    description
                    state
                    progress
                    startDate
                    targetDate
                    teams {
                        nodes {
                            id
                            name
                        }
                    }
                }
            }
        }
        """
        variables = {}
        if team_id:
            variables["teamId"] = team_id
        result = await self.query(query, variables)
        return result.get("data", {}).get("projects", {}).get("nodes", [])

    async def create_project(
        self, name: str, team_ids: list[str], description: str | None = None
    ) -> dict[str, Any]:
        """Create a new project."""
        query = """
        mutation CreateProject($name: String!, $teamIds: [String!]!, $description: String) {
            projectCreate(input: {
                name: $name
                teamIds: $teamIds
                description: $description
            }) {
                success
                project {
                    id
                    name
                    url
                }
            }
        }
        """
        variables = {"name": name, "teamIds": team_ids, "description": description}
        result = await self.query(query, variables)
        return result.get("data", {}).get("projectCreate", {})

    # OPTIMIZED: Enhanced Issue Management
    async def get_issues(
        self,
        team_id: str | None = None,
        state: str | None = None,
        assignee_id: str | None = None,
        label_ids: list[str] | None = None,
        project_id: str | None = None,
        limit: int = 50,
    ) -> list[dict[str, Any]]:
        """Get Linear issues with advanced filtering."""
        query = """
        query GetIssues(
            $teamId: String,
            $state: String,
            $assigneeId: String,
            $labelIds: [String!],
            $projectId: String,
            $first: Int
        ) {
            issues(
                filter: {
                    team: {id: {eq: $teamId}}
                    state: {name: {eq: $state}}
                    assignee: {id: {eq: $assigneeId}}
                    labels: {id: {in: $labelIds}}
                    project: {id: {eq: $projectId}}
                }
                first: $first
            ) {
                nodes {
                    id
                    identifier
                    title
                    description
                    priority
                    state {
                        id
                        name
                        type
                    }
                    team {
                        id
                        name
                        key
                    }
                    assignee {
                        id
                        name
                        email
                    }
                    labels {
                        nodes {
                            id
                            name
                            color
                        }
                    }
                    project {
                        id
                        name
                    }
                    url
                    createdAt
                    updatedAt
                    dueDate
                    estimate
                    assignee {
                        id
                        name
                    }
                }
                pageInfo {
                    hasNextPage
                    endCursor
                }
            }
        }
        """

        variables: dict[str, Any] = {"first": limit}
        if team_id:
            variables["teamId"] = team_id
        if state:
            variables["state"] = state
        if assignee_id:
            variables["assigneeId"] = assignee_id
        if label_ids:
            variables["labelIds"] = label_ids
        if project_id:
            variables["projectId"] = project_id

        result = await self.query(query, variables)
        return result.get("data", {}).get("issues", {}).get("nodes", [])

    async def create_issue(
        self,
        team_id: str,
        title: str,
        description: str | None = None,
        priority: int | None = None,
        assignee_id: str | None = None,
        label_ids: list[str] | None = None,
        project_id: str | None = None,
        due_date: str | None = None,
        estimate: int | None = None,
    ) -> dict[str, Any]:
        """Create a new Linear issue with full options."""
        query = """
        mutation CreateIssue(
            $teamId: String!,
            $title: String!,
            $description: String,
            $priority: Int,
            $assigneeId: String,
            $labelIds: [String!],
            $projectId: String,
            $dueDate: DateTime,
            $estimate: Float
        ) {
            issueCreate(input: {
                teamId: $teamId
                title: $title
                description: $description
                priority: $priority
                assigneeId: $assigneeId
                labelIds: $labelIds
                projectId: $projectId
                dueDate: $dueDate
                estimate: $estimate
            }) {
                success
                issue {
                    id
                    identifier
                    title
                    url
                    priority
                    state {
                        name
                    }
                }
            }
        }
        """

        variables: dict[str, Any] = {
            "teamId": team_id,
            "title": title,
        }
        if description:
            variables["description"] = description
        if priority:
            variables["priority"] = priority
        if assignee_id:
            variables["assigneeId"] = assignee_id
        if label_ids:
            variables["labelIds"] = label_ids
        if project_id:
            variables["projectId"] = project_id
        if due_date:
            variables["dueDate"] = due_date
        if estimate:
            variables["estimate"] = estimate

        result = await self.query(query, variables)
        return result.get("data", {}).get("issueCreate", {})

    async def update_issue(
        self,
        issue_id: str,
        title: str | None = None,
        description: str | None = None,
        priority: int | None = None,
        state_id: str | None = None,
        assignee_id: str | None = None,
        label_ids: list[str] | None = None,
        project_id: str | None = None,
        due_date: str | None = None,
    ) -> dict[str, Any]:
        """Update Linear issue."""
        query = """
        mutation UpdateIssue(
            $id: String!,
            $title: String,
            $description: String,
            $priority: Int,
            $stateId: String,
            $assigneeId: String,
            $labelIds: [String!],
            $projectId: String,
            $dueDate: DateTime
        ) {
            issueUpdate(id: $id, input: {
                title: $title
                description: $description
                priority: $priority
                stateId: $stateId
                assigneeId: $assigneeId
                labelIds: $labelIds
                projectId: $projectId
                dueDate: $dueDate
            }) {
                success
                issue {
                    id
                    title
                    state {
                        name
                    }
                }
            }
        }
        """

        variables: dict[str, Any] = {"id": issue_id}
        if title:
            variables["title"] = title
        if description:
            variables["description"] = description
        if priority is not None:
            variables["priority"] = priority
        if state_id:
            variables["stateId"] = state_id
        if assignee_id:
            variables["assigneeId"] = assignee_id
        if label_ids:
            variables["labelIds"] = label_ids
        if project_id:
            variables["projectId"] = project_id
        if due_date:
            variables["dueDate"] = due_date

        result = await self.query(query, variables)
        return result.get("data", {}).get("issueUpdate", {})

    # OPTIMIZED: Comments
    async def add_comment(self, issue_id: str, body: str) -> dict[str, Any]:
        """Add comment to issue."""
        query = """
        mutation AddComment($issueId: String!, $body: String!) {
            commentCreate(input: {
                issueId: $issueId
                body: $body
            }) {
                success
                comment {
                    id
                    body
                    createdAt
                }
            }
        }
        """
        variables = {"issueId": issue_id, "body": body}
        result = await self.query(query, variables)
        return result.get("data", {}).get("commentCreate", {})

    # OPTIMIZED: Labels Management
    async def get_labels(self, team_id: str | None = None) -> list[dict[str, Any]]:
        """Get labels."""
        query = """
        query GetLabels($teamId: String) {
            issueLabels(filter: {team: {id: {eq: $teamId}}}) {
                nodes {
                    id
                    name
                    color
                    description
                    team {
                        id
                        name
                    }
                }
            }
        }
        """
        variables = {}
        if team_id:
            variables["teamId"] = team_id
        result = await self.query(query, variables)
        return result.get("data", {}).get("issueLabels", {}).get("nodes", [])

    # OPTIMIZED: Users/Assignees
    async def get_users(self, team_id: str | None = None) -> list[dict[str, Any]]:
        """Get users/assignees."""
        query = """
        query GetUsers($teamId: String) {
            users(filter: {teams: {id: {eq: $teamId}}}) {
                nodes {
                    id
                    name
                    email
                    avatarUrl
                    active
                    teams {
                        nodes {
                            id
                            name
                        }
                    }
                }
            }
        }
        """
        variables = {}
        if team_id:
            variables["teamId"] = team_id
        result = await self.query(query, variables)
        return result.get("data", {}).get("users", {}).get("nodes", [])

    # OPTIMIZED: States/Workflows
    async def get_states(self, team_id: str | None = None) -> list[dict[str, Any]]:
        """Get workflow states."""
        query = """
        query GetStates($teamId: String) {
            workflowStates(filter: {team: {id: {eq: $teamId}}}) {
                nodes {
                    id
                    name
                    type
                    position
                    team {
                        id
                        name
                    }
                }
            }
        }
        """
        variables = {}
        if team_id:
            variables["teamId"] = team_id
        result = await self.query(query, variables)
        return result.get("data", {}).get("workflowStates", {}).get("nodes", [])

    # OPTIMIZED: Analytics
    async def get_team_analytics(
        self, team_id: str, start_date: str, end_date: str
    ) -> dict[str, Any]:
        """Get team analytics."""
        query = """
        query GetTeamAnalytics($teamId: String!, $startDate: DateTime!, $endDate: DateTime!) {
            team(id: $teamId) {
                id
                name
                issues(filter: {
                    createdAt: {gte: $startDate, lte: $endDate}
                }) {
                    nodes {
                        id
                        title
                        state {
                            name
                        }
                        createdAt
                        completedAt
                    }
                }
            }
        }
        """
        variables = {"teamId": team_id, "startDate": start_date, "endDate": end_date}
        result = await self.query(query, variables)
        return result.get("data", {}).get("team", {})


def get_linear_client_optimized() -> LinearClientOptimized:
    """Get optimized Linear client from environment variables."""
    api_key = os.getenv("LINEAR_API_KEY", "")
    if not api_key:
        raise ValueError("LINEAR_API_KEY not configured")

    config = LinearConfig(api_key=api_key)
    return LinearClientOptimized(config)

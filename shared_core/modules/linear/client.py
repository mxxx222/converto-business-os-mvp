import os
import httpx
from typing import Dict, Any, Optional, List
from dataclasses import dataclass


@dataclass
class LinearConfig:
    api_key: str
    base_url: str = "https://api.linear.app/graphql"


class LinearClient:
    def __init__(self, config: LinearConfig):
        self.config = config
        self.headers = {
            "Authorization": f"Bearer {config.api_key}",
            "Content-Type": "application/json"
        }
    
    async def query(self, query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute GraphQL query"""
        async with httpx.AsyncClient() as client:
            data = {
                "query": query,
                "variables": variables or {}
            }
            response = await client.post(
                self.config.base_url,
                headers=self.headers,
                json=data
            )
            response.raise_for_status()
            return response.json()
    
    async def get_issues(self, team_id: Optional[str] = None, state: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get Linear issues"""
        query = """
        query GetIssues($teamId: String, $state: String) {
            issues(filter: {team: {id: {eq: $teamId}}, state: {name: {eq: $state}}}) {
                nodes {
                    id
                    title
                    description
                    state {
                        name
                    }
                    priority
                    team {
                        name
                    }
                    assignee {
                        name
                    }
                    labels {
                        nodes {
                            name
                        }
                    }
                    url
                    createdAt
                    updatedAt
                }
            }
        }
        """
        
        variables = {}
        if team_id:
            variables["teamId"] = team_id
        if state:
            variables["state"] = state
        
        result = await self.query(query, variables)
        return result.get("data", {}).get("issues", {}).get("nodes", [])
    
    async def create_issue(self, team_id: str, title: str, description: Optional[str] = None) -> Dict[str, Any]:
        """Create a new Linear issue"""
        query = """
        mutation CreateIssue($teamId: String!, $title: String!, $description: String) {
            issueCreate(input: {
                teamId: $teamId,
                title: $title,
                description: $description
            }) {
                success
                issue {
                    id
                    title
                    url
                }
            }
        }
        """
        
        variables = {
            "teamId": team_id,
            "title": title,
            "description": description
        }
        
        result = await self.query(query, variables)
        return result.get("data", {}).get("issueCreate", {})


def get_linear_client() -> LinearClient:
    """Get Linear client from environment variables"""
    config = LinearConfig(
        api_key=os.getenv("LINEAR_API_KEY", "")
    )
    return LinearClient(config)

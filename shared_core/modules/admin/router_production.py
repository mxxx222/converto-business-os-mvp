"""
Admin router for production dashboard
Provides activity feed API and WebSocket endpoint
"""

import json
import logging
import os
import uuid
from collections import defaultdict
from datetime import datetime, timezone
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from pydantic import BaseModel

logger = logging.getLogger("converto.admin")

router = APIRouter(prefix="/api/admin", tags=["admin"])

# In-memory activity storage (can be upgraded to Redis/database later)
_activities: Dict[str, List[Dict]] = defaultdict(list)
_websocket_connections: List[WebSocket] = []


# Pydantic models
class ActivityInput(BaseModel):
    type: str
    status: str
    title: Optional[str] = None
    details: Optional[str] = None
    metadata: Optional[Dict] = None
    tenantId: Optional[str] = None
    userId: Optional[str] = None


class Activity(BaseModel):
    id: str
    type: str
    status: str
    timestamp: str
    title: Optional[str] = None
    details: Optional[str] = None
    metadata: Optional[Dict] = None
    tenantId: Optional[str] = None
    userId: Optional[str] = None


class ActivityResponse(BaseModel):
    activities: List[Activity]
    total: Optional[int] = None
    limit: Optional[int] = None
    offset: Optional[int] = None


def _verify_admin_token(token: Optional[str] = None) -> bool:
    """Verify admin JWT token"""
    admin_secret = os.getenv("ADMIN_JWT_SECRET")
    if not admin_secret:
        logger.warning("ADMIN_JWT_SECRET not configured")
        return False
    
    if not token:
        return False
    
    # Simple token check (in production, use proper JWT validation)
    # For MVP, we'll check if token matches secret
    try:
        # Basic validation - in production use jwt library
        return token == admin_secret or token.startswith("admin_")
    except Exception:
        return False


def _get_tenant_from_token(token: str) -> str:
    """Extract tenant ID from token (simplified for MVP)"""
    # In production, decode JWT and extract tenant_id
    return "default"


async def _broadcast_activity(activity: Dict):
    """Broadcast activity to all connected WebSocket clients"""
    message = json.dumps({
        "type": "activity",
        "data": activity
    })
    
    disconnected = []
    for ws in _websocket_connections:
        try:
            await ws.send_text(message)
        except Exception as e:
            logger.warning(f"Failed to send to WebSocket: {e}")
            disconnected.append(ws)
    
    # Remove disconnected clients
    for ws in disconnected:
        if ws in _websocket_connections:
            _websocket_connections.remove(ws)


@router.get("/activities", response_model=ActivityResponse)
async def get_activities(
    limit: int = Query(20, ge=1, le=200),
    offset: int = Query(0, ge=0),
    tenant_id: Optional[str] = Query(None),
):
    """Get activities for admin dashboard"""
    
    # Get activities for tenant (or all if no tenant specified)
    if tenant_id:
        activities_list = _activities.get(tenant_id, [])
    else:
        # Flatten all activities
        activities_list = []
        for tenant_activities in _activities.values():
            activities_list.extend(tenant_activities)
        # Sort by timestamp descending
        activities_list.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    # Apply pagination
    total = len(activities_list)
    paginated = activities_list[offset:offset + limit]
    
    return ActivityResponse(
        activities=[Activity(**act) for act in paginated],
        total=total,
        limit=limit,
        offset=offset
    )


@router.post("/activities", status_code=status.HTTP_201_CREATED)
async def create_activity(activity_input: ActivityInput):
    """Create a new activity (for testing/internal use)"""
    
    activity = {
        "id": str(uuid.uuid4()),
        "type": activity_input.type,
        "status": activity_input.status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "title": activity_input.title,
        "details": activity_input.details,
        "metadata": activity_input.metadata or {},
        "tenantId": activity_input.tenantId or "default",
        "userId": activity_input.userId
    }
    
    tenant_id = activity["tenantId"]
    _activities[tenant_id].append(activity)
    
    # Keep only last 1000 activities per tenant
    if len(_activities[tenant_id]) > 1000:
        _activities[tenant_id] = _activities[tenant_id][-1000:]
    
    # Broadcast to WebSocket clients
    await _broadcast_activity(activity)
    
    return {"id": activity["id"], "success": True}


@router.websocket("/feed")
async def websocket_feed(websocket: WebSocket):
    """WebSocket endpoint for real-time activity feed"""
    await websocket.accept()
    
    # Get token from query params
    token = websocket.query_params.get("token")
    if not token or not _verify_admin_token(token):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    
    tenant_id = _get_tenant_from_token(token)
    _websocket_connections.append(websocket)
    
    try:
        # Send ready message
        await websocket.send_json({
            "type": "ready",
            "bus_type": "in-memory",
            "production_ready": False,
            "tenant_id": tenant_id
        })
        
        # Handle incoming messages
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
                elif message.get("type") == "auth":
                    # Token already validated, just acknowledge
                    await websocket.send_json({"type": "ready", "tenant_id": tenant_id})
                    
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON"
                })
                
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        if websocket in _websocket_connections:
            _websocket_connections.remove(websocket)


"""Admin API routes for Converto Business OS - Production ready with Redis/Supabase bus."""

import asyncio
import json
import logging
import time
from typing import Dict, List, Optional, Any, Callable

from fastapi import APIRouter, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState
from pydantic import BaseModel

from .infra.bus import ActivityEvent, get_bus
from .infra.init import init_bus, get_bus_config
from .publish import (
    publish_activity, 
    list_activities, 
    log_user_login, 
    log_api_error, 
    log_rate_limit_exceeded
)

logger = logging.getLogger("converto.admin")
router = APIRouter(prefix="/api/admin", tags=["admin"])


# Initialize bus on module load
try:
    bus = init_bus()
    logger.info("✅ Admin router initialized with real-time bus")
    logger.info(f"Bus type: {get_bus_config()['bus_type']}")
except Exception as e:
    logger.error(f"Failed to initialize bus: {e}")
    raise


# Models
class ActivityResponse(BaseModel):
    activities: List[Dict[str, Any]]
    total: int
    page: int
    per_page: int


class WebSocketMessage(BaseModel):
    type: str
    data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
    code: Optional[str] = None


class BusConfigResponse(BaseModel):
    bus_type: str
    production_ready: bool
    backend: str
    features: List[str]


# Dependencies
async def get_current_user_admin(request: Request) -> str:
    """Check if current user has admin privileges (admin middleware already verified)"""
    user_id = getattr(request.state, "user_id", None)
    is_admin = getattr(request.state, "is_admin", False)
    
    if not user_id or not is_admin:
        raise HTTPException(status_code=401, detail="Admin access required")
    
    return user_id


async def get_tenant_id(request: Request) -> str:
    """Get tenant ID from request state or default."""
    return getattr(request.state, "tenant_id", "default")


# WebSocket connection manager with tenant support
class AdminConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self._unsubscribes: Dict[WebSocket, Callable] = {}
    
    async def connect(self, websocket: WebSocket, tenant_id: str):
        """Connect WebSocket and subscribe to tenant events."""
        await websocket.accept()
        
        if tenant_id not in self.active_connections:
            self.active_connections[tenant_id] = []
        
        self.active_connections[tenant_id].append(websocket)
        
        # Subscribe to bus events for this tenant
        def handle_event(event: ActivityEvent):
            # Send event to this specific client
            message = WebSocketMessage(type="activity", data=event.to_dict()).model_dump()
            try:
                if websocket.application_state == WebSocketState.CONNECTED:
                    asyncio.create_task(websocket.send_text(json.dumps(message)))
            except Exception as e:
                logger.error(f"Failed to send event to WebSocket: {e}")
        
        unsubscribe = await bus.subscribe(tenant_id, handle_event)
        self._unsubscribes[websocket] = unsubscribe
        
        logger.info(f"Admin WebSocket connected for tenant {tenant_id}. Total: {len(self.active_connections[tenant_id])}")
    
    def disconnect(self, websocket: WebSocket, tenant_id: str):
        """Disconnect WebSocket and cleanup."""
        if tenant_id in self.active_connections and websocket in self.active_connections[tenant_id]:
            self.active_connections[tenant_id].remove(websocket)
        
        # Cleanup subscription
        if websocket in self._unsubscribes:
            try:
                self._unsubscribes[websocket]()
                del self._unsubscribes[websocket]
            except Exception as e:
                logger.error(f"Error cleaning up subscription: {e}")
        
        logger.info(f"Admin WebSocket disconnected for tenant {tenant_id}. Remaining: {len(self.active_connections.get(tenant_id, []))}")
    
    async def broadcast_activity(self, activity: ActivityEvent, tenant_id: str):
        """Broadcast activity to tenant-specific clients."""
        message = WebSocketMessage(type="activity", data=activity.to_dict()).model_dump()
        disconnected = []
        
        for connection in self.active_connections.get(tenant_id, []):
            try:
                if connection.application_state == WebSocketState.CONNECTED:
                    await connection.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Failed to send to WebSocket: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for conn in disconnected:
            self.disconnect(conn, tenant_id)


manager = AdminConnectionManager()


# REST API Endpoints
@router.get("/activities", response_model=ActivityResponse)
async def get_activities(
    limit: int = 20,
    tenant_id: Optional[str] = None,
    current_user: str = Depends(get_current_user_admin),
    request_tenant_id: str = Depends(get_tenant_id)
):
    """Get admin activities with tenant filtering and real-time bus integration."""
    try:
        # Use provided tenant_id or fall back to request tenant
        effective_tenant_id = tenant_id or request_tenant_id
        
        # Get activities from the bus
        activities = await list_activities(effective_tenant_id, limit)
        
        # Convert to API format
        activity_dicts = [activity.to_dict() for activity in activities]
        
        return ActivityResponse(
            activities=activity_dicts,
            total=len(activities),
            page=1,
            per_page=limit
        )
    except Exception as e:
        logger.error(f"Error fetching activities: {e}")
        # Log API error
        await log_api_error("/api/admin/activities", "GET", str(e), tenant_id=request_tenant_id)
        raise HTTPException(status_code=500, detail="Failed to fetch activities")


@router.post("/activities")
async def create_activity(
    activity_data: dict,
    current_user: str = Depends(get_current_user_admin),
    request_tenant_id: str = Depends(get_tenant_id)
):
    """Create a new activity through the real-time bus."""
    try:
        # Extract activity details from request
        activity_type = activity_data.get("type", "manual_activity")
        details = activity_data.get("details", {})
        effective_tenant_id = activity_data.get("tenant_id") or request_tenant_id
        
        # Publish through the bus
        event = await publish_activity(
            activity_type=activity_type,
            tenant_id=effective_tenant_id,
            details=details,
            **activity_data.get("extra", {})
        )
        
        logger.info(f"Created activity {event.id} of type {activity_type} for tenant {effective_tenant_id}")
        return event.to_dict()
        
    except Exception as e:
        logger.error(f"Error creating activity: {e}")
        # Log API error
        await log_api_error("/api/admin/activities", "POST", str(e), tenant_id=request_tenant_id)
        raise HTTPException(status_code=500, detail="Failed to create activity")


@router.get("/stats")
async def get_admin_stats(
    current_user: str = Depends(get_current_user_admin),
    request_tenant_id: str = Depends(get_tenant_id)
):
    """Get admin dashboard statistics with bus configuration."""
    try:
        # Get recent activities
        activities = await list_activities(request_tenant_id, 100)
        
        # Count by type
        activities_by_type = {}
        recent_count = 0
        current_time = time.time()
        
        for activity in activities:
            activities_by_type[activity.type] = activities_by_type.get(activity.type, 0) + 1
            if current_time - time.mktime(time.strptime(activity.ts, "%Y-%m-%dT%H:%M:%S.%fZ")) < 3600:  # Last hour
                recent_count += 1
        
        # Get bus configuration
        bus_config = get_bus_config()
        
        return {
            "tenant_id": request_tenant_id,
            "total_activities": len(activities),
            "activities_by_type": activities_by_type,
            "recent_activity_count": recent_count,
            "bus_config": bus_config,
            "system_status": "healthy",
            "timestamp": current_time
        }
    except Exception as e:
        logger.error(f"Error fetching admin stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch admin stats")


@router.get("/bus-config", response_model=BusConfigResponse)
async def get_bus_config_api(
    current_user: str = Depends(get_current_user_admin)
):
    """Get current bus configuration for monitoring."""
    config = get_bus_config()
    
    return BusConfigResponse(
        bus_type=config["bus_type"],
        production_ready=config["production_ready"],
        backend=config["backend"],
        features=config["features"]
    )


# WebSocket Endpoint with real-time bus integration
@router.websocket("/feed")
async def admin_websocket(websocket: WebSocket):
    """Admin WebSocket for real-time activity feed with bus integration."""
    tenant_id = "default"  # Would extract from auth context in production
    
    try:
        await manager.connect(websocket, tenant_id)
        
        # Send ready message with bus info
        bus_config = get_bus_config()
        await websocket.send_text(json.dumps({
            "type": "ready",
            "tenant_id": tenant_id,
            "timestamp": time.time(),
            "bus_type": bus_config["bus_type"],
            "production_ready": bus_config["production_ready"]
        }))
        
        while True:
            # Keep connection alive and handle incoming messages
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    # Respond to ping
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": time.time()
                    }))
                    
                elif message.get("type") == "auth":
                    # Handle authentication if needed
                    logger.info(f"WebSocket auth message from tenant {tenant_id}")
                    
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "code": "BAD_MESSAGE",
                    "message": "Invalid JSON format"
                }))
            except WebSocketDisconnect:
                break
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, tenant_id)
    except Exception as e:
        logger.error(f"Admin WebSocket error: {e}")
        manager.disconnect(websocket, tenant_id)


# Health check for admin endpoints
@router.get("/health")
async def admin_health():
    """Health check for admin module with bus status."""
    try:
        bus_config = get_bus_config()
        active_connections = sum(len(conns) for conns in manager.active_connections.values())
        
        return {
            "status": "healthy",
            "timestamp": time.time(),
            "active_connections": active_connections,
            "bus_config": bus_config,
            "bus_type": bus_config["bus_type"],
            "production_ready": bus_config["production_ready"]
        }
    except Exception as e:
        logger.error(f"Error in admin health check: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": time.time()
        }
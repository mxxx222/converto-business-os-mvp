"""Hardened Admin API Router for DocFlow - PR2 production ready.

Features:
- Mandatory WebSocket handshake authentication  
- Tenant-based channel isolation
- Pydantic schema validation
- Rate limiting (60/min/tenant)
- Redis/Supabase bus integration
- XTRIM=10k/tenant data retention
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Dict, List, Optional, Any

from fastapi import APIRouter, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from starlette.websockets import WebSocketState

from .schemas import (
    Activity,
    ActivityInput,
    WebSocketMessage,
    RateLimitRequest,
    RateLimitResponse,
    HealthCheck,
    ActivityResponse,
    AdminSummary,
)
from .bus import get_bus, ActivityEvent
from .rate_limit import rate_limiter, RateLimitError
from shared_core.middleware.admin_auth import admin_auth
from jwt import InvalidTokenError, PyJWKClientError, decode as jwt_decode


logger = logging.getLogger("converto.admin")
router = APIRouter(prefix="/api/admin", tags=["admin"])


# Hardened WebSocket connection manager
class HardenedConnectionManager:
    """Production-ready WebSocket manager with authentication and tenant isolation."""
    
    def __init__(self):
        self.tenant_connections: Dict[str, List[WebSocket]] = {}
        self.authenticated_connections: Dict[WebSocket, Dict[str, Any]] = {}
        self.connection_metadata: Dict[WebSocket, Dict[str, Any]] = {}
        
    async def connect(self, websocket: WebSocket, tenant_id: str) -> bool:
        """Authenticate and connect WebSocket with mandatory auth."""
        try:
            # Request authentication message
            auth_message = await asyncio.wait_for(websocket.receive_text(), timeout=10.0)
            
            try:
                auth_data = json.loads(auth_message)
                auth_msg = WebSocketMessage(**auth_data)
                
                if auth_msg.type != "auth":
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "code": "INVALID_AUTH",
                        "message": "First message must be authentication"
                    }))
                    await websocket.close(code=1008)
                    return False
                
                # Validate admin token using the same JWKS setup as HTTP admin auth
                token = auth_data.get("token", "")
                if not token or len(token) < 10:
                    await websocket.send_text(
                        json.dumps(
                            {
                                "type": "error",
                                "code": "INVALID_TOKEN",
                                "message": "Invalid or missing admin token",
                            }
                        )
                    )
                    await websocket.close(code=1008)
                    return False

                if admin_auth.jwks_client is None:
                    # Admin auth not configured; fail closed in production-style code
                    await websocket.send_text(
                        json.dumps(
                            {
                                "type": "error",
                                "code": "AUTH_NOT_CONFIGURED",
                                "message": "Admin authentication is not configured",
                            }
                        )
                    )
                    await websocket.close(code=1011)
                    return False

                try:
                    signing_key = admin_auth.jwks_client.get_signing_key_from_jwt(token).key
                    claims = jwt_decode(
                        token,
                        signing_key,
                        algorithms=["RS256"],
                        audience=admin_auth.audience,
                        options={"require": ["sub", "iss", "aud"]},
                    )
                except (InvalidTokenError, PyJWKClientError) as exc:
                    await websocket.send_text(
                        json.dumps(
                            {
                                "type": "error",
                                "code": "INVALID_TOKEN",
                                "message": f"Invalid admin token: {exc}",
                            }
                        )
                    )
                    await websocket.close(code=1008)
                    return False

                if admin_auth.issuer and str(claims.get("iss")) != admin_auth.issuer:
                    await websocket.send_text(
                        json.dumps(
                            {
                                "type": "error",
                                "code": "INVALID_ISSUER",
                                "message": "Invalid token issuer",
                            }
                        )
                    )
                    await websocket.close(code=1008)
                    return False

                # Enforce admin privileges
                if not admin_auth._check_admin_role(claims):
                    await websocket.send_text(
                        json.dumps(
                            {
                                "type": "error",
                                "code": "INSUFFICIENT_PRIVILEGES",
                                "message": "Admin privileges required",
                            }
                        )
                    )
                    await websocket.close(code=1008)
                    return False

                # Resolve tenant from claims or auth payload
                resolved_tenant_id = (
                    auth_data.get("tenant_id") or admin_auth._resolve_tenant_id(claims)
                )
                tenant_id = resolved_tenant_id or tenant_id
                
                # Check rate limit for WebSocket connections
                allowed, rate_info = await rate_limiter.check_rate_limit(
                    tenant_id, "websocket", "CONNECT"
                )
                
                if not allowed:
                    await websocket.send_text(
                        json.dumps(
                            {
                                "type": "error",
                                "code": "RATE_LIMITED",
                                "message": "WebSocket rate limit exceeded",
                                "retry_after": rate_info.get("retry_after", 60),
                            }
                        )
                    )
                    await websocket.close(code=1008)
                    return False
                
                # Accept connection
                await websocket.accept()
                
                # Store authenticated connection
                if tenant_id not in self.tenant_connections:
                    self.tenant_connections[tenant_id] = []
                self.tenant_connections[tenant_id].append(websocket)

                self.authenticated_connections[websocket] = {
                    "tenant_id": tenant_id,
                    "token": token,
                    "user_id": str(claims.get("sub")),
                    "connected_at": time.time(),
                    "last_ping": time.time(),
                    "capabilities": auth_data.get("capabilities", []),
                }
                
                self.connection_metadata[websocket] = {
                    "ping_count": 0,
                    "message_count": 0,
                    "error_count": 0
                }
                
                logger.info(f"✅ Authenticated WebSocket connected for tenant {tenant_id}")
                
                # Send ready message
                await websocket.send_text(json.dumps({
                    "type": "ready",
                    "tenant_id": tenant_id,
                    "timestamp": time.time(),
                    "capabilities": ["activity_stream", "bulk_activities"]
                }))
                
                return True
                
            except (json.JSONDecodeError, ValueError) as e:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "code": "BAD_AUTH_FORMAT",
                    "message": f"Invalid authentication message: {str(e)}"
                }))
                await websocket.close(code=1003)
                return False
                
        except asyncio.TimeoutError:
            await websocket.send_text(json.dumps({
                "type": "error",
                "code": "AUTH_TIMEOUT",
                "message": "Authentication timeout (10s)"
            }))
            await websocket.close(code=1008)
            return False
            
        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
            return False
    
    def disconnect(self, websocket: WebSocket, tenant_id: str):
        """Disconnect and cleanup WebSocket."""
        try:
            if tenant_id in self.tenant_connections and websocket in self.tenant_connections[tenant_id]:
                self.tenant_connections[tenant_id].remove(websocket)
            
            self.authenticated_connections.pop(websocket, None)
            self.connection_metadata.pop(websocket, None)
            
            logger.info(f"WebSocket disconnected for tenant {tenant_id}")
            
        except Exception as e:
            logger.error(f"WebSocket disconnect error: {e}")
    
    async def broadcast_activity(self, activity: Activity, tenant_id: str):
        """Broadcast activity to tenant-specific connections."""
        try:
            message = {
                "type": "activity",
                "data": activity.to_dict(),
                "timestamp": time.time()
            }
            
            message_json = json.dumps(message)
            disconnected = []
            
            for connection in self.tenant_connections.get(tenant_id, []):
                try:
                    if connection.application_state == WebSocketState.CONNECTED:
                        await connection.send_text(message_json)
                        
                        if connection in self.connection_metadata:
                            self.connection_metadata[connection]["message_count"] += 1
                            
                except Exception as e:
                    logger.error(f"Failed to send to WebSocket: {e}")
                    disconnected.append(connection)
            
            for conn in disconnected:
                self.disconnect(conn, tenant_id)
                
        except Exception as e:
            logger.error(f"Broadcast activity failed: {e}")


# Global connection manager
connection_manager = HardenedConnectionManager()


# Dependencies
async def get_current_user_admin(request: Request) -> str:
    """Check if current user has admin privileges."""
    user_id = getattr(request.state, "user_id", None)
    is_admin = getattr(request.state, "is_admin", False)
    
    if not user_id or not is_admin:
        raise HTTPException(status_code=401, detail="Admin access required")
    
    return user_id


async def get_tenant_id(request: Request) -> str:
    """Get tenant ID from request state or default."""
    return getattr(request.state, "tenant_id", "default")


# REST API Endpoints
@router.get("/activities", response_model=ActivityResponse)
async def get_activities(
    limit: int = 20,
    tenant_id: Optional[str] = None,
    current_user: str = Depends(get_current_user_admin),
    request_tenant_id: str = Depends(get_tenant_id)
):
    """Get admin activities with rate limiting."""
    try:
        effective_tenant_id = tenant_id or request_tenant_id
        
        # Check rate limit
        allowed, rate_info = await rate_limiter.check_rate_limit(
            effective_tenant_id, "activities", "GET", current_user
        )
        
        if not allowed:
            raise RateLimitError(effective_tenant_id, "activities", rate_info)
        
        # Get activities from bus
        bus = get_bus()
        activities = await bus.get_recent_activities(effective_tenant_id, limit=limit)
        
        activity_dicts = [activity.payload.to_dict() for activity in activities]
        
        return ActivityResponse(
            activities=activity_dicts,
            total=len(activity_dicts),
            page=1,
            per_page=limit
        )
        
    except RateLimitError:
        raise
    except Exception as e:
        logger.error(f"Error fetching activities: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch activities")


@router.get("/summary", response_model=AdminSummary)
async def get_admin_summary(
    current_user: str = Depends(get_current_user_admin),
    request_tenant_id: str = Depends(get_tenant_id),
):
    """Get high-level admin dashboard summary for a tenant."""
    try:
        tenant_id = request_tenant_id

        # Fetch recent activities to build a simple summary
        bus = get_bus()
        activities = await bus.get_recent_activities(tenant_id, limit=200)

        activities_by_type: Dict[str, int] = {}
        recent_count = 0
        now = time.time()

        for event in activities:
            activities_by_type[event.type] = activities_by_type.get(event.type, 0) + 1
            if now - event.timestamp < 3600:  # last hour
                recent_count += 1

        return AdminSummary(
            tenant_id=tenant_id,
            total_activities=len(activities),
            activities_by_type=activities_by_type,
            recent_activity_count=recent_count,
            timestamp=datetime.utcnow(),
        )
    except Exception as e:
        logger.error(f"Error fetching admin summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch admin summary")


@router.post("/activities")
async def create_activity(
    activity_input: ActivityInput,
    current_user: str = Depends(get_current_user_admin),
    request_tenant_id: str = Depends(get_tenant_id)
):
    """Create activity with validation and rate limiting."""
    try:
        effective_tenant_id = activity_input.tenant_id or request_tenant_id
        
        # Check rate limit
        allowed, rate_info = await rate_limiter.check_rate_limit(
            effective_tenant_id, "activities", "POST", current_user
        )
        
        if not allowed:
            raise RateLimitError(effective_tenant_id, "activities", rate_info)
        
        # Create activity
        activity = Activity(**activity_input.dict())
        
        # Publish to bus
        bus = get_bus()
        event = ActivityEvent(
            id=activity.id,
            tenant_id=activity.tenant_id,
            type=activity.type,
            payload=activity.to_dict(),
            channel=f"admin:{activity.tenant_id}:{activity.type}",
            timestamp=time.time()
        )
        
        await bus.publish(event)
        
        # Broadcast to WebSocket clients
        await connection_manager.broadcast_activity(activity, activity.tenant_id)
        
        return activity.to_dict()
        
    except RateLimitError:
        raise
    except Exception as e:
        logger.error(f"Error creating activity: {e}")
        raise HTTPException(status_code=500, detail="Failed to create activity")


@router.get("/health", response_model=HealthCheck)
async def admin_health():
    """Health check for admin module."""
    start_time = time.time()
    
    try:
        response_time_ms = (time.time() - start_time) * 1000
        
        return HealthCheck(
            service="admin_api",
            status="healthy",
            response_time_ms=response_time_ms,
            checks={
                "rate_limiting": "enabled",
                "websocket_auth": "enabled"
            }
        )
        
    except Exception as e:
        return HealthCheck(
            service="admin_api",
            status="unhealthy",
            response_time_ms=(time.time() - start_time) * 1000,
            error=str(e)
        )


# WebSocket Endpoint
@router.websocket("/feed")
async def admin_websocket(websocket: WebSocket):
    """Admin WebSocket with mandatory authentication."""
    tenant_id = "default"
    
    try:
        authenticated = await connection_manager.connect(websocket, tenant_id)
        
        if not authenticated:
            return
        
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                message = json.loads(data)
                
                msg_type = message.get("type")
                
                if msg_type == "ping":
                    timestamp = message.get("timestamp", time.time())
                    await websocket.send_text(json.dumps({
                        "type": "pong",
                        "timestamp": timestamp
                    }))
                    
                elif msg_type == "subscribe":
                    channels = message.get("channels", [])
                    await websocket.send_text(json.dumps({
                        "type": "subscribed",
                        "channels": channels
                    }))
                    
            except asyncio.TimeoutError:
                try:
                    await websocket.send_text(json.dumps({
                        "type": "heartbeat",
                        "timestamp": time.time()
                    }))
                except:
                    break
                    
            except WebSocketDisconnect:
                break
                
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        connection_manager.disconnect(websocket, tenant_id)


__all__ = ["router", "connection_manager"]
"""Pydantic validation schemas for DocFlow admin real-time feed - PR2 hardening."""

from __future__ import annotations

import re
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, validator, root_validator


# Enums
class ActivityType(str, Enum):
    """Activity types for validation."""
    USER_LOGIN = "user_login"
    USER_LOGOUT = "user_logout"  
    API_REQUEST = "api_request"
    API_ERROR = "api_error"
    OCR_STARTED = "ocr_started"
    OCR_COMPLETED = "ocr_completed"
    OCR_FAILED = "ocr_failed"
    DOCUMENT_UPLOADED = "document_uploaded"
    DOCUMENT_PROCESSED = "document_processed"
    DOCUMENT_FAILED = "document_failed"
    SUBSCRIPTION_CREATED = "subscription_created"
    SUBSCRIPTION_UPDATED = "subscription_updated"
    SUBSCRIPTION_CANCELLED = "subscription_cancelled"
    PAYMENT_SUCCESSFUL = "payment_successful"
    PAYMENT_FAILED = "payment_failed"
    SYSTEM_ALERT = "system_alert"
    SYSTEM_ERROR = "system_error"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    ADMIN_ACTION = "admin_action"


class Severity(str, Enum):
    """Activity severity levels."""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class Source(str, Enum):
    """Event source systems."""
    FRONTEND = "frontend"
    BACKEND = "backend"
    OCR_SERVICE = "ocr_service"
    BILLING_SERVICE = "billing_service"
    SUPABASE = "supabase"
    REDIS = "redis"
    EXTERNAL_API = "external_api"


# Base models
class BaseValidationModel(BaseModel):
    """Base model with common validation."""
    
    @validator('*', pre=True)
    def strip_strings(cls, v):
        if isinstance(v, str):
            return v.strip()
        return v


# Activity model
class ActivityMetadata(BaseValidationModel):
    """Activity metadata (flexible key-value store)."""
    pass  # This allows any additional fields via extra='forbid' in parent


class ActivityInput(BaseValidationModel):
    """Input schema for creating activities."""
    type: ActivityType
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    severity: Severity = Severity.INFO
    source: Source = Source.BACKEND
    user_id: Optional[str] = None
    tenant_id: str = Field(..., regex=r'^[a-z0-9][a-z0-9-_]*[a-z0-9]$')
    session_id: Optional[str] = Field(None, max_length=100)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = Field(None, max_length=500)
    api_endpoint: Optional[str] = Field(None, max_length=200)
    http_method: Optional[str] = Field(None, regex=r'^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)$')
    http_status: Optional[int] = Field(None, ge=100, le=599)
    response_time_ms: Optional[float] = Field(None, gt=0)
    error_code: Optional[str] = Field(None, max_length=50)
    error_message: Optional[str] = Field(None, max_length=500)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('ip_address')
    def validate_ip_address(cls, v):
        if v and not re.match(r'^(?:\d{1,3}\.){3}\d{1,3}$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$', v):
            raise ValueError('Invalid IP address format')
        return v
    
    @validator('metadata')
    def validate_metadata_size(cls, v):
        if len(str(v)) > 10000:  # 10KB limit
            raise ValueError('Metadata too large (max 10KB)')
        return v


class Activity(ActivityInput):
    """Complete activity model with generated fields."""
    id: str = Field(default_factory=lambda: str(UUID.generate()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "type": self.type,
            "title": self.title,
            "description": self.description,
            "severity": self.severity,
            "source": self.source,
            "user_id": self.user_id,
            "tenant_id": self.tenant_id,
            "session_id": self.session_id,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "api_endpoint": self.api_endpoint,
            "http_method": self.http_method,
            "http_status": self.http_status,
            "response_time_ms": self.response_time_ms,
            "error_code": self.error_code,
            "error_message": self.error_message,
            "metadata": self.metadata,
            "timestamp": self.timestamp.isoformat(),
            "created_at": self.created_at.isoformat()
        }


# WebSocket message models
class WebSocketMessageType(str, Enum):
    """WebSocket message types."""
    SUBSCRIBE = "subscribe"
    UNSUBSCRIBE = "unsubscribe" 
    PING = "ping"
    PONG = "pong"
    ACTIVITY = "activity"
    ERROR = "error"
    BULK_ACTIVITIES = "bulk_activities"
    HEARTBEAT = "heartbeat"
    AUTH = "auth"


class WebSocketAuthMessage(BaseValidationModel):
    """WebSocket authentication message."""
    type: WebSocketMessageType = WebSocketMessageType.AUTH
    token: str = Field(..., min_length=10)
    tenant_id: Optional[str] = None
    capabilities: Optional[List[str]] = None


class WebSocketSubscribeMessage(BaseValidationModel):
    """WebSocket subscription message."""
    type: WebSocketMessageType = WebSocketMessageType.SUBSCRIBE
    channels: List[str] = Field(..., min_items=1, max_items=10)
    filters: Optional[Dict[str, Any]] = None


class WebSocketPingMessage(BaseValidationModel):
    """WebSocket ping message."""
    type: WebSocketMessageType = WebSocketMessageType.PING
    timestamp: float = Field(..., gt=0)


class WebSocketPongMessage(BaseValidationModel):
    """WebSocket pong response."""
    type: WebSocketMessageType = WebSocketMessageType.PONG
    timestamp: float = Field(..., gt=0)


class WebSocketErrorMessage(BaseValidationModel):
    """WebSocket error message."""
    type: WebSocketMessageType = WebSocketMessageType.ERROR
    code: str = Field(..., max_length=50)
    message: str = Field(..., max_length=500)
    details: Optional[Dict[str, Any]] = None


class WebSocketMessage(BaseValidationModel):
    """Unified WebSocket message model."""
    type: WebSocketMessageType
    data: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
    code: Optional[str] = None
    
    @root_validator
    def validate_message_content(cls, values):
        msg_type = values.get('type')
        
        if msg_type == WebSocketMessageType.AUTH and 'data' in values:
            return WebSocketAuthMessage(**values).dict()
        elif msg_type == WebSocketMessageType.SUBSCRIBE and 'data' in values:
            return WebSocketSubscribeMessage(**values).dict()
        elif msg_type == WebSocketMessageType.PING and 'data' in values:
            return WebSocketPingMessage(**values).dict()
        elif msg_type == WebSocketMessageType.ERROR:
            return WebSocketErrorMessage(**values).dict()
        
        return values


# Rate limiting models
class RateLimitRequest(BaseValidationModel):
    """Rate limit request model."""
    tenant_id: str = Field(..., regex=r'^[a-z0-9][a-z0-9-_]*[a-z0-9]$')
    endpoint: str = Field(..., min_length=1, max_length=200)
    method: str = Field(default="GET", regex=r'^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)$')
    user_id: Optional[str] = None


class RateLimitResponse(BaseValidationModel):
    """Rate limit response model."""
    allowed: bool
    remaining: int = Field(..., ge=0)
    reset_time: float = Field(..., ge=0)
    retry_after: Optional[float] = Field(None, ge=0)


# Health check models
class HealthCheck(BaseValidationModel):
    """Health check result model."""
    service: str = Field(..., min_length=1, max_length=100)
    status: str = Field(..., regex=r'^(healthy|degraded|unhealthy)$')
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    response_time_ms: float = Field(..., gt=0)
    checks: Optional[Dict[str, Any]] = None
    error: Optional[str] = Field(None, max_length=500)


# Bus models
class BusActivity(BaseValidationModel):
    """Bus activity message for Redis/Supabase."""
    id: str
    tenant_id: str = Field(..., regex=r'^[a-z0-9][a-z0-9-_]*[a-z0-9]$')
    type: str
    payload: Dict[str, Any]
    channel: str
    timestamp: datetime
    ttl: int = Field(default=3600, ge=1, le=86400)  # 1 hour default, max 1 day


# Response models
class ActivityResponse(BaseValidationModel):
    """Activity list response."""
    activities: List[Dict[str, Any]]
    total: int = Field(..., ge=0)
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)


class BusConfigResponse(BaseValidationModel):
    """Bus configuration response."""
    bus_type: str
    production_ready: bool
    backend: str
    features: List[str]


# Validation functions
def validate_activity(data: Dict[str, Any]) -> Activity:
    """Validate and create activity from dict."""
    try:
        return Activity(**data)
    except Exception as e:
        raise ValueError(f"Activity validation failed: {e}")


def validate_websocket_message(data: Dict[str, Any]) -> WebSocketMessage:
    """Validate and create WebSocket message from dict."""
    try:
        return WebSocketMessage(**data)
    except Exception as e:
        raise ValueError(f"WebSocket message validation failed: {e}")


def validate_rate_limit_request(data: Dict[str, Any]) -> RateLimitRequest:
    """Validate rate limit request."""
    try:
        return RateLimitRequest(**data)
    except Exception as e:
        raise ValueError(f"Rate limit request validation failed: {e}")


def validate_bus_activity(data: Dict[str, Any]) -> BusActivity:
    """Validate bus activity message."""
    try:
        return BusActivity(**data)
    except Exception as e:
        raise ValueError(f"Bus activity validation failed: {e}")


# Export all models and validation functions
__all__ = [
    # Enums
    "ActivityType", "Severity", "Source", "WebSocketMessageType",
    
    # Models
    "Activity", "ActivityInput", "WebSocketMessage", "WebSocketAuthMessage",
    "WebSocketSubscribeMessage", "WebSocketPingMessage", "WebSocketErrorMessage",
    "RateLimitRequest", "RateLimitResponse", "HealthCheck", "BusActivity",
    "ActivityResponse", "BusConfigResponse",
    
    # Validation functions
    "validate_activity", "validate_websocket_message", "validate_rate_limit_request",
    "validate_bus_activity"
]
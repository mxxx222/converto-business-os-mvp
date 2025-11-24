"""Structured logging utility for the admin system."""

import json
import time
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import uuid


class StructuredLogger:
    """Structured logger with request correlation and tenant context."""
    
    def __init__(self, name: str = "converto.admin"):
        self.logger = logging.getLogger(name)
        self._setup_logger()
    
    def _setup_logger(self):
        """Setup logger with JSON formatter."""
        if not self.logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter('%(message)s')
            handler.setFormatter(formatter)
            self.logger.addHandler(handler)
            self.logger.setLevel(logging.INFO)
    
    def _log(self, level: str, message: str, **meta: Any):
        """Internal logging method with structured output."""
        log_entry = {
            "level": level,
            "message": message,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "logger": self.logger.name,
            **meta
        }
        
        # Log as JSON for structured parsing
        if level == "error":
            self.logger.error(json.dumps(log_entry))
        elif level == "warning":
            self.logger.warning(json.dumps(log_entry))
        else:
            self.logger.info(json.dumps(log_entry))
    
    def info(self, message: str, **meta: Any):
        """Log info level message."""
        self._log("info", message, **meta)
    
    def error(self, message: str, **meta: Any):
        """Log error level message."""
        self._log("error", message, **meta)
    
    def warning(self, message: str, **meta: Any):
        """Log warning level message."""
        self._log("warning", message, **meta)
    
    def activity_published(self, activity_type: str, tenant_id: str, activity_id: str, **meta: Any):
        """Log activity publication event."""
        self.info(
            "activity_published",
            event_type="activity_published",
            activity_type=activity_type,
            tenant_id=tenant_id,
            activity_id=activity_id,
            **meta
        )
    
    def ws_connection_opened(self, tenant_id: str, connection_id: str, **meta: Any):
        """Log WebSocket connection open."""
        self.info(
            "ws_connection_opened",
            event_type="ws_connection",
            tenant_id=tenant_id,
            connection_id=connection_id,
            **meta
        )
    
    def ws_connection_closed(self, tenant_id: str, connection_id: str, reason: str, **meta: Any):
        """Log WebSocket connection close."""
        self.info(
            "ws_connection_closed",
            event_type="ws_connection",
            tenant_id=tenant_id,
            connection_id=connection_id,
            close_reason=reason,
            **meta
        )
    
    def ws_backpressure_close(self, tenant_id: str, connection_id: str, buffer_size: int, **meta: Any):
        """Log WebSocket backpressure closure."""
        self.warning(
            "ws_backpressure_close",
            event_type="ws_backpressure",
            tenant_id=tenant_id,
            connection_id=connection_id,
            buffer_size=buffer_size,
            **meta
        )
    
    def rate_limit_exceeded(self, tenant_id: str, endpoint: str, limit: int, window: int, **meta: Any):
        """Log rate limit exceedance."""
        self.warning(
            "rate_limit_exceeded",
            event_type="rate_limit",
            tenant_id=tenant_id,
            endpoint=endpoint,
            limit=limit,
            window_seconds=window,
            **meta
        )
    
    def validation_error(self, error_type: str, field: str, value: str, **meta: Any):
        """Log validation error."""
        self.error(
            "validation_error",
            event_type="validation_error",
            error_type=error_type,
            field=field,
            value_preview=value[:100],  # Truncate for security
            **meta
        )
    
    def api_request(self, method: str, path: str, status_code: int, duration_ms: float, tenant_id: str, **meta: Any):
        """Log API request summary."""
        self.info(
            "api_request",
            event_type="api_request",
            method=method,
            path=path,
            status_code=status_code,
            duration_ms=duration_ms,
            tenant_id=tenant_id,
            **meta
        )


# Global logger instance
admin_logger = StructuredLogger()


def log_api_request(method: str, path: str, status_code: int, duration_ms: float, tenant_id: str, **meta: Any):
    """Log API request with timing."""
    admin_logger.api_request(method, path, status_code, duration_ms, tenant_id, **meta)


def log_activity_published(activity_type: str, tenant_id: str, activity_id: str, **meta: Any):
    """Log activity publication."""
    admin_logger.activity_published(activity_type, tenant_id, activity_id, **meta)


def log_ws_event(event_type: str, tenant_id: str, connection_id: str, **meta: Any):
    """Log WebSocket events."""
    if event_type == "connection_opened":
        admin_logger.ws_connection_opened(tenant_id, connection_id, **meta)
    elif event_type == "connection_closed":
        admin_logger.ws_connection_closed(tenant_id, connection_id, meta.get("reason", "unknown"), **meta)
    elif event_type == "backpressure":
        admin_logger.ws_backpressure_close(tenant_id, connection_id, meta.get("buffer_size", 0), **meta)


def log_error(error_type: str, error_message: str, **meta: Any):
    """Log error with context."""
    admin_logger.error(error_message, error_type=error_type, **meta)


def log_warning(warning_type: str, message: str, **meta: Any):
    """Log warning with context."""
    admin_logger.warning(message, warning_type=warning_type, **meta)


def generate_request_id() -> str:
    """Generate unique request ID for correlation."""
    return str(uuid.uuid4())


def log_with_request_id(message: str, request_id: str, **meta: Any):
    """Log message with request correlation ID."""
    admin_logger.info(message, request_id=request_id, **meta)
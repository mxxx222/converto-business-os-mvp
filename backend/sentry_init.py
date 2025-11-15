"""Sentry initialization for DocFlow backend.

This module initializes Sentry SDK for FastAPI backend with:
- Error tracking and performance monitoring
- SQL query tracing (SQLAlchemy integration)
- Aggressive PII scrubbing (GDPR-compliant)
- Tenant context tagging
- ENV-controlled sampling

Usage:
    from backend.sentry_init import init_sentry, set_tenant_context
    
    # In main.py
    init_sentry()
    
    # In middleware
    set_tenant_context(tenant_id, user_id, role)
"""

from __future__ import annotations

import os
import re
import logging
from typing import Any, Dict, Optional

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from sentry_sdk.integrations.logging import LoggingIntegration

logger = logging.getLogger(__name__)

# Sensitive headers to scrub
SENSITIVE_HEADERS = {
    "authorization",
    "cookie",
    "set-cookie",
    "x-api-key",
    "x-auth-token",
    "x-admin-override-reason",
    "x-supabase-token",
}

# PII fields to remove
PII_FIELDS = {"email", "phone", "ip_address", "username"}

# Email pattern for scrubbing
EMAIL_PATTERN = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')

# Token pattern for scrubbing (long alphanumeric strings)
TOKEN_PATTERN = re.compile(r'\b[A-Za-z0-9_-]{20,}\b')


def scrub_event(event: Dict[str, Any], hint: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Scrub PII from Sentry events.
    
    This function removes all sensitive data from events before sending to Sentry:
    - Authorization headers and cookies
    - Email addresses and phone numbers
    - Tokens and API keys
    - Query parameters (might contain sensitive data)
    
    Args:
        event: Sentry event dictionary
        hint: Additional context (unused)
        
    Returns:
        Scrubbed event or None to drop the event
    """
    
    # Scrub request headers
    if "request" in event and "headers" in event["request"]:
        headers = {}
        for key, value in event["request"]["headers"].items():
            if key.lower() not in SENSITIVE_HEADERS:
                headers[key] = value
            else:
                headers[key] = "[REDACTED]"
        event["request"]["headers"] = headers
    
    # Scrub cookies
    if "request" in event and "cookies" in event["request"]:
        event["request"]["cookies"] = {}
    
    # Scrub query parameters (might contain tokens)
    if "request" in event and "query_string" in event["request"]:
        event["request"]["query_string"] = "[REDACTED]"
    
    # Scrub user data (keep only non-PII)
    if "user" in event:
        user = {}
        for key, value in event["user"].items():
            if key not in PII_FIELDS:
                user[key] = value
        event["user"] = user
    
    # Scrub exception messages
    if "exception" in event and "values" in event["exception"]:
        for exception in event["exception"]["values"]:
            if "value" in exception:
                # Remove emails
                exception["value"] = EMAIL_PATTERN.sub(
                    '[REDACTED_EMAIL]',
                    exception["value"]
                )
                # Remove potential tokens
                exception["value"] = TOKEN_PATTERN.sub(
                    '[REDACTED_TOKEN]',
                    exception["value"]
                )
    
    # Scrub breadcrumbs
    if "breadcrumbs" in event:
        for breadcrumb in event["breadcrumbs"]:
            if "data" in breadcrumb:
                # Remove sensitive keys
                for key in list(breadcrumb["data"].keys()):
                    if key.lower() in SENSITIVE_HEADERS:
                        breadcrumb["data"][key] = "[REDACTED]"
    
    return event


def init_sentry() -> None:
    """Initialize Sentry SDK for backend.
    
    This should be called once at application startup, before creating
    the FastAPI app instance.
    
    Configuration via environment variables:
    - SENTRY_DSN: Sentry project DSN (required)
    - ENVIRONMENT: Environment name (development/staging/production)
    - SENTRY_TRACES_SAMPLE_RATE: Trace sampling rate (default 0.1)
    - SENTRY_PROFILES_SAMPLE_RATE: Profiling sampling rate (default 0.1)
    - SENTRY_RELEASE: Release identifier (git commit SHA)
    """
    
    dsn = os.getenv("SENTRY_DSN")
    if not dsn:
        logger.warning("SENTRY_DSN not set - Sentry disabled")
        return
    
    environment = os.getenv("ENVIRONMENT", "development")
    
    # Sampling rates from environment
    traces_sample_rate = float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1"))
    profiles_sample_rate = float(os.getenv("SENTRY_PROFILES_SAMPLE_RATE", "0.1"))
    
    # Initialize Sentry
    sentry_sdk.init(
        dsn=dsn,
        environment=environment,
        
        # Integrations
        integrations=[
            FastApiIntegration(
                transaction_style="endpoint",  # Group by endpoint, not full URL
            ),
            SqlalchemyIntegration(),
            LoggingIntegration(
                level=logging.INFO,  # Capture INFO and above
                event_level=logging.ERROR,  # Only send ERROR and above as events
            ),
        ],
        
        # Sampling
        traces_sample_rate=traces_sample_rate,
        profiles_sample_rate=profiles_sample_rate,
        
        # PII
        send_default_pii=False,
        before_send=scrub_event,
        
        # Release tracking
        release=os.getenv("SENTRY_RELEASE", os.getenv("GIT_COMMIT_SHA")),
        
        # Performance profiling (Sentry Team feature)
        _experiments={
            "profiles_sample_rate": profiles_sample_rate,
        },
        
        # Additional options
        attach_stacktrace=True,
        max_breadcrumbs=50,
    )
    
    logger.info(
        f"Sentry initialized: env={environment}, "
        f"traces={traces_sample_rate}, profiles={profiles_sample_rate}"
    )


def set_tenant_context(tenant_id: str, user_id: str, role: str) -> None:
    """Set tenant context for Sentry events.
    
    This adds tags to all subsequent Sentry events that help filter
    and analyze errors by tenant. Should be called in middleware after
    user authentication.
    
    Note: tenant_id and user_id are UUIDs, not PII.
    
    Args:
        tenant_id: Tenant identifier (UUID)
        user_id: User identifier (UUID)
        role: User role (admin/support/readonly/user)
        
    Example:
        @app.middleware("http")
        async def sentry_context(request, call_next):
            user = request.state.user
            if user:
                set_tenant_context(user.tenant_id, user.id, user.role)
            return await call_next(request)
    """
    from sentry_sdk import set_tag, set_user
    
    # Set tags for filtering
    set_tag("tenant_id", str(tenant_id))
    set_tag("user_role", str(role))
    
    # Set user context (only non-PII fields)
    set_user({
        "id": str(user_id),
        "tenant_id": str(tenant_id),
        # Do NOT include email, ip_address, or other PII
    })


def capture_auth_error(error: Exception, context: Dict[str, Any]) -> None:
    """Capture authentication-related errors with additional context.
    
    Use this for auth-specific errors like token refresh failures,
    RLS violations, etc.
    
    Args:
        error: The exception that occurred
        context: Additional context (e.g., endpoint, user_id)
        
    Example:
        try:
            await refresh_token()
        except Exception as e:
            capture_auth_error(e, {
                "endpoint": "/api/auth/refresh",
                "user_id": user.id,
            })
            raise
    """
    from sentry_sdk import capture_exception
    
    capture_exception(error, extras=context, tags={
        "component": "auth",
        "error_type": type(error).__name__,
    })


def capture_rls_violation(
    table: str,
    operation: str,
    tenant_id: str,
    user_id: str,
    error: Exception
) -> None:
    """Capture Row Level Security violations.
    
    RLS violations are CRITICAL security events that should be
    investigated immediately.
    
    Args:
        table: Database table name
        operation: SQL operation (SELECT/INSERT/UPDATE/DELETE)
        tenant_id: Tenant that was accessed
        user_id: User who attempted access
        error: The RLS error
    """
    from sentry_sdk import capture_exception
    
    capture_exception(error, level="error", extras={
        "table": table,
        "operation": operation,
        "tenant_id": tenant_id,
        "user_id": user_id,
    }, tags={
        "component": "rls",
        "security": "critical",
        "table": table,
    })


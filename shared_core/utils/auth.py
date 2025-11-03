"""Authentication utilities for FastAPI."""

from __future__ import annotations

from fastapi import Request


def get_current_user_id(request: Request) -> str:
    """Get current user ID from request state (set by auth middleware)."""
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        # Fallback to dev mode
        return "dev-user"
    return str(user_id)


def get_current_tenant_id(request: Request) -> str:
    """Get current tenant ID from request state."""
    tenant_id = getattr(request.state, "tenant_id", None)
    if not tenant_id:
        # Fallback to dev mode
        return "dev-tenant"
    return str(tenant_id)

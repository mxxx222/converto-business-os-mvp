"""Tenant Context Middleware for Row Level Security.

This middleware sets PostgreSQL session variables that are used by
Supabase RLS policies to enforce tenant isolation at the database level.

Security: This is a critical security component. Any bugs here could
lead to tenant data leakage.
"""

from __future__ import annotations

import logging
from typing import Callable, Awaitable

from fastapi import Request, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from shared_core.utils.db import get_session

logger = logging.getLogger(__name__)


class TenantContextMiddleware:
    """Middleware to set PostgreSQL session variables for RLS enforcement.
    
    This middleware MUST run after authentication middleware (supabase_auth or rbac)
    to ensure request.state.user is populated.
    
    Session variables set:
    - app.current_tenant_id: Used by RLS policies for tenant isolation
    - app.user_role: Used by admin override policies
    - app.admin_override_reason: Required for admin to access other tenants
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)

    async def __call__(
        self, 
        request: Request, 
        call_next: Callable[[Request], Awaitable]
    ):
        """Set tenant context before processing request."""
        
        # Skip for public endpoints
        public_paths = {
            "/",
            "/health",
            "/docs",
            "/openapi.json",
            "/api/auth/login",
            "/api/auth/signup",
        }
        
        if request.url.path in public_paths:
            return await call_next(request)

        # Get user from request state (set by auth middleware)
        user = getattr(request.state, 'user', None)
        
        if not user:
            # No user context - let request proceed (auth middleware will handle)
            return await call_next(request)

        # Extract tenant_id and role
        tenant_id = getattr(user, 'tenant_id', None)
        role = getattr(user, 'role', 'user')
        
        if not tenant_id:
            self.logger.warning(
                f"User {getattr(user, 'id', 'unknown')} has no tenant_id. "
                "This may cause RLS policies to block all queries."
            )
            # Continue anyway - some endpoints might not need tenant context
            return await call_next(request)

        # Set PostgreSQL session variables for RLS
        try:
            # Get database session
            db: AsyncSession = next(get_session())
            
            async with db.begin():
                # Set tenant context
                await db.execute(
                    text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
                    {"tenant_id": str(tenant_id)}
                )
                
                # Set user role
                await db.execute(
                    text("SELECT set_config('app.user_role', :role, true)"),
                    {"role": str(role)}
                )
                
                # Check for admin override reason (from header)
                admin_override_reason = request.headers.get('X-Admin-Override-Reason')
                if admin_override_reason and role == 'admin':
                    await db.execute(
                        text("SELECT set_config('app.admin_override_reason', :reason, true)"),
                        {"reason": admin_override_reason}
                    )
                    self.logger.info(
                        f"Admin {getattr(user, 'id', 'unknown')} accessing with override: {admin_override_reason}"
                    )
            
            self.logger.debug(
                f"Set tenant context: tenant_id={tenant_id}, role={role}"
            )
            
        except Exception as e:
            self.logger.error(f"Failed to set tenant context: {e}")
            # CRITICAL: If we can't set tenant context, we MUST fail the request
            # to prevent potential data leakage
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to establish security context"
            )

        # Process request with tenant context set
        response = await call_next(request)
        return response


# Global middleware instance
tenant_context_middleware = TenantContextMiddleware()


# Utility function for manual tenant context setting (for background jobs, etc.)
async def set_tenant_context(
    db: AsyncSession,
    tenant_id: str,
    role: str = 'user',
    admin_override_reason: str | None = None
) -> None:
    """Manually set tenant context for database session.
    
    Use this in background jobs, CLI scripts, or anywhere outside HTTP request context.
    
    Args:
        db: SQLAlchemy async session
        tenant_id: Tenant identifier
        role: User role (default: 'user')
        admin_override_reason: Required if role='admin' and accessing other tenants
        
    Example:
        async with get_session() as db:
            await set_tenant_context(db, 'tenant-123', 'admin', 'Support ticket #456')
            # Now all queries will be scoped to tenant-123
            receipts = await db.execute(select(Receipt))
    """
    async with db.begin():
        await db.execute(
            text("SELECT set_config('app.current_tenant_id', :tenant_id, true)"),
            {"tenant_id": str(tenant_id)}
        )
        
        await db.execute(
            text("SELECT set_config('app.user_role', :role, true)"),
            {"role": str(role)}
        )
        
        if admin_override_reason:
            await db.execute(
                text("SELECT set_config('app.admin_override_reason', :reason, true)"),
                {"reason": admin_override_reason}
            )
    
    logger.info(f"Manually set tenant context: tenant_id={tenant_id}, role={role}")


# Utility function to clear tenant context
async def clear_tenant_context(db: AsyncSession) -> None:
    """Clear tenant context from database session.
    
    Use this when you need to perform cross-tenant operations
    (e.g., system maintenance, reporting).
    
    WARNING: This bypasses RLS. Only use in trusted contexts.
    """
    async with db.begin():
        await db.execute(text("SELECT set_config('app.current_tenant_id', NULL, true)"))
        await db.execute(text("SELECT set_config('app.user_role', NULL, true)"))
        await db.execute(text("SELECT set_config('app.admin_override_reason', NULL, true)"))
    
    logger.warning("Cleared tenant context - RLS bypassed!")


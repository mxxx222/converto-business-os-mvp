"""Role-Based Access Control (RBAC) middleware for DocFlow."""

from __future__ import annotations

import logging
from enum import Enum
from functools import wraps
from typing import Any, Callable, List, Optional

from fastapi import HTTPException, Request, status
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class UserRole(str, Enum):
    """User roles in the system."""
    ADMIN = "admin"
    SUPPORT = "support"
    READONLY = "readonly"
    USER = "user"


class Permission(str, Enum):
    """System permissions."""
    # User management
    USER_CREATE = "user:create"
    USER_READ = "user:read"
    USER_UPDATE = "user:update"
    USER_DELETE = "user:delete"
    
    # Document management
    DOCUMENT_CREATE = "document:create"
    DOCUMENT_READ = "document:read"
    DOCUMENT_UPDATE = "document:update"
    DOCUMENT_DELETE = "document:delete"
    
    # System administration
    SYSTEM_ADMIN = "system:admin"
    SYSTEM_MONITOR = "system:monitor"
    
    # Support operations
    SUPPORT_ACCESS = "support:access"
    SUPPORT_IMPERSONATE = "support:impersonate"


class RolePermissions:
    """Role to permissions mapping."""
    
    ROLE_PERMISSIONS = {
        UserRole.ADMIN: [
            Permission.USER_CREATE,
            Permission.USER_READ,
            Permission.USER_UPDATE,
            Permission.USER_DELETE,
            Permission.DOCUMENT_CREATE,
            Permission.DOCUMENT_READ,
            Permission.DOCUMENT_UPDATE,
            Permission.DOCUMENT_DELETE,
            Permission.SYSTEM_ADMIN,
            Permission.SYSTEM_MONITOR,
            Permission.SUPPORT_ACCESS,
            Permission.SUPPORT_IMPERSONATE,
        ],
        UserRole.SUPPORT: [
            Permission.USER_READ,
            Permission.USER_UPDATE,
            Permission.DOCUMENT_READ,
            Permission.DOCUMENT_UPDATE,
            Permission.SYSTEM_MONITOR,
            Permission.SUPPORT_ACCESS,
        ],
        UserRole.READONLY: [
            Permission.USER_READ,
            Permission.DOCUMENT_READ,
            Permission.SYSTEM_MONITOR,
        ],
        UserRole.USER: [
            Permission.DOCUMENT_CREATE,
            Permission.DOCUMENT_READ,
            Permission.DOCUMENT_UPDATE,
            Permission.DOCUMENT_DELETE,
        ],
    }
    
    @classmethod
    def get_permissions(cls, role: UserRole) -> List[Permission]:
        """Get permissions for a role."""
        return cls.ROLE_PERMISSIONS.get(role, [])
    
    @classmethod
    def has_permission(cls, role: UserRole, permission: Permission) -> bool:
        """Check if role has specific permission."""
        return permission in cls.get_permissions(role)


class User(BaseModel):
    """User model for RBAC."""
    id: str
    email: str
    role: UserRole
    tenant_id: Optional[str] = None
    is_active: bool = True


class RBACError(HTTPException):
    """RBAC specific error."""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Optional[dict] = None,
        error_code: Optional[str] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code


def require_permission(permission: Permission):
    """Decorator to require specific permission."""
    
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract request from args/kwargs
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            if not request:
                # Look in kwargs
                request = kwargs.get('request')
            
            if not request:
                logger.error("No request object found in function arguments")
                raise RBACError(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Internal server error: No request context",
                    error_code="NO_REQUEST_CONTEXT"
                )
            
            # Get user from request state
            user = getattr(request.state, 'user', None)
            if not user:
                logger.warning("No user found in request state")
                raise RBACError(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required",
                    headers={"WWW-Authenticate": "Bearer"},
                    error_code="AUTHENTICATION_REQUIRED"
                )
            
            # Check if user has permission
            if not RolePermissions.has_permission(user.role, permission):
                logger.warning(
                    f"User {user.id} with role {user.role} attempted to access "
                    f"resource requiring {permission}"
                )
                raise RBACError(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient permissions. Required: {permission}",
                    error_code="INSUFFICIENT_PERMISSIONS"
                )
            
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


def require_role(required_role: UserRole):
    """Decorator to require specific role."""
    
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract request from args/kwargs
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break
            
            if not request:
                request = kwargs.get('request')
            
            if not request:
                raise RBACError(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Internal server error: No request context",
                    error_code="NO_REQUEST_CONTEXT"
                )
            
            # Get user from request state
            user = getattr(request.state, 'user', None)
            if not user:
                raise RBACError(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required",
                    headers={"WWW-Authenticate": "Bearer"},
                    error_code="AUTHENTICATION_REQUIRED"
                )
            
            # Check role hierarchy (admin can access everything)
            allowed_roles = [required_role]
            if required_role != UserRole.ADMIN:
                allowed_roles.append(UserRole.ADMIN)
            
            if user.role not in allowed_roles:
                logger.warning(
                    f"User {user.id} with role {user.role} attempted to access "
                    f"resource requiring role {required_role}"
                )
                raise RBACError(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient role. Required: {required_role}",
                    error_code="INSUFFICIENT_ROLE"
                )
            
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


class RBACMiddleware:
    """RBAC middleware for FastAPI."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    async def __call__(self, request: Request, call_next):
        """Process request with RBAC context."""
        
        # Skip RBAC for public endpoints
        public_paths = [
            "/",
            "/health",
            "/docs",
            "/openapi.json",
            "/api/auth/login",
            "/api/auth/signup",
            "/api/auth/health",
        ]
        
        if request.url.path in public_paths:
            return await call_next(request)
        
        # Extract user information from headers or JWT
        user = await self._extract_user(request)
        if user:
            request.state.user = user
            self.logger.debug(f"User {user.id} with role {user.role} authenticated")
        
        try:
            response = await call_next(request)
            return response
        except RBACError as e:
            # Log RBAC errors for security monitoring
            user = getattr(request.state, "user", None)
            user_id = getattr(user, "id", "unknown") if user else "unknown"
            self.logger.warning(
                f"RBAC error for user {user_id}: {e.error_code} - {e.detail}"
            )
            raise
    
    async def _extract_user(self, request: Request) -> Optional[User]:
        """Extract user from request using Supabase claims when available."""

        # Development shortcut
        if hasattr(request.state, "user_id") and getattr(request.state, "user_id") == "dev-user":
            return User(
                id="dev-user",
                email="dev@docflow.fi",
                role=UserRole.ADMIN,
                tenant_id="dev-tenant",
            )

        # If an authenticated user has already been attached by upstream middleware
        existing_user = getattr(request.state, "user", None)
        if isinstance(existing_user, User):
            return existing_user

        # Prefer Supabase JWT claims populated by SupabaseAuthMiddleware/AdminAuthMiddleware
        claims = getattr(request.state, "supabase_claims", None)
        if isinstance(claims, dict):
            email = (
                claims.get("email")
                or claims.get("preferred_username")
                or f"{claims.get('sub', 'user')}@docflow.local"
            )

            # Determine role from common Supabase claim locations
            role_value = None
            role_keys = ["role", "user_role", "user_type"]
            app_meta = claims.get("app_metadata") or {}
            user_meta = claims.get("user_metadata") or {}

            for key in role_keys:
                if key in claims:
                    role_value = claims.get(key)
                    break
                if key in app_meta:
                    role_value = app_meta.get(key)
                    break
                if key in user_meta:
                    role_value = user_meta.get(key)
                    break

            role_str = str(role_value or "user").lower()
            if role_str.startswith("admin") or role_str == "owner":
                role = UserRole.ADMIN
            elif role_str.startswith("support"):
                role = UserRole.SUPPORT
            elif role_str.startswith("read"):
                role = UserRole.READONLY
            else:
                role = UserRole.USER

            # Resolve tenant identifier
            tenant_id = None
            for key in ("tenant_id", "tenant", "org_id"):
                if claims.get(key):
                    tenant_id = str(claims.get(key))
                    break
            if tenant_id is None:
                for container in (app_meta, user_meta):
                    for key in ("tenant_id", "tenant", "org_id"):
                        if container.get(key):
                            tenant_id = str(container.get(key))
                            break
                    if tenant_id:
                        break

            return User(
                id=str(claims.get("sub", "")),
                email=email,
                role=role,
                tenant_id=tenant_id,
                is_active=bool(claims.get("email_confirmed", True)),
            )

        # Fallback: unauthenticated/unknown user
        return None


# Global middleware instance
rbac_middleware = RBACMiddleware()


# Convenience functions for common role checks
def require_admin(func: Callable) -> Callable:
    """Require admin role."""
    return require_role(UserRole.ADMIN)(func)


def require_support(func: Callable) -> Callable:
    """Require support role or higher."""
    return require_role(UserRole.SUPPORT)(func)


def require_readonly(func: Callable) -> Callable:
    """Require readonly role or higher."""
    return require_role(UserRole.READONLY)(func)


# HTTP status code handlers
def handle_401_unauthorized(request: Request, exc: HTTPException):
    """Handle 401 Unauthorized errors."""
    return {
        "error": "UNAUTHORIZED",
        "message": "Authentication required. Please provide valid credentials.",
        "status_code": 401,
        "timestamp": request.state.get("timestamp"),
        "path": str(request.url.path),
    }


def handle_403_forbidden(request: Request, exc: HTTPException):
    """Handle 403 Forbidden errors."""
    user = getattr(request.state, 'user', None)
    return {
        "error": "FORBIDDEN",
        "message": "Insufficient permissions to access this resource.",
        "status_code": 403,
        "timestamp": request.state.get("timestamp"),
        "path": str(request.url.path),
        "user_role": user.role if user else None,
    }

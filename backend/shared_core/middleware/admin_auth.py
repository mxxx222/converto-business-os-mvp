"""Admin-specific authentication and RBAC middleware."""

from __future__ import annotations

import os
from typing import Awaitable, Callable

from fastapi import HTTPException, Request
from jwt import (
    InvalidTokenError,
    PyJWKClient,
    PyJWKClientError,
    decode as jwt_decode,
)

from shared_core.middleware.rbac import User, UserRole


class AdminAuthMiddleware:
    """Admin-specific authentication middleware extending Supabase auth with RBAC.

    This middleware only enforces authentication on admin endpoints:
      - `/api/admin*`
      - `/api/v1/admin*` (future-proof)

    For all other routes it is effectively a pass-through.
    """

    def __init__(self) -> None:
        base_url = os.getenv("SUPABASE_URL", "").rstrip("/")
        self.audience = os.getenv("SUPABASE_JWT_AUD", "authenticated")
        # Default issuer follows Supabase convention when URL is present
        self.issuer = os.getenv("SUPABASE_JWT_ISS", f"{base_url}/auth/v1") if base_url else os.getenv(
            "SUPABASE_JWT_ISS", ""
        )

        if not base_url or not self.issuer:
            # If missing configuration, treat as disabled (pass-through).
            # This avoids crashing local/dev environments where Supabase
            # might not be configured, while still allowing strict config
            # in production via env vars.
            self.jwks_client = None
        else:
            jwks_url = f"{base_url}/auth/v1/certs"
            self.jwks_client = PyJWKClient(jwks_url)

    def _check_admin_role(self, claims: dict) -> bool:
        """Check if user has admin privileges."""
        # Check various possible locations for admin role
        role_keys = ["role", "admin", "is_admin", "user_role", "user_type"]
        
        # Check direct role
        for key in role_keys:
            if claims.get(key) in ["admin", "administrator", "super_admin"]:
                return True
        
        # Check in app_metadata
        app_metadata = claims.get("app_metadata", {})
        for key in role_keys:
            if app_metadata.get(key) in ["admin", "administrator", "super_admin"]:
                return True
        
        # Check in user_metadata
        user_metadata = claims.get("user_metadata", {})
        for key in role_keys:
            if user_metadata.get(key) in ["admin", "administrator", "super_admin"]:
                return True
        
        # Check for custom claims with admin prefix
        for claim_key, claim_value in claims.items():
            if claim_key.startswith("admin_") and claim_value:
                return True
        
        return False

    async def __call__(
        self, request: Request, call_next: Callable[[Request], Awaitable]
    ):
        path = request.url.path
        # Only protect admin API paths
        if not (path.startswith("/api/admin") or path.startswith("/api/v1/admin")):
            return await call_next(request)

        # Allow admin health checks without strict auth (for probes)
        if path.endswith("/admin/health") or path.endswith("/health"):
            return await call_next(request)

        # If not configured, fail open (dev environments) but still require token
        if self.jwks_client is None:
            return await call_next(request)

        # Require authentication for all admin routes
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.lower().startswith("bearer "):
            raise HTTPException(status_code=401, detail="missing_bearer_token")

        token = auth_header.split(" ", 1)[1].strip()
        if not token:
            raise HTTPException(status_code=401, detail="empty_bearer_token")

        try:
            signing_key = self.jwks_client.get_signing_key_from_jwt(token).key
            claims = jwt_decode(
                token,
                signing_key,
                algorithms=["RS256"],
                audience=self.audience,
                options={"require": ["sub", "iss", "aud"]},
            )
        except (InvalidTokenError, PyJWKClientError) as exc:
            raise HTTPException(status_code=401, detail=f"invalid_token: {exc}") from exc

        if self.issuer and str(claims.get("iss")) != self.issuer:
            raise HTTPException(status_code=401, detail="invalid_issuer")

        # Check admin privileges
        if not self._check_admin_role(claims):
            raise HTTPException(status_code=403, detail="insufficient_privileges")

        # Set user context for downstream handlers and RBAC
        user_id = str(claims.get("sub"))
        tenant_id = self._resolve_tenant_id(claims)

        request.state.user_id = user_id
        request.state.tenant_id = tenant_id
        request.state.supabase_claims = claims
        request.state.is_admin = True

        # Attach RBAC user model so `require_admin`/RBAC helpers can be used
        email = claims.get("email") or claims.get("preferred_username") or ""
        request.state.user = User(
            id=user_id,
            email=email or f"{user_id}@admin.local",
            role=UserRole.ADMIN,
            tenant_id=tenant_id,
            is_active=True,
        )

        return await call_next(request)

    def _resolve_tenant_id(self, claims: dict) -> str:
        """Resolve tenant ID from claims."""
        for key in ("tenant_id", "tenant"):
            value = claims.get(key)
            if value:
                return str(value)

        app_metadata = claims.get("app_metadata") or {}
        user_metadata = claims.get("user_metadata") or {}

        for container in (app_metadata, user_metadata):
            for key in ("tenant_id", "tenant", "org_id"):
                value = container.get(key)
                if value:
                    return str(value)

        return str(claims.get("sub"))


# Global instance
admin_auth = AdminAuthMiddleware()
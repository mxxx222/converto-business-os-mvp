from __future__ import annotations

import os
from typing import Callable, Awaitable

from fastapi import Request, HTTPException
from jwt import PyJWKClient, decode as jwt_decode, InvalidTokenError


class SupabaseAuthMiddleware:
    """FastAPI-compatible middleware that validates Supabase JWTs via JWKS.

    Configuration via environment variables:
      - SUPABASE_URL (e.g. https://xxxx.supabase.co)
      - SUPABASE_JWT_ISS (optional, defaults to f"{SUPABASE_URL}/auth/v1")
      - SUPABASE_JWT_AUD (optional, defaults to "authenticated")
    """

    def __init__(self) -> None:
        base_url = os.getenv("SUPABASE_URL", "").rstrip("/")
        self.issuer = os.getenv("SUPABASE_JWT_ISS", f"{base_url}/auth/v1") if base_url else os.getenv("SUPABASE_JWT_ISS", "")
        self.audience = os.getenv("SUPABASE_JWT_AUD", "authenticated")
        self.public_paths = {
            "/",
            "/health",
            "/docs",
            "/openapi.json",
        }
        if not self.issuer:
            # If missing configuration, treat as pass-through
            self.jwks_client = None
        else:
            self.jwks_client = PyJWKClient(f"{self.issuer}/keys")

    async def __call__(self, request: Request, call_next: Callable[[Request], Awaitable]):
        # Allow public paths
        if request.url.path in self.public_paths:
            return await call_next(request)

        # If not configured, pass through
        if not self.jwks_client:
            return await call_next(request)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise HTTPException(401, "missing_bearer_token")

        token = auth_header.split(" ", 1)[1]
        try:
            signing_key = self.jwks_client.get_signing_key_from_jwt(token).key
            claims = jwt_decode(
                token,
                signing_key,
                algorithms=["RS256"],
                audience=self.audience,
                options={"require": ["sub", "iss", "aud"]},
            )
        except InvalidTokenError as e:
            raise HTTPException(401, f"invalid_token: {e}")

        # Optional issuer check when configured
        if self.issuer and str(claims.get("iss")) != self.issuer:
            raise HTTPException(401, "invalid_issuer")

        # Attach user context
        request.state.user_id = str(claims.get("sub"))
        return await call_next(request)


# Global instance
supabase_auth = SupabaseAuthMiddleware()


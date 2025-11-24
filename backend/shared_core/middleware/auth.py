from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import os


class DevAuthMiddleware:
    """Development authentication middleware for testing"""
    
    def __init__(self):
        self.dev_mode = os.getenv("ENVIRONMENT", "development") == "development"
        self.dev_jwt = os.getenv("DEV_JWT", "dev-token-123")
    
    async def __call__(self, request: Request, call_next):
        # Skip auth for health checks and docs
        if request.url.path in ["/", "/health", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        # Skip auth in dev mode for testing
        if self.dev_mode:
            # Add mock headers for dev
            request.state.tenant_id = "dev-tenant"
            request.state.user_id = "dev-user"
            return await call_next(request)
        
        # In production, check for proper auth headers
        auth_header = request.headers.get("Authorization")
        tenant_id = request.headers.get("x-tenant-id")
        user_id = request.headers.get("x-user-id")
        
        if not auth_header and not (tenant_id and user_id):
            raise HTTPException(
                status_code=401,
                detail="missing_auth: provide JWT or x-tenant-id+x-user-id headers"
            )
        
        # Set user context
        request.state.tenant_id = tenant_id or "default"
        request.state.user_id = user_id or "default"
        
        return await call_next(request)


# Global instance
dev_auth = DevAuthMiddleware()

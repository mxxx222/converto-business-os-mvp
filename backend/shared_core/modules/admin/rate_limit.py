"""Rate limiting infrastructure for DocFlow admin - PR2 hardening.

Implements tenant-based rate limiting with Redis backend.
Target: 60 requests/minute per tenant.
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
from typing import Dict, Optional, Tuple
from collections import defaultdict

from fastapi import HTTPException

from .schemas import validate_rate_limit_request


logger = logging.getLogger("converto.admin.ratelimit")


class RateLimiter:
    """Tenant-based rate limiter with Redis backend."""
    
    def __init__(self, redis_client=None):
        self.redis_client = redis_client
        self.memory_cache: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))
        self.config = {
            "admin_api": {"requests": 60, "window": 60},  # 60 requests per minute
            "websocket": {"requests": 120, "window": 60},  # 120 messages per minute
            "activities_post": {"requests": 60, "window": 60},  # 60 activities per minute
            "stats_get": {"requests": 100, "window": 60},  # 100 stats requests per minute
            "bulk_activities": {"requests": 10, "window": 60},  # 10 bulk operations per minute
        }
    
    def _get_cache_key(self, tenant_id: str, endpoint: str) -> str:
        """Generate Redis cache key for rate limit."""
        return f"ratelimit:{tenant_id}:{endpoint}"
    
    def _get_memory_key(self, tenant_id: str, endpoint: str) -> str:
        """Generate memory cache key."""
        return f"{tenant_id}:{endpoint}"
    
    async def check_rate_limit(
        self, 
        tenant_id: str, 
        endpoint: str, 
        method: str = "GET",
        user_id: Optional[str] = None
    ) -> Tuple[bool, Dict[str, int]]:
        """
        Check if request is within rate limits.
        
        Returns:
            Tuple[bool, Dict]: (allowed, rate_limit_info)
        """
        try:
            # Validate request
            request_data = {
                "tenant_id": tenant_id,
                "endpoint": endpoint,
                "method": method,
                "user_id": user_id
            }
            validate_rate_limit_request(request_data)
        except ValueError as e:
            logger.error(f"Rate limit validation failed: {e}")
            return False, {"error": "invalid_request", "message": str(e)}
        
        if self.redis_client:
            return await self._check_redis_rate_limit(tenant_id, endpoint, method)
        else:
            return self._check_memory_rate_limit(tenant_id, endpoint, method)
    
    async def _check_redis_rate_limit(
        self, 
        tenant_id: str, 
        endpoint: str, 
        method: str
    ) -> Tuple[bool, Dict[str, int]]:
        """Check rate limit using Redis."""
        try:
            cache_key = self._get_cache_key(tenant_id, endpoint)
            now = time.time()
            
            # Get rate limit config
            config_key = f"{endpoint.lower()}_{method.lower()}"
            config = self.config.get(config_key, self.config["admin_api"])
            
            # Redis pipeline for atomic operations
            pipe = self.redis_client.pipeline()
            pipe.incr(cache_key)
            pipe.expire(cache_key, config["window"])
            results = await pipe.execute()
            
            current_count = results[0]
            allowed = current_count <= config["requests"]
            
            rate_limit_info = {
                "allowed": allowed,
                "remaining": max(0, config["requests"] - current_count),
                "reset_time": int(now + config["window"]),
                "retry_after": 0 if allowed else config["window"]
            }
            
            if not allowed:
                logger.warning(
                    f"Rate limit exceeded for tenant {tenant_id}, endpoint {endpoint}, "
                    f"count {current_count}, limit {config['requests']}"
                )
            
            return allowed, rate_limit_info
            
        except Exception as e:
            logger.error(f"Redis rate limit check failed: {e}")
            # Fail open - allow request if Redis is down
            return True, {"error": "redis_down", "allowed": True}
    
    def _check_memory_rate_limit(
        self, 
        tenant_id: str, 
        endpoint: str, 
        method: str
    ) -> Tuple[bool, Dict[str, int]]:
        """Check rate limit using in-memory cache (fallback)."""
        try:
            cache_key = self._get_memory_key(tenant_id, endpoint)
            now = time.time()
            
            # Get rate limit config
            config_key = f"{endpoint.lower()}_{method.lower()}"
            config = self.config.get(config_key, self.config["admin_api"])
            
            # Clean old entries
            cutoff_time = now - config["window"]
            tenant_cache = self.memory_cache[cache_key]
            keys_to_delete = [k for k, v in tenant_cache.items() if v < cutoff_time]
            for key in keys_to_delete:
                del tenant_cache[key]
            
            # Check current count
            current_count = len(tenant_cache)
            allowed = current_count < config["requests"]
            
            if allowed:
                # Add current request
                tenant_cache[now] = now
            
            rate_limit_info = {
                "allowed": allowed,
                "remaining": max(0, config["requests"] - current_count - (0 if allowed else 1)),
                "reset_time": int(now + config["window"]),
                "retry_after": 0 if allowed else config["window"]
            }
            
            return allowed, rate_limit_info
            
        except Exception as e:
            logger.error(f"Memory rate limit check failed: {e}")
            # Fail open
            return True, {"error": "memory_error", "allowed": True}
    
    def get_rate_limit_status(self, tenant_id: str, endpoint: str) -> Dict[str, int]:
        """Get current rate limit status for monitoring."""
        cache_key = self._get_memory_key(tenant_id, endpoint)
        now = time.time()
        
        if cache_key in self.memory_cache:
            tenant_cache = self.memory_cache[cache_key]
            config_key = f"{endpoint.lower()}_get"
            config = self.config.get(config_key, self.config["admin_api"])
            
            current_count = len([t for t in tenant_cache.values() if t > now - config["window"]])
            
            return {
                "current": current_count,
                "limit": config["requests"],
                "window": config["window"],
                "remaining": max(0, config["requests"] - current_count)
            }
        
        return {"current": 0, "limit": 60, "window": 60, "remaining": 60}
    
    async def cleanup_expired(self):
        """Clean up expired rate limit entries."""
        try:
            now = time.time()
            for cache_key, tenant_cache in list(self.memory_cache.items()):
                cutoff_time = now - 3600  # 1 hour lookback
                keys_to_delete = [k for k, v in tenant_cache.items() if v < cutoff_time]
                for key in keys_to_delete:
                    del tenant_cache[key]
                
                if not tenant_cache:
                    del self.memory_cache[cache_key]
        except Exception as e:
            logger.error(f"Rate limit cleanup failed: {e}")


class RateLimitError(HTTPException):
    """HTTPException for rate limit violations."""
    
    def __init__(self, tenant_id: str, endpoint: str, rate_limit_info: Dict):
        retry_after = rate_limit_info.get("retry_after", 60)
        super().__init__(
            status_code=429,
            detail={
                "error": "rate_limit_exceeded",
                "tenant_id": tenant_id,
                "endpoint": endpoint,
                "retry_after": retry_after,
                "rate_limit_info": rate_limit_info
            },
            headers={"Retry-After": str(retry_after)}
        )


# Global rate limiter instance
rate_limiter = RateLimiter()


def check_admin_rate_limit(
    tenant_id: str, 
    endpoint: str, 
    method: str = "GET"
) -> bool:
    """Sync wrapper for rate limit checking."""
    try:
        # This is a simple wrapper - in production, use async version
        return True  # For now, allow all requests during development
    except Exception as e:
        logger.error(f"Rate limit check failed: {e}")
        return True  # Fail open


# Rate limit decorators
def require_rate_limit(endpoint: str, method: str = "GET"):
    """Decorator to enforce rate limits on API endpoints."""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Extract tenant_id and user_id from request
            request = kwargs.get('request') or args[0] if args else None
            if not request:
                return await func(*args, **kwargs)
            
            tenant_id = getattr(request.state, "tenant_id", "default")
            user_id = getattr(request.state, "user_id", None)
            
            allowed, rate_limit_info = await rate_limiter.check_rate_limit(
                tenant_id, endpoint, method, user_id
            )
            
            if not allowed:
                raise RateLimitError(tenant_id, endpoint, rate_limit_info)
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


# Export
__all__ = [
    "RateLimiter", "RateLimitError", "rate_limiter", 
    "check_admin_rate_limit", "require_rate_limit"
]
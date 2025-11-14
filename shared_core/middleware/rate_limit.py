"""Rate limiting middleware with 429 Retry-After and X-RateLimit headers for DocFlow."""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Dict, Optional, Tuple
from dataclasses import dataclass, field
from collections import defaultdict, deque

from fastapi import Request, Response, HTTPException, status
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


@dataclass
class RateLimitConfig:
    """Rate limit configuration."""
    requests: int  # Number of requests allowed
    window: int    # Time window in seconds
    burst: int = 0  # Burst allowance (0 = no burst)


@dataclass
class ClientState:
    """Client rate limit state."""
    requests: deque = field(default_factory=deque)
    last_request: float = 0.0
    blocked_until: float = 0.0
    
    def cleanup_old_requests(self, window: int) -> None:
        """Remove requests outside the time window."""
        current_time = time.time()
        while self.requests and self.requests[0] <= current_time - window:
            self.requests.popleft()


class RateLimiter:
    """In-memory rate limiter with sliding window."""
    
    def __init__(self):
        self.clients: Dict[str, ClientState] = defaultdict(ClientState)
        self.configs: Dict[str, RateLimitConfig] = {}
        self.global_config = RateLimitConfig(requests=1000, window=60)  # Default: 1000/min
        
        # Predefined rate limits for different endpoints
        self.endpoint_configs = {
            "/api/v1/ocr": RateLimitConfig(requests=10, window=60),  # OCR: 10/min
            "/api/v1/upload": RateLimitConfig(requests=20, window=60),  # Upload: 20/min
            "/api/auth/login": RateLimitConfig(requests=5, window=300),  # Login: 5/5min
            "/api/auth/signup": RateLimitConfig(requests=3, window=3600),  # Signup: 3/hour
            "/api/v1/export": RateLimitConfig(requests=5, window=60),  # Export: 5/min
        }
    
    def get_client_key(self, request: Request) -> str:
        """Generate client key for rate limiting."""
        # Use user ID if authenticated, otherwise IP
        user_id = getattr(request.state, 'user_id', None)
        if user_id:
            return f"user:{user_id}"
        
        # Get real IP from headers (for proxy/load balancer)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return f"ip:{forwarded_for.split(',')[0].strip()}"
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return f"ip:{real_ip}"
        
        # Fallback to client IP
        client_ip = request.client.host if request.client else "unknown"
        return f"ip:{client_ip}"
    
    def get_rate_limit_config(self, request: Request) -> RateLimitConfig:
        """Get rate limit configuration for the request."""
        path = request.url.path
        
        # Check for exact endpoint match
        if path in self.endpoint_configs:
            return self.endpoint_configs[path]
        
        # Check for pattern matches
        for pattern, config in self.endpoint_configs.items():
            if path.startswith(pattern.rstrip("*")):
                return config
        
        # Return global default
        return self.global_config
    
    def is_allowed(self, client_key: str, config: RateLimitConfig) -> Tuple[bool, Dict[str, str]]:
        """Check if request is allowed and return headers."""
        current_time = time.time()
        client = self.clients[client_key]
        
        # Check if client is currently blocked
        if client.blocked_until > current_time:
            retry_after = int(client.blocked_until - current_time) + 1
            headers = {
                "X-RateLimit-Limit": str(config.requests),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(client.blocked_until)),
                "Retry-After": str(retry_after),
            }
            return False, headers
        
        # Clean up old requests
        client.cleanup_old_requests(config.window)
        
        # Count current requests in window
        request_count = len(client.requests)
        
        # Check if limit exceeded
        if request_count >= config.requests:
            # Block client for the remaining window time
            oldest_request = client.requests[0] if client.requests else current_time
            reset_time = oldest_request + config.window
            client.blocked_until = reset_time
            
            retry_after = int(reset_time - current_time) + 1
            headers = {
                "X-RateLimit-Limit": str(config.requests),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(reset_time)),
                "Retry-After": str(retry_after),
            }
            return False, headers
        
        # Allow request and record it
        client.requests.append(current_time)
        client.last_request = current_time
        
        # Calculate reset time
        reset_time = current_time + config.window
        if client.requests:
            reset_time = client.requests[0] + config.window
        
        headers = {
            "X-RateLimit-Limit": str(config.requests),
            "X-RateLimit-Remaining": str(config.requests - request_count - 1),
            "X-RateLimit-Reset": str(int(reset_time)),
        }
        
        return True, headers
    
    def cleanup_expired_clients(self) -> None:
        """Clean up expired client states."""
        current_time = time.time()
        expired_clients = []
        
        for client_key, client in self.clients.items():
            # Remove clients inactive for more than 1 hour
            if current_time - client.last_request > 3600:
                expired_clients.append(client_key)
        
        for client_key in expired_clients:
            del self.clients[client_key]
        
        if expired_clients:
            logger.debug(f"Cleaned up {len(expired_clients)} expired rate limit clients")


class RateLimitMiddleware:
    """Rate limiting middleware for FastAPI."""
    
    def __init__(self, limiter: Optional[RateLimiter] = None):
        self.limiter = limiter or RateLimiter()
        self.logger = logging.getLogger(__name__)
        
        # Start cleanup task
        asyncio.create_task(self._cleanup_task())
    
    async def __call__(self, request: Request, call_next):
        """Apply rate limiting to requests."""
        
        # Skip rate limiting for health checks and static files
        skip_paths = ["/health", "/docs", "/openapi.json", "/favicon.ico"]
        if request.url.path in skip_paths:
            return await call_next(request)
        
        # Get rate limit configuration
        config = self.limiter.get_rate_limit_config(request)
        client_key = self.limiter.get_client_key(request)
        
        # Check if request is allowed
        allowed, headers = self.limiter.is_allowed(client_key, config)
        
        if not allowed:
            self.logger.warning(
                f"Rate limit exceeded for client {client_key} on {request.url.path}"
            )
            
            # Return 429 Too Many Requests with proper headers
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "error": "RATE_LIMIT_EXCEEDED",
                    "message": "Too many requests. Please try again later.",
                    "retry_after": int(headers.get("Retry-After", "60")),
                },
                headers=headers
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers to response
        for header_name, header_value in headers.items():
            response.headers[header_name] = header_value
        
        return response
    
    async def _cleanup_task(self):
        """Background task to clean up expired clients."""
        while True:
            try:
                await asyncio.sleep(300)  # Run every 5 minutes
                self.limiter.cleanup_expired_clients()
            except Exception as e:
                self.logger.error(f"Error in rate limit cleanup task: {e}")


# Redis-based rate limiter for production use
class RedisRateLimiter:
    """Redis-based rate limiter for distributed systems."""
    
    def __init__(self, redis_client=None):
        self.redis = redis_client
        self.script = None
        
        if self.redis:
            # Lua script for atomic rate limiting
            self.script = self.redis.register_script("""
                local key = KEYS[1]
                local window = tonumber(ARGV[1])
                local limit = tonumber(ARGV[2])
                local current_time = tonumber(ARGV[3])
                
                -- Remove expired entries
                redis.call('ZREMRANGEBYSCORE', key, 0, current_time - window)
                
                -- Count current requests
                local current_requests = redis.call('ZCARD', key)
                
                if current_requests < limit then
                    -- Add current request
                    redis.call('ZADD', key, current_time, current_time)
                    redis.call('EXPIRE', key, window)
                    return {1, limit - current_requests - 1}
                else
                    -- Rate limit exceeded
                    return {0, 0}
                end
            """)
    
    def is_allowed(self, client_key: str, config: RateLimitConfig) -> Tuple[bool, Dict[str, str]]:
        """Check if request is allowed using Redis."""
        if not self.redis or not self.script:
            # Fallback to in-memory limiter
            return True, {}
        
        current_time = time.time()
        redis_key = f"rate_limit:{client_key}"
        
        try:
            result = self.script(
                keys=[redis_key],
                args=[config.window, config.requests, current_time]
            )
            
            allowed = bool(result[0])
            remaining = int(result[1])
            
            headers = {
                "X-RateLimit-Limit": str(config.requests),
                "X-RateLimit-Remaining": str(remaining),
                "X-RateLimit-Reset": str(int(current_time + config.window)),
            }
            
            if not allowed:
                headers["Retry-After"] = str(config.window)
            
            return allowed, headers
            
        except Exception as e:
            logger.error(f"Redis rate limiting error: {e}")
            # Fallback to allowing the request
            return True, {}


# Global rate limiter instance
rate_limiter = RateLimiter()
rate_limit_middleware = RateLimitMiddleware(rate_limiter)


# Decorator for function-level rate limiting
def rate_limit(requests: int, window: int):
    """Decorator to apply rate limiting to specific endpoints."""
    
    def decorator(func):
        # Store rate limit config in function metadata
        func._rate_limit_config = RateLimitConfig(requests=requests, window=window)
        return func
    
    return decorator


# Common rate limit presets
class RateLimitPresets:
    """Common rate limiting presets."""
    
    STRICT = RateLimitConfig(requests=10, window=60)      # 10/min
    MODERATE = RateLimitConfig(requests=100, window=60)   # 100/min
    LENIENT = RateLimitConfig(requests=1000, window=60)   # 1000/min
    
    # Endpoint-specific presets
    AUTH = RateLimitConfig(requests=5, window=300)        # 5/5min for auth
    UPLOAD = RateLimitConfig(requests=20, window=60)      # 20/min for uploads
    OCR = RateLimitConfig(requests=10, window=60)         # 10/min for OCR
    EXPORT = RateLimitConfig(requests=5, window=60)       # 5/min for exports

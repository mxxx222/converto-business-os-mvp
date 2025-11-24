"""Rate limiting for admin activities per tenant."""

import time
from typing import Dict, Optional
from collections import defaultdict


class RateLimiter:
    """Token bucket rate limiter with tenant support."""
    
    def __init__(self):
        self.buckets: Dict[str, Dict] = defaultdict(lambda: {"tokens": 0, "last_refill": 0})
    
    def _get_bucket_key(self, identifier: str) -> str:
        """Get bucket key for rate limiting."""
        return identifier
    
    def check_rate_limit(
        self, 
        identifier: str, 
        limit: int = 60, 
        window_seconds: int = 60,
        token_cost: int = 1
    ) -> bool:
        """
        Check if request is within rate limit.
        
        Args:
            identifier: Tenant ID or user identifier
            limit: Maximum requests per window
            window_seconds: Time window in seconds
            token_cost: Cost per request in tokens
        """
        now = time.time()
        bucket_key = self._get_bucket_key(identifier)
        bucket = self.buckets[bucket_key]
        
        # Calculate time since last refill
        time_passed = now - bucket["last_refill"]
        
        # Refill tokens based on elapsed time
        if time_passed > 0:
            refill_rate = limit / window_seconds
            bucket["tokens"] = min(limit, bucket["tokens"] + time_passed * refill_rate)
            bucket["last_refill"] = now
        
        # Check if enough tokens available
        if bucket["tokens"] >= token_cost:
            bucket["tokens"] -= token_cost
            return True
        
        return False
    
    def get_remaining_tokens(self, identifier: str, limit: int = 60) -> int:
        """Get remaining tokens for identifier."""
        bucket_key = self._get_bucket_key(identifier)
        bucket = self.buckets[bucket_key]
        return max(0, int(bucket["tokens"]))
    
    def get_reset_time(self, identifier: str) -> Optional[float]:
        """Get time when rate limit resets."""
        bucket_key = self._get_bucket_key(identifier)
        bucket = self.buckets[bucket_key]
        
        if bucket["tokens"] >= 1:
            return 0  # No reset needed
        
        # Calculate time until bucket would be full again
        # This is a simplified calculation
        return bucket["last_refill"] + 1.0  # Assume 1 second reset for simplicity


# Global rate limiter instance
rate_limiter = RateLimiter()


def check_admin_rate_limit(
    tenant_id: str, 
    endpoint: str, 
    limit: int = 60, 
    window_seconds: int = 60
) -> bool:
    """
    Check rate limit for admin activity.
    
    Args:
        tenant_id: Tenant identifier
        endpoint: API endpoint
        limit: Rate limit per window
        window_seconds: Window in seconds
    """
    identifier = f"{tenant_id}:{endpoint}"
    return rate_limiter.check_rate_limit(identifier, limit, window_seconds)


def get_rate_limit_status(tenant_id: str, endpoint: str, limit: int = 60) -> dict:
    """Get rate limit status for monitoring."""
    identifier = f"{tenant_id}:{endpoint}"
    remaining = rate_limiter.get_remaining_tokens(identifier, limit)
    reset_time = rate_limiter.get_reset_time(identifier)
    
    return {
        "limit": limit,
        "remaining": remaining,
        "reset_time": reset_time,
        "identifier": identifier
    }
"""Redis caching utilities."""

from __future__ import annotations

import json
import logging
from typing import Any

import redis

from backend.config import get_settings

settings = get_settings()
logger = logging.getLogger("converto.cache")

# Initialize Redis client (lazy loading)
_redis_client: redis.Redis[str] | None = None


def get_redis_client() -> redis.Redis[str] | None:
    """Get Redis client (singleton)."""
    global _redis_client

    if _redis_client is not None:
        return _redis_client

    redis_url = getattr(settings, "redis_url", None)
    if not redis_url:
        logger.warning("REDIS_URL not configured - caching disabled")
        return None

    try:
        _redis_client = redis.from_url(redis_url, decode_responses=True)
        # Test connection
        _redis_client.ping()
        logger.info("Redis connection established")
        return _redis_client
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        return None


class CacheManager:
    """Cache manager for Redis."""

    @staticmethod
    def get(key: str) -> Any | None:
        """Get from cache."""
        client = get_redis_client()
        if not client:
            return None

        try:
            value = client.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
        return None

    @staticmethod
    def set(key: str, value: Any, ttl: int = 3600) -> bool:
        """Set in cache."""
        client = get_redis_client()
        if not client:
            return False

        try:
            client.setex(key, ttl, json.dumps(value))
            return True
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
        return False

    @staticmethod
    def delete(key: str) -> bool:
        """Delete from cache."""
        client = get_redis_client()
        if not client:
            return False

        try:
            client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
        return False

    @staticmethod
    def clear_pattern(pattern: str) -> int:
        """Clear cache by pattern."""
        client = get_redis_client()
        if not client:
            return 0

        try:
            keys = client.keys(pattern)
            if keys:
                return client.delete(*keys)
        except Exception as e:
            logger.error(f"Cache clear error for pattern {pattern}: {e}")
        return 0

"""Redis utilities for Converto Business OS - ROI MAXIMIZED.

Provides:
- Session management
- Rate limiting
- Queue management
- Pub/Sub messaging
- Advanced caching
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

try:
    import redis  # type: ignore
except ImportError:
    redis = None  # type: ignore

logger = logging.getLogger("converto.redis")

# Global Redis client instance
try:
    # Type hint only if redis is available
    _redis_client: Any = None  # type: ignore
except Exception:
    _redis_client = None


def get_redis_client() -> Any | None:
    """Get Redis client instance (singleton pattern).

    Returns:
        Redis client or None if not configured
    """
    global _redis_client

    if _redis_client is not None:
        return _redis_client

    # Try to initialize Redis
    try:
        redis_host = os.getenv("REDIS_HOST", "localhost")
        redis_port = int(os.getenv("REDIS_PORT", "6379"))
        redis_db = int(os.getenv("REDIS_DB", "0"))
        redis_password = os.getenv("REDIS_PASSWORD")

        # Support Redis URL format (e.g., Redis Cloud)
        redis_url = os.getenv("REDIS_URL")

        if redis_url:
            _redis_client = redis.from_url(
                redis_url,
                decode_responses=True,
                socket_connect_timeout=5,
            )
        else:
            _redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=redis_db,
                password=redis_password,
                decode_responses=True,
                socket_connect_timeout=5,
            )

        # Test connection
        _redis_client.ping()
        logger.info(f"Redis connected: {redis_host}:{redis_port}/{redis_db}")
        return _redis_client

    except ImportError:
        logger.warning("Redis not installed. Install with: pip install redis")
        return None
    except Exception as e:
        logger.warning(f"Redis not available: {e}")
        return None


class SessionManager:
    """Session management using Redis."""

    def __init__(self, redis_client: Any | None = None, ttl: int = 3600):
        """Initialize session manager.

        Args:
            redis_client: Redis client (auto-connect if None)
            ttl: Session TTL in seconds (default: 1 hour)
        """
        self.redis = redis_client or get_redis_client()
        self.ttl = ttl
        self.enabled = self.redis is not None

    def set_session(self, session_id: str, data: dict[str, Any], ttl: int | None = None) -> bool:
        """Set session data.

        Args:
            session_id: Unique session ID
            data: Session data
            ttl: Optional TTL override

        Returns:
            True if successful
        """
        if not self.enabled or not self.redis:
            return False

        try:
            key = f"session:{session_id}"
            ttl = ttl or self.ttl
            self.redis.setex(key, ttl, json.dumps(data))
            return True
        except Exception as e:
            logger.error(f"Failed to set session: {e}")
            return False

    def get_session(self, session_id: str) -> dict[str, Any] | None:
        """Get session data.

        Args:
            session_id: Session ID

        Returns:
            Session data or None
        """
        if not self.enabled or not self.redis:
            return None

        try:
            key = f"session:{session_id}"
            data = self.redis.get(key)
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.error(f"Failed to get session: {e}")
            return None

    def delete_session(self, session_id: str) -> bool:
        """Delete session.

        Args:
            session_id: Session ID

        Returns:
            True if successful
        """
        if not self.enabled or not self.redis:
            return False

        try:
            key = f"session:{session_id}"
            self.redis.delete(key)
            return True
        except Exception as e:
            logger.error(f"Failed to delete session: {e}")
            return False


class RateLimiter:
    """Rate limiting using Redis."""

    def __init__(self, redis_client: Any | None = None):
        """Initialize rate limiter.

        Args:
            redis_client: Redis client (auto-connect if None)
        """
        self.redis = redis_client or get_redis_client()
        self.enabled = self.redis is not None

    def check_rate_limit(
        self,
        key: str,
        limit: int,
        window: int,
    ) -> tuple[bool, int]:
        """Check if rate limit is exceeded.

        Args:
            key: Rate limit key (e.g., "ip:1.2.3.4" or "user:123")
            limit: Maximum requests per window
            window: Time window in seconds

        Returns:
            Tuple of (allowed, remaining_requests)
        """
        if not self.enabled or not self.redis:
            return True, limit  # Allow if Redis unavailable

        try:
            redis_key = f"ratelimit:{key}"

            # Use sliding window log algorithm
            current = self.redis.incr(redis_key)
            if current == 1:
                self.redis.expire(redis_key, window)

            remaining = max(0, limit - current)
            allowed = current <= limit

            return allowed, remaining
        except Exception as e:
            logger.error(f"Rate limit check failed: {e}")
            return True, limit  # Allow on error


class QueueManager:
    """Queue management using Redis."""

    def __init__(self, redis_client: Any | None = None):
        """Initialize queue manager.

        Args:
            redis_client: Redis client (auto-connect if None)
        """
        self.redis = redis_client or get_redis_client()
        self.enabled = self.redis is not None

    def enqueue(self, queue_name: str, job: dict[str, Any]) -> bool:
        """Add job to queue.

        Args:
            queue_name: Queue name
            job: Job data

        Returns:
            True if successful
        """
        if not self.enabled or not self.redis:
            return False

        try:
            key = f"queue:{queue_name}"
            self.redis.lpush(key, json.dumps(job))
            return True
        except Exception as e:
            logger.error(f"Failed to enqueue job: {e}")
            return False

    def dequeue(self, queue_name: str, timeout: int = 0) -> dict[str, Any] | None:
        """Get job from queue.

        Args:
            queue_name: Queue name
            timeout: Blocking timeout in seconds (0 = non-blocking)

        Returns:
            Job data or None
        """
        if not self.enabled or not self.redis:
            return None

        try:
            key = f"queue:{queue_name}"

            if timeout > 0:
                result = self.redis.brpop(key, timeout=timeout)
                if result:
                    _, data = result
                    return json.loads(data)
            else:
                data = self.redis.rpop(key)
                if data:
                    return json.loads(data)

            return None
        except Exception as e:
            logger.error(f"Failed to dequeue job: {e}")
            return None

    def queue_length(self, queue_name: str) -> int:
        """Get queue length.

        Args:
            queue_name: Queue name

        Returns:
            Queue length
        """
        if not self.enabled or not self.redis:
            return 0

        try:
            key = f"queue:{queue_name}"
            return self.redis.llen(key)
        except Exception as e:
            logger.error(f"Failed to get queue length: {e}")
            return 0


class PubSubManager:
    """Pub/Sub messaging using Redis."""

    def __init__(self, redis_client: Any | None = None):
        """Initialize pub/sub manager.

        Args:
            redis_client: Redis client (auto-connect if None)
        """
        self.redis = redis_client or get_redis_client()
        self.enabled = self.redis is not None
        self.pubsub = None

    def publish(self, channel: str, message: dict[str, Any]) -> bool:
        """Publish message to channel.

        Args:
            channel: Channel name
            message: Message data

        Returns:
            True if successful
        """
        if not self.enabled or not self.redis:
            return False

        try:
            self.redis.publish(channel, json.dumps(message))
            return True
        except Exception as e:
            logger.error(f"Failed to publish message: {e}")
            return False

    def subscribe(self, channel: str, callback: callable) -> bool:
        """Subscribe to channel.

        Args:
            channel: Channel name
            callback: Callback function(message)

        Returns:
            True if successful
        """
        if not self.enabled or not self.redis:
            return False

        try:
            if self.pubsub is None:
                self.pubsub = self.redis.pubsub()

            self.pubsub.subscribe(channel)

            # Process messages in background
            for message in self.pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"])
                    callback(data)

            return True
        except Exception as e:
            logger.error(f"Failed to subscribe: {e}")
            return False


class AdvancedCache:
    """Advanced caching with Redis."""

    def __init__(self, redis_client: Any | None = None, default_ttl: int = 3600):
        """Initialize advanced cache.

        Args:
            redis_client: Redis client (auto-connect if None)
            default_ttl: Default TTL in seconds
        """
        self.redis = redis_client or get_redis_client()
        self.default_ttl = default_ttl
        self.enabled = self.redis is not None

    def cache_get(self, key: str) -> Any | None:
        """Get cached value.

        Args:
            key: Cache key

        Returns:
            Cached value or None
        """
        if not self.enabled or not self.redis:
            return None

        try:
            data = self.redis.get(f"cache:{key}")
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.error(f"Cache get failed: {e}")
            return None

    def cache_set(self, key: str, value: Any, ttl: int | None = None) -> bool:
        """Set cached value.

        Args:
            key: Cache key
            value: Value to cache
            ttl: Optional TTL override

        Returns:
            True if successful
        """
        if not self.enabled or not self.redis:
            return False

        try:
            ttl = ttl or self.default_ttl
            self.redis.setex(f"cache:{key}", ttl, json.dumps(value))
            return True
        except Exception as e:
            logger.error(f"Cache set failed: {e}")
            return False

    def cache_delete(self, pattern: str) -> int:
        """Delete cache entries matching pattern.

        Args:
            pattern: Redis key pattern (e.g., "cache:user:*")

        Returns:
            Number of keys deleted
        """
        if not self.enabled or not self.redis:
            return 0

        try:
            keys = self.redis.keys(f"cache:{pattern}")
            if keys:
                return self.redis.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache delete failed: {e}")
            return 0


# Convenience instances
session_manager = SessionManager()
rate_limiter = RateLimiter()
queue_manager = QueueManager()
pubsub_manager = PubSubManager()
advanced_cache = AdvancedCache()

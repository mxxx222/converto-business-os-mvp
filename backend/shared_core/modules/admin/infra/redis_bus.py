"""Redis/Upstash bus implementation for production real-time admin events.

This implementation uses Upstash Redis for high-performance pub/sub and stream handling
with sub-10ms publish latency and automatic tenant isolation.
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import time
from typing import Callable, Dict, List, Optional, Set, Any

import httpx

from .bus import Bus, ActivityEvent

logger = logging.getLogger("converto.admin.infra.redis")


class RedisBus(Bus):
    """Redis bus implementation using Upstash Redis REST API."""
    
    def __init__(self):
        self.base_url = os.getenv("UPSTASH_REDIS_REST_URL")
        self.token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
        
        if not self.base_url or not self.token:
            raise ValueError("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set")
        
        self.client = httpx.AsyncClient()
        self._local_subscribers: Dict[str, Set[Callable[[ActivityEvent], None]]] = {}
        
        logger.info("RedisBus initialized with Upstash Redis")
    
    def _stream_key(self, tenant_id: str) -> str:
        """Get Redis stream key for tenant."""
        return f"admin:stream:{tenant_id}"
    
    def _subscriber_key(self, tenant_id: str) -> str:
        """Get Redis key for local subscription tracking."""
        return f"admin:sub:{tenant_id}"
    
    async def _redis_command(self, command: List[str], extra_commands: Optional[List[List[str]]] = None) -> Dict[str, Any]:
        """Execute Redis command via REST API."""
        pipeline = [command]
        if extra_commands:
            pipeline.extend(extra_commands)
        
        try:
            response = await self.client.post(
                self.base_url,
                headers={
                    "Authorization": f"Bearer {self.token}",
                    "Content-Type": "application/json"
                },
                json={"pipeline": pipeline}
            )
            response.raise_for_status()
            
            result = response.json()
            if isinstance(result, dict) and "result" in result:
                return result["result"]
            return result
            
        except Exception as e:
            logger.error(f"Redis command failed: {e}")
            raise
    
    async def _add_to_stream(self, tenant_id: str, event: ActivityEvent) -> None:
        """Add event to Redis stream with retention policy."""
        stream_key = self._stream_key(tenant_id)
        event_data = ["json", json.dumps(event.to_dict())]
        
        # Add to stream and apply retention policy (keep last 10,000 events)
        await self._redis_command([
            "XADD", stream_key, "*", *event_data
        ])
        
        # Trim old events (MAXLEN ~10000 for efficient memory usage)
        await self._redis_command([
            "XTRIM", stream_key, "MAXLEN", "~", "10000"
        ])
        
        logger.debug(f"Added {event.type} to stream {stream_key}")
    
    async def _get_from_stream(self, tenant_id: str, limit: int = 100) -> List[ActivityEvent]:
        """Get events from Redis stream."""
        stream_key = self._stream_key(tenant_id)
        
        try:
            # XREVRANGE gets newest first, then we reverse to get chronological order
            result = await self._redis_command([
                "XREVRANGE", stream_key, "+", "-", "COUNT", str(limit)
            ])
            
            if not result or not isinstance(result, list):
                return []
            
            events = []
            for item in reversed(result):  # Reverse to get chronological order
                if isinstance(item, list) and len(item) >= 2:
                    fields = item[1]  # Second element contains field-value pairs
                    if len(fields) >= 2 and fields[0] == "json":
                        try:
                            event_data = json.loads(fields[1])
                            events.append(ActivityEvent.from_dict(event_data))
                        except json.JSONDecodeError as e:
                            logger.error(f"Failed to parse event JSON: {e}")
            
            return events
            
        except Exception as e:
            logger.error(f"Failed to get events from stream: {e}")
            return []
    
    async def publish(self, tenant_id: str, event: ActivityEvent) -> None:
        """Publish event to Redis stream and notify local subscribers."""
        start_time = time.perf_counter()
        
        try:
            # Add to Redis stream
            await self._add_to_stream(tenant_id, event)
            
            # Notify local subscribers (for this instance)
            if tenant_id in self._local_subscribers:
                for callback in self._local_subscribers[tenant_id]:
                    try:
                        callback(event)
                    except Exception as e:
                        logger.error(f"Error in local subscriber callback: {e}")
            
            # Log publish latency for monitoring
            publish_time = (time.perf_counter() - start_time) * 1000  # Convert to ms
            logger.info(
                f"Published {event.type} to tenant {tenant_id} in {publish_time:.2f}ms",
                extra={
                    "event_type": "activity_published",
                    "activity_type": event.type,
                    "tenant_id": tenant_id,
                    "activity_id": event.id,
                    "publish_latency_ms": round(publish_time, 2)
                }
            )
            
        except Exception as e:
            logger.error(
                f"Failed to publish event: {e}",
                extra={
                    "event_type": "publish_error",
                    "tenant_id": tenant_id,
                    "activity_type": event.type,
                    "activity_id": event.id,
                    "error": str(e)
                }
            )
            # Add retry logic with exponential backoff
            await self._retry_publish(tenant_id, event)
    
    async def _retry_publish(self, tenant_id: str, event: ActivityEvent, max_retries: int = 3) -> None:
        """Retry publish with exponential backoff."""
        for attempt in range(max_retries):
            try:
                await asyncio.sleep(2 ** attempt)  # Exponential backoff: 1s, 2s, 4s
                await self._add_to_stream(tenant_id, event)
                logger.info(f"Successfully retried publish on attempt {attempt + 1}")
                return
            except Exception as e:
                logger.warning(f"Retry attempt {attempt + 1} failed: {e}")
                if attempt == max_retries - 1:
                    logger.error(
                        f"All retry attempts failed for event {event.id}",
                        extra={
                            "event_type": "publish_retry_failed",
                            "tenant_id": tenant_id,
                            "activity_id": event.id,
                            "max_retries": max_retries
                        }
                    )
                    raise
    
    async def subscribe(
        self, 
        tenant_id: str, 
        callback: Callable[[ActivityEvent], None]
    ) -> Callable[[], None]:
        """Subscribe to events for a tenant (local instance only)."""
        if tenant_id not in self._local_subscribers:
            self._local_subscribers[tenant_id] = set()
        
        self._local_subscribers[tenant_id].add(callback)
        
        def unsubscribe() -> None:
            self._local_subscribers[tenant_id].discard(callback)
            if not self._local_subscribers[tenant_id]:
                del self._local_subscribers[tenant_id]
        
        return unsubscribe
    
    async def list(self, tenant_id: str, limit: int = 100) -> List[ActivityEvent]:
        """List recent events for a tenant from Redis stream."""
        try:
            events = await self._get_from_stream(tenant_id, limit)
            logger.debug(f"Retrieved {len(events)} events for tenant {tenant_id}")
            return events
        except Exception as e:
            logger.error(f"Failed to list events for tenant {tenant_id}: {e}")
            return []
    
    async def close(self) -> None:
        """Close the HTTP client."""
        await self.client.aclose()


class SupabaseBus(Bus):
    """Supabase Realtime bus implementation (alternative to Redis)."""
    
    def __init__(self):
        # Import here to avoid dependency issues if not used
        try:
            from supabase import create_client, Client
        except ImportError:
            raise ImportError("supabase-py must be installed to use SupabaseBus")
        
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not self.supabase_url or not self.service_role_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        
        self.client: Client = create_client(self.supabase_url, self.service_role_key)
        self._local_subscribers: Dict[str, Set[Callable[[ActivityEvent], None]]] = {}
        
        logger.info("SupabaseBus initialized with Supabase Realtime")
    
    async def publish(self, tenant_id: str, event: ActivityEvent) -> None:
        """Publish event to Supabase database."""
        try:
            # Insert event into admin_activities table
            data = {
                "tenant_id": tenant_id,
                "payload": event.to_dict()
            }
            
            result = self.client.table("admin_activities").insert(data).execute()
            
            if not result.data:
                raise Exception("No data returned from insert")
            
            # Notify local subscribers
            if tenant_id in self._local_subscribers:
                for callback in self._local_subscribers[tenant_id]:
                    try:
                        callback(event)
                    except Exception as e:
                        logger.error(f"Error in local subscriber callback: {e}")
            
            logger.info(f"Published {event.type} to tenant {tenant_id} via Supabase")
            
        except Exception as e:
            logger.error(f"Failed to publish via Supabase: {e}")
            raise
    
    async def subscribe(
        self, 
        tenant_id: str, 
        callback: Callable[[ActivityEvent], None]
    ) -> Callable[[], None]:
        """Subscribe to realtime changes (local instance only)."""
        if tenant_id not in self._local_subscribers:
            self._local_subscribers[tenant_id] = set()
        
        self._local_subscribers[tenant_id].add(callback)
        
        def unsubscribe() -> None:
            self._local_subscribers[tenant_id].discard(callback)
            if not self._local_subscribers[tenant_id]:
                del self._local_subscribers[tenant_id]
        
        return unsubscribe
    
    async def list(self, tenant_id: str, limit: int = 100) -> List[ActivityEvent]:
        """List events from Supabase database."""
        try:
            result = (
                self.client.table("admin_activities")
                .select("payload")
                .eq("tenant_id", tenant_id)
                .order("created_at", desc=True)
                .limit(limit)
                .execute()
            )
            
            events = []
            for item in result.data or []:
                if "payload" in item:
                    try:
                        event = ActivityEvent.from_dict(item["payload"])
                        events.append(event)
                    except Exception as e:
                        logger.error(f"Failed to parse event: {e}")
            
            return list(reversed(events))  # Reverse to get chronological order
            
        except Exception as e:
            logger.error(f"Failed to list events from Supabase: {e}")
            return []
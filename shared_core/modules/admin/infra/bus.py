"""Infrastructure bus abstraction for real-time admin events.

This module provides a pluggable interface for different real-time backends
(Redis/Upstash, Supabase Realtime, etc.) to handle admin activity publishing
and subscription with tenant isolation.
"""

from __future__ import annotations

import json
import logging
import time
from abc import ABC, abstractmethod
from typing import Callable, Dict, List, Optional, Set, Any
from uuid import uuid4


logger = logging.getLogger("converto.admin.infra")


class ActivityEvent:
    """Activity event structure for admin bus."""
    
    def __init__(
        self,
        id: Optional[str] = None,
        type: str = "",
        ts: Optional[str] = None,
        tenant_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        **kwargs: Any
    ):
        self.id = id or str(uuid4())
        self.type = type
        self.ts = ts or time.strftime("%Y-%m-%dT%H:%M:%S.%fZ", time.gmtime())
        self.tenant_id = tenant_id or "default"
        self.details = details or {}
        # Add any additional kwargs to details
        self.details.update(kwargs)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert event to dictionary."""
        return {
            "id": self.id,
            "type": self.type,
            "ts": self.ts,
            "tenant_id": self.tenant_id,
            "details": self.details
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> ActivityEvent:
        """Create event from dictionary."""
        return cls(
            id=data.get("id"),
            type=data.get("type", ""),
            ts=data.get("ts"),
            tenant_id=data.get("tenant_id"),
            details=data.get("details", {}),
            **{k: v for k, v in data.items() if k not in ["id", "type", "ts", "tenant_id", "details"]}
        )


class Bus(ABC):
    """Abstract bus interface for real-time event handling."""
    
    @abstractmethod
    async def publish(self, tenant_id: str, event: ActivityEvent) -> None:
        """Publish an activity event to a tenant channel."""
        pass
    
    @abstractmethod
    async def subscribe(
        self, 
        tenant_id: str, 
        callback: Callable[[ActivityEvent], None]
    ) -> Callable[[], None]:
        """Subscribe to events for a tenant. Returns unsubscribe function."""
        pass
    
    @abstractmethod
    async def list(self, tenant_id: str, limit: int = 100) -> List[ActivityEvent]:
        """List recent events for a tenant."""
        pass


# Global bus instance
_bus: Optional[Bus] = None


def set_bus(bus_instance: Bus) -> None:
    """Set the global bus instance."""
    global _bus
    _bus = bus_instance


def get_bus() -> Bus:
    """Get the global bus instance."""
    if _bus is None:
        raise RuntimeError("BUS_NOT_INITIALIZED")
    return _bus


class InMemoryBus(Bus):
    """In-memory bus implementation for development/testing."""
    
    def __init__(self):
        self._streams: Dict[str, List[ActivityEvent]] = {}
        self._subscribers: Dict[str, Set[Callable[[ActivityEvent], None]]] = {}
        logger.info("InMemoryBus initialized for development")
    
    async def publish(self, tenant_id: str, event: ActivityEvent) -> None:
        """Publish event to in-memory stream."""
        if tenant_id not in self._streams:
            self._streams[tenant_id] = []
        
        self._streams[tenant_id].append(event)
        
        # Keep only last 1000 events per tenant
        if len(self._streams[tenant_id]) > 1000:
            self._streams[tenant_id] = self._streams[tenant_id][-1000:]
        
        # Notify local subscribers
        if tenant_id in self._subscribers:
            for callback in self._subscribers[tenant_id]:
                try:
                    callback(event)
                except Exception as e:
                    logger.error(f"Error in subscriber callback: {e}")
        
        logger.debug(f"Published {event.type} to tenant {tenant_id}")
    
    async def subscribe(
        self, 
        tenant_id: str, 
        callback: Callable[[ActivityEvent], None]
    ) -> Callable[[], None]:
        """Subscribe to tenant events."""
        if tenant_id not in self._subscribers:
            self._subscribers[tenant_id] = set()
        
        self._subscribers[tenant_id].add(callback)
        
        def unsubscribe() -> None:
            self._subscribers[tenant_id].discard(callback)
            if not self._subscribers[tenant_id]:
                del self._subscribers[tenant_id]
        
        return unsubscribe
    
    async def list(self, tenant_id: str, limit: int = 100) -> List[ActivityEvent]:
        """List events for tenant."""
        events = self._streams.get(tenant_id, [])
        return events[-limit:] if limit > 0 else events
"""Enhanced activity store with tenant channels and pub/sub."""

import json
import time
import uuid
from typing import Dict, List, Set, Callable, Optional, Any
from collections import defaultdict
import logging

from .schemas import ActivityInput, ActivitySchema


logger = logging.getLogger("converto.admin.store")


class Activity:
    """Activity record with validation."""
    
    def __init__(self, activity_data: ActivityInput):
        self.id = str(uuid.uuid4())
        self.type = activity_data.type
        self.details = activity_data.details
        self.tenant_id = activity_data.tenant_id or "default"
        self.timestamp = activity_data.timestamp or time.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        self.created_at = time.time()
    
    def to_dict(self) -> dict:
        """Convert to dictionary for API responses."""
        return {
            "id": self.id,
            "type": self.type,
            "details": self.details,
            "tenant_id": self.tenant_id,
            "timestamp": self.timestamp,
            "created_at": self.created_at
        }


class TenantChannel:
    """Tenant-specific activity channel."""
    
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id
        self.activities: List[Activity] = []
        self.subscribers: Set[Callable[[Activity], None]] = set()
        self.max_activities = 1000  # Keep last 1000 activities per tenant
    
    def add_activity(self, activity: Activity):
        """Add activity to tenant channel."""
        self.activities.insert(0, activity)
        
        # Trim to max size
        if len(self.activities) > self.max_activities:
            self.activities = self.activities[:self.max_activities]
        
        # Notify subscribers
        for subscriber in self.subscribers.copy():
            try:
                subscriber(activity)
            except Exception as e:
                logger.error(f"Error notifying subscriber: {e}")
                self.subscribers.discard(subscriber)
    
    def get_activities(self, limit: int = 100) -> List[Activity]:
        """Get recent activities."""
        return self.activities[:limit]
    
    def subscribe(self, callback: Callable[[Activity], None]) -> Callable[[], None]:
        """Subscribe to activity updates."""
        self.subscribers.add(callback)
        
        # Return unsubscribe function
        def unsubscribe():
            self.subscribers.discard(callback)
        
        return unsubscribe


class ActivityStore:
    """Multi-tenant activity store with pub/sub."""
    
    def __init__(self):
        self.tenant_channels: Dict[str, TenantChannel] = {}
        self.global_activities: List[Activity] = []
        self.max_global_activities = 10000  # Keep last 10k activities globally
    
    def get_tenant_channel(self, tenant_id: str) -> TenantChannel:
        """Get or create tenant channel."""
        if tenant_id not in self.tenant_channels:
            self.tenant_channels[tenant_id] = TenantChannel(tenant_id)
        return self.tenant_channels[tenant_id]
    
    def publish_activity(self, activity_data: ActivityInput) -> Activity:
        """Publish activity to appropriate tenant channel."""
        try:
            # Validate input
            validated_data = ActivitySchema(
                type=activity_data.type,
                details=activity_data.details,
                tenant_id=activity_data.tenant_id,
                timestamp=activity_data.timestamp
            )
        except Exception as e:
            raise ValueError(f"Invalid activity data: {e}")
        
        # Create activity
        activity = Activity(activity_data)
        
        # Add to tenant channel
        channel = self.get_tenant_channel(activity.tenant_id)
        channel.add_activity(activity)
        
        # Add to global store
        self.global_activities.insert(0, activity)
        if len(self.global_activities) > self.max_global_activities:
            self.global_activities = self.global_activities[:self.max_global_activities]
        
        logger.info(f"Activity published: {activity.type} for tenant {activity.tenant_id}")
        return activity
    
    def get_activities(self, tenant_id: Optional[str] = None, limit: int = 100) -> List[Activity]:
        """Get activities for tenant or all tenants."""
        if tenant_id:
            channel = self.get_tenant_channel(tenant_id)
            return channel.get_activities(limit)
        else:
            return self.global_activities[:limit]
    
    def subscribe_tenant(self, tenant_id: str, callback: Callable[[Activity], None]) -> Callable[[], None]:
        """Subscribe to tenant activity updates."""
        channel = self.get_tenant_channel(tenant_id)
        return channel.subscribe(callback)
    
    def get_channel_stats(self) -> Dict[str, dict]:
        """Get statistics for all channels."""
        stats = {}
        for tenant_id, channel in self.tenant_channels.items():
            stats[tenant_id] = {
                "activities_count": len(channel.activities),
                "subscribers_count": len(channel.subscribers),
                "oldest_activity": channel.activities[-1].timestamp if channel.activities else None,
                "newest_activity": channel.activities[0].timestamp if channel.activities else None
            }
        return stats


# Global activity store instance
activity_store = ActivityStore()


def publish_activity(activity_data: ActivityInput) -> Activity:
    """Publish activity to global store."""
    return activity_store.publish_activity(activity_data)


def get_activities(tenant_id: Optional[str] = None, limit: int = 100) -> List[Activity]:
    """Get activities from global store."""
    return activity_store.get_activities(tenant_id, limit)


def subscribe_tenant_activities(tenant_id: str, callback: Callable[[Activity], None]) -> Callable[[], None]:
    """Subscribe to tenant-specific activity updates."""
    return activity_store.subscribe_tenant(tenant_id, callback)


def get_store_stats() -> Dict[str, Any]:
    """Get activity store statistics."""
    channel_stats = activity_store.get_channel_stats()
    
    return {
        "total_channels": len(activity_store.tenant_channels),
        "total_activities": len(activity_store.global_activities),
        "tenant_channels": channel_stats,
        "timestamp": time.time()
    }
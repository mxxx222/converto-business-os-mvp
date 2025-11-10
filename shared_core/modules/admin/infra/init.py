"""Infrastructure bus initialization and configuration.

This module provides the initialization logic for the real-time admin bus,
supporting Redis/Upstash as primary and Supabase Realtime as fallback.
"""

from __future__ import annotations

import logging
import os
from typing import Optional, Type

from .bus import Bus, InMemoryBus
from .redis_bus import RedisBus, SupabaseBus

logger = logging.getLogger("converto.admin.infra.init")


def init_bus() -> Bus:
    """Initialize the admin bus based on environment configuration.
    
    Priority:
    1. Redis/Upstash (if UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set)
    2. Supabase Realtime (if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set)
    3. In-memory (development fallback)
    
    Returns:
        Configured Bus instance
    """
    upstash_url = os.getenv("UPSTASH_REDIS_REST_URL")
    upstash_token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    # Priority 1: Redis/Upstash (primary for production)
    if upstash_url and upstash_token:
        try:
            bus = RedisBus()
            logger.info("✅ Initialized RedisBus with Upstash Redis")
            logger.info("🚀 Using Redis for real-time admin events")
            return bus
        except Exception as e:
            logger.error(f"Failed to initialize RedisBus: {e}")
            logger.warning("Falling back to in-memory bus")
    
    # Priority 2: Supabase Realtime (alternative for production)
    elif supabase_url and supabase_service_key:
        try:
            bus = SupabaseBus()
            logger.info("✅ Initialized SupabaseBus with Supabase Realtime")
            logger.info("🚀 Using Supabase for real-time admin events")
            return bus
        except Exception as e:
            logger.error(f"Failed to initialize SupabaseBus: {e}")
            logger.warning("Falling back to in-memory bus")
    
    # Priority 3: In-memory (development)
    else:
        logger.info("✅ Initialized InMemoryBus (development mode)")
        logger.warning("⚠️  Using in-memory bus - not suitable for production")
        logger.info("💡 Configure UPSTASH_REDIS_* or SUPABASE_* for production")
    
    return InMemoryBus()


def get_bus_class() -> Type[Bus]:
    """Get the bus class that would be initialized based on environment.
    
    Returns:
        Bus class type (not instance)
    """
    upstash_url = os.getenv("UPSTASH_REDIS_REST_URL")
    upstash_token = os.getenv("UPSTASH_REDIS_REST_TOKEN")
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    if upstash_url and upstash_token:
        return RedisBus
    elif supabase_url and supabase_service_key:
        return SupabaseBus
    else:
        return InMemoryBus


def get_bus_config() -> dict:
    """Get current bus configuration for monitoring.
    
    Returns:
        Dictionary with bus configuration information
    """
    bus_class = get_bus_class()
    
    config = {
        "bus_type": bus_class.__name__,
        "production_ready": bus_class != InMemoryBus,
        "features": []
    }
    
    if bus_class == RedisBus:
        config.update({
            "backend": "upstash_redis",
            "features": ["streams", "pub_sub", "retention_policy", "retry_logic"],
            "url_configured": bool(os.getenv("UPSTASH_REDIS_REST_URL")),
            "token_configured": bool(os.getenv("UPSTASH_REDIS_REST_TOKEN"))
        })
    elif bus_class == SupabaseBus:
        config.update({
            "backend": "supabase_realtime",
            "features": ["database_audit", "real_time", "tenant_isolation"],
            "url_configured": bool(os.getenv("SUPABASE_URL")),
            "service_key_configured": bool(os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
        })
    elif bus_class == InMemoryBus:
        config.update({
            "backend": "in_memory",
            "features": ["development", "testing"],
            "production_ready": False
        })
    
    return config
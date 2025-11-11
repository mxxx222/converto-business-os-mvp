"""
Event Bus Service - Redis Streams based event messaging
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import redis
import json
import asyncio
import logging
import os
from datetime import datetime
from enum import Enum

app = FastAPI(title="Event Bus Service", version="1.0.0")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Redis connection
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", "6379")),
    db=int(os.getenv("REDIS_DB", "0")),
    decode_responses=True
)


class EventType(str, Enum):
    # OCR Events
    OCR_STARTED = "ocr.started"
    OCR_COMPLETED = "ocr.completed"
    OCR_FAILED = "ocr.failed"
    
    # Vision Events
    VISION_ANALYSIS_STARTED = "vision.analysis.started"
    VISION_ANALYSIS_COMPLETED = "vision.analysis.completed"
    VISION_ANALYSIS_FAILED = "vision.analysis.failed"
    
    # Billing Events
    SUBSCRIPTION_CREATED = "billing.subscription.created"
    SUBSCRIPTION_UPDATED = "billing.subscription.updated"
    PAYMENT_SUCCEEDED = "billing.payment.succeeded"
    PAYMENT_FAILED = "billing.payment.failed"
    USAGE_RECORDED = "billing.usage.recorded"
    
    # Auth Events
    USER_REGISTERED = "auth.user.registered"
    USER_LOGIN = "auth.user.login"
    USER_LOGOUT = "auth.user.logout"
    TOKEN_REFRESHED = "auth.token.refreshed"
    
    # System Events
    SERVICE_HEALTH_CHECK = "system.health.check"
    SERVICE_STARTED = "system.service.started"
    SERVICE_STOPPED = "system.service.stopped"


class Event(BaseModel):
    event_type: EventType
    source_service: str
    tenant_id: Optional[str] = None
    user_id: Optional[str] = None
    data: Dict[str, Any]
    timestamp: datetime = datetime.utcnow()
    correlation_id: Optional[str] = None


class EventRequest(BaseModel):
    event_type: EventType
    source_service: str
    tenant_id: Optional[str] = None
    user_id: Optional[str] = None
    data: Dict[str, Any]
    correlation_id: Optional[str] = None


class StreamConfig(BaseModel):
    stream_name: str
    max_length: int = 10000
    retention_days: int = 30


@app.post("/events/publish")
async def publish_event(event_request: EventRequest):
    """Publish event to event bus"""
    
    try:
        # Create event
        event = Event(
            event_type=event_request.event_type,
            source_service=event_request.source_service,
            tenant_id=event_request.tenant_id,
            user_id=event_request.user_id,
            data=event_request.data,
            correlation_id=event_request.correlation_id
        )
        
        # Get stream name based on event type
        stream_name = get_stream_name(event.event_type)
        
        # Publish to Redis Stream
        event_id = redis_client.xadd(
            stream_name,
            {
                "event_type": event.event_type,
                "source_service": event.source_service,
                "tenant_id": event.tenant_id or "",
                "user_id": event.user_id or "",
                "data": json.dumps(event.data),
                "timestamp": event.timestamp.isoformat(),
                "correlation_id": event.correlation_id or ""
            }
        )
        
        logger.info(f"Published event {event.event_type} to {stream_name} with ID {event_id}")
        
        return {
            "event_id": event_id,
            "stream_name": stream_name,
            "status": "published"
        }
        
    except Exception as e:
        logger.error(f"Failed to publish event: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Event publishing failed: {str(e)}")


@app.get("/events/consume/{stream_name}")
async def consume_events(stream_name: str, count: int = 10, block: int = 1000):
    """Consume events from stream"""
    
    try:
        # Read from stream
        messages = redis_client.xread({stream_name: "$"}, count=count, block=block)
        
        events = []
        for stream, msgs in messages:
            for msg_id, fields in msgs:
                event = {
                    "id": msg_id,
                    "stream": stream,
                    "event_type": fields.get("event_type"),
                    "source_service": fields.get("source_service"),
                    "tenant_id": fields.get("tenant_id"),
                    "user_id": fields.get("user_id"),
                    "data": json.loads(fields.get("data", "{}")),
                    "timestamp": fields.get("timestamp"),
                    "correlation_id": fields.get("correlation_id")
                }
                events.append(event)
        
        return {"events": events, "count": len(events)}
        
    except Exception as e:
        logger.error(f"Failed to consume events: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Event consumption failed: {str(e)}")


@app.get("/events/streams")
async def list_streams():
    """List all event streams"""
    
    try:
        streams = redis_client.keys("stream:*")
        stream_info = []
        
        for stream in streams:
            info = redis_client.xinfo_stream(stream)
            stream_info.append({
                "name": stream,
                "length": info["length"],
                "first_entry": info["first-entry"],
                "last_entry": info["last-entry"]
            })
        
        return {"streams": stream_info}
        
    except Exception as e:
        logger.error(f"Failed to list streams: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Stream listing failed: {str(e)}")


@app.post("/events/subscribe")
async def subscribe_to_events(
    stream_names: List[str],
    consumer_group: str,
    consumer_name: str,
    count: int = 10
):
    """Subscribe to events using consumer group"""
    
    try:
        # Create consumer group if it doesn't exist
        for stream_name in stream_names:
            try:
                redis_client.xgroup_create(stream_name, consumer_group, id="0", mkstream=True)
            except redis.exceptions.ResponseError:
                # Group already exists
                pass
        
        # Read from consumer group
        messages = redis_client.xreadgroup(
            consumer_group,
            consumer_name,
            {stream_name: ">" for stream_name in stream_names},
            count=count
        )
        
        events = []
        for stream, msgs in messages:
            for msg_id, fields in msgs:
                event = {
                    "id": msg_id,
                    "stream": stream,
                    "event_type": fields.get("event_type"),
                    "source_service": fields.get("source_service"),
                    "tenant_id": fields.get("tenant_id"),
                    "user_id": fields.get("user_id"),
                    "data": json.loads(fields.get("data", "{}")),
                    "timestamp": fields.get("timestamp"),
                    "correlation_id": fields.get("correlation_id")
                }
                events.append(event)
        
        return {"events": events, "count": len(events)}
        
    except Exception as e:
        logger.error(f"Failed to subscribe to events: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Event subscription failed: {str(e)}")


@app.post("/events/acknowledge")
async def acknowledge_event(stream_name: str, consumer_group: str, message_id: str):
    """Acknowledge processed event"""
    
    try:
        redis_client.xack(stream_name, consumer_group, message_id)
        
        return {"status": "acknowledged", "message_id": message_id}
        
    except Exception as e:
        logger.error(f"Failed to acknowledge event: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Event acknowledgment failed: {str(e)}")


@app.post("/events/streams/create")
async def create_stream(config: StreamConfig):
    """Create new event stream"""
    
    try:
        # Create stream with initial message
        redis_client.xadd(
            config.stream_name,
            {"message": "Stream created", "timestamp": datetime.utcnow().isoformat()},
            maxlen=config.max_length
        )
        
        # Set retention policy
        redis_client.expire(config.stream_name, config.retention_days * 24 * 3600)
        
        return {"status": "created", "stream_name": config.stream_name}
        
    except Exception as e:
        logger.error(f"Failed to create stream: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Stream creation failed: {str(e)}")


@app.get("/events/health")
async def health_check():
    """Health check endpoint"""
    
    try:
        # Test Redis connection
        redis_client.ping()
        
        return {
            "status": "healthy",
            "service": "event-bus",
            "redis_connected": True
        }
        
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "service": "event-bus",
            "redis_connected": False,
            "error": str(e)
        }


def get_stream_name(event_type: EventType) -> str:
    """Get stream name based on event type"""
    
    if event_type.value.startswith("ocr."):
        return "stream:ocr"
    elif event_type.value.startswith("vision."):
        return "stream:vision"
    elif event_type.value.startswith("billing."):
        return "stream:billing"
    elif event_type.value.startswith("auth."):
        return "stream:auth"
    elif event_type.value.startswith("system."):
        return "stream:system"
    else:
        return "stream:general"


# Background task for event processing
async def process_events():
    """Background task to process events"""
    
    while True:
        try:
            # Process events from different streams
            streams = ["stream:ocr", "stream:vision", "stream:billing", "stream:auth"]
            
            for stream in streams:
                try:
                    messages = redis_client.xread({stream: "$"}, count=10, block=1000)
                    
                    for stream_name, msgs in messages:
                        for msg_id, fields in msgs:
                            # Process event based on type
                            event_type = fields.get("event_type")
                            await route_event(event_type, fields)
                            
                except Exception as e:
                    logger.error(f"Error processing stream {stream}: {str(e)}")
            
            await asyncio.sleep(1)
            
        except Exception as e:
            logger.error(f"Event processing error: {str(e)}")
            await asyncio.sleep(5)


async def route_event(event_type: str, fields: Dict[str, Any]):
    """Route event to appropriate handler"""
    
    try:
        if event_type.startswith("ocr."):
            await handle_ocr_event(event_type, fields)
        elif event_type.startswith("vision."):
            await handle_vision_event(event_type, fields)
        elif event_type.startswith("billing."):
            await handle_billing_event(event_type, fields)
        elif event_type.startswith("auth."):
            await handle_auth_event(event_type, fields)
        elif event_type.startswith("system."):
            await handle_system_event(event_type, fields)
        
        logger.info(f"Processed event: {event_type}")
        
    except Exception as e:
        logger.error(f"Failed to route event {event_type}: {str(e)}")


async def handle_ocr_event(event_type: str, fields: Dict[str, Any]):
    """Handle OCR events"""
    logger.info(f"Handling OCR event: {event_type}")


async def handle_vision_event(event_type: str, fields: Dict[str, Any]):
    """Handle Vision events"""
    logger.info(f"Handling Vision event: {event_type}")


async def handle_billing_event(event_type: str, fields: Dict[str, Any]):
    """Handle Billing events"""
    logger.info(f"Handling Billing event: {event_type}")


async def handle_auth_event(event_type: str, fields: Dict[str, Any]):
    """Handle Auth events"""
    logger.info(f"Handling Auth event: {event_type}")


async def handle_system_event(event_type: str, fields: Dict[str, Any]):
    """Handle System events"""
    logger.info(f"Handling System event: {event_type}")


# Start background task
@app.on_event("startup")
async def startup_event():
    """Start background event processing"""
    asyncio.create_task(process_events())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)

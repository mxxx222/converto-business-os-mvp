"""
API Gateway - Orchestrates all microservices
Service discovery, load balancing, authentication, rate limiting
"""

from fastapi import FastAPI, HTTPException, Depends, Request, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import httpx
import asyncio
import logging
import os
from datetime import datetime, timedelta
import redis
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
import json

app = FastAPI(title="API Gateway", version="1.0.0")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security
security = HTTPBearer()

# Redis for caching and rate limiting
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", "6379")),
    db=int(os.getenv("REDIS_DB", "0")),
    decode_responses=True
)

@app.on_event("startup")
async def _init_rate_limiter():
    try:
        await FastAPILimiter.init(redis_client)
    except Exception as e:
        logger.warning(f"Rate limiter init failed: {e}")

# Service registry
SERVICES = {
    "ai-gateway": {
        "url": "http://localhost:8001",
        "health_endpoint": "/ai/health",
        "rate_limit": 100,  # requests per minute
        "timeout": 30
    },
    "ocr-service": {
        "url": "http://localhost:8002",
        "health_endpoint": "/ocr/health",
        "rate_limit": 200,
        "timeout": 60
    },
    "vision-service": {
        "url": "http://localhost:8003",
        "health_endpoint": "/vision/health",
        "rate_limit": 150,
        "timeout": 45
    },
    "billing-service": {
        "url": "http://localhost:8004",
        "health_endpoint": "/billing/health",
        "rate_limit": 300,
        "timeout": 15
    },
    "auth-service": {
        "url": "http://localhost:8005",
        "health_endpoint": "/auth/health",
        "rate_limit": 500,
        "timeout": 10
    },
    "event-bus": {
        "url": "http://localhost:8006",
        "health_endpoint": "/events/health",
        "rate_limit": 1000,
        "timeout": 5
    }
}


class ServiceHealth(BaseModel):
    service_name: str
    status: str
    response_time_ms: int
    last_check: datetime


class GatewayStats(BaseModel):
    total_requests: int
    successful_requests: int
    failed_requests: int
    average_response_time_ms: float
    services_status: List[ServiceHealth]


# Request tracking
request_stats = {
    "total": 0,
    "successful": 0,
    "failed": 0,
    "response_times": []
}


@app.middleware("http")
async def gateway_middleware(request: Request, call_next):
    """Gateway middleware for logging, rate limiting, and stats"""
    
    start_time = datetime.utcnow()
    request_stats["total"] += 1
    
    # Rate limiting
    client_ip = request.client.host
    if not await check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    
    # Process request
    response = await call_next(request)
    
    # Update stats
    response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
    request_stats["response_times"].append(response_time)
    request_stats["response_times"] = request_stats["response_times"][-1000:]  # Keep last 1000
    
    if response.status_code < 400:
        request_stats["successful"] += 1
    else:
        request_stats["failed"] += 1
    
    # Add response headers
    response.headers["X-Response-Time"] = str(response_time)
    response.headers["X-Gateway-Version"] = "1.0.0"
    
    return response


@app.get("/health")
async def health_check():
    """Gateway health check"""
    return {
        "status": "healthy",
        "service": "api-gateway",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/services/health")
async def check_all_services():
    """Check health of all services"""
    
    health_results = []
    
    async with httpx.AsyncClient() as client:
        for service_name, config in SERVICES.items():
            try:
                start_time = datetime.utcnow()
                
                response = await client.get(
                    f"{config['url']}{config['health_endpoint']}",
                    timeout=config['timeout']
                )
                
                response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
                
                health_results.append(ServiceHealth(
                    service_name=service_name,
                    status="healthy" if response.status_code == 200 else "unhealthy",
                    response_time_ms=int(response_time),
                    last_check=datetime.utcnow()
                ))
                
            except Exception as e:
                health_results.append(ServiceHealth(
                    service_name=service_name,
                    status="unhealthy",
                    response_time_ms=0,
                    last_check=datetime.utcnow()
                ))
                logger.error(f"Health check failed for {service_name}: {str(e)}")
    
    return {"services": health_results}


@app.get("/stats")
async def get_gateway_stats():
    """Get gateway statistics"""
    
    avg_response_time = (
        sum(request_stats["response_times"]) / len(request_stats["response_times"])
        if request_stats["response_times"] else 0
    )
    
    # Get service health
    services_health = await check_all_services()
    
    return GatewayStats(
        total_requests=request_stats["total"],
        successful_requests=request_stats["successful"],
        failed_requests=request_stats["failed"],
        average_response_time_ms=avg_response_time,
        services_status=services_health["services"]
    )


# AI Gateway proxy
@app.post("/ai/chat", dependencies=[Depends(RateLimiter(times=60, seconds=60))])
async def ai_chat_proxy(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Proxy AI chat requests"""
    
    # Validate token
    await validate_token(credentials.credentials)
    
    # Forward to AI Gateway
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SERVICES['ai-gateway']['url']}/ai/chat",
            content=await request.body(),
            headers={"Authorization": f"Bearer {credentials.credentials}"},
            timeout=SERVICES['ai-gateway']['timeout']
        )
        
        return response.json()


# OCR Service proxy
@app.post("/ocr/extract", dependencies=[Depends(RateLimiter(times=120, seconds=60))])
async def ocr_extract_proxy(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Proxy OCR extraction requests"""
    
    await validate_token(credentials.credentials)
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SERVICES['ocr-service']['url']}/ocr/extract",
            content=await request.body(),
            headers={"Authorization": f"Bearer {credentials.credentials}"},
            timeout=SERVICES['ocr-service']['timeout']
        )
        
        return response.json()


@app.post("/ocr/upload", dependencies=[Depends(RateLimiter(times=60, seconds=60))])
async def ocr_upload_proxy(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Proxy OCR upload requests"""
    
    await validate_token(credentials.credentials)
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SERVICES['ocr-service']['url']}/ocr/upload",
            content=await request.body(),
            headers={"Authorization": f"Bearer {credentials.credentials}"},
            timeout=SERVICES['ocr-service']['timeout']
        )
        
        return response.json()


# Vision Service proxy
@app.post("/vision/analyze", dependencies=[Depends(RateLimiter(times=90, seconds=60))])
async def vision_analyze_proxy(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Proxy vision analysis requests"""
    
    await validate_token(credentials.credentials)
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SERVICES['vision-service']['url']}/vision/analyze",
            content=await request.body(),
            headers={"Authorization": f"Bearer {credentials.credentials}"},
            timeout=SERVICES['vision-service']['timeout']
        )
        
        return response.json()


# Billing Service proxy
@app.post("/billing/subscribe")
async def billing_subscribe_proxy(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Proxy billing subscription requests"""
    
    await validate_token(credentials.credentials)
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SERVICES['billing-service']['url']}/billing/subscribe",
            content=await request.body(),
            headers={"Authorization": f"Bearer {credentials.credentials}"},
            timeout=SERVICES['billing-service']['timeout']
        )
        
        return response.json()


@app.post("/billing/usage")
async def billing_usage_proxy(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Proxy billing usage requests"""
    
    await validate_token(credentials.credentials)
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SERVICES['billing-service']['url']}/billing/usage",
            content=await request.body(),
            headers={"Authorization": f"Bearer {credentials.credentials}"},
            timeout=SERVICES['billing-service']['timeout']
        )
        
        return response.json()


# Auth Service proxy (no auth required for these endpoints)
@app.post("/auth/register")
async def auth_register_proxy(request: Request):
    """Proxy auth registration requests"""
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SERVICES['auth-service']['url']}/auth/register",
            content=await request.body(),
            timeout=SERVICES['auth-service']['timeout']
        )
        
        return response.json()


@app.post("/auth/login")
async def auth_login_proxy(request: Request):
    """Proxy auth login requests"""
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SERVICES['auth-service']['url']}/auth/login",
            content=await request.body(),
            timeout=SERVICES['auth-service']['timeout']
        )
        
        return response.json()


@app.get("/auth/me")
async def auth_me_proxy(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Proxy auth me requests"""
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SERVICES['auth-service']['url']}/auth/me",
            headers={"Authorization": f"Bearer {credentials.credentials}"},
            timeout=SERVICES['auth-service']['timeout']
        )
        
        return response.json()


# Event Bus proxy
@app.post("/events/publish")
async def events_publish_proxy(request: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Proxy event publishing requests"""
    
    await validate_token(credentials.credentials)
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{SERVICES['event-bus']['url']}/events/publish",
            content=await request.body(),
            headers={"Authorization": f"Bearer {credentials.credentials}"},
            timeout=SERVICES['event-bus']['timeout']
        )
        
        return response.json()


# Helper functions
async def validate_token(token: str):
    """Validate JWT token with auth service"""
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SERVICES['auth-service']['url']}/auth/verify",
                headers={"Authorization": f"Bearer {token}"},
                timeout=SERVICES['auth-service']['timeout']
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid token")
                
    except httpx.RequestError as e:
        logger.error(f"Token validation failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Auth service unavailable")


async def check_rate_limit(client_ip: str) -> bool:
    """Check rate limit for client IP"""
    
    try:
        key = f"rate_limit:{client_ip}"
        current_requests = redis_client.get(key)
        
        if current_requests is None:
            redis_client.setex(key, 60, 1)  # 1 minute window
            return True
        
        if int(current_requests) >= 1000:  # Global rate limit
            return False
        
        redis_client.incr(key)
        return True
        
    except Exception as e:
        logger.error(f"Rate limit check failed: {str(e)}")
        return True  # Allow request if rate limiting fails


# Service discovery
@app.get("/services")
async def list_services():
    """List all registered services"""
    
    return {
        "services": [
            {
                "name": name,
                "url": config["url"],
                "rate_limit": config["rate_limit"],
                "timeout": config["timeout"]
            }
            for name, config in SERVICES.items()
        ]
    }


@app.get("/services/{service_name}")
async def get_service_info(service_name: str):
    """Get specific service information"""
    
    if service_name not in SERVICES:
        raise HTTPException(status_code=404, detail="Service not found")
    
    config = SERVICES[service_name]
    
    # Get health status
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{config['url']}{config['health_endpoint']}",
                timeout=config['timeout']
            )
            health_status = "healthy" if response.status_code == 200 else "unhealthy"
    except Exception:
        health_status = "unhealthy"
    
    return {
        "name": service_name,
        "url": config["url"],
        "rate_limit": config["rate_limit"],
        "timeout": config["timeout"],
        "health_status": health_status
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

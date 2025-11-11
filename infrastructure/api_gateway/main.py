"""
API Gateway - Microservice Orchestration
FastAPI Gateway with Redis Queues and OpenTelemetry
"""

from fastapi import FastAPI, HTTPException, Depends, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import httpx
import asyncio
import logging
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
import redis
import json
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenTelemetry setup
trace.set_tracer_provider(TracerProvider())
tracer = trace.get_tracer(__name__)

jaeger_exporter = JaegerExporter(
    agent_host_name=os.getenv("JAEGER_AGENT_HOST", "jaeger"),
    agent_port=int(os.getenv("JAEGER_AGENT_PORT", "14268")),
)
span_processor = BatchSpanProcessor(jaeger_exporter)
trace.get_tracer_provider().add_span_processor(span_processor)

# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Number of active connections')
SERVICE_HEALTH = Gauge('service_health', 'Service health status', ['service'])

app = FastAPI(title="Converto API Gateway", version="1.0.0")

# Instrument FastAPI
FastAPIInstrumentor.instrument_app(app)
HTTPXClientInstrumentor().instrument()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
)

# Redis connection
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", "6379")),
    db=0,
    decode_responses=True
)

# Instrument Redis
RedisInstrumentor().instrument()

# Service registry
SERVICES = {
    "vision-ai": {
        "url": "http://vision-ai-service:8001",
        "health_endpoint": "/health",
        "timeout": 30,
        "circuit_breaker": {"failure_threshold": 5, "recovery_timeout": 60}
    },
    "billing": {
        "url": "http://billing-service:8002", 
        "health_endpoint": "/health",
        "timeout": 15,
        "circuit_breaker": {"failure_threshold": 5, "recovery_timeout": 60}
    },
    "ocr": {
        "url": "http://ocr-service:8003",
        "health_endpoint": "/health",
        "timeout": 60,
        "circuit_breaker": {"failure_threshold": 5, "recovery_timeout": 60}
    }
}

# Circuit breaker state
circuit_breakers = {}

@app.middleware("http")
async def gateway_middleware(request: Request, call_next):
    """Gateway middleware with tracing and metrics"""
    
    start_time = time.time()
    span = tracer.start_span(f"{request.method} {request.url.path}")
    
    try:
        # Add trace context to request
        request.state.span = span
        
        # Process request
        response = await call_next(request)
        
        # Record metrics
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        
        REQUEST_DURATION.observe(time.time() - start_time)
        
        return response
        
    except Exception as e:
        # Record error metrics
        REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.url.path,
            status=500
        ).inc()
        
        span.record_exception(e)
        span.set_status(trace.Status(trace.StatusCode.ERROR, str(e)))
        raise
        
    finally:
        span.end()


@app.get("/health")
async def health_check():
    """Gateway health check"""
    
    with tracer.start_as_current_span("health_check") as span:
        span.set_attribute("service", "api-gateway")
        
        # Check Redis connection
        try:
            redis_client.ping()
            redis_healthy = True
        except Exception as e:
            redis_healthy = False
            logger.error(f"Redis health check failed: {str(e)}")
        
        # Check service health
        service_health = {}
        for service_name, config in SERVICES.items():
            try:
                async with httpx.AsyncClient(timeout=config["timeout"]) as client:
                    response = await client.get(f"{config['url']}{config['health_endpoint']}")
                    service_health[service_name] = response.status_code == 200
            except Exception as e:
                service_health[service_name] = False
                logger.error(f"Service {service_name} health check failed: {str(e)}")
        
        return {
            "status": "healthy",
            "service": "api-gateway",
            "timestamp": datetime.utcnow().isoformat(),
            "redis_healthy": redis_healthy,
            "services": service_health
        }


@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest()


@app.get("/services")
async def list_services():
    """List all registered services"""
    
    with tracer.start_as_current_span("list_services") as span:
        span.set_attribute("service_count", len(SERVICES))
        
        services_info = []
        for service_name, config in SERVICES.items():
            service_info = {
                "name": service_name,
                "url": config["url"],
                "timeout": config["timeout"],
                "circuit_breaker": config["circuit_breaker"]
            }
            services_info.append(service_info)
        
        return {"services": services_info}


@app.post("/gateway/proxy/{service_name}/{path:path}")
async def proxy_request(
    service_name: str,
    path: str,
    request: Request,
    background_tasks: BackgroundTasks
):
    """Proxy requests to microservices"""
    
    with tracer.start_as_current_span(f"proxy_{service_name}") as span:
        span.set_attribute("service", service_name)
        span.set_attribute("path", path)
        
        if service_name not in SERVICES:
            raise HTTPException(status_code=404, detail="Service not found")
        
        service_config = SERVICES[service_name]
        
        # Check circuit breaker
        if not _is_circuit_breaker_open(service_name):
            try:
                # Forward request
                async with httpx.AsyncClient(timeout=service_config["timeout"]) as client:
                    # Prepare request data
                    request_data = await request.body()
                    headers = dict(request.headers)
                    
                    # Remove host header to avoid conflicts
                    headers.pop("host", None)
                    
                    # Make request to service
                    response = await client.request(
                        method=request.method,
                        url=f"{service_config['url']}/{path}",
                        content=request_data,
                        headers=headers,
                        params=request.query_params
                    )
                    
                    # Reset circuit breaker on success
                    _reset_circuit_breaker(service_name)
                    
                    span.set_attribute("status_code", response.status_code)
                    span.set_attribute("success", True)
                    
                    return response.json()
                    
            except Exception as e:
                # Record failure in circuit breaker
                _record_circuit_breaker_failure(service_name)
                
                span.record_exception(e)
                span.set_attribute("success", False)
                
                logger.error(f"Proxy request to {service_name} failed: {str(e)}")
                raise HTTPException(status_code=503, detail=f"Service {service_name} unavailable")
        
        else:
            span.set_attribute("circuit_breaker_open", True)
            raise HTTPException(status_code=503, detail=f"Service {service_name} circuit breaker open")


@app.post("/gateway/async/{service_name}/{path:path}")
async def async_proxy_request(
    service_name: str,
    path: str,
    request: Request,
    background_tasks: BackgroundTasks
):
    """Async proxy requests using Redis queues"""
    
    with tracer.start_as_current_span(f"async_proxy_{service_name}") as span:
        span.set_attribute("service", service_name)
        span.set_attribute("path", path)
        
        if service_name not in SERVICES:
            raise HTTPException(status_code=404, detail="Service not found")
        
        # Create async task
        task_id = f"task_{service_name}_{int(time.time())}"
        task_data = {
            "task_id": task_id,
            "service_name": service_name,
            "path": path,
            "method": request.method,
            "headers": dict(request.headers),
            "body": await request.body(),
            "query_params": dict(request.query_params),
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Queue task in Redis
        queue_name = f"{service_name}_queue"
        redis_client.lpush(queue_name, json.dumps(task_data))
        
        span.set_attribute("task_id", task_id)
        span.set_attribute("queue_name", queue_name)
        
        return {
            "task_id": task_id,
            "status": "queued",
            "message": f"Task queued for {service_name} service"
        }


@app.get("/gateway/task/{task_id}/status")
async def get_task_status(task_id: str):
    """Get async task status"""
    
    with tracer.start_as_current_span("get_task_status") as span:
        span.set_attribute("task_id", task_id)
        
        # Get task status from Redis
        task_status = redis_client.get(f"task_status:{task_id}")
        
        if not task_status:
            raise HTTPException(status_code=404, detail="Task not found")
        
        status_data = json.loads(task_status)
        
        span.set_attribute("status", status_data.get("status"))
        
        return status_data


@app.get("/gateway/task/{task_id}/result")
async def get_task_result(task_id: str):
    """Get async task result"""
    
    with tracer.start_as_current_span("get_task_result") as span:
        span.set_attribute("task_id", task_id)
        
        # Get task result from Redis
        task_result = redis_client.get(f"task_result:{task_id}")
        
        if not task_result:
            raise HTTPException(status_code=404, detail="Task result not found")
        
        result_data = json.loads(task_result)
        
        span.set_attribute("success", result_data.get("success", False))
        
        return result_data


@app.post("/gateway/broadcast/{path:path}")
async def broadcast_request(path: str, request: Request):
    """Broadcast request to all services"""
    
    with tracer.start_as_current_span("broadcast_request") as span:
        span.set_attribute("path", path)
        span.set_attribute("service_count", len(SERVICES))
        
        results = {}
        
        # Send request to all services
        for service_name, config in SERVICES.items():
            try:
                async with httpx.AsyncClient(timeout=config["timeout"]) as client:
                    request_data = await request.body()
                    headers = dict(request.headers)
                    headers.pop("host", None)
                    
                    response = await client.request(
                        method=request.method,
                        url=f"{config['url']}/{path}",
                        content=request_data,
                        headers=headers,
                        params=request.query_params
                    )
                    
                    results[service_name] = {
                        "status_code": response.status_code,
                        "data": response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text
                    }
                    
            except Exception as e:
                results[service_name] = {
                    "error": str(e),
                    "status": "failed"
                }
                logger.error(f"Broadcast to {service_name} failed: {str(e)}")
        
        span.set_attribute("successful_services", len([r for r in results.values() if "error" not in r]))
        
        return {
            "broadcast_results": results,
            "timestamp": datetime.utcnow().isoformat()
        }


@app.get("/gateway/load-balance/{service_name}/{path:path}")
async def load_balance_request(service_name: str, path: str, request: Request):
    """Load balanced request to service instances"""
    
    with tracer.start_as_current_span(f"load_balance_{service_name}") as span:
        span.set_attribute("service", service_name)
        span.set_attribute("path", path)
        
        if service_name not in SERVICES:
            raise HTTPException(status_code=404, detail="Service not found")
        
        service_config = SERVICES[service_name]
        
        # Simple round-robin load balancing
        service_instances = await _get_service_instances(service_name)
        if not service_instances:
            raise HTTPException(status_code=503, detail="No service instances available")
        
        # Select instance using round-robin
        instance = _select_instance(service_instances)
        
        try:
            async with httpx.AsyncClient(timeout=service_config["timeout"]) as client:
                request_data = await request.body()
                headers = dict(request.headers)
                headers.pop("host", None)
                
                response = await client.request(
                    method=request.method,
                    url=f"{instance['url']}/{path}",
                    content=request_data,
                    headers=headers,
                    params=request.query_params
                )
                
                span.set_attribute("instance_url", instance['url'])
                span.set_attribute("status_code", response.status_code)
                
                return response.json()
                
        except Exception as e:
            span.record_exception(e)
            logger.error(f"Load balanced request to {service_name} failed: {str(e)}")
            raise HTTPException(status_code=503, detail=f"Service {service_name} unavailable")


# Circuit breaker functions
def _is_circuit_breaker_open(service_name: str) -> bool:
    """Check if circuit breaker is open for service"""
    
    if service_name not in circuit_breakers:
        return False
    
    cb_state = circuit_breakers[service_name]
    failure_threshold = SERVICES[service_name]["circuit_breaker"]["failure_threshold"]
    recovery_timeout = SERVICES[service_name]["circuit_breaker"]["recovery_timeout"]
    
    if cb_state["failure_count"] >= failure_threshold:
        if time.time() - cb_state["last_failure_time"] < recovery_timeout:
            return True
    
    return False


def _record_circuit_breaker_failure(service_name: str):
    """Record failure in circuit breaker"""
    
    if service_name not in circuit_breakers:
        circuit_breakers[service_name] = {
            "failure_count": 0,
            "last_failure_time": 0
        }
    
    circuit_breakers[service_name]["failure_count"] += 1
    circuit_breakers[service_name]["last_failure_time"] = time.time()


def _reset_circuit_breaker(service_name: str):
    """Reset circuit breaker on success"""
    
    if service_name in circuit_breakers:
        circuit_breakers[service_name]["failure_count"] = 0


# Load balancing functions
async def _get_service_instances(service_name: str) -> List[Dict[str, Any]]:
    """Get available service instances"""
    
    # In production, this would query service discovery
    # For now, return mock instances
    return [
        {"url": SERVICES[service_name]["url"], "health": True},
        {"url": SERVICES[service_name]["url"], "health": True}
    ]


def _select_instance(instances: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Select instance using round-robin"""
    
    # Simple round-robin selection
    import random
    x = random.randint(0, len(instances) - 1)
    return instances[x]


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )

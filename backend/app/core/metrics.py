# 📊 Prometheus Metrics - Converto Business OS

from fastapi import Request, Response
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Gauge, Histogram, generate_latest

# Request metrics
REQUEST_COUNT: Counter = Counter(
    "http_requests_total", "Total HTTP requests", ["method", "endpoint", "status_code"]
)

REQUEST_DURATION: Histogram = Histogram(
    "http_request_duration_seconds", "HTTP request duration in seconds", ["method", "endpoint"]
)

# Business metrics
PILOT_SIGNUPS: Counter = Counter("pilot_signups_total", "Total pilot signups")
LEADS_CREATED: Counter = Counter("leads_created_total", "Total leads created")
LEADS_ERRORS: Counter = Counter("leads_errors_total", "Total lead creation errors")

OCR_PROCESSING: Counter = Counter(
    "ocr_processing_total", "Total OCR processing requests", ["status"]
)

API_CALLS: Counter = Counter(
    "api_calls_total", "Total API calls", ["service", "endpoint", "status"]
)

# System metrics
ACTIVE_CONNECTIONS: Gauge = Gauge("active_connections", "Number of active connections")

DATABASE_CONNECTIONS: Gauge = Gauge("database_connections", "Number of database connections")

REDIS_CONNECTIONS: Gauge = Gauge("redis_connections", "Number of Redis connections")

# Error metrics
ERROR_COUNT: Counter = Counter("errors_total", "Total errors", ["error_type", "service"])

# Custom metrics
CUSTOM_METRICS: dict = {}


def get_metrics() -> bytes:
    """Get all metrics in Prometheus format"""
    return generate_latest()


def get_metrics_content_type() -> str:
    """Get content type for metrics endpoint"""
    return CONTENT_TYPE_LATEST


def record_request_metrics(request: Request, response: Response, duration: float) -> None:
    """Record request metrics"""
    method = request.method
    endpoint = request.url.path
    status_code = str(response.status_code)

    REQUEST_COUNT.labels(method=method, endpoint=endpoint, status_code=status_code).inc()
    REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)


def record_pilot_signup() -> None:
    """Record pilot signup"""
    PILOT_SIGNUPS.inc()


def record_lead_created() -> None:
    """Record successful lead creation"""
    LEADS_CREATED.inc()


def record_lead_error() -> None:
    """Record lead creation error"""
    LEADS_ERRORS.inc()


def record_ocr_processing(status: str) -> None:
    """Record OCR processing"""
    OCR_PROCESSING.labels(status=status).inc()


def record_api_call(service: str, endpoint: str, status: str) -> None:
    """Record API call"""
    API_CALLS.labels(service=service, endpoint=endpoint, status=status).inc()


def record_error(error_type: str, service: str) -> None:
    """Record error"""
    ERROR_COUNT.labels(error_type=error_type, service=service).inc()


def set_active_connections(count: int) -> None:
    """Set active connections count"""
    ACTIVE_CONNECTIONS.set(count)


def set_database_connections(count: int) -> None:
    """Set database connections count"""
    DATABASE_CONNECTIONS.set(count)


def set_redis_connections(count: int) -> None:
    """Set Redis connections count"""
    REDIS_CONNECTIONS.set(count)


def create_custom_metric(
    name: str, metric_type: str, description: str, labels: list[str] = None
) -> None:
    """Create custom metric"""
    if metric_type == "counter":
        CUSTOM_METRICS[name] = Counter(name, description, labels or [])
    elif metric_type == "histogram":
        CUSTOM_METRICS[name] = Histogram(name, description, labels or [])
    elif metric_type == "gauge":
        CUSTOM_METRICS[name] = Gauge(name, description, labels or [])
    else:
        raise ValueError(f"Unknown metric type: {metric_type}")


def get_custom_metric(name: str) -> Counter | Histogram | Gauge | None:
    """Get custom metric"""
    return CUSTOM_METRICS.get(name)

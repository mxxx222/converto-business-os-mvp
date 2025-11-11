"""
Celery Application - Async Task Processing
Redis Streams + Celery for OCR and Stripe webhooks
"""

from celery import Celery
from celery.signals import task_prerun, task_postrun, task_failure
import logging
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import redis
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.celery import CeleryInstrumentor
from prometheus_client import Counter, Histogram, Gauge
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
TASK_COUNT = Counter('celery_tasks_total', 'Total Celery tasks', ['task_name', 'status'])
TASK_DURATION = Histogram('celery_task_duration_seconds', 'Celery task duration', ['task_name'])
ACTIVE_TASKS = Gauge('celery_active_tasks', 'Number of active Celery tasks', ['queue'])
QUEUE_LENGTH = Gauge('celery_queue_length', 'Celery queue length', ['queue'])

# Celery app configuration
celery_app = Celery(
    'converto_tasks',
    broker=os.getenv('CELERY_BROKER_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0'),
    include=[
        'infrastructure.async_tasks.ocr_tasks',
        'infrastructure.async_tasks.billing_tasks',
        'infrastructure.async_tasks.notification_tasks'
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_disable_rate_limits=False,
    task_routes={
        'infrastructure.async_tasks.ocr_tasks.*': {'queue': 'ocr_queue'},
        'infrastructure.async_tasks.billing_tasks.*': {'queue': 'billing_queue'},
        'infrastructure.async_tasks.notification_tasks.*': {'queue': 'notification_queue'},
    },
    beat_schedule={
        'cleanup-expired-tasks': {
            'task': 'infrastructure.async_tasks.maintenance_tasks.cleanup_expired_tasks',
            'schedule': 3600.0,  # Every hour
        },
        'health-check': {
            'task': 'infrastructure.async_tasks.maintenance_tasks.health_check',
            'schedule': 60.0,  # Every minute
        },
        'queue-monitoring': {
            'task': 'infrastructure.async_tasks.maintenance_tasks.monitor_queues',
            'schedule': 30.0,  # Every 30 seconds
        },
    }
)

# Instrument Celery
CeleryInstrumentor().instrument_app(celery_app)

# Redis client for additional operations
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", "6379")),
    db=0,
    decode_responses=True
)


@task_prerun.connect
def task_prerun_handler(sender=None, task_id=None, task=None, args=None, kwargs=None, **kwds):
    """Handle task prerun events"""
    
    with tracer.start_as_current_span(f"celery_task_{task.name}") as span:
        span.set_attribute("task_id", task_id)
        span.set_attribute("task_name", task.name)
        span.set_attribute("queue", task.request.delivery_info.get('routing_key', 'unknown'))
        
        # Update metrics
        ACTIVE_TASKS.labels(queue=task.request.delivery_info.get('routing_key', 'unknown')).inc()
        
        # Log task start
        logger.info(f"Starting task {task.name} with ID {task_id}")


@task_postrun.connect
def task_postrun_handler(sender=None, task_id=None, task=None, args=None, kwargs=None, retval=None, state=None, **kwds):
    """Handle task postrun events"""
    
    with tracer.start_as_current_span(f"celery_task_complete_{task.name}") as span:
        span.set_attribute("task_id", task_id)
        span.set_attribute("task_name", task.name)
        span.set_attribute("state", state)
        
        # Update metrics
        TASK_COUNT.labels(task_name=task.name, status=state).inc()
        ACTIVE_TASKS.labels(queue=task.request.delivery_info.get('routing_key', 'unknown')).dec()
        
        # Log task completion
        logger.info(f"Completed task {task.name} with ID {task_id}, state: {state}")


@task_failure.connect
def task_failure_handler(sender=None, task_id=None, exception=None, traceback=None, einfo=None, **kwds):
    """Handle task failure events"""
    
    with tracer.start_as_current_span(f"celery_task_failure_{sender.name}") as span:
        span.set_attribute("task_id", task_id)
        span.set_attribute("task_name", sender.name)
        span.record_exception(exception)
        span.set_status(trace.Status(trace.StatusCode.ERROR, str(exception)))
        
        # Update metrics
        TASK_COUNT.labels(task_name=sender.name, status="FAILURE").inc()
        ACTIVE_TASKS.labels(queue=sender.request.delivery_info.get('routing_key', 'unknown')).dec()
        
        # Log task failure
        logger.error(f"Task {sender.name} with ID {task_id} failed: {exception}")


@celery_app.task(bind=True, name='infrastructure.async_tasks.maintenance_tasks.cleanup_expired_tasks')
def cleanup_expired_tasks(self):
    """Cleanup expired tasks and results"""
    
    with tracer.start_as_current_span("cleanup_expired_tasks") as span:
        try:
            # Cleanup expired task results (older than 24 hours)
            cutoff_time = datetime.utcnow() - timedelta(hours=24)
            
            # Get all task keys
            task_keys = redis_client.keys("celery-task-meta-*")
            cleaned_count = 0
            
            for key in task_keys:
                try:
                    task_data = redis_client.get(key)
                    if task_data:
                        task_info = json.loads(task_data)
                        if task_info.get("status") in ["SUCCESS", "FAILURE"]:
                            # Check if task is older than cutoff
                            task_timestamp = task_info.get("date_done")
                            if task_timestamp:
                                task_time = datetime.fromisoformat(task_timestamp.replace('Z', '+00:00'))
                                if task_time < cutoff_time:
                                    redis_client.delete(key)
                                    cleaned_count += 1
                except Exception as e:
                    logger.warning(f"Failed to process task key {key}: {str(e)}")
                    continue
            
            span.set_attribute("cleaned_tasks", cleaned_count)
            logger.info(f"Cleaned up {cleaned_count} expired tasks")
            
            return {"cleaned_tasks": cleaned_count}
            
        except Exception as e:
            span.record_exception(e)
            logger.error(f"Failed to cleanup expired tasks: {str(e)}")
            raise


@celery_app.task(bind=True, name='infrastructure.async_tasks.maintenance_tasks.health_check')
def health_check(self):
    """Health check task"""
    
    with tracer.start_as_current_span("celery_health_check") as span:
        try:
            # Check Redis connection
            redis_client.ping()
            
            # Check Celery stats
            stats = celery_app.control.inspect().stats()
            
            # Get queue lengths
            queue_lengths = {}
            for queue_name in ['ocr_queue', 'billing_queue', 'notification_queue']:
                queue_length = redis_client.llen(queue_name)
                queue_lengths[queue_name] = queue_length
                QUEUE_LENGTH.labels(queue=queue_name).set(queue_length)
            
            health_status = {
                "timestamp": datetime.utcnow().isoformat(),
                "redis_healthy": True,
                "workers": len(stats) if stats else 0,
                "queue_lengths": queue_lengths,
                "status": "healthy"
            }
            
            span.set_attribute("workers", health_status["workers"])
            span.set_attribute("redis_healthy", health_status["redis_healthy"])
            
            return health_status
            
        except Exception as e:
            span.record_exception(e)
            logger.error(f"Health check failed: {str(e)}")
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "redis_healthy": False,
                "workers": 0,
                "status": "unhealthy",
                "error": str(e)
            }


@celery_app.task(bind=True, name='infrastructure.async_tasks.maintenance_tasks.monitor_queues')
def monitor_queues(self):
    """Monitor queue health and performance"""
    
    with tracer.start_as_current_span("monitor_queues") as span:
        try:
            queue_stats = {}
            
            for queue_name in ['ocr_queue', 'billing_queue', 'notification_queue']:
                queue_length = redis_client.llen(queue_name)
                queue_stats[queue_name] = {
                    "length": queue_length,
                    "status": "healthy" if queue_length < 1000 else "congested"
                }
                
                # Update Prometheus metrics
                QUEUE_LENGTH.labels(queue=queue_name).set(queue_length)
            
            # Check for stuck tasks (tasks running for more than 1 hour)
            active_tasks = celery_app.control.inspect().active()
            stuck_tasks = 0
            
            if active_tasks:
                for worker, tasks in active_tasks.items():
                    for task in tasks:
                        task_start_time = task.get('time_start')
                        if task_start_time:
                            start_time = datetime.fromtimestamp(task_start_time)
                            if datetime.utcnow() - start_time > timedelta(hours=1):
                                stuck_tasks += 1
            
            monitoring_result = {
                "timestamp": datetime.utcnow().isoformat(),
                "queue_stats": queue_stats,
                "stuck_tasks": stuck_tasks,
                "status": "healthy" if stuck_tasks == 0 else "warning"
            }
            
            span.set_attribute("stuck_tasks", stuck_tasks)
            span.set_attribute("queue_count", len(queue_stats))
            
            return monitoring_result
            
        except Exception as e:
            span.record_exception(e)
            logger.error(f"Queue monitoring failed: {str(e)}")
            raise


@celery_app.task(bind=True, name='infrastructure.async_tasks.maintenance_tasks.scale_workers')
def scale_workers(self, queue_name: str, target_workers: int):
    """Scale workers for specific queue"""
    
    with tracer.start_as_current_span("scale_workers") as span:
        span.set_attribute("queue_name", queue_name)
        span.set_attribute("target_workers", target_workers)
        
        try:
            # Get current worker stats
            stats = celery_app.control.inspect().stats()
            current_workers = len(stats) if stats else 0
            
            # In production, this would integrate with container orchestration
            # For now, just log the scaling request
            logger.info(f"Scaling request: {queue_name} queue to {target_workers} workers (current: {current_workers})")
            
            return {
                "queue_name": queue_name,
                "current_workers": current_workers,
                "target_workers": target_workers,
                "scaling_requested": True,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            span.record_exception(e)
            logger.error(f"Worker scaling failed: {str(e)}")
            raise


# Task retry configuration
@celery_app.task(bind=True, autoretry_for=(Exception,), retry_kwargs={'max_retries': 3, 'countdown': 60})
def retryable_task(self, task_data: Dict[str, Any]):
    """Template for retryable tasks"""
    
    with tracer.start_as_current_span("retryable_task") as span:
        span.set_attribute("task_id", self.request.id)
        span.set_attribute("retry_count", self.request.retries)
        
        try:
            # Task implementation here
            logger.info(f"Processing retryable task {self.request.id}")
            
            return {"status": "completed", "task_id": self.request.id}
            
        except Exception as e:
            span.record_exception(e)
            logger.error(f"Retryable task {self.request.id} failed: {str(e)}")
            
            # Retry with exponential backoff
            countdown = 60 * (2 ** self.request.retries)
            raise self.retry(countdown=countdown)


# Task result handlers
@celery_app.task(bind=True)
def on_task_success(self, retval, task_id, args, kwargs):
    """Handle successful task completion"""
    
    with tracer.start_as_current_span("on_task_success") as span:
        span.set_attribute("task_id", task_id)
        
        logger.info(f"Task {task_id} completed successfully")
        
        # Store result in Redis for API Gateway access
        result_key = f"task_result:{task_id}"
        result_data = {
            "task_id": task_id,
            "status": "success",
            "result": retval,
            "completed_at": datetime.utcnow().isoformat()
        }
        
        redis_client.setex(result_key, 3600, json.dumps(result_data))  # Expire in 1 hour


@celery_app.task(bind=True)
def on_task_failure(self, exc, task_id, args, kwargs, einfo):
    """Handle task failure"""
    
    with tracer.start_as_current_span("on_task_failure") as span:
        span.set_attribute("task_id", task_id)
        span.record_exception(exc)
        
        logger.error(f"Task {task_id} failed: {str(exc)}")
        
        # Store failure result in Redis
        result_key = f"task_result:{task_id}"
        result_data = {
            "task_id": task_id,
            "status": "failure",
            "error": str(exc),
            "failed_at": datetime.utcnow().isoformat()
        }
        
        redis_client.setex(result_key, 3600, json.dumps(result_data))  # Expire in 1 hour


if __name__ == '__main__':
    celery_app.start()

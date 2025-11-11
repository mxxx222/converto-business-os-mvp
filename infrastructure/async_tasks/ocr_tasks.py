"""
OCR Celery Tasks
 - Upload image (base64 or URL) to OCR service and extract text
 - Extract structured data (receipt/invoice/specs) from OCR text
 - Orchestrated pipeline task

Notes:
 - Celery is configured to use JSON serializer, so binary payloads should be
   provided as base64-encoded strings when enqueueing tasks.
"""

from __future__ import annotations

import base64
import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, Optional

import httpx
import redis
from celery import states

from .celery_app import celery_app, tracer, TASK_COUNT, TASK_DURATION, ACTIVE_TASKS


logger = logging.getLogger(__name__)


REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)

OCR_SERVICE_URL = os.getenv("OCR_SERVICE_URL", "http://ocr-service:8002")


def _set_task_status(task_id: str, status: str, meta: Optional[Dict[str, Any]] = None) -> None:
    key = f"task_status:{task_id}"
    data = {"task_id": task_id, "status": status, "updated_at": datetime.utcnow().isoformat()}
    if meta:
        data.update(meta)
    redis_client.setex(key, 3600, json.dumps(data))


@celery_app.task(
    bind=True,
    name="infrastructure.async_tasks.ocr_tasks.process_ocr_upload",
    autoretry_for=(Exception,),
    retry_kwargs={"max_retries": 3, "countdown": 30},
)
def process_ocr_upload(
    self,
    image_base64: str,
    filename: str = "upload.jpg",
    content_type: str = "image/jpeg",
    language: str = "fin+eng",
) -> Dict[str, Any]:
    """Upload base64 image to OCR service and extract raw text.

    Params must be JSON-serializable. Image content is base64-encoded.
    """
    task_name = self.name
    ACTIVE_TASKS.labels(queue=self.request.delivery_info.get("routing_key", "unknown")).inc()
    with tracer.start_as_current_span(task_name) as span:
        span.set_attribute("task_id", self.request.id)
        span.set_attribute("language", language)
        _set_task_status(self.request.id, "running", {"step": "upload"})

        try:
            image_bytes = base64.b64decode(image_base64)

            with httpx.Client(timeout=60) as client:
                files = {"file": (filename, image_bytes, content_type)}
                params = {"language": language}
                resp = client.post(f"{OCR_SERVICE_URL}/ocr/upload", files=files, params=params)
                resp.raise_for_status()
                data = resp.json()

            TASK_COUNT.labels(task_name=task_name, status=states.SUCCESS).inc()
            _set_task_status(self.request.id, "completed", {"step": "upload", "result": data})
            return data
        except Exception as e:
            logger.error(f"process_ocr_upload failed: {e}")
            TASK_COUNT.labels(task_name=task_name, status=states.FAILURE).inc()
            _set_task_status(self.request.id, "failed", {"error": str(e)})
            raise
        finally:
            ACTIVE_TASKS.labels(queue=self.request.delivery_info.get("routing_key", "unknown")).dec()


@celery_app.task(
    bind=True,
    name="infrastructure.async_tasks.ocr_tasks.extract_structured_data",
    autoretry_for=(Exception,),
    retry_kwargs={"max_retries": 3, "countdown": 30},
)
def extract_structured_data(
    self,
    ocr_text: str,
    extraction_type: str = "invoice",  # invoice | specs | contact
) -> Dict[str, Any]:
    """Call OCR service to structure OCR text into typed fields."""
    task_name = self.name
    ACTIVE_TASKS.labels(queue=self.request.delivery_info.get("routing_key", "unknown")).inc()
    with tracer.start_as_current_span(task_name) as span:
        span.set_attribute("task_id", self.request.id)
        span.set_attribute("extraction_type", extraction_type)
        _set_task_status(self.request.id, "running", {"step": "extract"})

        try:
            payload = {"text": ocr_text, "extraction_type": extraction_type}
            with httpx.Client(timeout=60) as client:
                resp = client.post(f"{OCR_SERVICE_URL}/ocr/extract-data", json=payload)
                resp.raise_for_status()
                data = resp.json()

            TASK_COUNT.labels(task_name=task_name, status=states.SUCCESS).inc()
            _set_task_status(self.request.id, "completed", {"step": "extract", "result": data})
            return data
        except Exception as e:
            logger.error(f"extract_structured_data failed: {e}")
            TASK_COUNT.labels(task_name=task_name, status=states.FAILURE).inc()
            _set_task_status(self.request.id, "failed", {"error": str(e)})
            raise
        finally:
            ACTIVE_TASKS.labels(queue=self.request.delivery_info.get("routing_key", "unknown")).dec()


@celery_app.task(
    bind=True,
    name="infrastructure.async_tasks.ocr_tasks.process_ocr_pipeline",
    autoretry_for=(Exception,),
    retry_kwargs={"max_retries": 3, "countdown": 45},
)
def process_ocr_pipeline(
    self,
    image_base64: str,
    filename: str = "upload.jpg",
    content_type: str = "image/jpeg",
    language: str = "fin+eng",
    extraction_type: str = "invoice",
) -> Dict[str, Any]:
    """Full OCR pipeline: upload -> extract text -> structure -> return combined result."""
    task_name = self.name
    ACTIVE_TASKS.labels(queue=self.request.delivery_info.get("routing_key", "unknown")).inc()
    with tracer.start_as_current_span(task_name) as span:
        span.set_attribute("task_id", self.request.id)
        span.set_attribute("extraction_type", extraction_type)
        _set_task_status(self.request.id, "running", {"step": "pipeline_start"})

        try:
            # Step 1: OCR upload -> raw text
            upload_result = process_ocr_upload(
                image_base64=image_base64,
                filename=filename,
                content_type=content_type,
                language=language,
            )
            raw_text = upload_result.get("text", "")

            # Step 2: Structured extraction
            structured = extract_structured_data(ocr_text=raw_text, extraction_type=extraction_type)

            result = {
                "raw": upload_result,
                "structured": structured,
                "extraction_type": extraction_type,
                "completed_at": datetime.utcnow().isoformat(),
            }

            TASK_COUNT.labels(task_name=task_name, status=states.SUCCESS).inc()
            _set_task_status(self.request.id, "completed", {"step": "pipeline_complete"})
            # Store final result for API Gateway
            redis_client.setex(f"task_result:{self.request.id}", 3600, json.dumps({"task_id": self.request.id, "success": True, "result": result}))
            return result
        except Exception as e:
            logger.error(f"process_ocr_pipeline failed: {e}")
            TASK_COUNT.labels(task_name=task_name, status=states.FAILURE).inc()
            _set_task_status(self.request.id, "failed", {"error": str(e)})
            # Store failure for API Gateway consumers
            redis_client.setex(
                f"task_result:{self.request.id}",
                3600,
                json.dumps({"task_id": self.request.id, "success": False, "error": str(e)}),
            )
            raise
        finally:
            ACTIVE_TASKS.labels(queue=self.request.delivery_info.get("routing_key", "unknown")).dec()


@celery_app.task(
    bind=True,
    name="infrastructure.async_tasks.ocr_tasks.process_ocr_from_url",
    autoretry_for=(Exception,),
    retry_kwargs={"max_retries": 3, "countdown": 30},
)
def process_ocr_from_url(
    self,
    image_url: str,
    language: str = "fin+eng",
    extraction_type: str = "invoice",
) -> Dict[str, Any]:
    """Download image from URL and run the OCR pipeline."""
    task_name = self.name
    ACTIVE_TASKS.labels(queue=self.request.delivery_info.get("routing_key", "unknown")).inc()
    with tracer.start_as_current_span(task_name) as span:
        span.set_attribute("task_id", self.request.id)
        span.set_attribute("image_url", image_url)
        _set_task_status(self.request.id, "running", {"step": "download"})

        try:
            with httpx.Client(timeout=60) as client:
                r = client.get(image_url)
                r.raise_for_status()
                content_type = r.headers.get("content-type", "image/jpeg")
                filename = image_url.split("/")[-1] or "download.jpg"
                b64 = base64.b64encode(r.content).decode()

            result = process_ocr_pipeline(
                image_base64=b64,
                filename=filename,
                content_type=content_type,
                language=language,
                extraction_type=extraction_type,
            )
            TASK_COUNT.labels(task_name=task_name, status=states.SUCCESS).inc()
            _set_task_status(self.request.id, "completed", {"step": "done"})
            return result
        except Exception as e:
            logger.error(f"process_ocr_from_url failed: {e}")
            TASK_COUNT.labels(task_name=task_name, status=states.FAILURE).inc()
            _set_task_status(self.request.id, "failed", {"error": str(e)})
            raise



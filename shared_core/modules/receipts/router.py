from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
import logging
import asyncio
import httpx

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from ...utils.db import get_session
from ..supabase.client import get_supabase_client
from ..ocr.service import run_ocr_bytes, extract_specs, merge
from ..ocr.vision import vision_enrich
from ..ocr.privacy import blur_faces_and_plates
from ..ai_common.insights import recommend_bundle
from ...utils.storage import sha256
from ..ocr.store import save_result

router = APIRouter(prefix="/api/v1/receipts", tags=["receipts"])


@router.post("/scan")
async def scan_receipt(file: UploadFile = File(...)) -> Dict[str, Any]:
    if not file:
        raise HTTPException(status_code=400, detail="file_required")
    # Minimal mock implementation; integrate OCR pipeline later
    content = await file.read()
    size = len(content)
    receipt_id = f"rcpt_{int(datetime.utcnow().timestamp())}"
    data = {
        "id": receipt_id,
        "vendor": "Tuntematon",
        "total_amount": 0.0,
        "vat_amount": 0.0,
        "vat_rate": 24,
        "net_amount": 0.0,
        "receipt_date": datetime.utcnow().date().isoformat(),
        "invoice_number": None,
        "payment_method": None,
        "currency": "EUR",
        "items": [],
        "category": "other",
        "subcategory": None,
        "tags": [],
        "confidence": 0.5,
        "status": "processed",
    }
    return {
        "success": True,
        "receipt_id": receipt_id,
        "data": data,
        "vision_ai": {
            "model": "mock",
            "processing_time_ms": 0,
            "confidence": 0.0,
        },
        "file_info": {"name": file.filename, "size": size, "content_type": file.content_type},
    }


@router.get("/")
async def list_receipts(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    # Placeholder list endpoint
    return []


@router.get("/stats")
async def receipts_stats() -> Dict[str, Any]:
    return {
        "total_receipts": 0,
        "total_amount": 0.0,
        "total_vat": 0.0,
        "categories": [],
        "average_confidence": 0.0,
    }


# Storage ingest (Supabase webhook)
logger = logging.getLogger("converto.receipts")


class StorageIngestEvent(BaseModel):
    bucket: str
    name: Optional[str] = None
    path: Optional[str] = None
    size: Optional[int] = None
    contentType: Optional[str] = None
    user_id: Optional[str] = None


@router.post("/storage-ingest")
async def storage_ingest(evt: StorageIngestEvent, db=Depends(get_session)):
    """Webhook receiver for Supabase Storage object_created events.

    Placeholder that logs and returns accepted. Extend to fetch a signed URL
    with service role and run OCR pipeline from the object.
    """
    obj_path = evt.name or evt.path or ""
    logger.info(
        "storage_ingest: bucket=%s path=%s size=%s contentType=%s user=%s",
        evt.bucket,
        obj_path,
        evt.size,
        evt.contentType,
        evt.user_id,
    )
    await asyncio.sleep(0)
    # Try to create a signed URL for the object and run OCR
    path = evt.name or evt.path
    if not path:
        return {"ok": True, "received": evt.dict(), "note": "no path in event"}

    supa = get_supabase_client()
    signed = await supa.sign_storage_url(evt.bucket, path)
    if not signed:
        return {"ok": True, "received": evt.dict(), "note": "no signed url (missing service role?)"}

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(signed)
            r.raise_for_status()
            raw = r.content
    except Exception as e:
        logger.warning("failed to fetch signed object: %s", e)
        return {"ok": False, "error": "fetch_failed"}

    safe = blur_faces_and_plates(raw)
    ocr_text = run_ocr_bytes(safe)
    specs = extract_specs(ocr_text)
    vision = None
    if not specs.get("rated_watts"):
        try:
            vision = vision_enrich(safe)
        except Exception:
            vision = None
    data = merge(None, specs, vision)
    hours = 1.0
    wh = int(max(hours, 0.1) * data.get("rated_watts", 0) or 0)
    bundle = recommend_bundle(wh)
    resp = {
        "input_hours": hours,
        "wh": wh,
        "analysis": {**data, "ocr_raw": ocr_text},
        "recommended_bundle": bundle,
    }
    rec = save_result(db, evt.user_id or "default", sha256(raw), resp)
    return {"ok": True, "id": str(rec.id), "bucket": evt.bucket, "path": path}

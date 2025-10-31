from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from datetime import datetime
import csv
import io

from .service import run_ocr_bytes, extract_specs, merge
from .vision import vision_enrich
from .privacy import blur_faces_and_plates
from ..ai_common.insights import recommend_bundle
from ...utils.storage import sha256
from ...utils.db import get_session
from .store import save_result, list_results, get_result
from .models import OcrResult
from ..gamify.service import record_event
from ..p2e.service import mint as p2e_mint


router = APIRouter(prefix="/api/v1/ocr", tags=["ocr"])


@router.post("/power")
async def ocr_power(
    file: UploadFile = File(...),
    device_hint: str | None = Form(None),
    hours: float = Form(1.0),
    tenant_id: str | None = Form(None),
    db=Depends(get_session),
):
    raw = await file.read()
    safe = blur_faces_and_plates(raw)
    ocr_text = run_ocr_bytes(safe)
    specs = extract_specs(ocr_text)
    vision = None
    if not specs.get("rated_watts"):
        vision = vision_enrich(safe)
    data = merge(device_hint, specs, vision)
    if not data.get("rated_watts"):
        raise HTTPException(
            422,
            "Ei löydetty tehoa – lisää laitevihje tai ota uudestaan niin, että tehotarra näkyy.",
        )
    wh = int(max(hours, 0.1) * data["rated_watts"])
    bundle = recommend_bundle(wh)
    resp = {
        "input_hours": hours,
        "wh": wh,
        "analysis": {**data, "ocr_raw": ocr_text},
        "recommended_bundle": bundle,
    }
    rec = save_result(db, tenant_id, sha256(raw), resp)
    try:
        # Gamify points
        record_event(
            db,
            tenant_id=tenant_id,
            kind="ocr.success",
            points=None,
            user_id=None,
            meta={"result_id": str(rec.id)},
            event_id=f"ocr_{rec.id}",
        )
        # P2E tokens
        p2e_mint(db, tenant_id or "default", "user_demo", 5, "ocr_success", ref_id=str(rec.id))
    except Exception:
        pass
    return {"id": str(rec.id), **resp}


@router.get("/results")
def ocr_results(
    tenant_id: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db=Depends(get_session),
):
    rows = list_results(db, tenant_id, limit, offset)
    return [
        {
            "id": str(r.id),
            "tenant_id": r.tenant_id,
            "device_type": r.device_type,
            "brand_model": r.brand_model,
            "rated_watts": r.rated_watts,
            "wh": r.wh,
            "confidence": r.confidence,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


@router.get("/results/{result_id}")
def ocr_result_detail(result_id: str, db=Depends(get_session)):
    r = get_result(db, result_id)
    if not r:
        raise HTTPException(404, "Not found")
    return {
        "id": str(r.id),
        "tenant_id": r.tenant_id,
        "sha256": r.sha256,
        "device_type": r.device_type,
        "brand_model": r.brand_model,
        "rated_watts": r.rated_watts,
        "peak_watts": r.peak_watts,
        "voltage_v": r.voltage_v,
        "current_a": r.current_a,
        "hours_input": r.hours_input,
        "wh": r.wh,
        "confidence": r.confidence,
        "source": r.source,
        "raw_text": r.raw_text,
        "evidence_json": r.evidence_json,
        "created_at": r.created_at.isoformat(),
    }


@router.get("/results.csv")
def ocr_results_csv(
    tenant_id: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    db=Depends(get_session),
):
    q = db.query(OcrResult).order_by(OcrResult.created_at.desc())
    if tenant_id:
        q = q.filter(OcrResult.tenant_id == tenant_id)
    if date_from:
        q = q.filter(OcrResult.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        q = q.filter(OcrResult.created_at < datetime.fromisoformat(date_to))
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(
        [
            "id",
            "tenant_id",
            "created_at",
            "device_type",
            "brand_model",
            "rated_watts",
            "peak_watts",
            "voltage_v",
            "current_a",
            "hours_input",
            "wh",
            "confidence",
        ]
    )
    for r in q.all():
        w.writerow(
            [
                str(r.id),
                r.tenant_id,
                r.created_at.isoformat(),
                r.device_type,
                r.brand_model,
                r.rated_watts,
                r.peak_watts,
                r.voltage_v,
                r.current_a,
                r.hours_input,
                r.wh,
                r.confidence,
            ]
        )
    buf.seek(0)
    return StreamingResponse(
        buf,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="ocr_results.csv"'},
    )

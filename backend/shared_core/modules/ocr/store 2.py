from typing import Optional, Dict
from sqlalchemy.orm import Session
from .models import OcrResult, OcrAudit


def save_result(db: Session, tenant_id: Optional[str], sha: str, payload: Dict) -> OcrResult:
    r = OcrResult(
        tenant_id=tenant_id,
        sha256=sha,
        device_type=payload["analysis"]["device_type"],
        brand_model=payload["analysis"].get("brand_model"),
        rated_watts=payload["analysis"]["rated_watts"],
        peak_watts=payload["analysis"].get("peak_watts"),
        voltage_v=payload["analysis"].get("voltage_v"),
        current_a=payload["analysis"].get("current_a"),
        hours_input=payload["input_hours"],
        wh=payload["wh"],
        confidence=payload["analysis"].get("confidence", 0.6),
        source="merged",
        raw_text=payload.get("analysis", {}).get("ocr_raw"),
        evidence_json=payload.get("analysis", {}).get("evidence"),
    )
    db.add(r)
    db.flush()
    db.add(OcrAudit(ocr_result_id=r.id, event="created", payload_json=payload))
    db.commit()
    db.refresh(r)
    return r


def list_results(db: Session, tenant_id: Optional[str], limit: int = 50, offset: int = 0):
    q = db.query(OcrResult).order_by(OcrResult.created_at.desc())
    if tenant_id:
        q = q.filter(OcrResult.tenant_id == tenant_id)
    return q.offset(offset).limit(limit).all()


def get_result(db: Session, result_id):
    return db.query(OcrResult).get(result_id)

from typing import Optional, Dict, List
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from sqlalchemy import func
from ...utils.db import engine, SessionLocal, Base
from .models import GamifyEvent
import yaml
import os
import hashlib


_tables_ready = False
_weights_cache: Optional[Dict] = None


def ensure_tables_created() -> None:
    global _tables_ready
    if _tables_ready:
        return
    Base.metadata.create_all(bind=engine)
    _tables_ready = True


def load_weights() -> Dict[str, int]:
    global _weights_cache
    if _weights_cache:
        return _weights_cache
    weights_path = os.path.join(os.path.dirname(__file__), "weights.yaml")
    if os.path.exists(weights_path):
        with open(weights_path, "r", encoding="utf-8") as f:
            cfg = yaml.safe_load(f)
            _weights_cache = cfg.get("event_types", {})
    else:
        _weights_cache = {
            "ocr.upload": 10,
            "vat.report.on_time": 20,
            "impact.roi.improve": 25,
            "billing.on_time": 10,
        }
    return _weights_cache


def compute_event_id(
    tenant_id: Optional[str], kind: str, user_id: Optional[str], meta: Optional[Dict]
) -> str:
    """Generate deterministic event_id for idempotency (e.g., webhook deduplication)."""
    base = f"{tenant_id}|{kind}|{user_id}|{meta.get('external_id') if meta else ''}"
    return hashlib.sha256(base.encode()).hexdigest()[:16]


def record_event(
    db: Session,
    tenant_id: Optional[str],
    kind: str,
    points: Optional[int] = None,
    user_id: Optional[str] = None,
    meta: Optional[Dict] = None,
    event_id: Optional[str] = None,
) -> Optional[GamifyEvent]:
    """
    Record a gamification event. Returns None if duplicate (idempotent).
    """
    ensure_tables_created()
    weights = load_weights()
    pts = int(points if points is not None else weights.get(kind, 5))

    # Idempotency check
    eid = event_id or compute_event_id(tenant_id, kind, user_id, meta)
    existing = (
        db.query(GamifyEvent)
        .filter_by(tenant_id=tenant_id, kind=kind, user_id=user_id)
        .filter(
            func.substr(
                GamifyEvent.id.cast(db.bind.dialect.name == "postgresql" and "text" or "varchar"),
                1,
                16,
            )
            == eid[:16]
        )
        .first()
    )
    if existing:
        return None  # duplicate

    ev = GamifyEvent(tenant_id=tenant_id, user_id=user_id, kind=kind, points=pts, meta=meta or {})
    db.add(ev)
    db.commit()
    db.refresh(ev)
    return ev


def compute_streak(
    db: Session, tenant_id: Optional[str], user_id: Optional[str], days: int = 30
) -> int:
    """
    Calculate consecutive days with at least one event, counting backwards from today.
    """
    ensure_tables_created()
    since = datetime.utcnow() - timedelta(days=days)
    q = db.query(func.date(GamifyEvent.created_at).label("d")).filter(
        GamifyEvent.created_at >= since
    )
    if tenant_id:
        q = q.filter(GamifyEvent.tenant_id == tenant_id)
    if user_id:
        q = q.filter(GamifyEvent.user_id == user_id)
    q = q.group_by(func.date(GamifyEvent.created_at)).order_by(
        func.date(GamifyEvent.created_at).desc()
    )
    active_dates = [r.d for r in q.all()]

    if not active_dates:
        return 0

    streak = 0
    today = date.today()
    for i in range(days):
        check_date = today - timedelta(days=i)
        if check_date in active_dates:
            streak += 1
        else:
            break
    return streak


def summary_since(
    db: Session, tenant_id: Optional[str], user_id: Optional[str] = None, days: int = 7
) -> Dict:
    ensure_tables_created()
    since = datetime.utcnow() - timedelta(days=days - 1)
    since = since.replace(hour=0, minute=0, second=0, microsecond=0)

    q = db.query(
        func.date_trunc("day", GamifyEvent.created_at).label("d"),
        func.sum(GamifyEvent.points).label("p"),
    ).filter(GamifyEvent.created_at >= since)
    if tenant_id:
        q = q.filter(GamifyEvent.tenant_id == tenant_id)
    if user_id:
        q = q.filter(GamifyEvent.user_id == user_id)
    q = q.group_by(func.date_trunc("day", GamifyEvent.created_at)).order_by(
        func.date_trunc("day", GamifyEvent.created_at)
    )
    rows = q.all()

    # Build 7-day buckets
    buckets = [0] * days
    today = date.today()
    for r in rows:
        day_offset = (r.d.date() - (today - timedelta(days=days - 1))).days
        if 0 <= day_offset < days:
            buckets[day_offset] = int(r.p or 0)

    total = sum(buckets)
    streak = compute_streak(db, tenant_id, user_id, days=30)

    # Streak bonus (every 7 consecutive days → +5p bonus shown)
    streak_bonus = (streak // 7) * 5

    return {
        "days": days,
        "total": total,
        "series": buckets,
        "streak_days": streak,
        "streak_bonus": streak_bonus,
    }

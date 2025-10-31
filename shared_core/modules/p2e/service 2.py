from typing import Optional, Tuple, Dict
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from .models import P2EWallet, P2ETokenLedger, P2EQuest
from ...utils.db import Base, engine
import os

MAX_MINT_PER_DAY = int(os.getenv("P2E_DAILY_MINT_LIMIT", "500"))
MAX_REDEEM_PER_DAY = int(os.getenv("P2E_DAILY_REDEEM_LIMIT", "500"))

_tables_ready = False


def ensure_tables_created() -> None:
    global _tables_ready
    if _tables_ready:
        return
    Base.metadata.create_all(bind=engine)
    _tables_ready = True


def _today_window():
    now = datetime.utcnow()
    start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    return start, now


def _sum_today(db: Session, tenant_id: str, user_id: str, positive: bool = True) -> int:
    start, now = _today_window()
    q = db.query(func.sum(P2ETokenLedger.delta)).filter(
        P2ETokenLedger.tenant_id == tenant_id,
        P2ETokenLedger.user_id == user_id,
        P2ETokenLedger.created_at >= start,
    )
    if positive:
        q = q.filter(P2ETokenLedger.delta > 0)
    else:
        q = q.filter(P2ETokenLedger.delta < 0)
    total = q.scalar() or 0
    return abs(int(total))


def get_balance(db: Session, tenant_id: str, user_id: str) -> int:
    ensure_tables_created()
    wallet = db.query(P2EWallet).filter_by(tenant_id=tenant_id, user_id=user_id).first()
    return wallet.balance if wallet else 0


def _ensure_wallet(db: Session, tenant_id: str, user_id: str) -> P2EWallet:
    wallet = db.query(P2EWallet).filter_by(tenant_id=tenant_id, user_id=user_id).first()
    if not wallet:
        wallet = P2EWallet(tenant_id=tenant_id, user_id=user_id, balance=0)
        db.add(wallet)
        db.flush()
    return wallet


def mint(
    db: Session,
    tenant_id: str,
    user_id: str,
    amount: int,
    reason: str,
    ref_id: Optional[str] = None,
) -> Tuple[bool, Dict]:
    """Mint tokens. Returns (success, data/error)."""
    ensure_tables_created()
    if amount <= 0:
        return False, {"error": "amount must be positive"}

    # Check daily limit
    today_minted = _sum_today(db, tenant_id, user_id, positive=True)
    if today_minted + amount > MAX_MINT_PER_DAY:
        return False, {"error": "mint_limit_reached", "limit": MAX_MINT_PER_DAY}

    wallet = _ensure_wallet(db, tenant_id, user_id)
    wallet.balance += amount

    ledger_entry = P2ETokenLedger(
        tenant_id=tenant_id, user_id=user_id, delta=amount, reason=reason, ref_id=ref_id
    )
    db.add(ledger_entry)
    db.commit()
    db.refresh(wallet)

    return True, {"balance": wallet.balance, "delta": amount}


def burn(
    db: Session,
    tenant_id: str,
    user_id: str,
    amount: int,
    reason: str,
    ref_id: Optional[str] = None,
) -> Tuple[bool, Dict]:
    """Burn tokens. Returns (success, data/error)."""
    ensure_tables_created()
    if amount <= 0:
        return False, {"error": "amount must be positive"}

    # Check daily limit
    today_burned = _sum_today(db, tenant_id, user_id, positive=False)
    if today_burned + amount > MAX_REDEEM_PER_DAY:
        return False, {"error": "redeem_limit_reached", "limit": MAX_REDEEM_PER_DAY}

    wallet = _ensure_wallet(db, tenant_id, user_id)
    if wallet.balance < amount:
        return False, {
            "error": "insufficient_balance",
            "balance": wallet.balance,
            "requested": amount,
        }

    wallet.balance -= amount

    ledger_entry = P2ETokenLedger(
        tenant_id=tenant_id, user_id=user_id, delta=-amount, reason=reason, ref_id=ref_id
    )
    db.add(ledger_entry)
    db.commit()
    db.refresh(wallet)

    return True, {"balance": wallet.balance, "delta": -amount}


def list_quests(db: Session, tenant_id: str):
    ensure_tables_created()
    quests = db.query(P2EQuest).filter_by(tenant_id=tenant_id, active=1).all()
    return [
        {
            "id": str(q.id),
            "code": q.code,
            "title": q.title,
            "desc": q.desc,
            "reward": q.reward,
            "period": q.period,
        }
        for q in quests
    ]

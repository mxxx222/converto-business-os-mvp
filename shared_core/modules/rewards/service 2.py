from typing import Tuple, Dict, List
from sqlalchemy.orm import Session
from .models import RewardCatalogItem, RedemptionRecord
from ..p2e.service import get_balance, burn
from ...utils.db import Base, engine


_tables_ready = False


def ensure_tables_created() -> None:
    global _tables_ready
    if _tables_ready:
        return
    Base.metadata.create_all(bind=engine)
    _tables_ready = True


def list_rewards(db: Session, tenant_id: str) -> List[Dict]:
    """List available rewards with stock > 0."""
    ensure_tables_created()
    rewards = (
        db.query(RewardCatalogItem)
        .filter_by(tenant_id=tenant_id)
        .filter(RewardCatalogItem.stock > 0)
        .all()
    )
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "desc": r.desc,
            "sponsor": r.sponsor,
            "points_cost": r.points_cost,
            "stock": r.stock,
            "terms_url": r.terms_url,
        }
        for r in rewards
    ]


def redeem_reward(db: Session, tenant_id: str, user_id: str, reward_id: str) -> Tuple[bool, Dict]:
    """
    Redeem a reward: check balance, burn tokens, decrement stock, record redemption.
    """
    ensure_tables_created()

    # Find reward
    reward = db.query(RewardCatalogItem).filter_by(id=reward_id, tenant_id=tenant_id).first()
    if not reward:
        return False, {"error": "reward_not_found"}

    if reward.stock <= 0:
        return False, {"error": "out_of_stock"}

    # Check user balance
    balance = get_balance(db, tenant_id, user_id)
    if balance < reward.points_cost:
        return False, {
            "error": "insufficient_balance",
            "balance": balance,
            "required": reward.points_cost,
        }

    # Burn tokens
    ok, burn_data = burn(
        db,
        tenant_id,
        user_id,
        reward.points_cost,
        reason=f"redeem:{reward.name}",
        ref_id=str(reward.id),
    )
    if not ok:
        return False, burn_data

    # Decrement stock
    reward.stock -= 1

    # Record redemption
    redemption = RedemptionRecord(
        tenant_id=tenant_id,
        user_id=user_id,
        reward_id=reward.id,
        reward_name=reward.name,
        points_spent=reward.points_cost,
        status="pending",
    )
    db.add(redemption)
    db.commit()
    db.refresh(redemption)

    return True, {
        "message": f"Lunastettu: {reward.name}",
        "redemption_id": str(redemption.id),
        "cost": reward.points_cost,
        "new_balance": burn_data.get("balance", 0),
    }


def list_redemptions(db: Session, tenant_id: str, user_id: str) -> List[Dict]:
    """List user's redemption history."""
    ensure_tables_created()
    redemptions = (
        db.query(RedemptionRecord)
        .filter_by(tenant_id=tenant_id, user_id=user_id)
        .order_by(RedemptionRecord.created_at.desc())
        .limit(50)
        .all()
    )
    return [
        {
            "id": str(r.id),
            "reward_name": r.reward_name,
            "points_spent": r.points_spent,
            "status": r.status,
            "created_at": r.created_at.isoformat(),
        }
        for r in redemptions
    ]

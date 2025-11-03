"""Audit log API endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from shared_core.utils.db import get_db
from shared_core.models.audit import AuditLog

router = APIRouter(prefix='/api/audit', tags=['audit'])


@router.get('/logs')
async def get_audit_logs(
    skip: int = Query(0),
    limit: int = Query(50),
    action: str | None = Query(None),
    session: Session = Depends(get_db),
):
    """Get audit logs for team."""
    query = session.query(AuditLog).order_by(AuditLog.created_at.desc())

    if action:
        query = query.filter(AuditLog.action == action)

    total = query.count()
    logs = query.offset(skip).limit(limit).all()

    return {
        'logs': [
            {
                'id': log.id,
                'action': log.action,
                'actor': log.actor_id,
                'resource': log.resource_type,
                'resource_id': log.resource_id,
                'changes': log.changes,
                'ip_address': log.ip_address,
                'user_agent': log.user_agent,
                'created_at': log.created_at.isoformat() if log.created_at else None,
            }
            for log in logs
        ],
        'total': total,
        'skip': skip,
        'limit': limit,
    }


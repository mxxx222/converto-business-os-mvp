"""Audit log models for tracking all changes."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Column, String, DateTime, JSON

from shared_core.utils.db import Base


class AuditLog(Base):
    """Audit log entry."""

    __tablename__ = 'audit_logs'

    id = Column(String, primary_key=True)
    team_id = Column(String)
    actor_id = Column(String)
    action = Column(String)
    resource_type = Column(String)
    resource_id = Column(String)
    changes = Column(JSON)
    ip_address = Column(String)
    user_agent = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)


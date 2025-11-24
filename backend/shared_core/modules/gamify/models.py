import uuid

from sqlalchemy import JSON, Column, DateTime, Integer, String
from sqlalchemy.sql import func

from ...utils.db import Base


class GamifyEvent(Base):
    __tablename__ = "gamify_events"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(64), index=True, nullable=True)
    user_id = Column(String(64), index=True, nullable=True)
    kind = Column(String(64), index=True, nullable=False)
    points = Column(Integer, nullable=False, default=0)
    meta = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

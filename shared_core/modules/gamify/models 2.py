from sqlalchemy import Column, String, Integer, JSON, DateTime
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ...utils.db import Base


class GamifyEvent(Base):
    __tablename__ = "gamify_events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String(64), index=True, nullable=True)
    user_id = Column(String(64), index=True, nullable=True)
    kind = Column(String(64), index=True, nullable=False)
    points = Column(Integer, nullable=False, default=0)
    meta = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

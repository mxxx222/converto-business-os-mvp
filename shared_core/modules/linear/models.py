from sqlalchemy import Column, String, Text, DateTime, Boolean, JSON, Integer
from sqlalchemy.sql import func
import uuid
from ...utils.db import Base


class LinearIssue(Base):
    __tablename__ = "linear_issues"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    linear_id = Column(String(64), nullable=False, unique=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    state = Column(String(32), nullable=False, index=True)  # backlog, in-progress, done, etc.
    priority = Column(Integer, nullable=True, index=True)  # 1-4
    team_id = Column(String(64), nullable=True, index=True)
    assignee_id = Column(String(64), nullable=True, index=True)
    labels = Column(JSON, nullable=True)
    url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    last_synced = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

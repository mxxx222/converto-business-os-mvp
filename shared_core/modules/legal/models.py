from sqlalchemy import Column, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
import uuid
from ...utils.db import Base


class LegalRule(Base):
    __tablename__ = "legal_rules"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(64), nullable=False, index=True)  # tax, employment, gdpr, etc.
    country = Column(String(2), nullable=False, index=True)  # ISO country code
    source_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    effective_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

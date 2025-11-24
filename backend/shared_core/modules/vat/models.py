from sqlalchemy import Column, String, Float, Date, Boolean, Text, DateTime
from sqlalchemy.sql import func
import uuid
from ...utils.db import Base


class VATRate(Base):
    __tablename__ = "vat_rates"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    country = Column(String(2), nullable=False, index=True)  # ISO country code
    rate_key = Column(String(32), nullable=False, index=True)  # standard, reduced1, reduced2, zero, exempt
    rate_pct = Column(Float, nullable=False)
    valid_from = Column(Date, nullable=False, index=True)
    valid_to = Column(Date, nullable=True, index=True)
    source_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

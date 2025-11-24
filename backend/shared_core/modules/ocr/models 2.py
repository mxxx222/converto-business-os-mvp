from sqlalchemy import Column, String, Integer, Float, JSON, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ...utils.db import Base


class OcrResult(Base):
    __tablename__ = "ocr_results"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String(64), index=True, nullable=True)
    sha256 = Column(String(64), index=True)
    device_type = Column(String(128))
    brand_model = Column(String(256))
    rated_watts = Column(Integer)
    peak_watts = Column(Integer)
    voltage_v = Column(Integer)
    current_a = Column(Float)
    hours_input = Column(Float)
    wh = Column(Integer)
    confidence = Column(Float)
    source = Column(String(16))
    raw_text = Column(Text)
    evidence_json = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class OcrAudit(Base):
    __tablename__ = "ocr_audit"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ocr_result_id = Column(UUID(as_uuid=True), index=True)
    event = Column(String(64))
    payload_json = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

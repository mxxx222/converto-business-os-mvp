"""Database models for the OCR module."""

from __future__ import annotations

import uuid
from typing import Callable

from sqlalchemy import Column, DateTime, Float, Integer, JSON, String, Text
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from ...utils.db import Base, engine


def _uuid_factory(use_native: bool) -> Callable[[], object]:
    def _factory() -> object:
        value = uuid.uuid4()
        return value if use_native else str(value)

    return _factory


USE_NATIVE_UUID = engine.url.get_backend_name().startswith("postgres")
UUID_TYPE = PG_UUID(as_uuid=True) if USE_NATIVE_UUID else String(36)
UUID_DEFAULT = _uuid_factory(USE_NATIVE_UUID)


class OcrResult(Base):
    __tablename__ = "ocr_results"

    id = Column(UUID_TYPE, primary_key=True, default=UUID_DEFAULT)
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

    id = Column(UUID_TYPE, primary_key=True, default=UUID_DEFAULT)
    ocr_result_id = Column(UUID_TYPE, index=True)
    event = Column(String(64))
    payload_json = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

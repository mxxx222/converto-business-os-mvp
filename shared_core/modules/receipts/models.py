"""Database models for receipts and invoices."""

from __future__ import annotations

import uuid
from typing import Callable

from sqlalchemy import Column, DateTime, Float, Integer, JSON, String, Text, Boolean, Date
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from shared_core.utils.db import Base, engine


def _uuid_factory(use_native: bool) -> Callable[[], object]:
    def _factory() -> object:
        value = uuid.uuid4()
        return value if use_native else str(value)
    return _factory


USE_NATIVE_UUID = engine.url.get_backend_name().startswith("postgres")
UUID_TYPE = PG_UUID(as_uuid=True) if USE_NATIVE_UUID else String(36)
UUID_DEFAULT = _uuid_factory(USE_NATIVE_UUID)


class Receipt(Base):
    """Kuittien tietomalli"""
    __tablename__ = "receipts"

    id = Column(UUID_TYPE, primary_key=True, default=UUID_DEFAULT)
    tenant_id = Column(String(64), index=True, nullable=True)
    
    # Perustiedot
    vendor = Column(String(255), nullable=False, index=True)
    total_amount = Column(Float, nullable=False)
    vat_amount = Column(Float, nullable=True)
    vat_rate = Column(Float, nullable=True)
    net_amount = Column(Float, nullable=True)
    
    # Päivämäärät
    receipt_date = Column(Date, nullable=False, index=True)
    processed_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Dokumenttitiedot
    invoice_number = Column(String(128), nullable=True, index=True)
    payment_method = Column(String(64), nullable=True)
    currency = Column(String(3), default="EUR")
    
    # Tuotteet/palvelut
    items = Column(JSON, nullable=True)  # Array of items
    
    # Vision AI tiedot
    confidence = Column(Float, nullable=False, default=0.0)
    vision_ai_model = Column(String(64), default="gpt-4o-mini")
    processing_time_ms = Column(Integer, nullable=True)
    
    # Kategorisointi
    category = Column(String(64), nullable=True, index=True)
    subcategory = Column(String(64), nullable=True)
    tags = Column(JSON, nullable=True)  # Array of tags
    
    # Tila
    status = Column(String(32), default="processed", index=True)  # processed, reviewed, approved, rejected
    is_deductible = Column(Boolean, default=True)
    is_reimbursable = Column(Boolean, default=False)
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(String(64), nullable=True)
    reviewed_by = Column(String(64), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)


class Invoice(Base):
    """Laskujen tietomalli"""
    __tablename__ = "invoices"

    id = Column(UUID_TYPE, primary_key=True, default=UUID_DEFAULT)
    tenant_id = Column(String(64), index=True, nullable=True)
    
    # Perustiedot
    vendor = Column(String(255), nullable=False, index=True)
    customer = Column(String(255), nullable=True, index=True)
    total_amount = Column(Float, nullable=False)
    vat_amount = Column(Float, nullable=True)
    vat_rate = Column(Float, nullable=True)
    net_amount = Column(Float, nullable=True)
    
    # Päivämäärät
    invoice_date = Column(Date, nullable=False, index=True)
    due_date = Column(Date, nullable=True, index=True)
    processed_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Dokumenttitiedot
    invoice_number = Column(String(128), nullable=False, index=True)
    reference_number = Column(String(128), nullable=True)
    payment_terms = Column(String(128), nullable=True)
    currency = Column(String(3), default="EUR")
    
    # Tuotteet/palvelut
    items = Column(JSON, nullable=True)  # Array of items
    
    # Vision AI tiedot
    confidence = Column(Float, nullable=False, default=0.0)
    vision_ai_model = Column(String(64), default="gpt-4o-mini")
    processing_time_ms = Column(Integer, nullable=True)
    
    # Kategorisointi
    category = Column(String(64), nullable=True, index=True)
    subcategory = Column(String(64), nullable=True)
    tags = Column(JSON, nullable=True)  # Array of tags
    
    # Maksu
    payment_status = Column(String(32), default="pending", index=True)  # pending, paid, overdue, cancelled
    payment_date = Column(Date, nullable=True)
    payment_method = Column(String(64), nullable=True)
    payment_reference = Column(String(128), nullable=True)
    
    # Tila
    status = Column(String(32), default="processed", index=True)  # processed, reviewed, approved, rejected
    is_deductible = Column(Boolean, default=True)
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_by = Column(String(64), nullable=True)
    reviewed_by = Column(String(64), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)


class ReceiptItem(Base):
    """Kuittien tuotteet"""
    __tablename__ = "receipt_items"

    id = Column(UUID_TYPE, primary_key=True, default=UUID_DEFAULT)
    receipt_id = Column(UUID_TYPE, nullable=False, index=True)
    tenant_id = Column(String(64), index=True, nullable=True)
    
    # Tuotetiedot
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(Float, nullable=False, default=1.0)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Verotiedot
    vat_rate = Column(Float, nullable=True)
    vat_amount = Column(Float, nullable=True)
    
    # Kategorisointi
    category = Column(String(64), nullable=True, index=True)
    subcategory = Column(String(64), nullable=True)
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class InvoiceItem(Base):
    """Laskujen tuotteet"""
    __tablename__ = "invoice_items"

    id = Column(UUID_TYPE, primary_key=True, default=UUID_DEFAULT)
    invoice_id = Column(UUID_TYPE, nullable=False, index=True)
    tenant_id = Column(String(64), index=True, nullable=True)
    
    # Tuotetiedot
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    quantity = Column(Float, nullable=False, default=1.0)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    
    # Verotiedot
    vat_rate = Column(Float, nullable=True)
    vat_amount = Column(Float, nullable=True)
    
    # Kategorisointi
    category = Column(String(64), nullable=True, index=True)
    subcategory = Column(String(64), nullable=True)
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DocumentAudit(Base):
    """Dokumenttien audit log"""
    __tablename__ = "document_audit"

    id = Column(UUID_TYPE, primary_key=True, default=UUID_DEFAULT)
    document_id = Column(UUID_TYPE, nullable=False, index=True)
    document_type = Column(String(32), nullable=False, index=True)  # receipt, invoice
    tenant_id = Column(String(64), index=True, nullable=True)
    
    # Tapahtuma
    event = Column(String(64), nullable=False, index=True)  # created, updated, reviewed, approved, rejected
    payload = Column(JSON, nullable=True)
    
    # Käyttäjä
    user_id = Column(String(64), nullable=True, index=True)
    user_name = Column(String(255), nullable=True)
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())

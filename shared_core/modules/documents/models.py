from sqlalchemy import Column, String, DateTime, Float, Integer, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped
from sqlalchemy.sql import func
from typing import Optional, Dict, Any
import uuid

from ...utils.db import Base


class Document(Base):
    """General document model for all document types"""
    __tablename__ = "documents"

    id: Mapped[str] = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id: Mapped[str] = Column(String(128), nullable=False, index=True)
    
    # File information
    file_name: Mapped[str] = Column(String(255), nullable=False)
    storage_path: Mapped[str] = Column(String(512), nullable=False)
    content_type: Mapped[Optional[str]] = Column(String(64))
    file_size: Mapped[Optional[int]] = Column(Integer)
    
    # Document classification
    document_type: Mapped[str] = Column(String(64), nullable=False, default="unknown")  # receipt, invoice, contract, etc.
    status: Mapped[str] = Column(String(32), nullable=False, default="pending")  # pending, processing, processed, error, approved, rejected
    
    # OCR and processing results
    ocr_confidence: Mapped[Optional[float]] = Column(Float)
    extracted_data: Mapped[Optional[Dict[str, Any]]] = Column(JSON)
    raw_ocr_text: Mapped[Optional[str]] = Column(Text)
    
    # Financial data (for receipts/invoices)
    vendor: Mapped[Optional[str]] = Column(String(255))
    total_amount: Mapped[Optional[float]] = Column(Float)
    vat_amount: Mapped[Optional[float]] = Column(Float)
    vat_rate: Mapped[Optional[float]] = Column(Float)
    currency: Mapped[str] = Column(String(3), default="EUR")
    
    # Dates
    document_date: Mapped[Optional[DateTime]] = Column(DateTime)
    due_date: Mapped[Optional[DateTime]] = Column(DateTime)
    processed_at: Mapped[Optional[DateTime]] = Column(DateTime)
    
    # Timestamps
    created_at: Mapped[DateTime] = Column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    processing_logs: Mapped[list["DocumentProcessingLog"]] = relationship(
        "DocumentProcessingLog", back_populates="document", cascade="all, delete-orphan"
    )


class DocumentProcessingLog(Base):
    """Log of document processing steps and errors"""
    __tablename__ = "document_processing_logs"

    id: Mapped[str] = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id: Mapped[str] = Column(UUID(as_uuid=False), ForeignKey("documents.id"), nullable=False)
    
    # Processing step information
    step: Mapped[str] = Column(String(64), nullable=False)  # upload, ocr, validation, approval, etc.
    status: Mapped[str] = Column(String(32), nullable=False)  # started, completed, failed
    
    # Results and errors
    result_data: Mapped[Optional[Dict[str, Any]]] = Column(JSON)
    error_message: Mapped[Optional[str]] = Column(Text)
    processing_time_ms: Mapped[Optional[int]] = Column(Integer)
    
    # Metadata
    processor: Mapped[Optional[str]] = Column(String(64))  # tesseract, openai_vision, manual, etc.
    confidence: Mapped[Optional[float]] = Column(Float)
    
    # Timestamp
    created_at: Mapped[DateTime] = Column(DateTime, server_default=func.now())
    
    # Relationships
    document: Mapped["Document"] = relationship("Document", back_populates="processing_logs")

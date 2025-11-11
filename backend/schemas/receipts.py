"""Pydantic schemas for receipt CRUD handlers."""

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class OcrResultOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    receipt_id: uuid.UUID
    tenant_id: str
    status: str
    raw_text: Optional[str] = None
    data: Optional[dict[str, Any]] = None
    confidence: Optional[Decimal] = None
    metadata: Optional[dict[str, Any]] = Field(default=None, validation_alias="meta")
    created_at: datetime
    updated_at: datetime


class ReceiptBase(BaseModel):
    external_id: Optional[str] = Field(default=None, max_length=128)
    file_name: str = Field(..., max_length=255)
    storage_path: str = Field(..., max_length=512)
    content_type: Optional[str] = Field(default=None, max_length=64)
    total_amount: Optional[Decimal] = Field(default=None)
    currency: Optional[str] = Field(default="EUR", max_length=3)
    status: Optional[str] = Field(default="pending", max_length=32)
    issued_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None

    @field_validator("currency")
    @classmethod
    def _uppercase_currency(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        return value.upper()


class ReceiptCreate(ReceiptBase):
    pass


class ReceiptUpdate(BaseModel):
    external_id: Optional[str] = Field(default=None, max_length=128)
    file_name: Optional[str] = Field(default=None, max_length=255)
    storage_path: Optional[str] = Field(default=None, max_length=512)
    content_type: Optional[str] = Field(default=None, max_length=64)
    total_amount: Optional[Decimal] = None
    currency: Optional[str] = Field(default=None, max_length=3)
    status: Optional[str] = Field(default=None, max_length=32)
    issued_at: Optional[datetime] = None
    processed_at: Optional[datetime] = None

    @field_validator("currency")
    @classmethod
    def _uppercase_currency(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        return value.upper()


class ReceiptOut(ReceiptBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tenant_id: str
    created_at: datetime
    updated_at: datetime
    ocr_result: Optional[OcrResultOut] = None

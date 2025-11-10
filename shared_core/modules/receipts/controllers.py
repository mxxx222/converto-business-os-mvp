"""Tenant-scoped CRUD helpers for receipt persistence."""

from __future__ import annotations

import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.orm import Session, selectinload

from .models import Receipt, ReceiptOcrResult, USE_NATIVE_UUID


RECEIPT_MUTABLE_FIELDS = {
    "external_id",
    "file_name",
    "storage_path",
    "content_type",
    "total_amount",
    "currency",
    "status",
    "issued_at",
    "processed_at",
}

OCR_MUTABLE_FIELDS = {
    "status",
    "raw_text",
    "data",
    "confidence",
    "metadata",
}


def _normalize_key(value: uuid.UUID | str) -> object:
    if isinstance(value, uuid.UUID) and not USE_NATIVE_UUID:
        return str(value)
    return value


def _receipt_query() -> Select[tuple[Receipt]]:
    return select(Receipt).options(selectinload(Receipt.ocr_result))


def list_receipts(
    db: Session,
    tenant_id: str,
    *,
    limit: int = 50,
    cursor: Optional[uuid.UUID] = None,
) -> list[Receipt]:
    if limit <= 0:
        limit = 50

    stmt = _receipt_query().where(Receipt.tenant_id == tenant_id)

    if cursor:
        anchor = db.get(Receipt, _normalize_key(cursor))
        if anchor is None or anchor.tenant_id != tenant_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="receipt_not_found")
        stmt = stmt.where(Receipt.created_at < anchor.created_at)

    stmt = stmt.order_by(Receipt.created_at.desc(), Receipt.id.desc()).limit(limit)
    return db.scalars(stmt).all()


def get_receipt(db: Session, tenant_id: str, receipt_id: uuid.UUID | str) -> Receipt:
    receipt = db.scalar(
        _receipt_query().where(
            Receipt.id == _normalize_key(receipt_id),
            Receipt.tenant_id == tenant_id,
        )
    )
    if receipt is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="receipt_not_found")
    return receipt


def create_receipt(db: Session, tenant_id: str, data: dict[str, object]) -> Receipt:
    filtered = {k: v for k, v in data.items() if k in RECEIPT_MUTABLE_FIELDS}
    currency = filtered.get("currency")
    if currency is not None:
        filtered["currency"] = str(currency).upper()
    receipt = Receipt(tenant_id=tenant_id, **filtered)
    db.add(receipt)
    db.commit()
    db.refresh(receipt)
    return receipt


def update_receipt(
    db: Session,
    tenant_id: str,
    receipt_id: uuid.UUID,
    updates: dict[str, object],
) -> Receipt:
    receipt = get_receipt(db, tenant_id, receipt_id)

    for key, value in updates.items():
        if key not in RECEIPT_MUTABLE_FIELDS:
            continue
        if key == "currency" and value is not None:
            value = str(value).upper()
        setattr(receipt, key, value)

    db.add(receipt)
    db.commit()
    db.refresh(receipt)
    return receipt


def delete_receipt(db: Session, tenant_id: str, receipt_id: uuid.UUID | str) -> None:
    receipt = get_receipt(db, tenant_id, receipt_id)
    db.delete(receipt)
    db.commit()


def upsert_ocr_result(
    db: Session,
    tenant_id: str,
    receipt_id: uuid.UUID,
    payload: dict[str, object],
) -> ReceiptOcrResult:
    receipt = get_receipt(db, tenant_id, receipt_id)

    result = receipt.ocr_result
    if result is None:
        result = ReceiptOcrResult(receipt_id=receipt.id, tenant_id=tenant_id)
        db.add(result)

    for key, value in payload.items():
        if key in OCR_MUTABLE_FIELDS:
            setattr(result, key, value)

    db.commit()
    db.refresh(result)
    return result

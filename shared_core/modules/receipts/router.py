"""FastAPI router for receipts and invoices."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.orm import Session

from ...utils.db import get_session
from ..gamify.service import record_event
from ..p2e.service import mint as p2e_mint
from .models import DocumentAudit, Invoice, InvoiceItem, Receipt, ReceiptItem
from .vision_service import categorize_invoice, categorize_receipt, process_invoice, process_receipt

router = APIRouter(prefix="/api/v1/receipts", tags=["receipts"])
logger = logging.getLogger("converto.receipts")


@router.post("/scan")
async def scan_receipt(
    file: UploadFile = File(...),
    tenant_id: str = Query(None),
    user_id: str = Query(None),
    db: Session = Depends(get_session),
):
    """Skannaa kuitti Vision AI:lla"""
    try:
        # Lue kuva
        img_bytes = await file.read()

        # Käsittele Vision AI:lla
        vision_result = process_receipt(img_bytes)

        if vision_result.get("error"):
            raise HTTPException(
                status_code=422, detail=f"Vision AI processing failed: {vision_result['error']}"
            )

        # Kategorisoi automaattisesti
        categorized_result = categorize_receipt(vision_result)

        # Laske netto summa jos puuttuu
        if (
            not categorized_result.get("net_amount")
            and categorized_result.get("total_amount")
            and categorized_result.get("vat_amount")
        ):
            categorized_result["net_amount"] = (
                categorized_result["total_amount"] - categorized_result["vat_amount"]
            )

        # Tallenna tietokantaan
        receipt = Receipt(
            tenant_id=tenant_id,
            vendor=categorized_result.get("vendor"),
            total_amount=categorized_result.get("total_amount"),
            vat_amount=categorized_result.get("vat_amount"),
            vat_rate=categorized_result.get("vat_rate"),
            net_amount=categorized_result.get("net_amount"),
            receipt_date=categorized_result.get("receipt_date"),
            invoice_number=categorized_result.get("invoice_number"),
            payment_method=categorized_result.get("payment_method"),
            currency=categorized_result.get("currency", "EUR"),
            items=categorized_result.get("items", []),
            confidence=categorized_result.get("confidence", 0.0),
            vision_ai_model=categorized_result.get("vision_ai_model"),
            processing_time_ms=categorized_result.get("processing_time_ms"),
            category=categorized_result.get("category"),
            subcategory=categorized_result.get("subcategory"),
            tags=categorized_result.get("tags", []),
            created_by=user_id,
        )

        db.add(receipt)
        db.flush()  # Saada ID

        # Tallenna tuotteet
        for item_data in categorized_result.get("items", []):
            item = ReceiptItem(
                receipt_id=receipt.id,
                tenant_id=tenant_id,
                name=item_data.get("name"),
                quantity=item_data.get("quantity", 1.0),
                unit_price=item_data.get("unit_price", 0.0),
                total_price=item_data.get("total_price", 0.0),
            )
            db.add(item)

        # Audit log
        audit = DocumentAudit(
            document_id=receipt.id,
            document_type="receipt",
            tenant_id=tenant_id,
            event="created",
            payload={"vision_result": categorized_result},
            user_id=user_id,
        )
        db.add(audit)

        db.commit()

        # Gamify points
        try:
            record_event(
                db,
                tenant_id=tenant_id,
                kind="receipt.scanned",
                points=10,
                user_id=user_id,
                meta={"receipt_id": str(receipt.id)},
                event_id=f"receipt_{receipt.id}",
            )
            # P2E tokens
            p2e_mint(
                db,
                tenant_id or "default",
                user_id or "user_demo",
                5,
                "receipt_scanned",
                ref_id=str(receipt.id),
            )
        except Exception:
            pass  # Gamify ei pakollinen

        return {
            "success": True,
            "receipt_id": str(receipt.id),
            "data": {
                "vendor": receipt.vendor,
                "total_amount": receipt.total_amount,
                "vat_amount": receipt.vat_amount,
                "vat_rate": receipt.vat_rate,
                "net_amount": receipt.net_amount,
                "receipt_date": receipt.receipt_date.isoformat() if receipt.receipt_date else None,
                "invoice_number": receipt.invoice_number,
                "payment_method": receipt.payment_method,
                "currency": receipt.currency,
                "items": receipt.items,
                "category": receipt.category,
                "subcategory": receipt.subcategory,
                "tags": receipt.tags,
                "confidence": receipt.confidence,
                "status": receipt.status,
            },
            "vision_ai": {
                "model": receipt.vision_ai_model,
                "processing_time_ms": receipt.processing_time_ms,
                "confidence": receipt.confidence,
            },
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Receipt processing failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Receipt processing failed: {str(e)}")


@router.post("/invoices/scan")
async def scan_invoice(
    file: UploadFile = File(...),
    tenant_id: str = Query(None),
    user_id: str = Query(None),
    db: Session = Depends(get_session),
):
    """Skannaa lasku Vision AI:lla"""
    try:
        # Lue kuva
        img_bytes = await file.read()

        # Käsittele Vision AI:lla
        vision_result = process_invoice(img_bytes)

        if vision_result.get("error"):
            raise HTTPException(
                status_code=422, detail=f"Vision AI processing failed: {vision_result['error']}"
            )

        # Kategorisoi automaattisesti
        categorized_result = categorize_invoice(vision_result)

        # Laske netto summa jos puuttuu
        if (
            not categorized_result.get("net_amount")
            and categorized_result.get("total_amount")
            and categorized_result.get("vat_amount")
        ):
            categorized_result["net_amount"] = (
                categorized_result["total_amount"] - categorized_result["vat_amount"]
            )

        # Tallenna tietokantaan
        invoice = Invoice(
            tenant_id=tenant_id,
            vendor=categorized_result.get("vendor"),
            customer=categorized_result.get("customer"),
            total_amount=categorized_result.get("total_amount"),
            vat_amount=categorized_result.get("vat_amount"),
            vat_rate=categorized_result.get("vat_rate"),
            net_amount=categorized_result.get("net_amount"),
            invoice_date=categorized_result.get("invoice_date"),
            due_date=categorized_result.get("due_date"),
            invoice_number=categorized_result.get("invoice_number"),
            reference_number=categorized_result.get("reference_number"),
            payment_terms=categorized_result.get("payment_terms"),
            currency=categorized_result.get("currency", "EUR"),
            items=categorized_result.get("items", []),
            confidence=categorized_result.get("confidence", 0.0),
            vision_ai_model=categorized_result.get("vision_ai_model"),
            processing_time_ms=categorized_result.get("processing_time_ms"),
            category=categorized_result.get("category"),
            subcategory=categorized_result.get("subcategory"),
            tags=categorized_result.get("tags", []),
            created_by=user_id,
        )

        db.add(invoice)
        db.flush()  # Saada ID

        # Tallenna tuotteet
        for item_data in categorized_result.get("items", []):
            item = InvoiceItem(
                invoice_id=invoice.id,
                tenant_id=tenant_id,
                name=item_data.get("name"),
                quantity=item_data.get("quantity", 1.0),
                unit_price=item_data.get("unit_price", 0.0),
                total_price=item_data.get("total_price", 0.0),
            )
            db.add(item)

        # Audit log
        audit = DocumentAudit(
            document_id=invoice.id,
            document_type="invoice",
            tenant_id=tenant_id,
            event="created",
            payload={"vision_result": categorized_result},
            user_id=user_id,
        )
        db.add(audit)

        db.commit()

        # Gamify points
        try:
            record_event(
                db,
                tenant_id=tenant_id,
                kind="invoice.scanned",
                points=15,
                user_id=user_id,
                meta={"invoice_id": str(invoice.id)},
                event_id=f"invoice_{invoice.id}",
            )
            # P2E tokens
            p2e_mint(
                db,
                tenant_id or "default",
                user_id or "user_demo",
                8,
                "invoice_scanned",
                ref_id=str(invoice.id),
            )
        except Exception:
            pass  # Gamify ei pakollinen

        return {
            "success": True,
            "invoice_id": str(invoice.id),
            "data": {
                "vendor": invoice.vendor,
                "customer": invoice.customer,
                "total_amount": invoice.total_amount,
                "vat_amount": invoice.vat_amount,
                "vat_rate": invoice.vat_rate,
                "net_amount": invoice.net_amount,
                "invoice_date": invoice.invoice_date.isoformat() if invoice.invoice_date else None,
                "due_date": invoice.due_date.isoformat() if invoice.due_date else None,
                "invoice_number": invoice.invoice_number,
                "reference_number": invoice.reference_number,
                "payment_terms": invoice.payment_terms,
                "currency": invoice.currency,
                "items": invoice.items,
                "category": invoice.category,
                "subcategory": invoice.subcategory,
                "tags": invoice.tags,
                "confidence": invoice.confidence,
                "status": invoice.status,
                "payment_status": invoice.payment_status,
            },
            "vision_ai": {
                "model": invoice.vision_ai_model,
                "processing_time_ms": invoice.processing_time_ms,
                "confidence": invoice.confidence,
            },
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Invoice processing failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Invoice processing failed: {str(e)}")


@router.get("/")
async def list_receipts(
    tenant_id: str = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    category: str = Query(None),
    status: str = Query(None),
    db: Session = Depends(get_session),
):
    """Listaa kuitit"""
    query = db.query(Receipt)

    if tenant_id:
        query = query.filter(Receipt.tenant_id == tenant_id)
    if category:
        query = query.filter(Receipt.category == category)
    if status:
        query = query.filter(Receipt.status == status)

    receipts = query.order_by(Receipt.created_at.desc()).offset(offset).limit(limit).all()

    return [
        {
            "id": str(r.id),
            "vendor": r.vendor,
            "total_amount": r.total_amount,
            "vat_amount": r.vat_amount,
            "vat_rate": r.vat_rate,
            "net_amount": r.net_amount,
            "receipt_date": r.receipt_date.isoformat() if r.receipt_date else None,
            "invoice_number": r.invoice_number,
            "payment_method": r.payment_method,
            "currency": r.currency,
            "category": r.category,
            "subcategory": r.subcategory,
            "tags": r.tags,
            "confidence": r.confidence,
            "status": r.status,
            "is_deductible": r.is_deductible,
            "is_reimbursable": r.is_reimbursable,
            "created_at": r.created_at.isoformat(),
        }
        for r in receipts
    ]


@router.get("/invoices")
async def list_invoices(
    tenant_id: str = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    category: str = Query(None),
    status: str = Query(None),
    payment_status: str = Query(None),
    db: Session = Depends(get_session),
):
    """Listaa laskut"""
    query = db.query(Invoice)

    if tenant_id:
        query = query.filter(Invoice.tenant_id == tenant_id)
    if category:
        query = query.filter(Invoice.category == category)
    if status:
        query = query.filter(Invoice.status == status)
    if payment_status:
        query = query.filter(Invoice.payment_status == payment_status)

    invoices = query.order_by(Invoice.created_at.desc()).offset(offset).limit(limit).all()

    return [
        {
            "id": str(i.id),
            "vendor": i.vendor,
            "customer": i.customer,
            "total_amount": i.total_amount,
            "vat_amount": i.vat_amount,
            "vat_rate": i.vat_rate,
            "net_amount": i.net_amount,
            "invoice_date": i.invoice_date.isoformat() if i.invoice_date else None,
            "due_date": i.due_date.isoformat() if i.due_date else None,
            "invoice_number": i.invoice_number,
            "reference_number": i.reference_number,
            "payment_terms": i.payment_terms,
            "currency": i.currency,
            "category": i.category,
            "subcategory": i.subcategory,
            "tags": i.tags,
            "confidence": i.confidence,
            "status": i.status,
            "payment_status": i.payment_status,
            "payment_date": i.payment_date.isoformat() if i.payment_date else None,
            "is_deductible": i.is_deductible,
            "created_at": i.created_at.isoformat(),
        }
        for i in invoices
    ]


@router.get("/stats")
async def get_receipt_stats(
    tenant_id: str = Query(None),
    db: Session = Depends(get_session),
):
    """Hae kuittien tilastot"""
    from sqlalchemy import func

    query = db.query(Receipt)
    if tenant_id:
        query = query.filter(Receipt.tenant_id == tenant_id)

    total_receipts = query.count()
    total_amount = (
        db.query(func.sum(Receipt.total_amount))
        .filter(Receipt.tenant_id == tenant_id if tenant_id else True)
        .scalar()
        or 0.0
    )
    total_vat = (
        db.query(func.sum(Receipt.vat_amount))
        .filter(Receipt.tenant_id == tenant_id if tenant_id else True)
        .scalar()
        or 0.0
    )

    # Kategoriat
    categories = (
        db.query(Receipt.category, func.count(Receipt.id))
        .filter(Receipt.tenant_id == tenant_id if tenant_id else True)
        .group_by(Receipt.category)
        .all()
    )

    return {
        "total_receipts": total_receipts,
        "total_amount": float(total_amount),
        "total_vat": float(total_vat),
        "categories": [{"category": c[0] or "other", "count": c[1]} for c in categories],
        "average_confidence": db.query(func.avg(Receipt.confidence))
        .filter(Receipt.tenant_id == tenant_id if tenant_id else True)
        .scalar()
        or 0.0,
    }

import os
import time
from typing import Dict, Any, Optional, List
from datetime import datetime
from sqlalchemy.orm import Session

from .models import Document, DocumentProcessingLog
from ..ocr.service import run_ocr_bytes
from ..ocr.vision_receipts import vision_enrich_receipt, vision_enrich_invoice
from ..ocr.privacy import blur_faces_and_plates
from ...utils.storage import sha256


def detect_document_type(file_name: str, content_type: str, ocr_text: str = "") -> str:
    """Detect document type based on filename, content type, and OCR text"""
    file_name_lower = file_name.lower()
    ocr_text_lower = ocr_text.lower()
    
    # Check for receipts
    receipt_keywords = ["kuitti", "receipt", "kassa", "maksukuitti", "ostokuitti"]
    if any(keyword in file_name_lower for keyword in receipt_keywords):
        return "receipt"
    if any(keyword in ocr_text_lower for keyword in receipt_keywords):
        return "receipt"
    
    # Check for invoices
    invoice_keywords = ["lasku", "invoice", "faktura", "laskutus"]
    if any(keyword in file_name_lower for keyword in invoice_keywords):
        return "invoice"
    if any(keyword in ocr_text_lower for keyword in invoice_keywords):
        return "invoice"
    
    # Check for contracts
    contract_keywords = ["sopimus", "contract", "agreement", "käyttöehdot"]
    if any(keyword in file_name_lower for keyword in contract_keywords):
        return "contract"
    if any(keyword in ocr_text_lower for keyword in contract_keywords):
        return "contract"
    
    # Default based on content type
    if content_type and content_type.startswith("image/"):
        return "receipt"  # Assume images are receipts by default
    
    return "unknown"


def process_document(
    db: Session,
    tenant_id: str,
    file_name: str,
    file_content: bytes,
    content_type: str = None,
    storage_path: str = None
) -> Document:
    """Process a document through the OCR pipeline"""
    
    # Create document record
    document = Document(
        tenant_id=tenant_id,
        file_name=file_name,
        storage_path=storage_path or f"documents/{tenant_id}/{sha256(file_content)[:16]}/{file_name}",
        content_type=content_type,
        file_size=len(file_content),
        status="processing"
    )
    
    db.add(document)
    db.flush()  # Get the ID
    
    # Log processing start
    log_processing_step(
        db, document.id, "upload", "completed", 
        {"file_size": len(file_content), "content_type": content_type}
    )
    
    try:
        # Step 1: Privacy protection (blur faces/plates)
        start_time = time.perf_counter()
        safe_content = blur_faces_and_plates(file_content)
        privacy_time = int((time.perf_counter() - start_time) * 1000)
        
        log_processing_step(
            db, document.id, "privacy_protection", "completed",
            {"processing_time_ms": privacy_time}
        )
        
        # Step 2: OCR text extraction
        start_time = time.perf_counter()
        ocr_text = run_ocr_bytes(safe_content)
        ocr_time = int((time.perf_counter() - start_time) * 1000)
        
        document.raw_ocr_text = ocr_text
        
        log_processing_step(
            db, document.id, "ocr_extraction", "completed",
            {"text_length": len(ocr_text), "processing_time_ms": ocr_time},
            processor="tesseract"
        )
        
        # Step 3: Document type detection
        document_type = detect_document_type(file_name, content_type or "", ocr_text)
        document.document_type = document_type
        
        log_processing_step(
            db, document.id, "type_detection", "completed",
            {"detected_type": document_type}
        )
        
        # Step 4: Vision AI processing based on document type
        vision_data = None
        start_time = time.perf_counter()
        
        if document_type == "receipt":
            vision_data = vision_enrich_receipt(safe_content)
        elif document_type == "invoice":
            vision_data = vision_enrich_invoice(safe_content)
        else:
            # For other document types, use basic OCR only
            vision_data = {
                "confidence": 0.5,
                "document_type": document_type,
                "extracted_text": ocr_text[:500]  # First 500 chars
            }
        
        vision_time = int((time.perf_counter() - start_time) * 1000)
        
        # Update document with extracted data
        if vision_data:
            document.extracted_data = vision_data
            document.ocr_confidence = vision_data.get("confidence", 0.5)
            
            # Extract financial data if available
            if "total_amount" in vision_data:
                document.total_amount = vision_data.get("total_amount")
            if "vat_amount" in vision_data:
                document.vat_amount = vision_data.get("vat_amount")
            if "vat_rate" in vision_data:
                document.vat_rate = vision_data.get("vat_rate")
            if "vendor" in vision_data:
                document.vendor = vision_data.get("vendor")
            
            # Parse dates
            if "date" in vision_data and vision_data["date"]:
                try:
                    document.document_date = datetime.fromisoformat(vision_data["date"])
                except (ValueError, TypeError):
                    pass
            
            if "due_date" in vision_data and vision_data["due_date"]:
                try:
                    document.due_date = datetime.fromisoformat(vision_data["due_date"])
                except (ValueError, TypeError):
                    pass
        
        log_processing_step(
            db, document.id, "vision_ai", "completed",
            {"confidence": document.ocr_confidence, "processing_time_ms": vision_time},
            processor="openai_vision",
            confidence=document.ocr_confidence
        )
        
        # Step 5: Final validation and status update
        document.status = "processed"
        document.processed_at = datetime.utcnow()
        
        log_processing_step(
            db, document.id, "validation", "completed",
            {"final_status": "processed"}
        )
        
        db.commit()
        return document
        
    except Exception as e:
        # Log error and update status
        document.status = "error"
        log_processing_step(
            db, document.id, "processing", "failed",
            error_message=str(e)
        )
        db.commit()
        raise


def log_processing_step(
    db: Session,
    document_id: str,
    step: str,
    status: str,
    result_data: Dict[str, Any] = None,
    error_message: str = None,
    processor: str = None,
    confidence: float = None
) -> DocumentProcessingLog:
    """Log a processing step for a document"""
    
    log_entry = DocumentProcessingLog(
        document_id=document_id,
        step=step,
        status=status,
        result_data=result_data,
        error_message=error_message,
        processor=processor,
        confidence=confidence,
        processing_time_ms=result_data.get("processing_time_ms") if result_data else None
    )
    
    db.add(log_entry)
    return log_entry


def get_documents(
    db: Session,
    tenant_id: str,
    skip: int = 0,
    limit: int = 50,
    status: str = None,
    document_type: str = None,
    search: str = None
) -> List[Document]:
    """Get documents with filtering and pagination"""
    
    query = db.query(Document).filter(Document.tenant_id == tenant_id)
    
    if status:
        query = query.filter(Document.status == status)
    
    if document_type:
        query = query.filter(Document.document_type == document_type)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Document.file_name.ilike(search_term)) |
            (Document.vendor.ilike(search_term)) |
            (Document.raw_ocr_text.ilike(search_term))
        )
    
    return query.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()


def get_document(db: Session, tenant_id: str, document_id: str) -> Optional[Document]:
    """Get a single document by ID"""
    return db.query(Document).filter(
        Document.id == document_id,
        Document.tenant_id == tenant_id
    ).first()


def update_document(
    db: Session,
    tenant_id: str,
    document_id: str,
    updates: Dict[str, Any]
) -> Optional[Document]:
    """Update a document"""
    document = get_document(db, tenant_id, document_id)
    if not document:
        return None
    
    for key, value in updates.items():
        if hasattr(document, key):
            setattr(document, key, value)
    
    # Log the update
    log_processing_step(
        db, document_id, "manual_update", "completed",
        {"updated_fields": list(updates.keys())},
        processor="manual"
    )
    
    db.commit()
    return document


def delete_document(db: Session, tenant_id: str, document_id: str) -> bool:
    """Delete a document and its processing logs"""
    document = get_document(db, tenant_id, document_id)
    if not document:
        return False
    
    db.delete(document)
    db.commit()
    return True


def reprocess_document(db: Session, tenant_id: str, document_id: str) -> Optional[Document]:
    """Reprocess a document through the OCR pipeline"""
    document = get_document(db, tenant_id, document_id)
    if not document:
        return None
    
    # Reset status and clear previous results
    document.status = "processing"
    document.extracted_data = None
    document.ocr_confidence = None
    document.raw_ocr_text = None
    document.processed_at = None
    
    # Log reprocessing start
    log_processing_step(
        db, document_id, "reprocessing", "started",
        {"reason": "manual_reprocess"}
    )
    
    db.commit()
    
    # Note: In a real implementation, this would trigger async reprocessing
    # For now, we just mark it as pending for reprocessing
    return document

import time
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel

from .service import (
    process_document, get_documents, get_document, 
    update_document, delete_document, reprocess_document
)
from .models import Document
from ...utils.db import get_session
from backend.app.core.metrics import inc_doc_ingested, observe_ocr_duration, record_ocr_processing


router = APIRouter(prefix="/api/v1/documents", tags=["documents"])


# Pydantic models for API
class DocumentOut(BaseModel):
    id: str
    tenant_id: str
    file_name: str
    storage_path: str
    content_type: Optional[str]
    file_size: Optional[int]
    document_type: str
    status: str
    ocr_confidence: Optional[float]
    extracted_data: Optional[Dict[str, Any]]
    vendor: Optional[str]
    total_amount: Optional[float]
    vat_amount: Optional[float]
    vat_rate: Optional[float]
    currency: str
    document_date: Optional[str]
    due_date: Optional[str]
    processed_at: Optional[str]
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class DocumentUpdate(BaseModel):
    status: Optional[str] = None
    vendor: Optional[str] = None
    total_amount: Optional[float] = None
    vat_amount: Optional[float] = None
    vat_rate: Optional[float] = None
    document_date: Optional[str] = None
    due_date: Optional[str] = None
    extracted_data: Optional[Dict[str, Any]] = None


class DocumentListResponse(BaseModel):
    documents: List[DocumentOut]
    total: int
    page: int
    per_page: int


def _get_tenant_id(tenant_id: str = Query("default")) -> str:
    """Get tenant ID from query parameter"""
    return tenant_id


@router.post("/process", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def process_document_endpoint(
    file: UploadFile = File(...),
    tenant_id: str = Depends(_get_tenant_id),
    db: Session = Depends(get_session),
) -> DocumentOut:
    """Process a document through the OCR pipeline"""
    
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="File must have a filename")
    
    start_time = time.perf_counter()
    status_label = "success"
    
    try:
        # Read file content
        content = await file.read()
        
        # Process the document
        document = process_document(
            db=db,
            tenant_id=tenant_id,
            file_name=file.filename,
            file_content=content,
            content_type=file.content_type
        )
        
        # Record metrics
        inc_doc_ingested(tenant_id, document.document_type)
        
        return DocumentOut.from_orm(document)
        
    except Exception as e:
        status_label = "error"
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    
    finally:
        # Record processing time
        duration = time.perf_counter() - start_time
        observe_ocr_duration("/api/v1/documents/process", status_label, duration)
        record_ocr_processing(status_label)


@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    tenant_id: str = Depends(_get_tenant_id),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    status: Optional[str] = Query(None),
    document_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_session),
) -> DocumentListResponse:
    """List documents with filtering and pagination"""
    
    documents = get_documents(
        db=db,
        tenant_id=tenant_id,
        skip=skip,
        limit=limit,
        status=status,
        document_type=document_type,
        search=search
    )
    
    # Get total count for pagination
    total_query = db.query(Document).filter(Document.tenant_id == tenant_id)
    if status:
        total_query = total_query.filter(Document.status == status)
    if document_type:
        total_query = total_query.filter(Document.document_type == document_type)
    if search:
        search_term = f"%{search}%"
        total_query = total_query.filter(
            (Document.file_name.ilike(search_term)) |
            (Document.vendor.ilike(search_term)) |
            (Document.raw_ocr_text.ilike(search_term))
        )
    
    total = total_query.count()
    
    return DocumentListResponse(
        documents=[DocumentOut.from_orm(doc) for doc in documents],
        total=total,
        page=skip // limit + 1,
        per_page=limit
    )


@router.get("/{document_id}", response_model=DocumentOut)
async def get_document_endpoint(
    document_id: str,
    tenant_id: str = Depends(_get_tenant_id),
    db: Session = Depends(get_session),
) -> DocumentOut:
    """Get a single document by ID"""
    
    document = get_document(db, tenant_id, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return DocumentOut.from_orm(document)


@router.patch("/{document_id}", response_model=DocumentOut)
async def update_document_endpoint(
    document_id: str,
    updates: DocumentUpdate,
    tenant_id: str = Depends(_get_tenant_id),
    db: Session = Depends(get_session),
) -> DocumentOut:
    """Update a document"""
    
    update_data = updates.dict(exclude_unset=True)
    if not update_data:
        # No updates provided, just return the current document
        document = get_document(db, tenant_id, document_id)
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        return DocumentOut.from_orm(document)
    
    document = update_document(db, tenant_id, document_id, update_data)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return DocumentOut.from_orm(document)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document_endpoint(
    document_id: str,
    tenant_id: str = Depends(_get_tenant_id),
    db: Session = Depends(get_session),
) -> Response:
    """Delete a document"""
    
    success = delete_document(db, tenant_id, document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{document_id}/reprocess", response_model=DocumentOut)
async def reprocess_document_endpoint(
    document_id: str,
    tenant_id: str = Depends(_get_tenant_id),
    db: Session = Depends(get_session),
) -> DocumentOut:
    """Reprocess a document through the OCR pipeline"""
    
    document = reprocess_document(db, tenant_id, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return DocumentOut.from_orm(document)


@router.get("/{document_id}/logs")
async def get_document_logs(
    document_id: str,
    tenant_id: str = Depends(_get_tenant_id),
    db: Session = Depends(get_session),
) -> List[Dict[str, Any]]:
    """Get processing logs for a document"""
    
    document = get_document(db, tenant_id, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    logs = []
    for log in document.processing_logs:
        logs.append({
            "id": log.id,
            "step": log.step,
            "status": log.status,
            "result_data": log.result_data,
            "error_message": log.error_message,
            "processing_time_ms": log.processing_time_ms,
            "processor": log.processor,
            "confidence": log.confidence,
            "created_at": log.created_at.isoformat()
        })
    
    return logs

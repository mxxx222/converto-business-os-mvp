from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import and_, or_, desc, asc, func
from datetime import datetime, date

from .models import Document, DocumentProcessingLog, VATAnalysis
from .service import process_document, log_processing_step


class DocumentController:
    """Controller for document operations with advanced querying and filtering"""
    
    @staticmethod
    def create_document(
        db: Session,
        tenant_id: str,
        file_name: str,
        file_content: bytes,
        content_type: str = None,
        storage_path: str = None
    ) -> Document:
        """Create and process a new document"""
        return process_document(
            db=db,
            tenant_id=tenant_id,
            file_name=file_name,
            file_content=file_content,
            content_type=content_type,
            storage_path=storage_path
        )
    
    @staticmethod
    def get_document(
        db: Session, 
        tenant_id: str, 
        document_id: str,
        include_logs: bool = False
    ) -> Optional[Document]:
        """Get a single document by ID with optional processing logs"""
        query = db.query(Document).filter(
            Document.id == document_id,
            Document.tenant_id == tenant_id
        )
        
        if include_logs:
            query = query.options(selectinload(Document.processing_logs))
        
        return query.first()
    
    @staticmethod
    def list_documents(
        db: Session,
        tenant_id: str,
        skip: int = 0,
        limit: int = 50,
        status: Optional[str] = None,
        document_type: Optional[str] = None,
        search: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        include_logs: bool = False
    ) -> List[Document]:
        """List documents with advanced filtering and sorting"""
        
        query = db.query(Document).filter(Document.tenant_id == tenant_id)
        
        # Apply filters
        if status:
            query = query.filter(Document.status == status)
        
        if document_type:
            query = query.filter(Document.document_type == document_type)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Document.file_name.ilike(search_term),
                    Document.vendor.ilike(search_term),
                    Document.raw_ocr_text.ilike(search_term)
                )
            )
        
        if date_from:
            query = query.filter(Document.document_date >= date_from)
        
        if date_to:
            query = query.filter(Document.document_date <= date_to)
        
        # Apply sorting
        sort_column = getattr(Document, sort_by, Document.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
        
        # Include processing logs if requested
        if include_logs:
            query = query.options(selectinload(Document.processing_logs))
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def count_documents(
        db: Session,
        tenant_id: str,
        status: Optional[str] = None,
        document_type: Optional[str] = None,
        search: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None
    ) -> int:
        """Count documents with the same filters as list_documents"""
        
        query = db.query(func.count(Document.id)).filter(Document.tenant_id == tenant_id)
        
        # Apply same filters as list_documents
        if status:
            query = query.filter(Document.status == status)
        
        if document_type:
            query = query.filter(Document.document_type == document_type)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Document.file_name.ilike(search_term),
                    Document.vendor.ilike(search_term),
                    Document.raw_ocr_text.ilike(search_term)
                )
            )
        
        if date_from:
            query = query.filter(Document.document_date >= date_from)
        
        if date_to:
            query = query.filter(Document.document_date <= date_to)
        
        return query.scalar()
    
    @staticmethod
    def update_document(
        db: Session,
        tenant_id: str,
        document_id: str,
        updates: Dict[str, Any],
        log_update: bool = True
    ) -> Optional[Document]:
        """Update a document with optional logging"""
        
        document = DocumentController.get_document(db, tenant_id, document_id)
        if not document:
            return None
        
        # Track what fields are being updated
        updated_fields = []
        
        for key, value in updates.items():
            if hasattr(document, key):
                old_value = getattr(document, key)
                if old_value != value:
                    setattr(document, key, value)
                    updated_fields.append(key)
        
        if updated_fields:
            document.updated_at = datetime.utcnow()
            
            # Log the update if requested
            if log_update:
                log_processing_step(
                    db, document_id, "manual_update", "completed",
                    {
                        "updated_fields": updated_fields,
                        "update_count": len(updated_fields)
                    },
                    processor="manual"
                )
            
            db.commit()
        
        return document
    
    @staticmethod
    def bulk_update_documents(
        db: Session,
        tenant_id: str,
        document_ids: List[str],
        updates: Dict[str, Any]
    ) -> List[Document]:
        """Update multiple documents at once"""
        
        documents = db.query(Document).filter(
            Document.tenant_id == tenant_id,
            Document.id.in_(document_ids)
        ).all()
        
        updated_documents = []
        
        for document in documents:
            updated_fields = []
            
            for key, value in updates.items():
                if hasattr(document, key):
                    old_value = getattr(document, key)
                    if old_value != value:
                        setattr(document, key, value)
                        updated_fields.append(key)
            
            if updated_fields:
                document.updated_at = datetime.utcnow()
                
                # Log bulk update
                log_processing_step(
                    db, document.id, "bulk_update", "completed",
                    {
                        "updated_fields": updated_fields,
                        "bulk_operation": True
                    },
                    processor="bulk_operation"
                )
                
                updated_documents.append(document)
        
        if updated_documents:
            db.commit()
        
        return updated_documents
    
    @staticmethod
    def delete_document(
        db: Session,
        tenant_id: str,
        document_id: str
    ) -> bool:
        """Delete a document and its processing logs"""
        
        document = DocumentController.get_document(db, tenant_id, document_id)
        if not document:
            return False
        
        # Log deletion before deleting
        log_processing_step(
            db, document_id, "deletion", "completed",
            {"deleted_at": datetime.utcnow().isoformat()},
            processor="manual"
        )
        
        db.delete(document)
        db.commit()
        return True
    
    @staticmethod
    def bulk_delete_documents(
        db: Session,
        tenant_id: str,
        document_ids: List[str]
    ) -> int:
        """Delete multiple documents at once"""
        
        documents = db.query(Document).filter(
            Document.tenant_id == tenant_id,
            Document.id.in_(document_ids)
        ).all()
        
        deleted_count = 0
        
        for document in documents:
            # Log bulk deletion
            log_processing_step(
                db, document.id, "bulk_deletion", "completed",
                {
                    "deleted_at": datetime.utcnow().isoformat(),
                    "bulk_operation": True
                },
                processor="bulk_operation"
            )
            
            db.delete(document)
            deleted_count += 1
        
        if deleted_count > 0:
            db.commit()
        
        return deleted_count
    
    @staticmethod
    def get_document_statistics(
        db: Session,
        tenant_id: str,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None
    ) -> Dict[str, Any]:
        """Get document statistics for dashboard"""
        
        base_query = db.query(Document).filter(Document.tenant_id == tenant_id)
        
        if date_from:
            base_query = base_query.filter(Document.created_at >= date_from)
        
        if date_to:
            base_query = base_query.filter(Document.created_at <= date_to)
        
        # Total counts
        total_documents = base_query.count()
        
        # Status breakdown
        status_counts = db.query(
            Document.status,
            func.count(Document.id).label('count')
        ).filter(Document.tenant_id == tenant_id).group_by(Document.status).all()
        
        # Document type breakdown
        type_counts = db.query(
            Document.document_type,
            func.count(Document.id).label('count')
        ).filter(Document.tenant_id == tenant_id).group_by(Document.document_type).all()
        
        # Average confidence
        avg_confidence = db.query(
            func.avg(Document.ocr_confidence)
        ).filter(
            Document.tenant_id == tenant_id,
            Document.ocr_confidence.isnot(None)
        ).scalar()
        
        # Total amounts
        total_amount = db.query(
            func.sum(Document.total_amount)
        ).filter(
            Document.tenant_id == tenant_id,
            Document.total_amount.isnot(None)
        ).scalar()
        
        return {
            "total_documents": total_documents,
            "status_breakdown": {status: count for status, count in status_counts},
            "type_breakdown": {doc_type: count for doc_type, count in type_counts},
            "average_confidence": float(avg_confidence) if avg_confidence else 0.0,
            "total_amount": float(total_amount) if total_amount else 0.0,
            "period": {
                "from": date_from.isoformat() if date_from else None,
                "to": date_to.isoformat() if date_to else None
            }
        }
    
    @staticmethod
    def get_processing_logs(
        db: Session,
        tenant_id: str,
        document_id: str,
        limit: int = 50
    ) -> List[DocumentProcessingLog]:
        """Get processing logs for a specific document"""
        
        # Verify document belongs to tenant
        document = DocumentController.get_document(db, tenant_id, document_id)
        if not document:
            return []
        
        return db.query(DocumentProcessingLog).filter(
            DocumentProcessingLog.document_id == document_id
        ).order_by(desc(DocumentProcessingLog.created_at)).limit(limit).all()
    
    @staticmethod
    def reprocess_document(
        db: Session,
        tenant_id: str,
        document_id: str
    ) -> Optional[Document]:
        """Mark a document for reprocessing"""
        
        document = DocumentController.get_document(db, tenant_id, document_id)
        if not document:
            return None
        
        # Reset processing status
        document.status = "processing"
        document.extracted_data = None
        document.ocr_confidence = None
        document.raw_ocr_text = None
        document.processed_at = None
        document.updated_at = datetime.utcnow()
        
        # Log reprocessing request
        log_processing_step(
            db, document_id, "reprocessing_requested", "started",
            {"reason": "manual_reprocess"},
            processor="manual"
        )
        
        db.commit()
        
        # Note: In a real implementation, this would trigger async reprocessing
        # For now, we just mark it as pending for reprocessing
        return document
    
    # ============================================
    # VEROPILOT-AI Specific Methods (user_id based)
    # ============================================
    
    @staticmethod
    def create_document_record(
        db: Session,
        user_id: str,
        file_name: str,
        storage_path: str,
        content_type: str,
        file_size: int,
        status: str = "uploading"
    ) -> Document:
        """Create a document record for VEROPILOT (user_id based)"""
        document = Document(
            user_id=user_id,
            file_name=file_name,
            storage_path=storage_path,
            content_type=content_type,
            file_size=file_size,
            status=status,
            document_type="receipt"  # Default for VEROPILOT
        )
        db.add(document)
        return document
    
    @staticmethod
    def update_document(
        db: Session,
        document_id: str,
        user_id: str,
        **kwargs
    ) -> Optional[Document]:
        """Update a document for VEROPILOT (user_id based)"""
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == user_id
        ).first()
        
        if not document:
            return None
        
        for key, value in kwargs.items():
            if hasattr(document, key) and value is not None:
                setattr(document, key, value)
        
        document.updated_at = datetime.utcnow()
        return document
    
    @staticmethod
    def create_vat_analysis_record(
        db: Session,
        document_id: str,
        user_id: str,
        y_tunnus: Optional[str] = None,
        company_info: Optional[Dict[str, Any]] = None,
        line_items: Optional[list] = None,
        total_vat_deductible: Optional[float] = None,
        suggested_booking: Optional[Dict[str, Any]] = None,
        vat_confidence: Optional[float] = None
    ) -> VATAnalysis:
        """Create VAT analysis record for VEROPILOT"""
        vat_analysis = VATAnalysis(
            document_id=document_id,
            user_id=user_id,
            y_tunnus=y_tunnus,
            company_info=company_info,
            line_items=line_items,
            total_vat_deductible=total_vat_deductible,
            suggested_booking=suggested_booking,
            vat_confidence=vat_confidence
        )
        db.add(vat_analysis)
        return vat_analysis

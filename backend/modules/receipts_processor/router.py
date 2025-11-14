"""FastAPI router for receipt processing."""

from __future__ import annotations

import os
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import logging

from .service import process_document_async

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/receipts", tags=["receipts"])


class ProcessRequest(BaseModel):
    """Request to process a document."""
    document_id: str
    storage_path: str
    user_id: str


@router.post("/process")
async def process_receipt(
    request: ProcessRequest,
    background_tasks: BackgroundTasks
):
    """
    Trigger OCR processing for a document.
    
    This endpoint is called by the frontend after uploading a document.
    Processing happens in the background.
    """
    try:
        # Get Supabase credentials
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE")
        
        if not supabase_url or not supabase_service_key:
            raise HTTPException(
                status_code=500,
                detail="Supabase credentials not configured"
            )
        
        # Add processing to background tasks
        background_tasks.add_task(
            process_document_async,
            request.document_id,
            request.storage_path,
            request.user_id,
            supabase_url,
            supabase_service_key,
        )
        
        logger.info(f"Queued processing for document {request.document_id}")
        
        return {
            "success": True,
            "message": "Processing started",
            "document_id": request.document_id,
        }
        
    except Exception as e:
        logger.error(f"Failed to queue processing: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start processing: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "receipts_processor",
    }


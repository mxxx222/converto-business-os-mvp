"""Document processing service with OCR and VAT analysis."""

from __future__ import annotations

import logging
from typing import Dict, Any, Optional
import httpx
from datetime import datetime

logger = logging.getLogger(__name__)


async def process_document_async(
    document_id: str,
    storage_path: str,
    user_id: str,
    supabase_url: str,
    supabase_service_key: str,
) -> Dict[str, Any]:
    """
    Process document with OCR and VAT analysis.
    
    Steps:
    1. Download image from Supabase Storage
    2. Run hybrid OCR (gpt-4o-mini → gpt-4o fallback)
    3. Analyze Finnish VAT
    4. Lookup company info from PRH if Y-tunnus found
    5. Save results to database
    
    Args:
        document_id: Document UUID
        storage_path: Path in Supabase Storage
        user_id: User UUID
        supabase_url: Supabase project URL
        supabase_service_key: Supabase service role key
    
    Returns:
        Processing result dictionary
    """
    from backend.modules.ocr.hybrid_vision import process_receipt_hybrid, process_invoice_hybrid
    from backend.modules.finnish_vat.service import analyze_receipt_vat, analyze_invoice_vat
    from backend.modules.integrations.prh_client import get_prh_client
    
    try:
        logger.info(f"Starting OCR processing for document {document_id}")
        
        # Step 1: Download image from Supabase Storage
        image_bytes = await download_from_storage(
            storage_path,
            supabase_url,
            supabase_service_key
        )
        
        if not image_bytes:
            await update_document_status(
                document_id,
                'failed',
                'Failed to download image from storage',
                supabase_url,
                supabase_service_key
            )
            return {"error": "Failed to download image"}
        
        logger.info(f"Downloaded {len(image_bytes)} bytes for document {document_id}")
        
        # Step 2: Determine document type (receipt vs invoice)
        # For now, default to receipt - can be enhanced with classification
        document_type = 'receipt'
        
        # Step 3: Run hybrid OCR
        if document_type == 'invoice':
            ocr_result = await process_invoice_hybrid(image_bytes)
        else:
            ocr_result = await process_receipt_hybrid(image_bytes)
        
        logger.info(f"OCR completed for document {document_id}: confidence={ocr_result.get('confidence')}, provider={ocr_result.get('ocr_provider')}")
        
        # Step 4: Analyze Finnish VAT
        if document_type == 'invoice':
            vat_analysis = analyze_invoice_vat(ocr_result)
        else:
            vat_analysis = analyze_receipt_vat(ocr_result)
        
        logger.info(f"VAT analysis completed for document {document_id}")
        
        # Step 5: Lookup company info from PRH if Y-tunnus found
        y_tunnus = ocr_result.get('y_tunnus') or vat_analysis.get('y_tunnus_analysis', {}).get('y_tunnus')
        company_info = None
        
        if y_tunnus:
            prh_client = get_prh_client()
            company_info = await prh_client.get_company_info(y_tunnus)
            
            if company_info:
                logger.info(f"PRH lookup successful for {y_tunnus}: {company_info.get('name')}")
            else:
                logger.warning(f"PRH lookup failed for {y_tunnus}")
        
        # Step 6: Save results to database
        await save_processing_results(
            document_id,
            document_type,
            ocr_result,
            vat_analysis,
            company_info,
            supabase_url,
            supabase_service_key
        )
        
        logger.info(f"Successfully processed document {document_id}")
        
        return {
            "success": True,
            "document_id": document_id,
            "document_type": document_type,
            "ocr_confidence": ocr_result.get('confidence'),
            "ocr_provider": ocr_result.get('ocr_provider'),
            "fallback_used": ocr_result.get('fallback_used'),
            "vat_analysis_complete": True,
        }
        
    except Exception as e:
        logger.error(f"Error processing document {document_id}: {str(e)}", exc_info=True)
        
        # Update document status to failed
        await update_document_status(
            document_id,
            'failed',
            str(e),
            supabase_url,
            supabase_service_key
        )
        
        return {
            "success": False,
            "error": str(e),
            "document_id": document_id,
        }


async def download_from_storage(
    storage_path: str,
    supabase_url: str,
    supabase_service_key: str,
) -> Optional[bytes]:
    """Download file from Supabase Storage."""
    try:
        # Create signed URL
        async with httpx.AsyncClient(timeout=30.0) as client:
            # Get public URL or create signed URL
            storage_url = f"{supabase_url}/storage/v1/object/documents/{storage_path}"
            
            response = await client.get(
                storage_url,
                headers={
                    "Authorization": f"Bearer {supabase_service_key}",
                }
            )
            
            response.raise_for_status()
            return response.content
            
    except Exception as e:
        logger.error(f"Failed to download from storage: {str(e)}")
        return None


async def update_document_status(
    document_id: str,
    status: str,
    error_message: Optional[str],
    supabase_url: str,
    supabase_service_key: str,
) -> None:
    """Update document status in database."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            update_data = {
                "status": status,
            }
            
            if error_message:
                update_data["extracted_data"] = {"error": error_message}
            
            response = await client.patch(
                f"{supabase_url}/rest/v1/documents?id=eq.{document_id}",
                json=update_data,
                headers={
                    "Authorization": f"Bearer {supabase_service_key}",
                    "apikey": supabase_service_key,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                }
            )
            
            response.raise_for_status()
            
    except Exception as e:
        logger.error(f"Failed to update document status: {str(e)}")


async def save_processing_results(
    document_id: str,
    document_type: str,
    ocr_result: Dict[str, Any],
    vat_analysis: Dict[str, Any],
    company_info: Optional[Dict[str, Any]],
    supabase_url: str,
    supabase_service_key: str,
) -> None:
    """Save OCR and VAT analysis results to database."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Update documents table
            document_update = {
                "status": "completed",
                "document_type": document_type,
                "ocr_confidence": ocr_result.get('confidence'),
                "ocr_provider": ocr_result.get('ocr_provider'),
                "fallback_used": ocr_result.get('fallback_used', False),
                "extracted_data": ocr_result,
                "vendor": ocr_result.get('vendor'),
                "y_tunnus": ocr_result.get('y_tunnus'),
                "total_amount": ocr_result.get('total_amount'),
                "vat_amount": ocr_result.get('vat_amount'),
                "vat_rate": ocr_result.get('vat_rate'),
                "net_amount": ocr_result.get('net_amount'),
                "currency": ocr_result.get('currency', 'EUR'),
                "document_date": ocr_result.get('receipt_date') or ocr_result.get('invoice_date'),
                "processed_at": datetime.now().isoformat(),
            }
            
            response = await client.patch(
                f"{supabase_url}/rest/v1/documents?id=eq.{document_id}",
                json=document_update,
                headers={
                    "Authorization": f"Bearer {supabase_service_key}",
                    "apikey": supabase_service_key,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                }
            )
            
            response.raise_for_status()
            
            # Insert VAT analysis
            y_tunnus_analysis = vat_analysis.get('y_tunnus_analysis', {})
            vat_rate_analysis = vat_analysis.get('vat_analysis', {})
            validation = vat_analysis.get('validation', {})
            
            vat_analysis_insert = {
                "document_id": document_id,
                "y_tunnus": y_tunnus_analysis.get('y_tunnus'),
                "y_tunnus_valid": y_tunnus_analysis.get('is_valid'),
                "y_tunnus_formatted": y_tunnus_analysis.get('formatted'),
                "company_name": company_info.get('name') if company_info else None,
                "company_info": company_info,
                "detected_vat_rate": vat_rate_analysis.get('detected_rate'),
                "expected_vat_rate": vat_rate_analysis.get('expected_rate'),
                "vat_rate_name": vat_rate_analysis.get('rate_name'),
                "rate_matches_vendor": vat_rate_analysis.get('matches_vendor'),
                "calculation_valid": validation.get('is_valid'),
                "calculation_errors": validation.get('errors'),
                "calculation_warnings": validation.get('warnings'),
                "items_vat_breakdown": vat_analysis.get('items_vat_breakdown'),
                "suggestions": vat_analysis.get('suggestions'),
                "analyzed_at": datetime.now().isoformat(),
            }
            
            response = await client.post(
                f"{supabase_url}/rest/v1/vat_analysis",
                json=vat_analysis_insert,
                headers={
                    "Authorization": f"Bearer {supabase_service_key}",
                    "apikey": supabase_service_key,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                }
            )
            
            response.raise_for_status()
            
            logger.info(f"Saved processing results for document {document_id}")
            
    except Exception as e:
        logger.error(f"Failed to save processing results: {str(e)}")
        raise


"""
OCR Microservice - Handles document scanning and text extraction
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import pytesseract
import cv2
import numpy as np
from PIL import Image
import io
import os
import logging
import hashlib
import redis

app = FastAPI(title="OCR Service", version="1.0.0")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Optional EasyOCR
try:
    import easyocr  # type: ignore
    _easyocr_reader = easyocr.Reader(["fi", "en"], gpu=False)
    EASY_AVAILABLE = True
except Exception:
    EASY_AVAILABLE = False

VISION_URL = os.getenv("VISION_SERVICE_URL", "http://vision-service:8003")
import requests
redis_client = redis.Redis(host=os.getenv("REDIS_HOST", "localhost"), port=int(os.getenv("REDIS_PORT", "6379")), db=0, decode_responses=True)


class OCRRequest(BaseModel):
    file_data: bytes
    language: str = "fin+eng"
    preprocessing: bool = True


class OCRResponse(BaseModel):
    text: str
    confidence: float
    language: str
    processing_time_ms: int
    metadata: Dict[str, Any]


class OCRExtractionRequest(BaseModel):
    text: str
    extraction_type: str = "specs"  # specs, contact, invoice


class OCRExtractionResponse(BaseModel):
    extracted_data: Dict[str, Any]
    confidence: float
    extraction_type: str


@app.post("/ocr/extract", response_model=OCRResponse)
async def extract_text(request: OCRRequest):
    """Extract text from image data"""
    
    import time
    start_time = time.time()
    
    try:
        # Load image
        img = Image.open(io.BytesIO(request.file_data)).convert("RGB")
        img_array = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        
        # Preprocess if requested
        if request.preprocessing:
            img_array = preprocess_image(img_array)
        
        # OCR extraction
        config = "--oem 1 --psm 6"
        text = pytesseract.image_to_string(img_array, lang=request.language, config=config)
        
        # Get confidence
        data = pytesseract.image_to_data(img_array, lang=request.language, output_type=pytesseract.Output.DICT)
        confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        return OCRResponse(
            text=text.strip(),
            confidence=avg_confidence / 100.0,
            language=request.language,
            processing_time_ms=processing_time_ms,
            metadata={
                "image_size": img.size,
                "preprocessing_applied": request.preprocessing
            }
        )
        
    except Exception as e:
        logger.error(f"OCR extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OCR error: {str(e)}")


@app.post("/ocr/upload", response_model=OCRResponse)
async def upload_and_extract(file: UploadFile = File(...), language: str = "fin+eng"):
    """Upload file and extract text"""
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_data = await file.read()
    digest = hashlib.sha256(file_data).hexdigest()
    ck = f"ocr:tesseract:{language}:{digest}"
    cached = redis_client.get(ck)
    if cached:
        try:
            obj = OCRResponse(**json.loads(cached))
            return obj
        except Exception:
            pass
    
    request = OCRRequest(
        file_data=file_data,
        language=language,
        preprocessing=True
    )
    
    result = await extract_text(request)
    try:
        redis_client.setex(ck, 60 * 60 * 24 * 30, result.model_dump())
    except Exception:
        pass
    # bill 1 scan if tenant header
    try:
        import httpx
        tenant_id = file.headers.get('x-tenant-id') if hasattr(file, 'headers') else None
        if tenant_id:
            async with httpx.AsyncClient(timeout=3.0) as client:
                await client.post(os.getenv('BILLING_URL', 'http://billing-service:8004') + '/billing/usage', json={
                    'tenant_id': tenant_id,
                    'feature': 'ocr_scans_per_month',
                    'quantity': 1,
                })
    except Exception:
        pass
    return result


@app.post("/ocr/extract-data", response_model=OCRExtractionResponse)
async def extract_structured_data(request: OCRExtractionRequest):
    """Extract structured data from OCR text"""
    
    try:
        if request.extraction_type == "specs":
            extracted_data = extract_device_specs(request.text)
        elif request.extraction_type == "contact":
            extracted_data = extract_contact_info(request.text)
        elif request.extraction_type == "invoice":
            extracted_data = extract_invoice_data(request.text)
        else:
            raise HTTPException(status_code=400, detail="Unsupported extraction type")
        
        return OCRExtractionResponse(
            extracted_data=extracted_data,
            confidence=0.85,  # Mock confidence
            extraction_type=request.extraction_type
        )
        
    except Exception as e:
        logger.error(f"Data extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Extraction error: {str(e)}")


@app.post("/ocr/ensemble")
async def ocr_ensemble(file: UploadFile = File(...), language: str = "fin+eng"):
    """Hybrid OCR: Tesseract + EasyOCR + Vision ensemble with confidence."""
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    img_bytes = await file.read()

    # Cache check for ensemble
    digest = hashlib.sha256(img_bytes).hexdigest()
    ck = f"ocr:ensemble:{language}:{digest}"
    cached = redis_client.get(ck)
    if cached:
        return json.loads(cached)

    # Tesseract branch
    tess_res = await extract_text(OCRRequest(file_data=img_bytes, language=language))

    # EasyOCR branch (optional)
    easy_text = ""
    easy_conf = 0.0
    if EASY_AVAILABLE:
        try:
            img = np.array(Image.open(io.BytesIO(img_bytes)).convert("RGB"))
            results: List[List[Any]] = _easyocr_reader.readtext(img)
            if results:
                easy_text = "\n".join([r[1] for r in results])
                confs = [float(r[2]) for r in results if isinstance(r[2], (float, int))]
                easy_conf = sum(confs) / len(confs) if confs else 0.0
        except Exception as e:
            logger.warning(f"EasyOCR failed: {e}")

    # Vision branch (OpenAI Vision via vision-service)
    vision_text = ""
    vision_conf = 0.0
    try:
        resp = requests.post(
            f"{VISION_URL}/vision/analyze",
            json={
                "image_data": list(img_bytes),  # pydantic may expect bytes; fallback to list
                "analysis_type": "receipt",
            },
            timeout=30,
        )
        if resp.ok:
            v = resp.json()
            # Flatten results description/raw_analysis
            vision_text = json.dumps(v.get("results", v), ensure_ascii=False)
            vision_conf = float(v.get("confidence", 0.8))
    except Exception as e:
        logger.warning(f"Vision analyze failed: {e}")

    # Ensemble score (simple weighted average)
    parts = []
    weights = []
    if tess_res.text:
        parts.append(tess_res.text)
        weights.append(max(0.1, tess_res.confidence))
    if easy_text:
        parts.append(easy_text)
        weights.append(max(0.1, easy_conf))
    if vision_text:
        parts.append(vision_text)
        weights.append(max(0.1, vision_conf))

    if not parts:
        raise HTTPException(status_code=500, detail="No OCR results available")

    # Merge: text concatenation; confidence = normalized weights avg
    merged_text = "\n\n".join(parts)
    conf = sum(weights) / len(weights)

    # Attempt structured extraction for invoice fields
    fields = extract_invoice_data(merged_text)
    result = {
        "text": merged_text,
        "confidence": conf,
        "sources": {
            "tesseract": tess_res.confidence,
            "easyocr": easy_conf if EASY_AVAILABLE else None,
            "vision": vision_conf,
        },
        "extracted": fields,
    }
    try:
        redis_client.setex(ck, 60 * 60 * 24 * 30, json.dumps(result))
    except Exception:
        pass
    return result


@app.get("/ocr/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "ocr-service"}


def preprocess_image(img: np.ndarray) -> np.ndarray:
    """Preprocess image for better OCR results"""
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Denoise
    gray = cv2.fastNlMeansDenoising(gray, None, 7, 7, 21)
    
    # Adaptive threshold
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 35, 11
    )
    
    return thresh


def extract_device_specs(text: str) -> Dict[str, Any]:
    """Extract device specifications from text"""
    import re
    
    specs = {}
    
    # Power (W, kW, VA)
    power_match = re.search(r'(\d+(?:[.,]\d+)?)\s*(W|kW|VA|w|kw|va)', text, re.IGNORECASE)
    if power_match:
        value, unit = power_match.groups()
        specs['power'] = {
            'value': float(value.replace(',', '.')),
            'unit': unit.upper()
        }
    
    # Voltage (V)
    voltage_match = re.search(r'(\d+(?:[.,]\d+)?)\s*V\b', text, re.IGNORECASE)
    if voltage_match:
        specs['voltage'] = float(voltage_match.group(1).replace(',', '.'))
    
    # Current (A)
    current_match = re.search(r'(\d+(?:[.,]\d+)?)\s*A\b', text, re.IGNORECASE)
    if current_match:
        specs['current'] = float(current_match.group(1).replace(',', '.'))
    
    return specs


def extract_contact_info(text: str) -> Dict[str, Any]:
    """Extract contact information from text"""
    import re
    
    contact = {}
    
    # Email
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    if email_match:
        contact['email'] = email_match.group()
    
    # Phone
    phone_match = re.search(r'(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    if phone_match:
        contact['phone'] = phone_match.group()
    
    return contact


def extract_invoice_data(text: str) -> Dict[str, Any]:
    """Extract invoice data from text"""
    import re
    
    invoice = {}
    
    # Total amount
    amount_match = re.search(r'(\d+(?:[.,]\d{2})?)\s*(€|EUR|euro)', text, re.IGNORECASE)
    if amount_match:
        invoice['total_amount'] = float(amount_match.group(1).replace(',', '.'))
    
    # VAT amount
    vat_match = re.search(r'ALV[:\s]*(\d+(?:[.,]\d{2})?)', text, re.IGNORECASE)
    if vat_match:
        invoice['vat_amount'] = float(vat_match.group(1).replace(',', '.'))
    
    # Date
    date_match = re.search(r'(\d{1,2}[./]\d{1,2}[./]\d{2,4})', text)
    if date_match:
        invoice['date'] = date_match.group(1)
    
    return invoice


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)

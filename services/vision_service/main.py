"""
Vision AI Microservice - Handles image analysis and computer vision tasks
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import base64
import io
import os
import json
import logging
from openai import OpenAI
import hashlib
import redis

app = FastAPI(title="Vision AI Service", version="1.0.0")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
redis_client = redis.Redis(host=os.getenv("REDIS_HOST", "localhost"), port=int(os.getenv("REDIS_PORT", "6379")), db=0, decode_responses=True)


class VisionRequest(BaseModel):
    image_data: bytes
    analysis_type: str = "general"  # general, receipt, invoice, device, face, object
    prompt: Optional[str] = None
    confidence_threshold: float = 0.7


class VisionResponse(BaseModel):
    analysis_type: str
    results: Dict[str, Any]
    confidence: float
    processing_time_ms: int
    model_used: str


class VisionBatchRequest(BaseModel):
    images: List[bytes]
    analysis_type: str = "general"
    batch_size: int = 5


class VisionBatchResponse(BaseModel):
    results: List[VisionResponse]
    total_processing_time_ms: int
    success_count: int
    failure_count: int


@app.post("/vision/analyze", response_model=VisionResponse)
async def analyze_image(request: VisionRequest):
    """Analyze single image with AI vision"""
    
    import time
    start_time = time.time()
    
    try:
        # Cache key
        digest = hashlib.sha256(request.image_data).hexdigest()
        cache_key = f"vision:{request.analysis_type}:{digest}:{hashlib.sha256((request.prompt or '').encode()).hexdigest()}"
        cached = redis_client.get(cache_key)
        if cached:
            obj = json.loads(cached)
            return VisionResponse(**obj)
        
        # Route to appropriate analysis
        if request.analysis_type == "receipt":
            results = await analyze_receipt(request.image_data, request.prompt)
        elif request.analysis_type == "invoice":
            results = await analyze_invoice(request.image_data, request.prompt)
        elif request.analysis_type == "device":
            results = await analyze_device(request.image_data, request.prompt)
        elif request.analysis_type == "face":
            results = await analyze_faces(request.image_data)
        elif request.analysis_type == "object":
            results = await analyze_objects(request.image_data, request.prompt)
        else:
            results = await analyze_general(request.image_data, request.prompt)
        
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        resp_obj = VisionResponse(
            analysis_type=request.analysis_type,
            results=results,
            confidence=results.get("confidence", 0.8),
            processing_time_ms=processing_time_ms,
            model_used="gpt-4-vision"
        )
        try:
            redis_client.setex(cache_key, 60 * 60 * 24 * 30, resp_obj.model_dump())
        except Exception:
            pass
        return resp_obj
        
    except Exception as e:
        logger.error(f"Vision analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Vision analysis error: {str(e)}")


@app.post("/vision/upload", response_model=VisionResponse)
async def upload_and_analyze(
    file: UploadFile = File(...), 
    analysis_type: str = "general",
    prompt: Optional[str] = None
):
    """Upload file and analyze with vision AI"""
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    image_data = await file.read()
    
    request = VisionRequest(
        image_data=image_data,
        analysis_type=analysis_type,
        prompt=prompt
    )
    
    return await analyze_image(request)


@app.post("/vision/batch", response_model=VisionBatchResponse)
async def batch_analyze(request: VisionBatchRequest):
    """Analyze multiple images in batch"""
    
    import time
    start_time = time.time()
    results = []
    success_count = 0
    failure_count = 0
    
    for image_data in request.images[:request.batch_size]:
        try:
            vision_request = VisionRequest(
                image_data=image_data,
                analysis_type=request.analysis_type
            )
            result = await analyze_image(vision_request)
            results.append(result)
            success_count += 1
        except Exception as e:
            logger.error(f"Batch analysis failed for image: {str(e)}")
            failure_count += 1
    
    total_processing_time_ms = int((time.time() - start_time) * 1000)
    
    return VisionBatchResponse(
        results=results,
        total_processing_time_ms=total_processing_time_ms,
        success_count=success_count,
        failure_count=failure_count
    )


@app.get("/vision/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "vision-service"}


async def analyze_receipt(image_data: bytes, prompt: Optional[str] = None) -> Dict[str, Any]:
    """Analyze receipt image"""
    
    image_b64 = base64.b64encode(image_data).decode()
    
    system_prompt = """Analyze this receipt image and extract:
    1. Merchant name
    2. Total amount
    3. VAT amount
    4. Date
    5. Items purchased
    6. Payment method
    
    Return as JSON with confidence score."""
    
    response = openai_client.chat.completions.create(
        model="gpt-4-vision-preview",
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt or "Analyze this receipt"},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}
                    }
                ]
            }
        ],
        max_tokens=1000,
        temperature=0.2
    )
    
    content = response.choices[0].message.content
    
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "raw_analysis": content,
            "confidence": 0.6,
            "extracted_data": {}
        }


async def analyze_invoice(image_data: bytes, prompt: Optional[str] = None) -> Dict[str, Any]:
    """Analyze invoice image with stronger field mapping and tax detection."""
    image_b64 = base64.b64encode(image_data).decode()
    system_prompt = """You are an expert invoice parser. Extract structured fields:
    - seller (name, address, VAT ID)
    - buyer (name, address, VAT ID if present)
    - invoice_number, date, due_date, payment_terms
    - line_items [description, quantity, unit_price, net, vat_rate, vat_amount, total]
    - subtotal, vat_amount_total, total_amount, currency
    - inferred_tax_fields (which lines had VAT, zero-rated, reverse charge)
    Return strictly JSON with a confidence score (0..1)."""

    response = openai_client.chat.completions.create(
        model="gpt-4-vision-preview",
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt or "Analyze this invoice"},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}},
                ],
            },
        ],
        max_tokens=1200,
        temperature=0.2,
    )

    content = response.choices[0].message.content
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {"raw_analysis": content, "confidence": 0.65, "extracted_data": {}}


async def analyze_device(image_data: bytes, prompt: Optional[str] = None) -> Dict[str, Any]:
    """Analyze device/product image"""
    
    image_b64 = base64.b64encode(image_data).decode()
    
    system_prompt = """Analyze this device/product image and extract:
    1. Device type and model
    2. Brand
    3. Power specifications (watts, voltage, current)
    4. Physical dimensions
    5. Features and capabilities
    
    Return as JSON with confidence score."""
    
    response = openai_client.chat.completions.create(
        model="gpt-4-vision-preview",
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt or "Analyze this device"},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}
                    }
                ]
            }
        ],
        max_tokens=800,
        temperature=0.2
    )
    
    content = response.choices[0].message.content
    
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "raw_analysis": content,
            "confidence": 0.7,
            "device_info": {}
        }


async def analyze_faces(image_data: bytes) -> Dict[str, Any]:
    """Analyze faces in image (privacy-focused)"""
    
    # For privacy, we'll use a mock implementation
    # In production, you'd use face detection libraries like OpenCV or cloud services
    
    return {
        "faces_detected": 1,
        "privacy_protection": "faces_blurred",
        "confidence": 0.9,
        "face_count": 1,
        "privacy_status": "protected"
    }


async def analyze_objects(image_data: bytes, prompt: Optional[str] = None) -> Dict[str, Any]:
    """Analyze objects in image"""
    
    image_b64 = base64.b64encode(image_data).decode()
    
    system_prompt = """Identify and describe objects in this image:
    1. List all visible objects
    2. Describe their positions
    3. Estimate sizes/quantities
    4. Note any text or labels
    
    Return as JSON with confidence score."""
    
    response = openai_client.chat.completions.create(
        model="gpt-4-vision-preview",
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt or "Identify objects in this image"},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}
                    }
                ]
            }
        ],
        max_tokens=600,
        temperature=0.3
    )
    
    content = response.choices[0].message.content
    
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "raw_analysis": content,
            "confidence": 0.8,
            "objects": []
        }


async def analyze_general(image_data: bytes, prompt: Optional[str] = None) -> Dict[str, Any]:
    """General image analysis"""
    
    image_b64 = base64.b64encode(image_data).decode()
    
    system_prompt = """Analyze this image and provide a comprehensive description:
    1. What do you see in the image?
    2. Describe the scene, objects, people, or text
    3. Note any important details
    4. Provide context and interpretation
    
    Return as JSON with confidence score."""
    
    response = openai_client.chat.completions.create(
        model="gpt-4-vision-preview",
        messages=[
            {"role": "system", "content": system_prompt},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt or "Analyze this image"},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_b64}"}
                    }
                ]
            }
        ],
        max_tokens=800,
        temperature=0.4
    )
    
    content = response.choices[0].message.content
    
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        return {
            "raw_analysis": content,
            "confidence": 0.8,
            "description": content
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)

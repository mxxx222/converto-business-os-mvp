"""Hybrid OCR vision strategy with cost optimization."""

from __future__ import annotations

import os
from typing import Dict, Any, Literal
from .providers.openai_mini import OpenAIMiniProvider
from .providers.openai_full import OpenAIFullProvider
from .confidence_analyzer import analyze_confidence, get_confidence_level

# Confidence threshold for fallback to gpt-4o
CONFIDENCE_THRESHOLD = float(os.getenv("OCR_CONFIDENCE_THRESHOLD", "0.88"))


async def process_receipt_hybrid(
    img_bytes: bytes,
    force_model: Literal["mini", "full", "auto"] = "auto"
) -> Dict[str, Any]:
    """
    Process receipt with hybrid OCR strategy.
    
    Strategy:
    1. Try gpt-4o-mini first (cost-effective)
    2. Analyze confidence score
    3. If confidence < 0.88, fallback to gpt-4o
    4. Return best result
    
    Args:
        img_bytes: Image bytes to process
        force_model: Force specific model ("mini", "full", or "auto")
    
    Returns:
        OCR result with confidence score and metadata
    """
    
    # Force specific model if requested
    if force_model == "full":
        provider = OpenAIFullProvider()
        result = await provider.extract_receipt(img_bytes)
        confidence_score = analyze_confidence(result)
        result["confidence"] = confidence_score
        result["confidence_level"] = get_confidence_level(confidence_score)
        result["ocr_provider"] = "gpt-4o"
        result["fallback_used"] = False
        result["strategy"] = "forced_full"
        return result
    
    if force_model == "mini":
        provider = OpenAIMiniProvider()
        result = await provider.extract_receipt(img_bytes)
        confidence_score = analyze_confidence(result)
        result["confidence"] = confidence_score
        result["confidence_level"] = get_confidence_level(confidence_score)
        result["ocr_provider"] = "gpt-4o-mini"
        result["fallback_used"] = False
        result["strategy"] = "forced_mini"
        return result
    
    # Auto mode: Hybrid strategy
    # Step 1: Try with gpt-4o-mini (cheaper)
    mini_provider = OpenAIMiniProvider()
    mini_result = await mini_provider.extract_receipt(img_bytes)
    
    # Step 2: Analyze confidence
    mini_confidence = analyze_confidence(mini_result)
    mini_result["confidence"] = mini_confidence
    mini_result["confidence_level"] = get_confidence_level(mini_confidence)
    mini_result["ocr_provider"] = "gpt-4o-mini"
    mini_result["fallback_used"] = False
    mini_result["strategy"] = "hybrid"
    
    # Step 3: Check if fallback needed
    if mini_confidence >= CONFIDENCE_THRESHOLD:
        # Good enough, return mini result
        return mini_result
    
    # Step 4: Fallback to gpt-4o for better accuracy
    full_provider = OpenAIFullProvider()
    full_result = await full_provider.extract_receipt(img_bytes)
    
    full_confidence = analyze_confidence(full_result)
    full_result["confidence"] = full_confidence
    full_result["confidence_level"] = get_confidence_level(full_confidence)
    full_result["ocr_provider"] = "gpt-4o"
    full_result["fallback_used"] = True
    full_result["strategy"] = "hybrid"
    full_result["mini_confidence"] = mini_confidence
    
    # Return the better result
    if full_confidence > mini_confidence:
        return full_result
    else:
        # Mini was actually better, return it but mark that we tried fallback
        mini_result["fallback_used"] = True
        mini_result["fallback_confidence"] = full_confidence
        return mini_result


async def process_invoice_hybrid(
    img_bytes: bytes,
    force_model: Literal["mini", "full", "auto"] = "auto"
) -> Dict[str, Any]:
    """
    Process invoice with hybrid OCR strategy.
    
    Same strategy as receipts but for invoice documents.
    
    Args:
        img_bytes: Image bytes to process
        force_model: Force specific model ("mini", "full", or "auto")
    
    Returns:
        OCR result with confidence score and metadata
    """
    
    # Force specific model if requested
    if force_model == "full":
        provider = OpenAIFullProvider()
        result = await provider.extract_invoice(img_bytes)
        confidence_score = analyze_confidence(result)
        result["confidence"] = confidence_score
        result["confidence_level"] = get_confidence_level(confidence_score)
        result["ocr_provider"] = "gpt-4o"
        result["fallback_used"] = False
        result["strategy"] = "forced_full"
        return result
    
    if force_model == "mini":
        provider = OpenAIMiniProvider()
        result = await provider.extract_invoice(img_bytes)
        confidence_score = analyze_confidence(result)
        result["confidence"] = confidence_score
        result["confidence_level"] = get_confidence_level(confidence_score)
        result["ocr_provider"] = "gpt-4o-mini"
        result["fallback_used"] = False
        result["strategy"] = "forced_mini"
        return result
    
    # Auto mode: Hybrid strategy
    mini_provider = OpenAIMiniProvider()
    mini_result = await mini_provider.extract_invoice(img_bytes)
    
    mini_confidence = analyze_confidence(mini_result)
    mini_result["confidence"] = mini_confidence
    mini_result["confidence_level"] = get_confidence_level(mini_confidence)
    mini_result["ocr_provider"] = "gpt-4o-mini"
    mini_result["fallback_used"] = False
    mini_result["strategy"] = "hybrid"
    
    if mini_confidence >= CONFIDENCE_THRESHOLD:
        return mini_result
    
    # Fallback to gpt-4o
    full_provider = OpenAIFullProvider()
    full_result = await full_provider.extract_invoice(img_bytes)
    
    full_confidence = analyze_confidence(full_result)
    full_result["confidence"] = full_confidence
    full_result["confidence_level"] = get_confidence_level(full_confidence)
    full_result["ocr_provider"] = "gpt-4o"
    full_result["fallback_used"] = True
    full_result["strategy"] = "hybrid"
    full_result["mini_confidence"] = mini_confidence
    
    if full_confidence > mini_confidence:
        return full_result
    else:
        mini_result["fallback_used"] = True
        mini_result["fallback_confidence"] = full_confidence
        return mini_result


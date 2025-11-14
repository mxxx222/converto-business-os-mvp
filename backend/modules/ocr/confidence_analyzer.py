"""Confidence scoring logic for OCR results."""

from __future__ import annotations

from typing import Dict, Any
import re


def analyze_confidence(result: Dict[str, Any]) -> float:
    """
    Analyze OCR result confidence based on completeness and data quality.
    
    Returns a confidence score between 0.0 and 1.0.
    Score < 0.88 triggers fallback to gpt-4o.
    """
    
    # If there's an error, confidence is 0
    if result.get("error"):
        return 0.0
    
    score = 0.0
    max_score = 0.0
    
    # Critical fields (high weight)
    critical_fields = {
        "vendor": 0.15,
        "total_amount": 0.20,
        "vat_amount": 0.15,
        "receipt_date": 0.10,
        "invoice_date": 0.10,
    }
    
    for field, weight in critical_fields.items():
        max_score += weight
        value = result.get(field)
        if value is not None and value != "" and value != 0:
            score += weight
    
    # Important fields (medium weight)
    important_fields = {
        "vat_rate": 0.10,
        "net_amount": 0.10,
        "invoice_number": 0.05,
        "payment_method": 0.03,
    }
    
    for field, weight in important_fields.items():
        max_score += weight
        value = result.get(field)
        if value is not None and value != "":
            score += weight
    
    # Optional fields (low weight)
    optional_fields = {
        "y_tunnus": 0.07,
        "items": 0.05,
        "currency": 0.02,
    }
    
    for field, weight in optional_fields.items():
        max_score += weight
        value = result.get(field)
        if field == "items":
            if value and isinstance(value, list) and len(value) > 0:
                score += weight
        elif field == "y_tunnus":
            if value and validate_y_tunnus_format(value):
                score += weight
        elif value is not None and value != "":
            score += weight
    
    # Data quality checks (bonus points)
    quality_bonus = 0.0
    
    # Check VAT calculation consistency
    total = result.get("total_amount")
    vat = result.get("vat_amount")
    net = result.get("net_amount")
    
    if all(isinstance(x, (int, float)) for x in [total, vat, net]):
        # Check if total = net + vat (with 1% tolerance)
        if abs(total - (net + vat)) / max(total, 0.01) < 0.01:
            quality_bonus += 0.05
        
        # Check if VAT rate makes sense (14%, 24%, etc.)
        vat_rate = result.get("vat_rate")
        if vat_rate in [10, 14, 24, 0]:
            quality_bonus += 0.03
    
    # Check Y-tunnus format if present
    y_tunnus = result.get("y_tunnus")
    if y_tunnus and validate_y_tunnus_format(y_tunnus):
        quality_bonus += 0.03
    
    # Check date format
    date_field = result.get("receipt_date") or result.get("invoice_date")
    if date_field and validate_date_format(date_field):
        quality_bonus += 0.02
    
    # Normalize score
    if max_score > 0:
        normalized_score = score / max_score
    else:
        normalized_score = 0.0
    
    # Add quality bonus (capped at 1.0)
    final_score = min(1.0, normalized_score + quality_bonus)
    
    return round(final_score, 3)


def validate_y_tunnus_format(y_tunnus: str) -> bool:
    """Validate Y-tunnus format (1234567-8)."""
    if not y_tunnus or not isinstance(y_tunnus, str):
        return False
    
    pattern = r'^\d{7}-\d$'
    return bool(re.match(pattern, y_tunnus.strip()))


def validate_date_format(date_str: str) -> bool:
    """Validate date format (YYYY-MM-DD)."""
    if not date_str or not isinstance(date_str, str):
        return False
    
    pattern = r'^\d{4}-\d{2}-\d{2}$'
    return bool(re.match(pattern, date_str.strip()))


def get_confidence_level(score: float) -> str:
    """Get human-readable confidence level."""
    if score >= 0.95:
        return "excellent"
    elif score >= 0.88:
        return "high"
    elif score >= 0.75:
        return "medium"
    elif score >= 0.50:
        return "low"
    else:
        return "very_low"


"""Finnish VAT intelligence service."""

from __future__ import annotations

from typing import Dict, Any, Optional
from .vat_rates import determine_vat_rate, get_vat_rate_name, FINNISH_VAT_RATES
from .y_tunnus_validator import validate_y_tunnus, extract_y_tunnus, format_y_tunnus
from .vat_calculator import (
    calculate_vat_breakdown,
    validate_vat_calculation,
    calculate_items_vat,
    suggest_vat_correction,
)


def analyze_receipt_vat(receipt_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze receipt with Finnish VAT intelligence.
    
    Adds:
    - Y-tunnus validation
    - VAT rate detection and validation
    - VAT calculation verification
    - Suggested corrections if needed
    
    Args:
        receipt_data: OCR extracted receipt data
    
    Returns:
        Enhanced receipt data with VAT analysis
    """
    analysis = {
        "original_data": receipt_data,
        "vat_analysis": {},
        "y_tunnus_analysis": {},
        "validation": {},
        "suggestions": [],
    }
    
    # Analyze Y-tunnus
    y_tunnus = receipt_data.get("y_tunnus")
    if y_tunnus:
        is_valid = validate_y_tunnus(y_tunnus)
        formatted = format_y_tunnus(y_tunnus)
        
        analysis["y_tunnus_analysis"] = {
            "y_tunnus": y_tunnus,
            "formatted": formatted,
            "is_valid": is_valid,
        }
        
        if not is_valid:
            analysis["suggestions"].append({
                "field": "y_tunnus",
                "message": "Y-tunnus format is invalid",
                "severity": "warning"
            })
    else:
        # Try to extract Y-tunnus from vendor name or other text
        vendor = receipt_data.get("vendor", "")
        extracted = extract_y_tunnus(vendor)
        
        if extracted:
            analysis["y_tunnus_analysis"] = {
                "y_tunnus": extracted,
                "formatted": extracted,
                "is_valid": True,
                "extracted_from": "vendor"
            }
            analysis["suggestions"].append({
                "field": "y_tunnus",
                "message": f"Y-tunnus extracted from vendor: {extracted}",
                "severity": "info"
            })
    
    # Analyze VAT rate
    vendor = receipt_data.get("vendor", "")
    vat_rate = receipt_data.get("vat_rate")
    
    if vat_rate is not None:
        # Convert percentage to decimal if needed
        if vat_rate > 1:
            vat_rate = vat_rate / 100
        
        # Determine expected VAT rate based on vendor
        expected_rate = determine_vat_rate(vendor)
        rate_name = get_vat_rate_name(vat_rate)
        
        analysis["vat_analysis"] = {
            "detected_rate": vat_rate,
            "detected_percentage": f"{vat_rate * 100:.0f}%",
            "rate_name": rate_name,
            "expected_rate": expected_rate,
            "expected_percentage": f"{expected_rate * 100:.0f}%",
            "matches_vendor": abs(vat_rate - expected_rate) < 0.01,
        }
        
        if abs(vat_rate - expected_rate) > 0.01:
            analysis["suggestions"].append({
                "field": "vat_rate",
                "message": f"VAT rate {vat_rate * 100:.0f}% unusual for {vendor} (expected {expected_rate * 100:.0f}%)",
                "severity": "warning"
            })
    
    # Validate VAT calculation
    total = receipt_data.get("total_amount")
    vat = receipt_data.get("vat_amount")
    net = receipt_data.get("net_amount")
    
    if all(x is not None for x in [total, vat, net, vat_rate]):
        validation = validate_vat_calculation(total, vat, net, vat_rate)
        analysis["validation"] = validation
        
        if not validation["is_valid"]:
            # Suggest correction
            correction = suggest_vat_correction(total, vat, net)
            if correction:
                analysis["suggestions"].append({
                    "field": "vat_calculation",
                    "message": "VAT calculation inconsistent",
                    "severity": "error",
                    "correction": correction
                })
    
    # Analyze items if present
    items = receipt_data.get("items", [])
    if items and isinstance(items, list) and len(items) > 0:
        items_analysis = calculate_items_vat(items, vat_rate or 0.24)
        analysis["items_vat_breakdown"] = items_analysis
        
        # Check if items total matches receipt total
        if total:
            items_total = items_analysis["totals"]["total_amount"]
            diff = abs(total - items_total)
            
            if diff > 0.02:
                analysis["suggestions"].append({
                    "field": "items",
                    "message": f"Items total ({items_total:.2f}€) doesn't match receipt total ({total:.2f}€)",
                    "severity": "warning",
                    "difference": round(diff, 2)
                })
    
    return analysis


def analyze_invoice_vat(invoice_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze invoice with Finnish VAT intelligence.
    
    Similar to receipt analysis but with invoice-specific checks.
    
    Args:
        invoice_data: OCR extracted invoice data
    
    Returns:
        Enhanced invoice data with VAT analysis
    """
    analysis = {
        "original_data": invoice_data,
        "vat_analysis": {},
        "y_tunnus_analysis": {},
        "customer_y_tunnus_analysis": {},
        "validation": {},
        "suggestions": [],
    }
    
    # Analyze vendor Y-tunnus
    y_tunnus = invoice_data.get("y_tunnus")
    if y_tunnus:
        is_valid = validate_y_tunnus(y_tunnus)
        formatted = format_y_tunnus(y_tunnus)
        
        analysis["y_tunnus_analysis"] = {
            "y_tunnus": y_tunnus,
            "formatted": formatted,
            "is_valid": is_valid,
            "role": "vendor"
        }
        
        if not is_valid:
            analysis["suggestions"].append({
                "field": "y_tunnus",
                "message": "Vendor Y-tunnus format is invalid",
                "severity": "error"
            })
    
    # Analyze customer Y-tunnus
    customer_y_tunnus = invoice_data.get("customer_y_tunnus")
    if customer_y_tunnus:
        is_valid = validate_y_tunnus(customer_y_tunnus)
        formatted = format_y_tunnus(customer_y_tunnus)
        
        analysis["customer_y_tunnus_analysis"] = {
            "y_tunnus": customer_y_tunnus,
            "formatted": formatted,
            "is_valid": is_valid,
            "role": "customer"
        }
        
        if not is_valid:
            analysis["suggestions"].append({
                "field": "customer_y_tunnus",
                "message": "Customer Y-tunnus format is invalid",
                "severity": "warning"
            })
    
    # Analyze VAT rate
    vendor = invoice_data.get("vendor", "")
    vat_rate = invoice_data.get("vat_rate")
    
    if vat_rate is not None:
        if vat_rate > 1:
            vat_rate = vat_rate / 100
        
        expected_rate = determine_vat_rate(vendor)
        rate_name = get_vat_rate_name(vat_rate)
        
        analysis["vat_analysis"] = {
            "detected_rate": vat_rate,
            "detected_percentage": f"{vat_rate * 100:.0f}%",
            "rate_name": rate_name,
            "expected_rate": expected_rate,
            "expected_percentage": f"{expected_rate * 100:.0f}%",
            "matches_vendor": abs(vat_rate - expected_rate) < 0.01,
        }
    
    # Validate VAT calculation
    total = invoice_data.get("total_amount")
    vat = invoice_data.get("vat_amount")
    net = invoice_data.get("net_amount")
    
    if all(x is not None for x in [total, vat, net, vat_rate]):
        validation = validate_vat_calculation(total, vat, net, vat_rate)
        analysis["validation"] = validation
        
        if not validation["is_valid"]:
            correction = suggest_vat_correction(total, vat, net)
            if correction:
                analysis["suggestions"].append({
                    "field": "vat_calculation",
                    "message": "VAT calculation inconsistent",
                    "severity": "error",
                    "correction": correction
                })
    
    # Analyze items
    items = invoice_data.get("items", [])
    if items and isinstance(items, list) and len(items) > 0:
        items_analysis = calculate_items_vat(items, vat_rate or 0.24)
        analysis["items_vat_breakdown"] = items_analysis
        
        if total:
            items_total = items_analysis["totals"]["total_amount"]
            diff = abs(total - items_total)
            
            if diff > 0.02:
                analysis["suggestions"].append({
                    "field": "items",
                    "message": f"Items total ({items_total:.2f}€) doesn't match invoice total ({total:.2f}€)",
                    "severity": "warning",
                    "difference": round(diff, 2)
                })
    
    # Check payment terms
    payment_terms = invoice_data.get("payment_terms")
    due_date = invoice_data.get("due_date")
    
    if not payment_terms and not due_date:
        analysis["suggestions"].append({
            "field": "payment_terms",
            "message": "Missing payment terms and due date",
            "severity": "warning"
        })
    
    return analysis


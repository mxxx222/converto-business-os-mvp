"""VAT calculation and validation utilities."""

from __future__ import annotations

from typing import Dict, Any, List, Optional
from decimal import Decimal, ROUND_HALF_UP


def calculate_vat_breakdown(
    total_amount: float,
    vat_rate: float,
    include_vat: bool = True
) -> Dict[str, float]:
    """
    Calculate VAT breakdown from total amount.
    
    Args:
        total_amount: Total amount (with or without VAT)
        vat_rate: VAT rate as decimal (e.g., 0.24 for 24%)
        include_vat: Whether total_amount includes VAT
    
    Returns:
        Dictionary with net_amount, vat_amount, total_amount
    """
    # Use Decimal for precise calculations
    total = Decimal(str(total_amount))
    rate = Decimal(str(vat_rate))
    
    if include_vat:
        # Total includes VAT: calculate backwards
        # net = total / (1 + rate)
        # vat = total - net
        net = (total / (1 + rate)).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        vat = total - net
    else:
        # Total is net: calculate forwards
        # vat = net * rate
        # total = net + vat
        net = total
        vat = (net * rate).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        total = net + vat
    
    return {
        "net_amount": float(net),
        "vat_amount": float(vat),
        "total_amount": float(total),
        "vat_rate": float(rate),
        "vat_percentage": float(rate * 100),
    }


def validate_vat_calculation(
    total_amount: float,
    vat_amount: float,
    net_amount: float,
    vat_rate: float,
    tolerance: float = 0.02
) -> Dict[str, Any]:
    """
    Validate VAT calculation consistency.
    
    Checks:
    1. total = net + vat
    2. vat = net * rate
    
    Args:
        total_amount: Total amount with VAT
        vat_amount: VAT amount
        net_amount: Net amount without VAT
        vat_rate: VAT rate as decimal
        tolerance: Allowed difference (default 0.02 EUR)
    
    Returns:
        Validation result with errors if any
    """
    errors = []
    warnings = []
    
    # Check 1: total = net + vat
    calculated_total = net_amount + vat_amount
    total_diff = abs(total_amount - calculated_total)
    
    if total_diff > tolerance:
        errors.append({
            "field": "total_amount",
            "message": f"Total ({total_amount:.2f}) != Net ({net_amount:.2f}) + VAT ({vat_amount:.2f})",
            "difference": round(total_diff, 2)
        })
    elif total_diff > 0.01:
        warnings.append({
            "field": "total_amount",
            "message": f"Minor rounding difference: {total_diff:.2f}€"
        })
    
    # Check 2: vat = net * rate
    calculated_vat = net_amount * vat_rate
    vat_diff = abs(vat_amount - calculated_vat)
    
    if vat_diff > tolerance:
        errors.append({
            "field": "vat_amount",
            "message": f"VAT ({vat_amount:.2f}) != Net ({net_amount:.2f}) × Rate ({vat_rate:.2%})",
            "difference": round(vat_diff, 2),
            "expected_vat": round(calculated_vat, 2)
        })
    elif vat_diff > 0.01:
        warnings.append({
            "field": "vat_amount",
            "message": f"Minor VAT calculation difference: {vat_diff:.2f}€"
        })
    
    # Check 3: VAT rate is valid Finnish rate
    valid_rates = [0.00, 0.10, 0.14, 0.24]
    rate_valid = any(abs(vat_rate - valid_rate) < 0.001 for valid_rate in valid_rates)
    
    if not rate_valid:
        warnings.append({
            "field": "vat_rate",
            "message": f"Unusual VAT rate: {vat_rate:.2%} (Finnish rates: 0%, 10%, 14%, 24%)"
        })
    
    return {
        "is_valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "total_difference": round(total_diff, 2),
        "vat_difference": round(vat_diff, 2),
    }


def calculate_items_vat(
    items: List[Dict[str, Any]],
    default_vat_rate: float = 0.24
) -> Dict[str, Any]:
    """
    Calculate VAT breakdown for multiple items.
    
    Args:
        items: List of items with quantity, unit_price, total_price, vat_rate
        default_vat_rate: Default VAT rate if not specified
    
    Returns:
        Aggregated VAT breakdown by rate
    """
    # Group by VAT rate
    vat_groups: Dict[float, Dict[str, float]] = {}
    
    for item in items:
        vat_rate = item.get("vat_rate", default_vat_rate)
        if isinstance(vat_rate, (int, float)) and vat_rate > 1:
            # Convert percentage to decimal
            vat_rate = vat_rate / 100
        
        total_price = item.get("total_price", 0)
        
        if vat_rate not in vat_groups:
            vat_groups[vat_rate] = {
                "net_amount": 0,
                "vat_amount": 0,
                "total_amount": 0,
            }
        
        # Calculate VAT for this item
        breakdown = calculate_vat_breakdown(total_price, vat_rate, include_vat=True)
        
        vat_groups[vat_rate]["net_amount"] += breakdown["net_amount"]
        vat_groups[vat_rate]["vat_amount"] += breakdown["vat_amount"]
        vat_groups[vat_rate]["total_amount"] += breakdown["total_amount"]
    
    # Format results
    vat_breakdown = []
    total_net = 0
    total_vat = 0
    total_amount = 0
    
    for rate, amounts in sorted(vat_groups.items()):
        vat_breakdown.append({
            "vat_rate": rate,
            "vat_percentage": round(rate * 100, 1),
            "net_amount": round(amounts["net_amount"], 2),
            "vat_amount": round(amounts["vat_amount"], 2),
            "total_amount": round(amounts["total_amount"], 2),
        })
        
        total_net += amounts["net_amount"]
        total_vat += amounts["vat_amount"]
        total_amount += amounts["total_amount"]
    
    return {
        "vat_breakdown": vat_breakdown,
        "totals": {
            "net_amount": round(total_net, 2),
            "vat_amount": round(total_vat, 2),
            "total_amount": round(total_amount, 2),
        }
    }


def suggest_vat_correction(
    total_amount: float,
    vat_amount: float,
    net_amount: float
) -> Optional[Dict[str, Any]]:
    """
    Suggest VAT rate correction if calculation doesn't match.
    
    Args:
        total_amount: Total amount with VAT
        vat_amount: VAT amount
        net_amount: Net amount without VAT
    
    Returns:
        Suggested correction or None if calculation is correct
    """
    # Try each Finnish VAT rate
    valid_rates = [0.24, 0.14, 0.10, 0.00]
    
    for rate in valid_rates:
        breakdown = calculate_vat_breakdown(total_amount, rate, include_vat=True)
        
        # Check if this rate makes the calculation consistent
        vat_diff = abs(breakdown["vat_amount"] - vat_amount)
        net_diff = abs(breakdown["net_amount"] - net_amount)
        
        if vat_diff < 0.02 and net_diff < 0.02:
            return {
                "suggested_vat_rate": rate,
                "suggested_vat_percentage": f"{rate * 100:.0f}%",
                "corrected_net_amount": breakdown["net_amount"],
                "corrected_vat_amount": breakdown["vat_amount"],
                "reason": f"Calculation matches {rate * 100:.0f}% VAT rate"
            }
    
    return None


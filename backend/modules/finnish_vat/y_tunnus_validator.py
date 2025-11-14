"""Finnish Y-tunnus (business ID) validation."""

from __future__ import annotations

import re
from typing import Optional


def validate_y_tunnus(y_tunnus: str) -> bool:
    """
    Validate Finnish business ID (Y-tunnus) format and check digit.
    
    Format: 1234567-8 (7 digits, dash, 1 check digit)
    
    Args:
        y_tunnus: Business ID to validate
    
    Returns:
        True if valid, False otherwise
    """
    if not y_tunnus or not isinstance(y_tunnus, str):
        return False
    
    # Clean whitespace
    y_tunnus = y_tunnus.strip()
    
    # Check format: 7 digits, dash, 1 digit
    pattern = r'^\d{7}-\d$'
    if not re.match(pattern, y_tunnus):
        return False
    
    # Validate check digit
    digits = y_tunnus.replace('-', '')
    
    # Multipliers for check digit calculation
    multipliers = [7, 9, 10, 5, 8, 4, 2]
    
    # Calculate sum
    total = sum(int(digits[i]) * multipliers[i] for i in range(7))
    
    # Calculate remainder
    remainder = total % 11
    
    # Determine expected check digit
    if remainder == 0:
        expected_check_digit = 0
    elif remainder == 1:
        # Remainder 1 is not valid
        return False
    else:
        expected_check_digit = 11 - remainder
    
    # Compare with actual check digit
    actual_check_digit = int(digits[7])
    
    return actual_check_digit == expected_check_digit


def extract_y_tunnus(text: str) -> Optional[str]:
    """
    Extract Y-tunnus from text.
    
    Looks for patterns matching Y-tunnus format and validates them.
    
    Args:
        text: Text to search for Y-tunnus
    
    Returns:
        First valid Y-tunnus found, or None
    """
    if not text:
        return None
    
    # Pattern for Y-tunnus: 7 digits, dash, 1 digit
    pattern = r'\b\d{7}-\d\b'
    matches = re.findall(pattern, text)
    
    # Return first valid match
    for match in matches:
        if validate_y_tunnus(match):
            return match
    
    return None


def format_y_tunnus(y_tunnus: str) -> Optional[str]:
    """
    Format Y-tunnus to standard format (1234567-8).
    
    Handles various input formats:
    - 12345678 -> 1234567-8
    - 1234567 8 -> 1234567-8
    - 1234567-8 -> 1234567-8
    
    Args:
        y_tunnus: Business ID in any format
    
    Returns:
        Formatted Y-tunnus or None if invalid
    """
    if not y_tunnus:
        return None
    
    # Remove all non-digits
    digits_only = re.sub(r'\D', '', y_tunnus)
    
    # Must have exactly 8 digits
    if len(digits_only) != 8:
        return None
    
    # Format as 1234567-8
    formatted = f"{digits_only[:7]}-{digits_only[7]}"
    
    # Validate
    if validate_y_tunnus(formatted):
        return formatted
    
    return None


def get_y_tunnus_info(y_tunnus: str) -> dict:
    """
    Get information about a Y-tunnus.
    
    Args:
        y_tunnus: Business ID to analyze
    
    Returns:
        Dictionary with Y-tunnus information
    """
    is_valid = validate_y_tunnus(y_tunnus)
    formatted = format_y_tunnus(y_tunnus) if not is_valid else y_tunnus
    
    return {
        "y_tunnus": y_tunnus,
        "formatted": formatted,
        "is_valid": is_valid,
        "format": "1234567-8 (7 digits, dash, 1 check digit)",
        "description": "Finnish Business ID (Y-tunnus)",
    }


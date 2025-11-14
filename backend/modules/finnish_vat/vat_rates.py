"""Finnish VAT rates and vendor mappings."""

from __future__ import annotations

from typing import Dict

# Finnish VAT rates (as of 2024)
FINNISH_VAT_RATES: Dict[str, float] = {
    "GENERAL": 0.24,      # 24% yleinen verokanta
    "FOOD": 0.14,         # 14% elintarvikkeet
    "BOOKS": 0.10,        # 10% kirjat, lehdet, liikunta, lääkkeet
    "EXEMPT": 0.00        # Veroton (terveydenhuolto, koulutus, rahoitus)
}

# Vendor to VAT rate mapping (Finnish market)
VENDOR_VAT_MAPPING: Dict[str, str] = {
    # Ruokakaupat - 14% elintarvikkeille, 24% muille tuotteille
    "k-market": "FOOD",
    "k-supermarket": "FOOD",
    "k-citymarket": "FOOD",
    "s-market": "FOOD",
    "sale": "FOOD",
    "prisma": "FOOD",
    "lidl": "FOOD",
    "alepa": "FOOD",
    "siwa": "FOOD",
    "valintatalo": "FOOD",
    "minimani": "FOOD",
    
    # Huoltoasemat - 24% polttoaineelle ja muille tuotteille
    "neste": "GENERAL",
    "shell": "GENERAL",
    "st1": "GENERAL",
    "esso": "GENERAL",
    "teboil": "GENERAL",
    "abc": "GENERAL",
    
    # Kirjakaupat - 10% kirjoille
    "suomalainen kirjakauppa": "BOOKS",
    "akateeminen": "BOOKS",
    "kirja": "BOOKS",
    
    # Apteekit - 10% lääkkeille (reseptilääkkeet veroton)
    "apteekki": "BOOKS",
    "yliopiston apteekki": "BOOKS",
    
    # Ravintolat - 14% ruoalle, 24% alkoholille
    "ravintola": "FOOD",
    "kahvila": "FOOD",
    "baari": "GENERAL",
    
    # Liikunta - 10%
    "kuntosali": "BOOKS",
    "uimahalli": "BOOKS",
    
    # Elektroniikka ja yleinen - 24%
    "verkkokauppa": "GENERAL",
    "gigantti": "GENERAL",
    "power": "GENERAL",
    "elisa": "GENERAL",
    "dna": "GENERAL",
    "telia": "GENERAL",
    "sonera": "GENERAL",
}

# Item keywords for VAT rate detection
ITEM_VAT_KEYWORDS: Dict[str, str] = {
    # 14% elintarvikkeet
    "FOOD": [
        "leipä", "bread", "maito", "milk", "juusto", "cheese",
        "liha", "meat", "kala", "fish", "vihannes", "vegetable",
        "hedelmä", "fruit", "kahvi", "coffee", "tee", "tea",
        "ruoka", "food", "ateria", "meal", "lounas", "lunch",
        "aamiainen", "breakfast", "illallinen", "dinner",
    ],
    
    # 24% yleinen
    "GENERAL": [
        "bensiini", "diesel", "fuel", "polttoaine",
        "alkoholi", "alcohol", "viini", "wine", "olut", "beer",
        "tupakka", "tobacco", "savuke", "cigarette",
        "elektroniikka", "electronics", "puhelin", "phone",
        "tietokone", "computer", "tabletti", "tablet",
    ],
    
    # 10% kirjat, lehdet, liikunta, lääkkeet
    "BOOKS": [
        "kirja", "book", "lehti", "magazine", "sanomalehti", "newspaper",
        "liikunta", "sport", "kuntoilu", "fitness", "uinti", "swimming",
        "lääke", "medicine", "resepti", "prescription",
    ],
}


def determine_vat_rate(vendor: str, item_description: str = "") -> float:
    """
    Määritä ALV-kanta myyjän ja tuotteen perusteella.
    
    Args:
        vendor: Myyjän nimi
        item_description: Tuotteen kuvaus (valinnainen)
    
    Returns:
        ALV-kanta desimaalilukuna (esim. 0.24 = 24%)
    """
    vendor_lower = vendor.lower() if vendor else ""
    item_lower = item_description.lower() if item_description else ""
    
    # Check vendor mapping first
    for vendor_key, rate_type in VENDOR_VAT_MAPPING.items():
        if vendor_key in vendor_lower:
            # For food stores, check if item is non-food (24%)
            if rate_type == "FOOD" and item_lower:
                # Check if item is actually non-food
                for keyword in ITEM_VAT_KEYWORDS["GENERAL"]:
                    if keyword in item_lower:
                        return FINNISH_VAT_RATES["GENERAL"]
            
            return FINNISH_VAT_RATES[rate_type]
    
    # Check item keywords if vendor not found
    if item_lower:
        for rate_type, keywords in ITEM_VAT_KEYWORDS.items():
            for keyword in keywords:
                if keyword in item_lower:
                    return FINNISH_VAT_RATES[rate_type]
    
    # Default to general rate
    return FINNISH_VAT_RATES["GENERAL"]


def get_vat_rate_name(rate: float) -> str:
    """Get human-readable VAT rate name."""
    for name, value in FINNISH_VAT_RATES.items():
        if abs(value - rate) < 0.001:  # Float comparison with tolerance
            return name
    return "UNKNOWN"


def get_finnish_vat_rates_info() -> Dict[str, any]:
    """Get information about Finnish VAT rates."""
    return {
        "rates": {
            "general": {
                "rate": FINNISH_VAT_RATES["GENERAL"],
                "percentage": f"{FINNISH_VAT_RATES['GENERAL'] * 100:.0f}%",
                "description": "Yleinen verokanta (tavarat ja palvelut)",
                "examples": ["Elektroniikka", "Vaatteet", "Polttoaine", "Alkoholi"]
            },
            "food": {
                "rate": FINNISH_VAT_RATES["FOOD"],
                "percentage": f"{FINNISH_VAT_RATES['FOOD'] * 100:.0f}%",
                "description": "Elintarvikkeet ja ravintola-ateriat",
                "examples": ["Ruoka", "Juomat (ei alkoholi)", "Ravintola-ateria"]
            },
            "books": {
                "rate": FINNISH_VAT_RATES["BOOKS"],
                "percentage": f"{FINNISH_VAT_RATES['BOOKS'] * 100:.0f}%",
                "description": "Kirjat, lehdet, liikunta, lääkkeet",
                "examples": ["Kirjat", "Sanomalehdet", "Kuntosali", "Lääkkeet"]
            },
            "exempt": {
                "rate": FINNISH_VAT_RATES["EXEMPT"],
                "percentage": "0%",
                "description": "Verottomat palvelut",
                "examples": ["Terveydenhuolto", "Koulutus", "Rahoituspalvelut"]
            }
        },
        "last_updated": "2024-01-01",
        "source": "Verohallinto"
    }


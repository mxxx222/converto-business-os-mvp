"""Vision AI service for receipts and invoices processing."""

import os
import base64
import json
import time
from typing import Dict, Any, Optional, List
from openai import OpenAI
from datetime import datetime, date
import re

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
VISION_MODEL = os.getenv("VISION_MODEL", "gpt-4o-mini")

# Kuittien tunnistus prompt
RECEIPT_PROMPT = (
    "Tehtävä: tunnista kuitti kuvasta ja erota kaikki tiedot. Vastaa JSONina.\n"
    "Pakolliset kentät:\n"
    "- vendor: myyjän nimi (string)\n"
    "- total_amount: kokonaissumma (number)\n"
    "- vat_amount: ALV summa (number)\n"
    "- vat_rate: ALV prosentti (number)\n"
    "- net_amount: netto summa (number)\n"
    "- receipt_date: päivämäärä (YYYY-MM-DD)\n"
    "- invoice_number: kuitin numero (string)\n"
    "- payment_method: maksutapa (string)\n"
    "- currency: valuutta (string, default EUR)\n"
    "- items: tuotteet (array of objects with name, quantity, unit_price, total_price)\n"
    "- confidence: luottamus (0.0-1.0)\n"
    "\n"
    "Jos jotain ei löydy, käytä null. Ei selityksiä, vain JSON."
)

# Laskujen tunnistus prompt
INVOICE_PROMPT = (
    "Tehtävä: tunnista lasku kuvasta ja erota kaikki tiedot. Vastaa JSONina.\n"
    "Pakolliset kentät:\n"
    "- vendor: toimittajan nimi (string)\n"
    "- customer: asiakkaan nimi (string)\n"
    "- total_amount: kokonaissumma (number)\n"
    "- vat_amount: ALV summa (number)\n"
    "- vat_rate: ALV prosentti (number)\n"
    "- net_amount: netto summa (number)\n"
    "- invoice_date: laskun päivämäärä (YYYY-MM-DD)\n"
    "- due_date: eräpäivä (YYYY-MM-DD)\n"
    "- invoice_number: laskun numero (string)\n"
    "- reference_number: viitenumero (string)\n"
    "- payment_terms: maksuehdot (string)\n"
    "- currency: valuutta (string, default EUR)\n"
    "- items: tuotteet/palvelut (array of objects with name, quantity, unit_price, total_price)\n"
    "- confidence: luottamus (0.0-1.0)\n"
    "\n"
    "Jos jotain ei löydy, käytä null. Ei selityksiä, vain JSON."
)


def process_receipt(img_bytes: bytes) -> Dict[str, Any]:
    """Käsittele kuitti Vision AI:lla"""
    start_time = time.time()
    
    try:
        b64 = base64.b64encode(img_bytes).decode()
        
        response = client.chat.completions.create(
            model=VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": RECEIPT_PROMPT},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                    ],
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        
        result = json.loads(response.choices[0].message.content)
        processing_time = int((time.time() - start_time) * 1000)
        
        # Validoi ja korjaa tulokset
        validated_result = validate_receipt_data(result)
        validated_result["processing_time_ms"] = processing_time
        validated_result["vision_ai_model"] = VISION_MODEL
        
        return validated_result
        
    except Exception as e:
        return {
            "error": str(e),
            "vendor": None,
            "total_amount": None,
            "vat_amount": None,
            "vat_rate": None,
            "net_amount": None,
            "receipt_date": None,
            "invoice_number": None,
            "payment_method": None,
            "currency": "EUR",
            "items": [],
            "confidence": 0.0,
            "processing_time_ms": int((time.time() - start_time) * 1000),
            "vision_ai_model": VISION_MODEL
        }


def process_invoice(img_bytes: bytes) -> Dict[str, Any]:
    """Käsittele lasku Vision AI:lla"""
    start_time = time.time()
    
    try:
        b64 = base64.b64encode(img_bytes).decode()
        
        response = client.chat.completions.create(
            model=VISION_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": INVOICE_PROMPT},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                    ],
                }
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        
        result = json.loads(response.choices[0].message.content)
        processing_time = int((time.time() - start_time) * 1000)
        
        # Validoi ja korjaa tulokset
        validated_result = validate_invoice_data(result)
        validated_result["processing_time_ms"] = processing_time
        validated_result["vision_ai_model"] = VISION_MODEL
        
        return validated_result
        
    except Exception as e:
        return {
            "error": str(e),
            "vendor": None,
            "customer": None,
            "total_amount": None,
            "vat_amount": None,
            "vat_rate": None,
            "net_amount": None,
            "invoice_date": None,
            "due_date": None,
            "invoice_number": None,
            "reference_number": None,
            "payment_terms": None,
            "currency": "EUR",
            "items": [],
            "confidence": 0.0,
            "processing_time_ms": int((time.time() - start_time) * 1000),
            "vision_ai_model": VISION_MODEL
        }


def validate_receipt_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validoi kuittien tiedot"""
    # Korjaa numerot
    data["total_amount"] = extract_number(data.get("total_amount"))
    data["vat_amount"] = extract_number(data.get("vat_amount"))
    data["vat_rate"] = extract_number(data.get("vat_rate"))
    data["net_amount"] = extract_number(data.get("net_amount"))
    
    # Korjaa päivämäärä
    data["receipt_date"] = parse_date(data.get("receipt_date"))
    
    # Varmista että confidence on numero
    if not isinstance(data.get("confidence"), (int, float)):
        data["confidence"] = 0.5
    
    # Validoi tuotteet
    if isinstance(data.get("items"), list):
        validated_items = []
        for item in data["items"]:
            if isinstance(item, dict):
                validated_item = {
                    "name": str(item.get("name", "")),
                    "quantity": extract_number(item.get("quantity")) or 1.0,
                    "unit_price": extract_number(item.get("unit_price")) or 0.0,
                    "total_price": extract_number(item.get("total_price")) or 0.0,
                }
                validated_items.append(validated_item)
        data["items"] = validated_items
    else:
        data["items"] = []
    
    # Varmista valuutta
    if not data.get("currency"):
        data["currency"] = "EUR"
    
    return data


def validate_invoice_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validoi laskujen tiedot"""
    # Korjaa numerot
    data["total_amount"] = extract_number(data.get("total_amount"))
    data["vat_amount"] = extract_number(data.get("vat_amount"))
    data["vat_rate"] = extract_number(data.get("vat_rate"))
    data["net_amount"] = extract_number(data.get("net_amount"))
    
    # Korjaa päivämäärät
    data["invoice_date"] = parse_date(data.get("invoice_date"))
    data["due_date"] = parse_date(data.get("due_date"))
    
    # Varmista että confidence on numero
    if not isinstance(data.get("confidence"), (int, float)):
        data["confidence"] = 0.5
    
    # Validoi tuotteet
    if isinstance(data.get("items"), list):
        validated_items = []
        for item in data["items"]:
            if isinstance(item, dict):
                validated_item = {
                    "name": str(item.get("name", "")),
                    "quantity": extract_number(item.get("quantity")) or 1.0,
                    "unit_price": extract_number(item.get("unit_price")) or 0.0,
                    "total_price": extract_number(item.get("total_price")) or 0.0,
                }
                validated_items.append(validated_item)
        data["items"] = validated_items
    else:
        data["items"] = []
    
    # Varmista valuutta
    if not data.get("currency"):
        data["currency"] = "EUR"
    
    return data


def extract_number(value: Any) -> Optional[float]:
    """Poimi numero tekstistä"""
    if value is None:
        return None
    
    if isinstance(value, (int, float)):
        return float(value)
    
    if isinstance(value, str):
        # Poimi numerot ja desimaalipisteet
        numbers = re.findall(r'\d+[.,]?\d*', value.replace(',', '.'))
        if numbers:
            try:
                return float(numbers[0])
            except ValueError:
                return None
    
    return None


def parse_date(date_str: Any) -> Optional[str]:
    """Parse päivämäärä YYYY-MM-DD muotoon"""
    if not date_str:
        return None
    
    if isinstance(date_str, date):
        return date_str.strftime("%Y-%m-%d")
    
    if isinstance(date_str, datetime):
        return date_str.strftime("%Y-%m-%d")
    
    if isinstance(date_str, str):
        # Yleisimmät päivämäärämuodot
        formats = [
            "%Y-%m-%d",
            "%d.%m.%Y",
            "%d/%m/%Y",
            "%d-%m-%Y",
            "%Y.%m.%d",
            "%Y/%m/%d",
            "%d.%m.%y",
            "%d/%m/%y",
            "%d-%m-%y"
        ]
        
        for fmt in formats:
            try:
                parsed = datetime.strptime(date_str.strip(), fmt)
                return parsed.strftime("%Y-%m-%d")
            except ValueError:
                continue
    
    return None


def categorize_receipt(receipt_data: Dict[str, Any]) -> Dict[str, Any]:
    """Kategorisoi kuitti automaattisesti"""
    vendor = receipt_data.get("vendor", "").lower()
    items = receipt_data.get("items", [])
    
    # Kategorisointi myyjän perusteella
    if any(keyword in vendor for keyword in ["k-market", "s-market", "prisma", "citymarket"]):
        category = "groceries"
        subcategory = "supermarket"
    elif any(keyword in vendor for keyword in ["shell", "neste", "esso", "huoltoasema"]):
        category = "transportation"
        subcategory = "fuel"
    elif any(keyword in vendor for keyword in ["verkkokauppa", "elisa", "dna", "telia"]):
        category = "technology"
        subcategory = "electronics"
    elif any(keyword in vendor for keyword in ["apteekki", "pharmacy"]):
        category = "healthcare"
        subcategory = "pharmacy"
    else:
        category = "other"
        subcategory = "general"
    
    # Lisää kategorisointi tuotteiden perusteella
    tags = []
    for item in items:
        item_name = item.get("name", "").lower()
        if any(keyword in item_name for keyword in ["kahvi", "coffee", "tee", "tea"]):
            tags.append("beverages")
        elif any(keyword in item_name for keyword in ["leipä", "bread", "maito", "milk"]):
            tags.append("food")
        elif any(keyword in item_name for keyword in ["bensiini", "diesel", "fuel"]):
            tags.append("fuel")
    
    receipt_data["category"] = category
    receipt_data["subcategory"] = subcategory
    receipt_data["tags"] = list(set(tags))
    
    return receipt_data


def categorize_invoice(invoice_data: Dict[str, Any]) -> Dict[str, Any]:
    """Kategorisoi lasku automaattisesti"""
    vendor = invoice_data.get("vendor", "").lower()
    items = invoice_data.get("items", [])
    
    # Kategorisointi myyjän perusteella
    if any(keyword in vendor for keyword in ["palvelu", "service", "consulting", "neuvonta"]):
        category = "services"
        subcategory = "consulting"
    elif any(keyword in vendor for keyword in ["toimisto", "office", "vuokra", "rent"]):
        category = "office"
        subcategory = "rent"
    elif any(keyword in vendor for keyword in ["sähkö", "electricity", "vesi", "water"]):
        category = "utilities"
        subcategory = "utilities"
    elif any(keyword in vendor for keyword in ["marketing", "mainos", "advertising"]):
        category = "marketing"
        subcategory = "advertising"
    else:
        category = "other"
        subcategory = "general"
    
    # Lisää kategorisointi tuotteiden perusteella
    tags = []
    for item in items:
        item_name = item.get("name", "").lower()
        if any(keyword in item_name for keyword in ["ohjelmisto", "software", "lisenssi", "license"]):
            tags.append("software")
        elif any(keyword in item_name for keyword in ["koulutus", "training", "kurssi", "course"]):
            tags.append("training")
        elif any(keyword in item_name for keyword in ["huolto", "maintenance", "korjaus", "repair"]):
            tags.append("maintenance")
    
    invoice_data["category"] = category
    invoice_data["subcategory"] = subcategory
    invoice_data["tags"] = list(set(tags))
    
    return invoice_data

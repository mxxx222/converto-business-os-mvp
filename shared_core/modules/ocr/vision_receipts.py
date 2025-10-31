import os
import base64
import json
from openai import OpenAI
from typing import Dict, Any, Optional
import re
from datetime import datetime

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
VISION_MODEL = os.getenv("VISION_MODEL", "gpt-4o-mini")

# Kuittien tunnistus prompt
RECEIPT_PROMPT = (
    "Tehtävä: tunnista kuitti/lasku kuvasta ja erota kaikki tiedot. Vastaa JSONina.\n"
    "Pakolliset kentät:\n"
    "- vendor: myyjän nimi\n"
    "- total_amount: kokonaissumma (numero)\n"
    "- vat_amount: ALV summa (numero)\n"
    "- vat_rate: ALV prosentti (numero)\n"
    "- date: päivämäärä (YYYY-MM-DD)\n"
    "- items: tuotteet/palvelut (array)\n"
    "- invoice_number: laskun numero\n"
    "- payment_method: maksutapa\n"
    "- confidence: luottamus (0.0-1.0)\n"
    "\n"
    "Jos jotain ei löydy, käytä null. Ei selityksiä, vain JSON."
)

# Laskujen tunnistus prompt
INVOICE_PROMPT = (
    "Tehtävä: tunnista lasku kuvasta ja erota kaikki tiedot. Vastaa JSONina.\n"
    "Pakolliset kentät:\n"
    "- vendor: toimittajan nimi\n"
    "- customer: asiakkaan nimi\n"
    "- total_amount: kokonaissumma (numero)\n"
    "- vat_amount: ALV summa (numero)\n"
    "- vat_rate: ALV prosentti (numero)\n"
    "- date: päivämäärä (YYYY-MM-DD)\n"
    "- due_date: eräpäivä (YYYY-MM-DD)\n"
    "- items: tuotteet/palvelut (array)\n"
    "- invoice_number: laskun numero\n"
    "- payment_terms: maksuehdot\n"
    "- confidence: luottamus (0.0-1.0)\n"
    "\n"
    "Jos jotain ei löydy, käytä null. Ei selityksiä, vain JSON."
)

def vision_enrich_receipt(img_bytes: bytes) -> Dict[str, Any]:
    """Tunnista kuitti Vision AI:lla"""
    b64 = base64.b64encode(img_bytes).decode()
    
    try:
        r = client.chat.completions.create(
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
            temperature=0.1,  # Pienempi lämpötila tarkempaan tunnistukseen
        )
        
        result = json.loads(r.choices[0].message.content)
        
        # Validoi ja korjaa tulokset
        return validate_receipt_data(result)
        
    except Exception as e:
        print(f"Vision AI receipt error: {e}")
        return {
            "vendor": None,
            "total_amount": None,
            "vat_amount": None,
            "vat_rate": None,
            "date": None,
            "items": [],
            "invoice_number": None,
            "payment_method": None,
            "confidence": 0.0,
            "error": str(e)
        }

def vision_enrich_invoice(img_bytes: bytes) -> Dict[str, Any]:
    """Tunnista lasku Vision AI:lla"""
    b64 = base64.b64encode(img_bytes).decode()
    
    try:
        r = client.chat.completions.create(
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
        
        result = json.loads(r.choices[0].message.content)
        
        # Validoi ja korjaa tulokset
        return validate_invoice_data(result)
        
    except Exception as e:
        print(f"Vision AI invoice error: {e}")
        return {
            "vendor": None,
            "customer": None,
            "total_amount": None,
            "vat_amount": None,
            "vat_rate": None,
            "date": None,
            "due_date": None,
            "items": [],
            "invoice_number": None,
            "payment_terms": None,
            "confidence": 0.0,
            "error": str(e)
        }

def validate_receipt_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validoi kuittien tiedot"""
    # Korjaa numerot
    if isinstance(data.get("total_amount"), str):
        data["total_amount"] = extract_number(data["total_amount"])
    
    if isinstance(data.get("vat_amount"), str):
        data["vat_amount"] = extract_number(data["vat_amount"])
    
    if isinstance(data.get("vat_rate"), str):
        data["vat_rate"] = extract_number(data["vat_rate"])
    
    # Korjaa päivämäärä
    if data.get("date"):
        data["date"] = parse_date(data["date"])
    
    # Varmista että confidence on numero
    if not isinstance(data.get("confidence"), (int, float)):
        data["confidence"] = 0.5
    
    return data

def validate_invoice_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validoi laskujen tiedot"""
    # Korjaa numerot
    if isinstance(data.get("total_amount"), str):
        data["total_amount"] = extract_number(data["total_amount"])
    
    if isinstance(data.get("vat_amount"), str):
        data["vat_amount"] = extract_number(data["vat_amount"])
    
    if isinstance(data.get("vat_rate"), str):
        data["vat_rate"] = extract_number(data["vat_rate"])
    
    # Korjaa päivämäärät
    if data.get("date"):
        data["date"] = parse_date(data["date"])
    
    if data.get("due_date"):
        data["due_date"] = parse_date(data["due_date"])
    
    # Varmista että confidence on numero
    if not isinstance(data.get("confidence"), (int, float)):
        data["confidence"] = 0.5
    
    return data

def extract_number(text: str) -> Optional[float]:
    """Poimi numero tekstistä"""
    if not text:
        return None
    
    # Poimi numerot ja desimaalipisteet
    numbers = re.findall(r'\d+[.,]?\d*', text.replace(',', '.'))
    if numbers:
        try:
            return float(numbers[0])
        except ValueError:
            return None
    return None

def parse_date(date_str: str) -> Optional[str]:
    """Parse päivämäärä YYYY-MM-DD muotoon"""
    if not date_str:
        return None
    
    # Yleisimmät päivämäärämuodot
    formats = [
        "%Y-%m-%d",
        "%d.%m.%Y",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%Y.%m.%d",
        "%Y/%m/%d"
    ]
    
    for fmt in formats:
        try:
            parsed = datetime.strptime(date_str.strip(), fmt)
            return parsed.strftime("%Y-%m-%d")
        except ValueError:
            continue
    
    return date_str  # Palauta alkuperäinen jos ei parsittu

# Yleinen Vision AI funktio (vanha, säilytetään yhteensopivuuden vuoksi)
def vision_enrich(img_bytes: bytes) -> dict:
    """Vanha funktio sähkölaitteiden tunnistukseen"""
    b64 = base64.b64encode(img_bytes).decode()
    r = client.chat.completions.create(
        model=VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Tehtävä: tunnista laite ja sähkötehot kuvasta. Vastaa JSONina.\nPakolliset: device_type, brand_model, rated_watts, peak_watts, voltage_v, current_a, confidence.\nJos arvaus, confidence ≤ 0.6. Ei selityksiä."},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                ],
            }
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    try:
        return r.choices[0].message.parsed or {}
    except Exception:
        return json.loads(r.choices[0].message.content)

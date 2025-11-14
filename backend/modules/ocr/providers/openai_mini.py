"""OpenAI gpt-4o-mini provider for cost-effective OCR."""

from __future__ import annotations

import os
import base64
import json
import time
from typing import Dict, Any
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL = "gpt-4o-mini"

# Finnish receipt extraction prompt
RECEIPT_PROMPT = """Tehtävä: Tunnista kuitti kuvasta ja pura kaikki tiedot. Vastaa JSONina.

Pakolliset kentät:
- vendor: myyjän nimi (string)
- y_tunnus: Y-tunnus jos löytyy (string, muoto: 1234567-8)
- total_amount: kokonaissumma (number)
- vat_amount: ALV summa (number)
- vat_rate: ALV prosentti (number, esim 24 tarkoittaa 24%)
- net_amount: netto summa ilman ALV:ia (number)
- receipt_date: päivämäärä (string, YYYY-MM-DD)
- invoice_number: kuitin/laskun numero (string)
- payment_method: maksutapa (string)
- currency: valuutta (string, default EUR)
- items: tuotteet (array of objects with: name, quantity, unit_price, total_price, vat_rate)

Jos jotain ei löydy, käytä null. Ei selityksiä, vain JSON.
Varmista että numerot ovat oikein ja ALV-laskelmat täsmäävät."""

INVOICE_PROMPT = """Tehtävä: Tunnista lasku kuvasta ja pura kaikki tiedot. Vastaa JSONina.

Pakolliset kentät:
- vendor: toimittajan nimi (string)
- y_tunnus: Y-tunnus (string, muoto: 1234567-8)
- customer: asiakkaan nimi (string)
- customer_y_tunnus: asiakkaan Y-tunnus jos löytyy (string)
- total_amount: kokonaissumma (number)
- vat_amount: ALV summa (number)
- vat_rate: ALV prosentti (number)
- net_amount: netto summa (number)
- invoice_date: laskun päivämäärä (string, YYYY-MM-DD)
- due_date: eräpäivä (string, YYYY-MM-DD)
- invoice_number: laskun numero (string)
- reference_number: viitenumero (string)
- payment_terms: maksuehdot (string)
- currency: valuutta (string, default EUR)
- items: tuotteet/palvelut (array of objects with: name, quantity, unit_price, total_price, vat_rate)

Jos jotain ei löydy, käytä null. Ei selityksiä, vain JSON."""


class OpenAIMiniProvider:
    """OpenAI gpt-4o-mini provider for cost-effective OCR processing."""
    
    def __init__(self):
        self.model = MODEL
        self.client = client
    
    async def extract_receipt(self, img_bytes: bytes) -> Dict[str, Any]:
        """Extract receipt data using gpt-4o-mini."""
        start_time = time.time()
        
        try:
            b64 = base64.b64encode(img_bytes).decode()
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": RECEIPT_PROMPT},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
                            },
                        ],
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
            )
            
            result = json.loads(response.choices[0].message.content)
            processing_time = int((time.time() - start_time) * 1000)
            
            result["processing_time_ms"] = processing_time
            result["model"] = self.model
            
            return result
            
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
                "processing_time_ms": int((time.time() - start_time) * 1000),
                "model": self.model,
            }
    
    async def extract_invoice(self, img_bytes: bytes) -> Dict[str, Any]:
        """Extract invoice data using gpt-4o-mini."""
        start_time = time.time()
        
        try:
            b64 = base64.b64encode(img_bytes).decode()
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": INVOICE_PROMPT},
                            {
                                "type": "image_url",
                                "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
                            },
                        ],
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
            )
            
            result = json.loads(response.choices[0].message.content)
            processing_time = int((time.time() - start_time) * 1000)
            
            result["processing_time_ms"] = processing_time
            result["model"] = self.model
            
            return result
            
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
                "processing_time_ms": int((time.time() - start_time) * 1000),
                "model": self.model,
            }


"""OpenAI gpt-4o provider for high-accuracy OCR fallback."""

from __future__ import annotations

import os
import base64
import json
import time
from typing import Dict, Any
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
MODEL = "gpt-4o"

# Enhanced Finnish receipt extraction prompt for high accuracy
RECEIPT_PROMPT = """Tehtävä: Tunnista kuitti kuvasta erittäin tarkasti. Vastaa JSONina.

TÄRKEÄÄ: Ole erityisen tarkka numeroiden ja ALV-laskelmien kanssa.

Pakolliset kentät:
- vendor: myyjän nimi täsmälleen kuten kuitissa (string)
- y_tunnus: Y-tunnus jos löytyy (string, muoto: 1234567-8)
- total_amount: kokonaissumma (number, tarkista että täsmää)
- vat_amount: ALV summa (number, tarkista laskutoimituksella)
- vat_rate: ALV prosentti (number, esim 24 tarkoittaa 24%)
- net_amount: netto summa ilman ALV:ia (number, total_amount - vat_amount)
- receipt_date: päivämäärä (string, YYYY-MM-DD)
- invoice_number: kuitin/laskun numero (string)
- payment_method: maksutapa (string: käteinen, kortti, lasku, etc)
- currency: valuutta (string, default EUR)
- items: tuotteet (array of objects with: name, quantity, unit_price, total_price, vat_rate)

VALIDOINTI:
1. Tarkista että total_amount = net_amount + vat_amount
2. Tarkista että vat_amount = net_amount * (vat_rate / 100)
3. Tarkista että items-summa täsmää total_amount:iin
4. Y-tunnus tulee olla muodossa 1234567-8 (7 numeroa, viiva, 1 numero)

Jos jotain ei löydy, käytä null. Ei selityksiä, vain JSON."""

INVOICE_PROMPT = """Tehtävä: Tunnista lasku kuvasta erittäin tarkasti. Vastaa JSONina.

TÄRKEÄÄ: Ole erityisen tarkka numeroiden, Y-tunnusten ja ALV-laskelmien kanssa.

Pakolliset kentät:
- vendor: toimittajan nimi täsmälleen kuten laskussa (string)
- y_tunnus: toimittajan Y-tunnus (string, muoto: 1234567-8)
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
- payment_terms: maksuehdot (string, esim "14 päivää netto")
- currency: valuutta (string, default EUR)
- items: tuotteet/palvelut (array of objects with: name, quantity, unit_price, total_price, vat_rate)

VALIDOINTI:
1. Tarkista että total_amount = net_amount + vat_amount
2. Tarkista että vat_amount = net_amount * (vat_rate / 100)
3. Y-tunnukset muodossa 1234567-8
4. Päivämäärät YYYY-MM-DD muodossa

Jos jotain ei löydy, käytä null. Ei selityksiä, vain JSON."""


class OpenAIFullProvider:
    """OpenAI gpt-4o provider for high-accuracy OCR processing."""
    
    def __init__(self):
        self.model = MODEL
        self.client = client
    
    async def extract_receipt(self, img_bytes: bytes) -> Dict[str, Any]:
        """Extract receipt data using gpt-4o with enhanced accuracy."""
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
                temperature=0.0,  # Lower temperature for more deterministic results
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
        """Extract invoice data using gpt-4o with enhanced accuracy."""
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
                temperature=0.0,
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


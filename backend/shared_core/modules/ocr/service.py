from typing import Optional
import re
import io
import os
import cv2
import numpy as np
from PIL import Image
import pytesseract


OCR_LANG = os.getenv("OCR_LANG", "fin+eng")


def _load_image(b: bytes) -> np.ndarray:
    img = Image.open(io.BytesIO(b)).convert("RGB")
    return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)


def _preprocess(img: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.fastNlMeansDenoising(gray, None, 7, 7, 21)
    thr = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 35, 11
    )
    return thr


def run_ocr_bytes(b: bytes) -> str:
    img = _load_image(b)
    proc = _preprocess(img)
    cfg = "--oem 1 --psm 6"
    return pytesseract.image_to_string(proc, lang=OCR_LANG, config=cfg)


W_REGEX = re.compile(r"(\d{2,5})\s*(kW|KW|W|w|VA|va)")
V_REGEX = re.compile(r"(\d{2,3})\s*V\b")
A_REGEX = re.compile(r"(\d{1,3}(?:[.,]\d{1,2})?)\s*A\b", re.I)


def extract_specs(text: str) -> dict:
    t = text.replace(",", ".")
    rated_watts = None
    m = W_REGEX.search(t)
    if m:
        n, u = int(m.group(1)), m.group(2).lower()
        rated_watts = n * 1000 if u == "kw" else int(n * 0.8) if u == "va" else n
    voltage = int(V_REGEX.search(t).group(1)) if V_REGEX.search(t) else None
    current = float(A_REGEX.search(t).group(1)) if A_REGEX.search(t) else None
    return {"rated_watts": rated_watts, "voltage_v": voltage, "current_a": current, "ocr_raw": text}


def merge(device_hint: Optional[str], ocr: dict, vision: Optional[dict]) -> dict:
    d = {
        "device_type": (vision or {}).get("device_type") or (device_hint or "device"),
        "brand_model": (vision or {}).get("brand_model"),
        "rated_watts": ocr.get("rated_watts") or (vision or {}).get("rated_watts"),
        "voltage_v": ocr.get("voltage_v") or (vision or {}).get("voltage_v"),
        "current_a": ocr.get("current_a") or (vision or {}).get("current_a"),
        "confidence": (vision or {}).get("confidence", 0.6),
    }
    d["peak_watts"] = (vision or {}).get("peak_watts") or (
        int(d["rated_watts"] * 1.2) if d.get("rated_watts") else None
    )
    return d
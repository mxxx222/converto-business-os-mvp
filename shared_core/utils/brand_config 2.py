import os


BRAND = os.getenv("APP_BRAND", "converto").lower()

CONFIG = {
    "converto": {
        "name": "Converto™ Business OS",
        "primary": "#0AA1DD",
        "accent": "#C77DFF",
        "notify_template": "business_summary.html",
        "channels": ["slack", "email"],
    },
    "fixuwatti": {
        "name": "FixuWatti™ Smart Power",
        "primary": "#FBC02D",
        "accent": "#388E3C",
        "notify_template": "rental_receipt.html",
        "channels": ["whatsapp", "email"],
    },
}.get(BRAND, {})

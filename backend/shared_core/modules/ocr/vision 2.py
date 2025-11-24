import os
import base64
import json
from openai import OpenAI


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
VISION_MODEL = os.getenv("VISION_MODEL", "gpt-4o-mini")

PROMPT = (
    "Tehtävä: tunnista laite ja sähkötehot kuvasta. Vastaa JSONina.\n"
    "Pakolliset: device_type, brand_model, rated_watts, peak_watts, voltage_v, current_a, confidence.\n"
    "Jos arvaus, confidence ≤ 0.6. Ei selityksiä."
)


def vision_enrich(img_bytes: bytes) -> dict:
    b64 = base64.b64encode(img_bytes).decode()
    r = client.chat.completions.create(
        model=VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": PROMPT},
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

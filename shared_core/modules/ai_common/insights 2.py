def recommend_bundle(wh: int) -> str:
    if wh <= 600:
        return "FixuLite / Converto-Lite (600Wh)"
    if wh <= 1000:
        return "FixuSolar / Converto-Std (1000Wh)"
    return "FixuUltra / Converto-Pro (2000Wh)"


def kpis_example() -> dict:
    return {"ocr_success": 0.93, "ai_accept_rate": 0.71, "next_month_cost_forecast": -0.08}

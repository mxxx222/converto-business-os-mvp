"""
Adaptive Pricing Engine for Converto Billing Service

Computes recommended plan and add-ons based on tenant usage, with
cost modeling for OCR scans and AI token consumption.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any, Optional


@dataclass
class PricingInputs:
    plan_type: str
    ocr_scans_month: int
    ai_tokens_month: int  # tokens
    users: int
    currency: str = "EUR"


@dataclass
class CostModel:
    ocr_cost_per_scan_eur: float = 0.02
    ai_cost_per_1k_tokens_eur: float = 0.003
    extra_user_cost_eur: float = 9.0


def estimate_variable_cost(inputs: PricingInputs, model: Optional[CostModel] = None) -> float:
    model = model or CostModel()
    ocr_cost = inputs.ocr_scans_month * model.ocr_cost_per_scan_eur
    ai_cost = (inputs.ai_tokens_month / 1000.0) * model.ai_cost_per_1k_tokens_eur
    extra_users = max(0, inputs.users - (1 if inputs.plan_type == "starter" else (5 if inputs.plan_type == "professional" else 9999)))
    user_cost = extra_users * model.extra_user_cost_eur
    return round(ocr_cost + ai_cost + user_cost, 2)


def recommend_plan(inputs: PricingInputs) -> Dict[str, Any]:
    """Simple heuristic recommendation based on usage vs. plan limits."""
    # Plan limits must match the service-level PLANS definition
    limits = {
        "starter": {"ocr": 150, "tokens": 150_000, "users": 1, "base": 29.0},
        "professional": {"ocr": 500, "tokens": 400_000, "users": 5, "base": 99.0},
        "enterprise": {"ocr": -1, "tokens": 1_000_000, "users": -1, "base": 299.0},
    }
    # Determine recommended plan
    rec = "starter"
    for plan in ("starter", "professional", "enterprise"):
        lim = limits[plan]
        ocr_ok = inputs.ocr_scans_month <= lim["ocr"] or lim["ocr"] < 0
        tok_ok = inputs.ai_tokens_month <= lim["tokens"] or lim["tokens"] < 0
        usr_ok = inputs.users <= lim["users"] or lim["users"] < 0
        if ocr_ok and tok_ok and usr_ok:
            rec = plan
            break
        rec = "enterprise"  # if we fail all

    return {
        "recommended_plan": rec,
        "reason": "Usage fits within plan limits" if rec != "enterprise" else "High usage requires enterprise tier",
        "base_price_eur": limits[rec]["base"],
    }


def calculate_adaptive_pricing(inputs: PricingInputs, model: Optional[CostModel] = None) -> Dict[str, Any]:
    model = model or CostModel()
    variable_cost = estimate_variable_cost(inputs, model)
    plan_rec = recommend_plan(inputs)
    total_estimate = round(plan_rec["base_price_eur"] + variable_cost, 2)
    return {
        "tenant_inputs": inputs.__dict__,
        "cost_model": model.__dict__,
        "plan_recommendation": plan_rec,
        "variable_cost_eur": variable_cost,
        "estimated_monthly_total_eur": total_estimate,
        "generated_at": datetime.utcnow().isoformat(),
    }



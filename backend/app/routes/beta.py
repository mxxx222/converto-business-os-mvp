from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from typing import List

router = APIRouter(prefix="/api", tags=["beta"])


class BetaSignupRequest(BaseModel):
    company_name: str = Field(min_length=1, max_length=100)
    contact_name: str | None = Field(None, max_length=100)
    email: EmailStr
    phone: str | None = Field(None, max_length=20)
    document_types: List[str] = Field(min_items=1)
    monthly_invoices: str
    current_system: str | None = None
    biggest_challenge: str | None = None
    start_timeline: str | None = None
    weekly_feedback_ok: bool = False
    source: str = Field(default="website")


@router.post("/beta-signup")
async def beta_signup(payload: BetaSignupRequest) -> dict[str, str]:
    """
    Beta signup endpoint for DocFlow.fi
    Public endpoint - no authentication required
    """
    try:
        # TODO: Save to Supabase beta_signups table
        # TODO: Send welcome email via Resend
        # TODO: Send admin notification
        
        # For now, just return success
        return {
            "message": "Beta signup successful",
            "status": "pending_review",
            "company": payload.company_name,
            "email": payload.email
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Beta signup failed: {str(e)}"
        )


@router.get("/beta-status")
async def beta_status() -> dict[str, int]:
    """
    Get current beta program status
    Public endpoint - no authentication required
    """
    return {
        "spots_available": 7,
        "total_spots": 10, 
        "applications_received": 3
    }
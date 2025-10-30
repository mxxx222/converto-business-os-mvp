from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

from backend.app.core.metrics import record_lead_created, record_lead_error


class LeadCreate(BaseModel):
    email: EmailStr
    company: str | None = None
    name: str | None = None
    phone: str | None = None
    note: str | None = None
    consent: bool = Field(default=False, description="GDPR consent")


router = APIRouter(prefix="/api", tags=["leads"])


@router.post("/leads")
async def create_lead(payload: LeadCreate) -> dict[str, bool]:
    if not payload.consent:
        record_lead_error()
        raise HTTPException(status_code=400, detail="consent required")

    # Persisting to DB is optional at this MVP stage; metrics are recorded.
    record_lead_created()
    return {"ok": True}

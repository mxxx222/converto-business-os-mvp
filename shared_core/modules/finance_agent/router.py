"""API router for FinanceAgent."""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from shared_core.utils.db import get_session

from .models import (
    AgentContextRequest,
    AgentDecisionResponse,
    AgentFeedbackRequest,
    AgentInsight,
    SpendingAlert,
)
from .service import FinanceAgentService

router = APIRouter(prefix="/api/v1/finance-agent", tags=["finance-agent"])


class AgentAnalysisResponse(BaseModel):
    """Response model for agent analysis."""

    insights: list[AgentInsight]
    alerts: list[SpendingAlert]
    decisions_count: int


@router.post("/analyze", response_model=AgentAnalysisResponse)
async def analyze_finances(
    request: AgentContextRequest,
    db: Session = Depends(get_session),
) -> AgentAnalysisResponse:
    """Analyze finances and generate insights."""

    agent = FinanceAgentService(
        tenant_id=request.tenant_id,
        user_id=request.user_id,
    )

    # Analyze receipts
    insights = agent.analyze_receipts(db, days_back=request.days_back)

    # Detect spending alerts
    alerts = agent.detect_spending_alerts(db)

    return AgentAnalysisResponse(
        insights=insights,
        alerts=alerts,
        decisions_count=len(insights),
    )


@router.get("/decisions", response_model=list[AgentDecisionResponse])
async def get_decisions(
    tenant_id: str,
    limit: int = 10,
    db: Session = Depends(get_session),
) -> list[AgentDecisionResponse]:
    """Get active agent decisions."""

    agent = FinanceAgentService(tenant_id=tenant_id)
    return agent.get_active_decisions(db, limit=limit)


@router.post("/feedback")
async def submit_feedback(
    feedback: AgentFeedbackRequest,
    db: Session = Depends(get_session),
) -> dict[str, str]:
    """Submit user feedback for agent learning."""

    # Get tenant_id from decision
    from .models import AgentDecision

    decision = db.query(AgentDecision).filter(AgentDecision.id == feedback.decision_id).first()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    agent = FinanceAgentService(
        tenant_id=decision.tenant_id,
        user_id=decision.user_id,
    )

    agent.store_user_feedback(
        db=db,
        decision_id=feedback.decision_id,
        feedback_type=feedback.feedback_type.value,
        rating=feedback.rating,
        comment=feedback.comment,
    )

    return {"status": "feedback_stored", "decision_id": feedback.decision_id}


@router.get("/insights", response_model=list[AgentInsight])
async def get_insights(
    tenant_id: str,
    days_back: int = 30,
    db: Session = Depends(get_session),
) -> list[AgentInsight]:
    """Get financial insights for tenant."""

    agent = FinanceAgentService(tenant_id=tenant_id)
    return agent.analyze_receipts(db, days_back=days_back)


@router.get("/insights/dashboard")
async def get_dashboard_insights(
    tenant_id: str | None = None,
    days_back: int = 30,
    db: Session = Depends(get_session),
) -> dict:
    """Get dashboard-formatted insights (compatible with frontend dashboard)."""

    # Get tenant_id from request state if not provided
    # This endpoint should be called with auth middleware setting tenant_id
    try:
        agent = FinanceAgentService(tenant_id=tenant_id or "dev-tenant")
        insights = agent.analyze_receipts(db, days_back=days_back)
        agent.detect_spending_alerts(db)

        # Convert to dashboard format
        dashboard_insights = []
        for insight in insights:
            dashboard_insights.append(
                {
                    "id": insight.id if hasattr(insight, "id") else str(hash(str(insight))),
                    "title": insight.title if hasattr(insight, "title") else str(insight),
                    "description": insight.description if hasattr(insight, "description") else "",
                    "type": insight.type if hasattr(insight, "type") else "recommendation",
                    "impact": insight.impact if hasattr(insight, "impact") else "medium",
                    "confidence": insight.confidence if hasattr(insight, "confidence") else 0.8,
                    "created_at": datetime.now().isoformat(),
                }
            )

        return {
            "insights": dashboard_insights,
            "generated_at": datetime.now().isoformat(),
            "receipt_count": 0,  # TODO: Get from DB
            "total_amount": 0.0,
            "total_vat": 0.0,
            "avg_amount": 0.0,
        }
    except Exception:
        # Return empty insights on error (fallback to demo data)
        return {
            "insights": [],
            "generated_at": datetime.now().isoformat(),
            "receipt_count": 0,
            "total_amount": 0.0,
            "total_vat": 0.0,
            "avg_amount": 0.0,
        }


@router.get("/alerts", response_model=list[SpendingAlert])
async def get_spending_alerts(
    tenant_id: str,
    category: str | None = None,
    db: Session = Depends(get_session),
) -> list[SpendingAlert]:
    """Get spending alerts."""

    agent = FinanceAgentService(tenant_id=tenant_id)
    return agent.detect_spending_alerts(db, category=category)


@router.get("/health")
async def agent_health() -> dict[str, str]:
    """Health check for FinanceAgent."""
    import os

    return {
        "status": "ok",
        "service": "FinanceAgent",
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "pinecone_configured": bool(os.getenv("PINECONE_API_KEY")),
    }

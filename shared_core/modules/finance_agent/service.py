"""FinanceAgent Service - Main orchestrator for financial AI agent."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any, Optional

from sqlalchemy.orm import Session

from shared_core.utils.db import get_session

from .memory import MemoryLayer
from .models import (
    AgentDecision,
    AgentFeedback,
    AgentDecisionResponse,
    AgentInsight,
    FinancialPattern,
    SpendingAlert,
    DecisionType,
)
from .reasoning import ReasoningEngine

logger = logging.getLogger("converto.finance_agent")


class FinanceAgentService:
    """Main service for FinanceAgent functionality."""
    
    def __init__(self, tenant_id: str, user_id: Optional[str] = None):
        self.tenant_id = tenant_id
        self.user_id = user_id
        self.memory = MemoryLayer(tenant_id)
        self.reasoning = ReasoningEngine()
    
    def analyze_receipts(
        self,
        db: Session,
        days_back: int = 30,
    ) -> list[AgentInsight]:
        """Analyze recent receipts and generate insights."""
        
        # Get recent receipts
        from shared_core.modules.receipts.models import Receipt
        
        cutoff_date = datetime.utcnow() - timedelta(days=days_back)
        receipts = db.query(Receipt).filter(
            Receipt.tenant_id == self.tenant_id,
            Receipt.receipt_date >= cutoff_date.date(),
        ).order_by(Receipt.receipt_date.desc()).limit(100).all()
        
        # Build context
        context_data = self._build_receipt_context(receipts)
        
        # Retrieve relevant memory
        query_text = f"Receipts and spending patterns for tenant {self.tenant_id}"
        memory_context = self.memory.retrieve_context(query_text, top_k=5)
        
        # Add memory to context
        if memory_context:
            context_data["memory_context"] = [
                m["metadata"].get("content_text", "")[:200]
                for m in memory_context
            ]
        
        # Run reasoning
        analysis = self.reasoning.analyze_financial_context(context_data)
        
        # Convert to insights
        insights = []
        for insight_data in analysis.get("insights", []):
            insights.append(AgentInsight(
                category=insight_data.get("type", "unknown"),
                insight_type=insight_data.get("type", "unknown"),
                message=insight_data.get("summary", ""),
                severity=insight_data.get("severity", "info"),
                metadata={
                    "title": insight_data.get("title"),
                    "recommendation": insight_data.get("recommendation"),
                    "action_items": insight_data.get("action_items", []),
                    "confidence": insight_data.get("confidence", 0.0),
                },
            ))
        
        # Store decisions in database
        for insight in insights:
            self._store_decision(db, insight)
        
        return insights
    
    def detect_spending_alerts(
        self,
        db: Session,
        category: Optional[str] = None,
    ) -> list[SpendingAlert]:
        """Detect spending anomalies and generate alerts."""
        
        from shared_core.modules.receipts.models import Receipt
        
        # Get current and previous period
        now = datetime.utcnow()
        current_start = now - timedelta(days=30)
        previous_start = current_start - timedelta(days=30)
        
        # Query receipts
        current_query = db.query(Receipt).filter(
            Receipt.tenant_id == self.tenant_id,
            Receipt.receipt_date >= current_start.date(),
        )
        
        previous_query = db.query(Receipt).filter(
            Receipt.tenant_id == self.tenant_id,
            Receipt.receipt_date >= previous_start.date(),
            Receipt.receipt_date < current_start.date(),
        )
        
        if category:
            current_query = current_query.filter(Receipt.category == category)
            previous_query = previous_query.filter(Receipt.category == category)
        
        current_receipts = current_query.all()
        previous_receipts = previous_query.all()
        
        # Calculate totals
        current_total = sum(r.total_amount for r in current_receipts)
        previous_total = sum(r.total_amount for r in previous_receipts)
        
        alerts = []
        
        if previous_total > 0:
            change_percent = ((current_total - previous_total) / previous_total) * 100
            
            # Alert if increase > 30%
            if change_percent > 30:
                alerts.append(SpendingAlert(
                    category=category or "all",
                    current_amount=current_total,
                    previous_amount=previous_total,
                    change_percent=change_percent,
                    threshold_exceeded=True,
                    message=f"Spending increased by {change_percent:.1f}% compared to previous period",
                    recommendation="Review expenses and identify cost-saving opportunities.",
                ))
        
        return alerts
    
    def store_user_feedback(
        self,
        db: Session,
        decision_id: str,
        feedback_type: str,
        rating: Optional[int] = None,
        comment: Optional[str] = None,
    ) -> None:
        """Store user feedback for learning."""
        
        feedback = AgentFeedback(
            tenant_id=self.tenant_id,
            decision_id=decision_id,
            feedback_type=feedback_type,
            rating=rating,
            comment=comment,
        )
        
        db.add(feedback)
        db.commit()
        
        # Update memory based on feedback
        if feedback_type == "positive":
            # Store positive decision pattern
            decision = db.query(AgentDecision).filter(AgentDecision.id == decision_id).first()
            if decision:
                self.memory.store_memory(
                    content_type="positive_decision",
                    content_id=str(decision.id),
                    content_text=decision.summary or decision.title,
                    metadata={"feedback_type": feedback_type, "rating": rating},
                )
    
    def get_active_decisions(
        self,
        db: Session,
        limit: int = 10,
    ) -> list[AgentDecisionResponse]:
        """Get active (unacknowledged) decisions."""
        
        decisions = db.query(AgentDecision).filter(
            AgentDecision.tenant_id == self.tenant_id,
            AgentDecision.acknowledged == False,
            AgentDecision.dismissed == False,
        ).order_by(AgentDecision.created_at.desc()).limit(limit).all()
        
        return [
            AgentDecisionResponse(
                id=str(d.id),
                decision_type=d.decision_type,
                title=d.title,
                summary=d.summary,
                recommendation=d.recommendation,
                action_items=d.action_items or [],
                confidence=d.confidence,
                created_at=d.created_at,
                acknowledged=d.acknowledged,
            )
            for d in decisions
        ]
    
    def _build_receipt_context(self, receipts: list) -> dict[str, Any]:
        """Build context data from receipts."""
        if not receipts:
            return {"receipts": []}
        
        # Group by category
        spending_by_category = {}
        for r in receipts:
            cat = r.category or "other"
            spending_by_category[cat] = spending_by_category.get(cat, 0) + r.total_amount
        
        return {
            "receipts": [
                {
                    "vendor": r.vendor,
                    "total_amount": r.total_amount,
                    "vat_amount": r.vat_amount,
                    "receipt_date": str(r.receipt_date),
                    "category": r.category,
                }
                for r in receipts
            ],
            "spending_by_category": spending_by_category,
            "total_spending": sum(r.total_amount for r in receipts),
            "receipt_count": len(receipts),
        }
    
    def _store_decision(self, db: Session, insight: AgentInsight) -> None:
        """Store agent decision in database."""
        
        decision = AgentDecision(
            tenant_id=self.tenant_id,
            user_id=self.user_id,
            decision_type=insight.category,
            title=insight.metadata.get("title", insight.message[:100]) if insight.metadata else insight.message[:100],
            summary=insight.message,
            recommendation=insight.metadata.get("recommendation") if insight.metadata else None,
            action_items=insight.metadata.get("action_items", []) if insight.metadata else [],
            confidence=insight.metadata.get("confidence", 0.0) if insight.metadata else 0.0,
            context_data={"insight": insight.dict()},
        )
        
        db.add(decision)
        db.commit()
        
        # Store in memory
        self.memory.store_memory(
            content_type="decision",
            content_id=str(decision.id),
            content_text=decision.summary or decision.title,
            metadata={
                "decision_type": decision.decision_type,
                "confidence": decision.confidence,
            },
        )
        
        logger.info(f"Stored agent decision: {decision.id}")


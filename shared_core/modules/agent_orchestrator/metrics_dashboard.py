"""Live Metrics Dashboard - Real-time workflow monitoring."""

import logging
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any

from sqlalchemy.orm import Session

from .workflow_persistence import WorkflowExecutionRecord

logger = logging.getLogger("converto.agent_orchestrator")


class WorkflowMetrics:
    """Workflow metrics and statistics."""

    def __init__(self, db: Session):
        self.db = db

    def get_workflow_metrics(
        self, tenant_id: str | None = None, hours_back: int = 24
    ) -> dict[str, Any]:
        """Get workflow metrics for dashboard.

        Args:
            tenant_id: Optional tenant filter
            hours_back: Hours to look back

        Returns:
            Metrics dictionary
        """
        cutoff_time = datetime.utcnow() - timedelta(hours=hours_back)

        query = self.db.query(WorkflowExecutionRecord).filter(
            WorkflowExecutionRecord.created_at >= cutoff_time
        )

        if tenant_id:
            query = query.filter(WorkflowExecutionRecord.tenant_id == tenant_id)

        executions = query.all()

        # Calculate metrics
        total_executions = len(executions)
        completed = sum(1 for e in executions if e.status == "completed")
        failed = sum(1 for e in executions if e.status == "failed")
        running = sum(1 for e in executions if e.status == "running")

        success_rate = (completed / total_executions * 100) if total_executions > 0 else 0

        # Average duration
        durations = [e.duration_ms for e in executions if e.duration_ms]
        avg_duration = sum(durations) / len(durations) if durations else 0

        # Group by template/workflow
        by_template = defaultdict(
            lambda: {
                "count": 0,
                "completed": 0,
                "failed": 0,
                "running": 0,
                "total_duration": 0,
            }
        )

        for exec in executions:
            template_id = exec.template_id or exec.workflow_id or "unknown"
            by_template[template_id]["count"] += 1
            if exec.status == "completed":
                by_template[template_id]["completed"] += 1
            elif exec.status == "failed":
                by_template[template_id]["failed"] += 1
            elif exec.status == "running":
                by_template[template_id]["running"] += 1

            if exec.duration_ms:
                by_template[template_id]["total_duration"] += exec.duration_ms

        # Calculate success rates per template
        template_metrics = []
        for template_id, stats in by_template.items():
            template_success_rate = (
                (stats["completed"] / stats["count"] * 100) if stats["count"] > 0 else 0
            )
            avg_template_duration = (
                stats["total_duration"] / stats["completed"] if stats["completed"] > 0 else 0
            )

            template_metrics.append(
                {
                    "template_id": template_id,
                    "total_executions": stats["count"],
                    "completed": stats["completed"],
                    "failed": stats["failed"],
                    "running": stats["running"],
                    "success_rate": round(template_success_rate, 1),
                    "avg_duration_ms": round(avg_template_duration, 1),
                    "avg_duration_seconds": round(avg_template_duration / 1000, 2),
                }
            )

        return {
            "summary": {
                "total_executions": total_executions,
                "completed": completed,
                "failed": failed,
                "running": running,
                "success_rate": round(success_rate, 1),
                "avg_duration_ms": round(avg_duration, 1),
                "avg_duration_seconds": round(avg_duration / 1000, 2),
                "period_hours": hours_back,
            },
            "by_template": sorted(
                template_metrics, key=lambda x: x["total_executions"], reverse=True
            ),
            "timestamp": datetime.utcnow().isoformat(),
        }

    def get_recent_executions(
        self, tenant_id: str | None = None, limit: int = 20
    ) -> list[dict[str, Any]]:
        """Get recent workflow executions.

        Args:
            tenant_id: Optional tenant filter
            limit: Maximum number of executions

        Returns:
            List of execution records
        """
        query = self.db.query(WorkflowExecutionRecord).order_by(
            WorkflowExecutionRecord.created_at.desc()
        )

        if tenant_id:
            query = query.filter(WorkflowExecutionRecord.tenant_id == tenant_id)

        executions = query.limit(limit).all()

        return [
            {
                "execution_id": e.id,
                "template_id": e.template_id,
                "workflow_id": e.workflow_id,
                "name": e.name,
                "status": e.status,
                "duration_ms": e.duration_ms,
                "duration_seconds": round(e.duration_ms / 1000, 2) if e.duration_ms else None,
                "created_at": e.created_at.isoformat(),
                "started_at": e.started_at.isoformat() if e.started_at else None,
                "completed_at": e.completed_at.isoformat() if e.completed_at else None,
                "error_message": e.error_message,
            }
            for e in executions
        ]



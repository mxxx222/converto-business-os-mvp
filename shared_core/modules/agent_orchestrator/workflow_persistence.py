"""Workflow Persistence - Save and load workflows from database."""

import logging
from datetime import datetime
from typing import Any
from uuid import uuid4

from sqlalchemy import JSON, Boolean, Column, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from shared_core.utils.db import Base

logger = logging.getLogger("converto.agent_orchestrator")


class SavedWorkflow(Base):
    """Saved workflow definition in database."""

    __tablename__ = "saved_workflows"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    tenant_id = Column(String(64), index=True, nullable=True)
    user_id = Column(String(64), index=True, nullable=True)

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    workflow_data = Column(JSON, nullable=False)  # Workflow definition (nodes, edges, etc.)

    # Metadata
    tags = Column(JSON, nullable=True)  # List of tags
    is_template = Column(Boolean, default=False)  # Is this a template?
    is_public = Column(Boolean, default=False)  # Is this public template?

    # Statistics
    execution_count = Column(Integer, default=0)
    success_count = Column(Integer, default=0)
    avg_duration_ms = Column(Float, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_executed_at = Column(DateTime(timezone=True), nullable=True)


class WorkflowExecutionRecord(Base):
    """Record of workflow execution for persistence."""

    __tablename__ = "workflow_executions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    tenant_id = Column(String(64), index=True, nullable=True)
    user_id = Column(String(64), index=True, nullable=True)

    # Workflow reference
    workflow_id = Column(String(36), index=True, nullable=True)  # Reference to saved_workflows
    template_id = Column(String(255), index=True, nullable=True)  # Template ID if used

    # Execution details
    name = Column(String(255), nullable=False)
    status = Column(String(32), nullable=False, index=True)  # pending, running, completed, failed
    initial_variables = Column(JSON, nullable=True)
    final_variables = Column(JSON, nullable=True)
    steps_data = Column(JSON, nullable=True)  # Step execution details

    # Metrics
    duration_ms = Column(Float, nullable=True)
    error_message = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)


class WorkflowScheduler:
    """Schedule workflows to run automatically."""

    def __init__(self, db: Session):
        self.db = db
        self.scheduler = None

    def start_scheduler(self):
        """Start the scheduler."""
        try:
            from apscheduler.schedulers.asyncio import AsyncIOScheduler

            self.scheduler = AsyncIOScheduler()
            self.scheduler.start()
            logger.info("Workflow scheduler started")

            # Load scheduled workflows from database
            self._load_scheduled_workflows()

        except ImportError:
            logger.warning("APScheduler not available, scheduling disabled")

    def _load_scheduled_workflows(self):
        """Load scheduled workflows from database."""
        # TODO: Load from database and schedule them
        pass

    def schedule_workflow(
        self, workflow_id: str, cron_expression: str, initial_variables: dict[str, Any]
    ) -> str:
        """Schedule a workflow to run on a cron schedule.

        Args:
            workflow_id: Workflow ID to schedule
            cron_expression: Cron expression (e.g., "0 9 1 * *" for 9 AM on 1st of month)
            initial_variables: Initial variables for workflow execution

        Returns:
            Schedule ID
        """
        if not self.scheduler:
            raise RuntimeError("Scheduler not started")

        try:
            from apscheduler.triggers.cron import CronTrigger

            # Parse cron expression
            # Format: "minute hour day month day_of_week"
            parts = cron_expression.split()
            if len(parts) != 5:
                raise ValueError(
                    "Invalid cron expression. Use format: 'minute hour day month day_of_week'"
                )

            minute, hour, day, month, day_of_week = parts

            CronTrigger(
                minute=minute if minute != "*" else None,
                hour=hour if hour != "*" else None,
                day=day if day != "*" else None,
                month=month if month != "*" else None,
                day_of_week=day_of_week if day_of_week != "*" else None,
            )

            schedule_id = str(uuid4())

            # TODO: Actually execute workflow
            # self.scheduler.add_job(
            #     execute_workflow_async,
            #     trigger=trigger,
            #     id=schedule_id,
            #     args=[workflow_id, initial_variables],
            # )

            logger.info(f"Workflow {workflow_id} scheduled with cron: {cron_expression}")
            return schedule_id

        except Exception as e:
            logger.error(f"Failed to schedule workflow: {e}")
            raise

    def stop_scheduler(self):
        """Stop the scheduler."""
        if self.scheduler:
            self.scheduler.shutdown()
            logger.info("Workflow scheduler stopped")


def save_workflow(
    db: Session,
    name: str,
    workflow_data: dict[str, Any],
    tenant_id: str | None = None,
    user_id: str | None = None,
    description: str | None = None,
    tags: list[str] | None = None,
    is_template: bool = False,
) -> SavedWorkflow:
    """Save a workflow to database.

    Args:
        db: Database session
        name: Workflow name
        workflow_data: Workflow definition (nodes, edges, steps, etc.)
        tenant_id: Tenant ID
        user_id: User ID
        description: Workflow description
        tags: List of tags
        is_template: Is this a template?

    Returns:
        Saved workflow
    """
    workflow = SavedWorkflow(
        tenant_id=tenant_id,
        user_id=user_id,
        name=name,
        description=description,
        workflow_data=workflow_data,
        tags=tags or [],
        is_template=is_template,
    )

    db.add(workflow)
    db.commit()
    db.refresh(workflow)

    logger.info(f"Workflow saved: {workflow.id} ({name})")
    return workflow


def load_workflow(
    db: Session, workflow_id: str, tenant_id: str | None = None
) -> SavedWorkflow | None:
    """Load a workflow from database.

    Args:
        db: Database session
        workflow_id: Workflow ID
        tenant_id: Tenant ID (for filtering)

    Returns:
        Saved workflow or None if not found
    """
    query = db.query(SavedWorkflow).filter(SavedWorkflow.id == workflow_id)

    if tenant_id:
        query = query.filter(SavedWorkflow.tenant_id == tenant_id)

    return query.first()


def list_workflows(
    db: Session,
    tenant_id: str | None = None,
    user_id: str | None = None,
    is_template: bool | None = None,
    tags: list[str] | None = None,
) -> list[SavedWorkflow]:
    """List workflows from database.

    Args:
        db: Database session
        tenant_id: Filter by tenant
        user_id: Filter by user
        is_template: Filter by template status
        tags: Filter by tags

    Returns:
        List of saved workflows
    """
    query = db.query(SavedWorkflow)

    if tenant_id:
        query = query.filter(SavedWorkflow.tenant_id == tenant_id)

    if user_id:
        query = query.filter(SavedWorkflow.user_id == user_id)

    if is_template is not None:
        query = query.filter(SavedWorkflow.is_template == is_template)

    if tags:
        # Filter workflows that have any of the specified tags
        query = query.filter(SavedWorkflow.tags.contains(tags))

    return query.order_by(SavedWorkflow.created_at.desc()).all()


def record_execution(
    db: Session,
    execution_id: str,
    workflow_id: str | None,
    template_id: str | None,
    name: str,
    status: str,
    tenant_id: str | None = None,
    user_id: str | None = None,
    initial_variables: dict[str, Any] | None = None,
    final_variables: dict[str, Any] | None = None,
    steps_data: dict[str, Any] | None = None,
    duration_ms: float | None = None,
    error_message: str | None = None,
    started_at: datetime | None = None,
    completed_at: datetime | None = None,
) -> WorkflowExecutionRecord:
    """Record a workflow execution.

    Args:
        db: Database session
        execution_id: Execution ID
        workflow_id: Workflow ID (if saved workflow)
        template_id: Template ID (if template-based)
        name: Execution name
        status: Execution status
        tenant_id: Tenant ID
        user_id: User ID
        initial_variables: Initial variables
        final_variables: Final variables
        steps_data: Step execution details
        duration_ms: Duration in milliseconds
        error_message: Error message if failed
        started_at: Start timestamp
        completed_at: Completion timestamp

    Returns:
        Execution record
    """
    record = WorkflowExecutionRecord(
        id=execution_id,
        tenant_id=tenant_id,
        user_id=user_id,
        workflow_id=workflow_id,
        template_id=template_id,
        name=name,
        status=status,
        initial_variables=initial_variables,
        final_variables=final_variables,
        steps_data=steps_data,
        duration_ms=duration_ms,
        error_message=error_message,
        started_at=started_at,
        completed_at=completed_at,
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    # Update workflow statistics
    if workflow_id:
        workflow = db.query(SavedWorkflow).filter(SavedWorkflow.id == workflow_id).first()
        if workflow:
            workflow.execution_count += 1
            if status == "completed":
                workflow.success_count += 1
            if duration_ms:
                if workflow.avg_duration_ms:
                    workflow.avg_duration_ms = (workflow.avg_duration_ms + duration_ms) / 2
                else:
                    workflow.avg_duration_ms = duration_ms
            workflow.last_executed_at = completed_at or datetime.utcnow()
            db.commit()

    logger.debug(f"Workflow execution recorded: {execution_id} ({status})")
    return record

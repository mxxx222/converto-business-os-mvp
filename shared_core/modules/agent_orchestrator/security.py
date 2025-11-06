"""Security Enhancements - RBAC, Audit Trail, API Key Validation."""

import logging
from datetime import datetime
from typing import Any
from uuid import uuid4

from sqlalchemy import JSON, Boolean, Column, DateTime, String, Text
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from shared_core.utils.db import Base

logger = logging.getLogger("converto.agent_orchestrator")


class AgentAPIKey(Base):
    """API keys for agent authentication."""

    __tablename__ = "agent_api_keys"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    agent_id = Column(String(255), nullable=False, index=True)
    api_key = Column(String(255), nullable=False, unique=True, index=True)
    tenant_id = Column(String(64), index=True, nullable=True)
    user_id = Column(String(64), index=True, nullable=True)

    # Permissions
    can_execute = Column(Boolean, default=True)
    can_read = Column(Boolean, default=True)
    can_write = Column(Boolean, default=False)

    # Metadata
    name = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_used_at = Column(DateTime(timezone=True), nullable=True)


class WorkflowAuditLog(Base):
    """Audit trail for workflow actions."""

    __tablename__ = "workflow_audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    tenant_id = Column(String(64), index=True, nullable=True)
    user_id = Column(String(64), index=True, nullable=True)

    # Action details
    action = Column(
        String(64), nullable=False, index=True
    )  # executed_workflow, saved_workflow, etc.
    resource_type = Column(String(64), nullable=False)  # workflow, execution, etc.
    resource_id = Column(String(255), nullable=True, index=True)

    # Request details
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(512), nullable=True)
    api_key_id = Column(String(36), nullable=True)

    # Action data
    action_data = Column(JSON, nullable=True)  # Additional context

    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class RoleBasedAccessControl:
    """RBAC for workflow access control."""

    # Role definitions
    ROLES = {
        "admin": {
            "can_execute_all": True,
            "can_save_workflows": True,
            "can_delete_workflows": True,
            "can_view_metrics": True,
            "can_manage_agents": True,
        },
        "user": {
            "can_execute_all": True,
            "can_save_workflows": True,
            "can_delete_own_workflows": True,
            "can_view_own_metrics": True,
            "can_manage_agents": False,
        },
        "viewer": {
            "can_execute_all": False,
            "can_save_workflows": False,
            "can_delete_workflows": False,
            "can_view_metrics": True,
            "can_manage_agents": False,
        },
    }

    @staticmethod
    def check_permission(
        role: str, permission: str, resource_owner_id: str | None = None, user_id: str | None = None
    ) -> bool:
        """Check if user has permission.

        Args:
            role: User role
            permission: Permission to check
            resource_owner_id: Resource owner ID (for ownership checks)
            user_id: Current user ID

        Returns:
            True if permitted, False otherwise
        """
        role_permissions = RoleBasedAccessControl.ROLES.get(role, {})

        # Admin has all permissions
        if role == "admin":
            return True

        # Check specific permission
        if permission in role_permissions:
            return role_permissions[permission]

        # Check ownership for "own" permissions
        if "own" in permission and resource_owner_id == user_id:
            base_permission = permission.replace("_own", "")
            return role_permissions.get(base_permission, False)

        return False


def log_audit_action(
    db: Session,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    tenant_id: str | None = None,
    user_id: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    api_key_id: str | None = None,
    action_data: dict[str, Any] | None = None,
) -> WorkflowAuditLog:
    """Log an audit action.

    Args:
        db: Database session
        action: Action name (e.g., "executed_workflow")
        resource_type: Resource type (e.g., "workflow")
        resource_id: Resource ID
        tenant_id: Tenant ID
        user_id: User ID
        ip_address: IP address
        user_agent: User agent string
        api_key_id: API key ID if used
        action_data: Additional action data

    Returns:
        Audit log entry
    """
    log_entry = WorkflowAuditLog(
        tenant_id=tenant_id,
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=ip_address,
        user_agent=user_agent,
        api_key_id=api_key_id,
        action_data=action_data,
    )

    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    logger.debug(f"Audit log: {action} on {resource_type} ({resource_id}) by {user_id}")
    return log_entry


def validate_api_key(
    db: Session, api_key: str, required_permission: str = "can_execute"
) -> AgentAPIKey | None:
    """Validate API key and check permissions.

    Args:
        db: Database session
        api_key: API key to validate
        required_permission: Required permission (can_execute, can_read, can_write)

    Returns:
        API key record if valid, None otherwise
    """
    key_record = db.query(AgentAPIKey).filter(AgentAPIKey.api_key == api_key).first()

    if not key_record:
        logger.warning("Invalid API key attempted")
        return None

    # Check expiration
    if key_record.expires_at and key_record.expires_at < datetime.utcnow():
        logger.warning(f"Expired API key attempted: {key_record.id}")
        return None

    # Check permission
    if not getattr(key_record, required_permission, False):
        logger.warning(f"API key {key_record.id} lacks permission: {required_permission}")
        return None

    # Update last used
    key_record.last_used_at = datetime.utcnow()
    db.commit()

    return key_record



"""Advanced RBAC models and permissions."""

from __future__ import annotations

from enum import Enum
from datetime import datetime

from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship

from shared_core.utils.db import Base


class Permission(str, Enum):
    """Permission definitions."""

    # Receipts
    RECEIPTS_READ = 'receipts:read'
    RECEIPTS_CREATE = 'receipts:create'
    RECEIPTS_UPDATE = 'receipts:update'
    RECEIPTS_DELETE = 'receipts:delete'

    # Reports
    REPORTS_READ = 'reports:read'
    REPORTS_CREATE = 'reports:create'
    REPORTS_EXPORT = 'reports:export'

    # Insights
    INSIGHTS_READ = 'insights:read'

    # Team
    TEAM_READ = 'team:read'
    TEAM_MANAGE = 'team:manage'
    TEAM_INVITE = 'team:invite'

    # Billing
    BILLING_READ = 'billing:read'
    BILLING_MANAGE = 'billing:manage'

    # Settings
    SETTINGS_READ = 'settings:read'
    SETTINGS_MANAGE = 'settings:manage'

    # Audit
    AUDIT_READ = 'audit:read'


class RoleType(str, Enum):
    """Role types."""

    VIEWER = 'viewer'
    EDITOR = 'editor'
    ADMIN = 'admin'
    OWNER = 'owner'
    CUSTOM = 'custom'


class Role(Base):
    """Team role with permissions."""

    __tablename__ = 'roles'

    id = Column(String, primary_key=True)
    team_id = Column(String, ForeignKey('teams.id'))
    name = Column(String)
    role_type = Column(String)
    permissions = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Role definitions
ROLE_PERMISSIONS = {
    RoleType.VIEWER: [
        Permission.RECEIPTS_READ,
        Permission.REPORTS_READ,
        Permission.INSIGHTS_READ,
        Permission.TEAM_READ,
        Permission.SETTINGS_READ,
    ],
    RoleType.EDITOR: [
        Permission.RECEIPTS_READ,
        Permission.RECEIPTS_CREATE,
        Permission.RECEIPTS_UPDATE,
        Permission.REPORTS_READ,
        Permission.REPORTS_CREATE,
        Permission.INSIGHTS_READ,
        Permission.TEAM_READ,
        Permission.SETTINGS_READ,
    ],
    RoleType.ADMIN: [
        Permission.RECEIPTS_READ,
        Permission.RECEIPTS_CREATE,
        Permission.RECEIPTS_UPDATE,
        Permission.RECEIPTS_DELETE,
        Permission.REPORTS_READ,
        Permission.REPORTS_CREATE,
        Permission.REPORTS_EXPORT,
        Permission.INSIGHTS_READ,
        Permission.TEAM_READ,
        Permission.TEAM_MANAGE,
        Permission.BILLING_READ,
        Permission.SETTINGS_READ,
        Permission.SETTINGS_MANAGE,
        Permission.AUDIT_READ,
    ],
    RoleType.OWNER: [
        Permission.RECEIPTS_READ,
        Permission.RECEIPTS_CREATE,
        Permission.RECEIPTS_UPDATE,
        Permission.RECEIPTS_DELETE,
        Permission.REPORTS_READ,
        Permission.REPORTS_CREATE,
        Permission.REPORTS_EXPORT,
        Permission.INSIGHTS_READ,
        Permission.TEAM_READ,
        Permission.TEAM_MANAGE,
        Permission.TEAM_INVITE,
        Permission.BILLING_READ,
        Permission.BILLING_MANAGE,
        Permission.SETTINGS_READ,
        Permission.SETTINGS_MANAGE,
        Permission.AUDIT_READ,
    ],
}


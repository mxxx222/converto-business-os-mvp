from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from ...utils.db import Base


class RewardCatalogItem(Base):
    __tablename__ = "rewards_catalog"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String(64), index=True, nullable=False)
    name = Column(String(256), nullable=False)
    desc = Column(Text, nullable=True)
    sponsor = Column(String(128), nullable=True)
    points_cost = Column(Integer, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    terms_url = Column(String(512), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RedemptionRecord(Base):
    __tablename__ = "redemptions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String(64), index=True, nullable=False)
    user_id = Column(String(64), index=True, nullable=False)
    reward_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    reward_name = Column(String(256), nullable=True)
    points_spent = Column(Integer, nullable=False)
    status = Column(String(32), default="pending")  # pending|fulfilled|cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

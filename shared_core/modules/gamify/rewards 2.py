from sqlalchemy import Column, String, Integer, JSON, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
import enum
from ...utils.db import Base


class RewardStatus(str, enum.Enum):
    available = "available"
    reserved = "reserved"
    redeemed = "redeemed"


class RewardCatalog(Base):
    __tablename__ = "reward_catalog"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(256), nullable=False)
    sponsor = Column(String(128))
    points_cost = Column(Integer, nullable=False)
    stock = Column(Integer, default=0)
    meta = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RewardRedemption(Base):
    __tablename__ = "reward_redemptions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(String(64), index=True, nullable=True)
    user_id = Column(String(64), index=True, nullable=True)
    reward_id = Column(UUID(as_uuid=True), index=True, nullable=False)
    points_spent = Column(Integer, nullable=False)
    status = Column(Enum(RewardStatus), nullable=False, default=RewardStatus.reserved)
    meta = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

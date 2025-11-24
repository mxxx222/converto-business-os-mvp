import uuid

from sqlalchemy import Column, DateTime, Index, Integer, String
from sqlalchemy.sql import func

from ...utils.db import Base


class P2EWallet(Base):
    __tablename__ = "p2e_wallet"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(64), index=True, nullable=False)
    user_id = Column(String(64), index=True, nullable=False)
    balance = Column(Integer, nullable=False, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    __table_args__ = (Index("ix_p2e_wallet_tu", "tenant_id", "user_id", unique=True),)


class P2ETokenLedger(Base):
    __tablename__ = "p2e_token_ledger"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(64), index=True, nullable=False)
    user_id = Column(String(64), index=True, nullable=False)
    delta = Column(Integer, nullable=False)  # +mint / -burn
    reason = Column(String(256), nullable=False)
    ref_id = Column(String(128), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class P2EQuest(Base):
    __tablename__ = "p2e_quest"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(64), index=True, nullable=False)
    code = Column(String(64), index=True, nullable=False)
    title = Column(String(256), nullable=False)
    desc = Column(String(512), nullable=True)
    reward = Column(Integer, nullable=False, default=25)
    period = Column(String(32), nullable=False, default="weekly")  # daily|weekly|oneoff
    active = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

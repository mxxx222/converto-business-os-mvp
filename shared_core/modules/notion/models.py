from sqlalchemy import Column, String, Text, DateTime, Boolean, JSON
from sqlalchemy.sql import func
import uuid
from ...utils.db import Base


class NotionPage(Base):
    __tablename__ = "notion_pages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    notion_id = Column(String(64), nullable=False, unique=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    content = Column(Text, nullable=True)
    database_id = Column(String(64), nullable=True, index=True)
    properties = Column(JSON, nullable=True)
    url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    last_synced = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

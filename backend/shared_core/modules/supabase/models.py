from sqlalchemy import Column, String, Text, DateTime, Boolean, JSON, Integer
from sqlalchemy.sql import func
import uuid
from ...utils.db import Base


class SupabaseProject(Base):
    __tablename__ = "supabase_projects"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(64), nullable=False, unique=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    region = Column(String(32), nullable=True)
    status = Column(String(32), nullable=False, index=True)  # active, paused, etc.
    database_url = Column(Text, nullable=True)
    api_url = Column(Text, nullable=True)
    anon_key = Column(Text, nullable=True)
    service_role_key = Column(Text, nullable=True)
    config = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    last_synced = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

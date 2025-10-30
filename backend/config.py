"""Backend configuration settings."""

from __future__ import annotations

import os
from typing import Any

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Environment
    environment: str = "development"
    log_level: str = "info"
    
    # Database
    database_url: str = "postgresql://demo:demo@demo.supabase.co:5432/demo"
    
    # CORS
    cors_origins_str: str = "http://localhost:3000,http://localhost:8080"
    allowed_origin_regex: str = r".*"
    
    # Supabase
    supabase_url: str = ""
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    supabase_auth_enabled: bool = os.getenv("SUPABASE_AUTH_ENABLED", "false").lower() in ("true", "1", "yes")
    
    # Sentry
    sentry_dsn: str = ""
    
    # Email
    resend_api_key: str = ""
    email_from: str = "noreply@converto.fi"
    email_reply_to: str = "hello@converto.fi"
    
    class Config:
        """Pydantic config."""
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra environment variables

    def cors_origins(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins_str.split(",")]


def get_settings() -> Settings:
    """Get application settings."""
    return Settings()
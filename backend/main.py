"""FastAPI application entrypoint for the Converto Business OS backend."""

from __future__ import annotations

import logging
import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

# Import Sentry initialization
from backend.sentry_init import init_sentry, set_tenant_context

from backend.app.routes.leads import router as leads_router
from backend.app.routes.metrics import router as metrics_router
from backend.app.routes.auth import router as auth_router
from backend.app.routes.users import router as users_router
from backend.config import get_settings
from backend.modules.email.router import router as email_router
from backend.modules.receipts_processor.router import router as receipts_processor_router
from backend.routes.csp import router as csp_router
from shared_core.middleware.auth import dev_auth
from shared_core.middleware.supabase_auth import supabase_auth
from shared_core.middleware.admin_auth import admin_auth
from shared_core.modules.admin import router as admin_router
from shared_core.modules.admin.bus import init_bus as init_admin_bus
from shared_core.modules.ai.router import router as ai_router
from shared_core.modules.clients.router import router as clients_router
from shared_core.modules.finance_agent.router import router as finance_agent_router
from shared_core.modules.linear.router import router as linear_router
from shared_core.modules.notion.router import router as notion_router
from shared_core.modules.ocr.router import router as ocr_router
from shared_core.modules.receipts.router import router as receipts_router
from shared_core.modules.supabase.router import router as supabase_router
from shared_core.utils.db import Base, engine
from backend.app.websocket import manager
from datetime import datetime

settings = get_settings()
logger = logging.getLogger("converto.backend")

# Initialize Sentry (before creating app)
# Uses backend/sentry_init.py for proper PII scrubbing and configuration
init_sentry()


def configure_logging() -> None:
    """Configure the global logging setup only once."""

    if logging.getLogger().handlers:
        return
    logging.basicConfig(
        level=settings.log_level.upper(),
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )
    logger.debug("Logging configured with level %s", settings.log_level.upper())


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """FastAPI lifespan hook used to initialise infrastructure."""

    configure_logging()
    logger.info("Ensuring database schema is up to date")
    Base.metadata.create_all(bind=engine)
    logger.info("Database schema ready")

    # Initialise admin activity bus (used by admin control plane)
    try:
        logger.info("Initialising admin activity bus")
        await init_admin_bus()
        logger.info("Admin activity bus initialised")
    except Exception as exc:
        logger.error(f"Failed to initialise admin activity bus: {exc}")

    yield


def create_app() -> FastAPI:
    """Create the FastAPI application instance."""

    app = FastAPI(
        title="Converto Business OS API",
        version="1.0.0",
        docs_url="/docs",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    origins = settings.cors_origins()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_origin_regex=settings.allowed_origin_regex,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Auth middleware chain: Supabase JWT (if enabled) then dev fallback
    if settings.supabase_auth_enabled:
        app.middleware("http")(supabase_auth)
    else:
        app.middleware("http")(dev_auth)

    # Admin-specific Supabase-based authentication and RBAC for /api/admin*
    app.middleware("http")(admin_auth)
    
    # Tenant context middleware for RLS (Auth MVP v0)
    # MUST run after auth middleware to have user context
    from shared_core.middleware.tenant_context import tenant_context_middleware
    app.middleware("http")(tenant_context_middleware)
    
    # Sentry tenant context middleware
    # Adds tenant_id and user_id tags to all Sentry events
    @app.middleware("http")
    async def sentry_tenant_middleware(request: Request, call_next):
        """Add tenant context to Sentry events."""
        user = getattr(request.state, 'user', None)
        
        if user and hasattr(user, 'tenant_id'):
            set_tenant_context(
                tenant_id=str(user.tenant_id),
                user_id=str(user.id),
                role=str(user.role)
            )
        
        return await call_next(request)

    @app.get("/", tags=["system"])
    async def root() -> dict[str, str]:
        """Simple index route for health probes."""

        return {
            "service": "converto-backend",
            "status": "ok",
            "environment": settings.environment,
        }

    @app.get("/health", tags=["system"])
    async def health() -> dict[str, str]:
        """Return the service health status used by Render probes."""

        return {"status": "healthy"}

    app.include_router(ai_router)
    app.include_router(finance_agent_router)
    app.include_router(ocr_router)
    app.include_router(receipts_router)
    app.include_router(receipts_processor_router)
    app.include_router(supabase_router)
    app.include_router(notion_router)
    app.include_router(linear_router)
    app.include_router(csp_router)
    app.include_router(clients_router)
    app.include_router(metrics_router)
    app.include_router(email_router)
    app.include_router(leads_router)
    app.include_router(auth_router)
    app.include_router(users_router)
    app.include_router(admin_router)

    # Back-compat alias: preserve body via 307 redirect
    @app.api_route("/api/v1/ocr-ai/scan", methods=["POST", "OPTIONS"], include_in_schema=False)
    async def ocr_ai_scan_alias() -> RedirectResponse:
        return RedirectResponse(url="/api/v1/ocr/power", status_code=307)

    # WebSocket endpoint for real-time notifications
    @app.websocket("/ws")
    async def websocket_endpoint(websocket: WebSocket):
        await manager.connect(websocket)
        try:
            # Send initial connection message
            await manager.send_personal_message({
                "type": "connection.established",
                "data": {"message": "Connected to DocFlow real-time updates"},
                "timestamp": datetime.utcnow().isoformat()
            }, websocket)
            
            # Keep connection alive and handle incoming messages
            while True:
                data = await websocket.receive_text()
                logger.info(f"Received message: {data}")
                # Handle client messages if needed
                
        except WebSocketDisconnect:
            manager.disconnect(websocket)
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
            manager.disconnect(websocket)

    return app


app = create_app()

__all__ = ["app", "create_app"]

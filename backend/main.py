"""FastAPI application entrypoint for the Converto Business OS backend."""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from backend.app.routes.leads import router as leads_router
from backend.app.routes.metrics import router as metrics_router
from backend.config import get_settings
from backend.modules.email.router import router as email_router
from backend.routes.csp import router as csp_router
from shared_core.middleware.auth import dev_auth
from shared_core.middleware.supabase_auth import supabase_auth
from shared_core.modules.ai.router import router as ai_router
from shared_core.modules.clients.router import router as clients_router
from shared_core.modules.linear.router import router as linear_router
from shared_core.modules.notion.router import router as notion_router
from shared_core.modules.ocr.router import router as ocr_router
from shared_core.modules.receipts.router import router as receipts_router
from shared_core.modules.supabase.router import router as supabase_router
from shared_core.utils.db import Base, engine

settings = get_settings()
logger = logging.getLogger("converto.backend")


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
    app.include_router(ocr_router)
    app.include_router(receipts_router)
    app.include_router(supabase_router)
    app.include_router(notion_router)
    app.include_router(linear_router)
    app.include_router(csp_router)
    app.include_router(clients_router)
    app.include_router(metrics_router)
    app.include_router(email_router)
    app.include_router(leads_router)

    # Back-compat alias: preserve body via 307 redirect
    @app.api_route("/api/v1/ocr-ai/scan", methods=["POST", "OPTIONS"], include_in_schema=False)
    async def ocr_ai_scan_alias() -> RedirectResponse:
        return RedirectResponse(url="/api/v1/ocr/power", status_code=307)

    return app


app = create_app()

__all__ = ["app", "create_app"]

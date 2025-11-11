#!/usr/bin/env python3
"""Export FastAPI OpenAPI schema to docs/openapi.yaml."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import sys
import types

try:
    import yaml  # type: ignore
except ModuleNotFoundError:  # pragma: no cover - optional dependency
    yaml = None

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


class _DummyScope:
    def __enter__(self) -> "_DummyScope":
        return self

    def __exit__(self, exc_type, exc, tb) -> bool:
        return False

    def set_tag(self, *args, **kwargs) -> None:  # pragma: no cover - no-op
        return None


class _DummySpan:
    def set_tag(self, *args, **kwargs) -> None:  # pragma: no cover - no-op
        return None

    def set_status(self, *args, **kwargs) -> None:  # pragma: no cover - no-op
        return None

    def set_data(self, *args, **kwargs) -> None:  # pragma: no cover - no-op
        return None

    def finish(self) -> None:  # pragma: no cover - no-op
        return None


def _start_span(**kwargs) -> _DummySpan:  # pragma: no cover - no-op
    return _DummySpan()


if "sentry_sdk" not in sys.modules:
    sentry_stub = types.SimpleNamespace(
        init=lambda **kwargs: None,
        capture_exception=lambda *args, **kwargs: None,
        configure_scope=lambda **kwargs: _DummyScope(),
        start_span=_start_span,
        set_tag=lambda *args, **kwargs: None,
    )
    sys.modules["sentry_sdk"] = sentry_stub
    fastapi_integration = types.SimpleNamespace(FastApiIntegration=lambda *args, **kwargs: None)
    logging_integration = types.SimpleNamespace(LoggingIntegration=lambda **kwargs: None)
    integrations_pkg = types.SimpleNamespace(
        fastapi=fastapi_integration,
        logging=logging_integration,
    )
    sys.modules["sentry_sdk.integrations"] = integrations_pkg
    sys.modules["sentry_sdk.integrations.fastapi"] = fastapi_integration
    sys.modules["sentry_sdk.integrations.logging"] = logging_integration


class _DummyMetric:
    def __init__(self, *args, **kwargs) -> None:  # pragma: no cover - no-op
        return None

    def labels(self, *args, **kwargs) -> "_DummyMetric":  # pragma: no cover
        return self

    def inc(self, *args, **kwargs) -> None:  # pragma: no cover
        return None

    def observe(self, *args, **kwargs) -> None:  # pragma: no cover
        return None

    def set(self, *args, **kwargs) -> None:  # pragma: no cover
        return None


if "prometheus_client" not in sys.modules:
    prometheus_stub = types.SimpleNamespace(
        Counter=_DummyMetric,
        Histogram=_DummyMetric,
        Gauge=_DummyMetric,
        generate_latest=lambda: b"",
        CONTENT_TYPE_LATEST="text/plain",
        CollectorRegistry=lambda *args, **kwargs: None,
    )
    sys.modules["prometheus_client"] = prometheus_stub

if "email_validator" not in sys.modules:
    class _DummyEmailResult(dict):
        def __init__(self, email: str) -> None:
            super().__init__()
            self["email"] = email
            self.email = email
            self.ascii_email = email

    email_validator_stub = types.SimpleNamespace(
        validate_email=lambda value, *args, **kwargs: _DummyEmailResult(value),
        EmailNotValidError=ValueError,
        __version__="0",
    )
    sys.modules["email_validator"] = email_validator_stub
    try:
        import importlib.metadata as importlib_metadata
    except ModuleNotFoundError:  # pragma: no cover
        import importlib_metadata  # type: ignore

    if not hasattr(importlib_metadata, "_original_version"):
        importlib_metadata._original_version = importlib_metadata.version  # type: ignore[attr-defined]
        importlib_metadata._original_distribution = importlib_metadata.distribution  # type: ignore[attr-defined]

        def _version(name: str) -> str:  # pragma: no cover - shim for email-validator
            if name == "email-validator":
                return "2.0.0"
            return importlib_metadata._original_version(name)  # type: ignore[attr-defined]

        def _distribution(name: str):  # pragma: no cover
            if name == "email-validator":
                class _FakeDistribution:
                    version = "2.0.0"

                return _FakeDistribution()
            return importlib_metadata._original_distribution(name)  # type: ignore[attr-defined]

        importlib_metadata.version = _version  # type: ignore[assignment]
        importlib_metadata.distribution = _distribution  # type: ignore[assignment]

if "pydantic_settings" not in sys.modules:
    from pydantic import BaseModel

    class _BaseSettings(BaseModel):
        class Config:
            extra = "allow"

    sys.modules["pydantic_settings"] = types.SimpleNamespace(BaseSettings=_BaseSettings)

if "stripe" not in sys.modules:
    class _StripeError(Exception):
        pass

    class _Webhook:
        @staticmethod
        def construct_event(payload, sig_header, secret):
            return {"type": "stub.event", "data": {}}

    stripe_stub = types.SimpleNamespace(
        Webhook=_Webhook,
        error=types.SimpleNamespace(
            SignatureVerificationError=_StripeError,
            InvalidRequestError=_StripeError,
        ),
    )
    sys.modules["stripe"] = stripe_stub

if "cv2" not in sys.modules:
    sys.modules["cv2"] = types.SimpleNamespace()

os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "service-role-stub")
os.environ.setdefault("SUPABASE_AUTH_ENABLED", "true")

from backend.main import create_app


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Export FastAPI OpenAPI schema.")
    parser.add_argument(
        "--out",
        default="docs/openapi.yaml",
        help="Output path for the generated OpenAPI document.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    app = create_app()
    schema = app.openapi()
    output_path = Path(args.out).resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if yaml is not None:
        content = yaml.safe_dump(schema, sort_keys=False)  # type: ignore[attr-defined]
    else:
        content = json.dumps(schema, indent=2)

    output_path.write_text(content)


if __name__ == "__main__":
    main()

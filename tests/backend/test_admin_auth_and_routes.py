from __future__ import annotations

import os
from typing import Dict

from fastapi.testclient import TestClient

from backend.main import app


def _make_token_headers(token: str) -> Dict[str, str]:
  return {"Authorization": f"Bearer {token}"}


def test_admin_routes_require_auth(monkeypatch):
  client = TestClient(app)

  # Without any token
  r = client.get("/api/admin/activities")
  assert r.status_code in (401, 403)


def test_admin_health_is_public():
  client = TestClient(app)
  r = client.get("/api/admin/health")
  assert r.status_code == 200
  body = r.json()
  assert body["service"] == "admin_api"



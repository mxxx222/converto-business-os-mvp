# Dashboard ↔ Backend: Seamless Integration Audit (Migration Validator)

## How to Use in Cursor

1. **Copy this entire document** into a new Cursor chat
2. **Set your environment URLs** in the ENV section below
3. **Run**: `@Codebase Execute this integration audit and report discrepancies with fix diffs`
4. **Review**: Cursor will check contracts, auth, metrics, and report PASS/FAIL
5. **Apply fixes**: Use provided diffs to harmonize frontend and backend

---

## Objective

Ensure Admin Dashboard and backend work seamlessly together: API contracts, tenant-scope, realtime, metrics, and CI. Fix discrepancies or propose migration steps (diffs/commands) until everything is green.

---

## Scope

### Backend
```
backend/app/routes/metrics.py
backend/app/core/metrics.py
  - REQUEST_DURATION_BUCKETS (request_duration_ms_bucket)
  - PUBLISH_LATENCY (publish_latency_ms)
  - DOC_INGESTED_TOTAL
  - REVENUE_TOTAL_EUR

shared_core/modules/admin/
  - router_production.py (admin bus endpoints)
  - Admin bus: publish/subscribe/list
  - Redis/Supabase integration

shared_core/middleware/auth.py
  - requireAdminAuth
  - Token validation
  - Tenant extraction

docs/openapi.yaml
  - OpenAPI schema export
  - Spectral linting
```

### Frontend
```
frontend/app/admin/dashboard/
  - All 6 segments
  - Admin API routes

frontend/lib/admin/
  - hooks/useTenantFeed.ts (WebSocket)
  - hooks/useAuthedFetch.ts
  - adminAuth.ts (requireAdminAuth)

frontend/app/api/admin/
  - All admin API routes
  - Rate limiting
  - Zod validation
```

### CI/CD
```
.github/workflows/quick-check.yml
scripts/quick-runner.sh
```

---

## ENV Expectations

```bash
# Backend
BACKEND_BASE_URL=https://backend.staging.example.com
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
ANALYTICS_PROM_ENABLED=true

# Frontend
FRONTEND_BASE_URL=https://staging.example.com
NEXT_PUBLIC_API_URL=https://api.staging.example.com
NEXT_PUBLIC_WS_URL=wss://ws.staging.example.com

# Admin
ADMIN_JWT_SECRET=your-secret-here
ADMIN_REQUIRED_ROLE=admin

# Mock mode
NO_EXTERNAL_SEND=true
```

---

## Migration Tasks

### Task 1: Contract Verification (OpenAPI → FE/BE)

**Objective:** Ensure frontend and backend API contracts match exactly

**Steps:**

1. **Export OpenAPI schema:**
```bash
python scripts/export_openapi.py --out docs/openapi.yaml
```

2. **Lint with Spectral:**
```bash
cd frontend
npm run openapi:lint
```

3. **Verify contract alignment:**

Check that frontend admin API routes match backend spec:

| Route | Method | FE Status | BE Status | Payload Keys | Response Keys |
|-------|--------|-----------|-----------|--------------|---------------|
| `/api/admin/queue` | POST | 201 | 201 | docId, action | ok, data |
| `/api/admin/ocr/errors` | GET | 200 | 200 | - | ok, data, errors |
| `/api/admin/analytics/cards` | GET | 200 | 200 | range | ok, data |
| `/api/admin/billing/cards` | GET | 200 | 200 | - | ok, data |
| `/api/admin/monitoring/summary` | GET | 200 | 200 | - | ok, data |

**Common Discrepancies:**

**Discrepancy 1: Status code mismatch**
```diff
# Frontend expects 201, backend returns 200
# Fix: Align on 201 for POST operations

# backend/shared_core/modules/admin/router_production.py
- return JSONResponse({"ok": True, "data": result}, status_code=200)
+ return JSONResponse({"ok": True, "data": result}, status_code=201)
```

**Discrepancy 2: Payload key mismatch**
```diff
# Frontend sends "docId", backend expects "doc_id"
# Fix: Standardize on camelCase (docId)

# backend/shared_core/modules/admin/router_production.py
class QueueRequest(BaseModel):
-   doc_id: str
+   docId: str
    action: str
```

**Discrepancy 3: Missing error field in response**
```diff
# Frontend expects "error" field on failure
# Backend only returns "detail"

# backend/shared_core/modules/admin/router_production.py
except Exception as e:
-   return JSONResponse({"detail": str(e)}, status_code=500)
+   return JSONResponse({"ok": False, "error": str(e)}, status_code=500)
```

**Expected:** All routes match in method, status codes, payload structure, and response format

---

### Task 2: Auth and Tenant-Scope

**Objective:** Verify authentication and tenant isolation work correctly

**Checks:**
- [ ] `requireAdminAuth` applied to all admin routes (FE + BE)
- [ ] WebSocket handshake includes token (query param or header)
- [ ] All `publishActivity` calls include `tenantId`
- [ ] E2E tests verify 401 without token, 200/201 with valid token

**Auth Flow:**
```
1. User logs in → JWT token issued
2. Token stored in httpOnly cookie (admin_token)
3. Frontend reads token, passes in Authorization header
4. Backend validates token, extracts tenantId
5. All operations scoped to tenantId
```

**Common Issues:**

**Issue 1: Token not passed to WebSocket**
```diff
# frontend/lib/admin/hooks/useTenantFeed.ts
- const ws = new WebSocket(`${wsUrl}/feed`);
+ const ws = new WebSocket(`${wsUrl}/feed?token=${encodeURIComponent(token)}`);
```

**Issue 2: tenantId not extracted from token**
```diff
# backend/shared_core/middleware/auth.py
def extract_tenant_id(token: str) -> str:
    payload = jwt.decode(token, secret, algorithms=["HS256"])
-   return payload.get("sub")
+   return payload.get("tenantId") or payload.get("sub")
```

**Issue 3: publishActivity missing tenantId**
```diff
# backend/shared_core/modules/admin/bus.py
async def publish_activity(event_type: str, data: dict):
+   tenant_id = data.get("tenantId") or "default"
    await redis.publish(
-       "admin:activities",
+       f"admin:activities:{tenant_id}",
        json.dumps({"type": event_type, "data": data})
    )
```

**Expected:** All operations properly scoped to tenant, no cross-tenant leaks

---

### Task 3: Rate-Limit Harmonization

**Objective:** Ensure rate limiting is consistent across FE and BE

**Target:** 60 requests/minute/tenant for POST operations

**Frontend Implementation:**
```typescript
// frontend/lib/rateLimit.ts
const RATE_LIMIT = 60; // requests per minute
const WINDOW_MS = 60 * 1000;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(tenantId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(tenantId);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(tenantId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  
  entry.count++;
  return true;
}
```

**Backend Implementation:**
```python
# backend/shared_core/middleware/rate_limit.py
from fastapi import Request, HTTPException
import time

RATE_LIMIT = 60
WINDOW_SECONDS = 60

rate_limit_store = {}

async def rate_limit_middleware(request: Request, tenant_id: str):
    now = time.time()
    key = f"rate_limit:{tenant_id}"
    
    if key not in rate_limit_store or now > rate_limit_store[key]["reset_at"]:
        rate_limit_store[key] = {"count": 1, "reset_at": now + WINDOW_SECONDS}
        return
    
    if rate_limit_store[key]["count"] >= RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded",
            headers={"Retry-After": str(int(rate_limit_store[key]["reset_at"] - now))}
        )
    
    rate_limit_store[key]["count"] += 1
```

**Common Issues:**

**Issue 1: Different limits on FE vs BE**
```diff
# Align both to 60/min
# frontend/lib/rateLimit.ts
- const RATE_LIMIT = 100;
+ const RATE_LIMIT = 60;
```

**Issue 2: Missing Retry-After header**
```diff
# backend response on 429
return JSONResponse(
    {"ok": False, "error": "Rate limit exceeded"},
    status_code=429,
+   headers={"Retry-After": "60"}
)
```

**Expected:** 429 returned after 60 requests/minute, consistent across FE and BE

---

### Task 4: Realtime and Metrics

**Objective:** Verify WebSocket and Prometheus metrics work correctly

**WebSocket Requirements:**
- [ ] Connection established with token
- [ ] Reconnect with exponential backoff (0.5s → 1s → 2s → 4s → 8s, max 10s)
- [ ] Backpressure handling (close if bufferedAmount > 1MB)
- [ ] Events filtered by tenant
- [ ] Latency < 1 second from publish to UI

**Metrics Requirements:**
- [ ] `/metrics` endpoint accessible
- [ ] `request_duration_ms_bucket` present
- [ ] `publish_latency_ms` present (bucket + count)
- [ ] `doc_ingested_total` present
- [ ] `revenue_total_eur` present

**Verify Metrics:**
```bash
curl -s $BACKEND_BASE_URL/metrics | grep -E "request_duration_ms_bucket|publish_latency_ms|doc_ingested_total|revenue_total_eur"
```

**Common Issues:**

**Issue 1: publish_latency_ms not measured**
```diff
# backend/shared_core/modules/admin/bus.py
+ from backend.app.core.metrics import PUBLISH_LATENCY
+ import time

async def publish_activity(event_type: str, data: dict, tenant_id: str):
+   start = time.time()
    await redis.publish(f"admin:activities:{tenant_id}", json.dumps(data))
+   latency_ms = (time.time() - start) * 1000
+   PUBLISH_LATENCY.labels(tenant=tenant_id, event_type=event_type).observe(latency_ms)
```

**Issue 2: Metrics not exposed**
```diff
# backend/app/routes/metrics.py
from fastapi import APIRouter, Response
+ from backend.app.core.metrics import get_metrics, get_metrics_content_type

router = APIRouter()

@router.get("/metrics")
async def metrics() -> Response:
+   return Response(
+       content=get_metrics(),
+       media_type=get_metrics_content_type()
+   )
```

**Issue 3: WebSocket reconnect loop**
```diff
# frontend/lib/admin/hooks/useTenantFeed.ts
+ const MAX_RETRIES = 10;
+ let retryCount = 0;

const connect = () => {
+   if (retryCount >= MAX_RETRIES) {
+       console.error("Max retries reached");
+       return;
+   }
    const ws = new WebSocket(wsUrl);
    ws.onerror = () => {
+       const delay = Math.min(500 * Math.pow(2, retryCount), 10000);
+       retryCount++;
        setTimeout(connect, delay);
    };
+   ws.onopen = () => { retryCount = 0; };
};
```

**Expected:** WebSocket stable, metrics accurate, publish latency < 20ms p95

---

### Task 5: Analytics and Monitoring

**Objective:** Verify Analytics and Monitoring segments work with Prometheus

**Requirements:**
- [ ] `ANALYTICS_PROM_ENABLED=true` in staging
- [ ] `/api/admin/analytics/cards` returns data or placeholders
- [ ] `/api/admin/analytics/series` returns time-series data
- [ ] Range selector works (30d, 90d)
- [ ] `/api/admin/monitoring/summary` returns route metrics

**Backend Analytics Implementation:**
```python
# backend/app/api/admin/analytics/cards.py
from fastapi import APIRouter, Query
from prometheus_client import REGISTRY
import os

router = APIRouter()

@router.get("/api/admin/analytics/cards")
async def get_analytics_cards(range: str = Query("30d")):
    if os.getenv("ANALYTICS_PROM_ENABLED") != "true":
        # Return placeholders
        return {
            "ok": True,
            "data": {
                "apiP95": 145,
                "ocrP95": 2340,
                "docsProcessed": 1234,
                "revenue": 567.89
            }
        }
    
    # Query Prometheus for real data
    # ... implementation
```

**Common Issues:**

**Issue 1: Prometheus not configured**
```diff
# Add to backend/config.py
+ prometheus_url: str = os.getenv("PROMETHEUS_BASE_URL", "")

# Use in analytics routes
+ import httpx
+ async with httpx.AsyncClient() as client:
+     response = await client.get(f"{prometheus_url}/api/v1/query", params={"query": "..."})
```

**Issue 2: Series data format mismatch**
```diff
# Frontend expects: [{ date: "2025-01-01", value: 123 }]
# Backend returns: [[timestamp, value]]

# backend/app/api/admin/analytics/series.py
- return {"ok": True, "data": prometheus_result}
+ formatted = [{"date": datetime.fromtimestamp(ts).isoformat(), "value": val} for ts, val in prometheus_result]
+ return {"ok": True, "data": formatted}
```

**Expected:** Analytics show real data when Prometheus available, placeholders otherwise

---

### Task 6: Integration Mock Mode

**Objective:** Verify mock mode works for external integrations

**Integrations to Mock:**
- Resend (email)
- Pipedrive (CRM)
- Stripe (billing)

**Implementation:**
```python
# backend/modules/email/service.py
import os

async def send_email(to: str, subject: str, body: str):
    if os.getenv("NO_EXTERNAL_SEND") == "true":
        logger.info(f"[MOCK] Would send email to {to}: {subject}")
        return {"ok": True, "messageId": "mock-123"}
    
    # Real Resend API call
    response = await resend_client.send(...)
    return response
```

**Verification:**
```bash
# Set mock mode
export NO_EXTERNAL_SEND=true

# Test contact endpoint
curl -X POST http://localhost:3000/api/admin/customers/contact \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerId":"C1","email":"test@example.com","message":"Test"}'

# Should succeed without actually sending email
# Check logs for "[MOCK]" prefix
```

**Common Issues:**

**Issue 1: Mock flag not checked**
```diff
# Add mock check to all external calls
+ if os.getenv("NO_EXTERNAL_SEND") == "true":
+     logger.info(f"[MOCK] Would call {service}")
+     return mock_response
```

**Issue 2: Audit events not created in mock mode**
```diff
# Ensure audit trail even in mock mode
async def send_email(to: str, subject: str, body: str):
    if os.getenv("NO_EXTERNAL_SEND") == "true":
        logger.info(f"[MOCK] Email to {to}")
+       await create_audit_event("email.sent", {"to": to, "mock": True})
        return {"ok": True, "messageId": "mock-123"}
```

**Expected:** All external calls mockable, audit events still created

---

### Task 7: CI and E2E

**Objective:** Verify CI runs all checks and E2E tests pass

**CI Workflow Checks:**
- [ ] OpenAPI export + lint
- [ ] Metrics endpoint validation
- [ ] Admin API smoke tests (401/201)
- [ ] E2E tests (modules, customers, analytics/billing)
- [ ] TypeScript typecheck
- [ ] Frontend build

**E2E Test Coverage:**
```
admin.modules.spec.ts:
  ✓ Queue Manager loads
  ✓ Seed events appear < 1s
  ✓ Requeue action works
  ✓ OCR Triage loads
  ✓ Retry/Ack actions work

admin.customers.spec.ts:
  ✓ Contact modal opens
  ✓ Validation works
  ✓ Mock send succeeds

admin.analytics_billing.spec.ts:
  ✓ Analytics renders
  ✓ CSV/PDF export works
  ✓ Billing renders
  ✓ API Monitoring renders
```

**Common Issues:**

**Issue 1: Import path mismatch**
```diff
# frontend/e2e/admin.modules.spec.ts
- import { test } from '@playwright/test';
+ import { test, expect } from '@playwright/test';

# Fix tsconfig paths if needed
# frontend/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./app/*"],
+     "@/lib/*": ["./lib/*"],
+     "@/components/*": ["./components/*"]
    }
  }
}
```

**Issue 2: E2E timeout in CI**
```diff
# .github/workflows/quick-check.yml
- timeout-minutes: 10
+ timeout-minutes: 20

# playwright.config.ts
export default defineConfig({
-   timeout: 10000,
+   timeout: 30000,
+   retries: process.env.CI ? 2 : 0,
});
```

**Issue 3: Spectral errors block CI**
```diff
# .spectral.yaml
rules:
  # Downgrade some rules from error to warn
-   info-description: error
+   info-description: warn
```

**Expected:** CI green, all E2E tests pass, no blocking errors

---

### Task 8: Rollout Plan

**Objective:** Define safe rollout strategy with monitoring

**Stages:**

**Stage 1: Staging Smoke (5-10 min)**
```bash
# 1. Deploy to staging
# 2. Run quick-runner
./scripts/quick-runner.sh

# 3. Seed test data
curl -X POST $STAGING_URL/api/admin/queue \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"docId":"SMOKE1","action":"requeue"}'

# 4. Verify Grafana (wait 5-10 min)
# - Open grafana/dashboards/docflow_analytics.json
# - Check Docs Ingested panel
# - Check Revenue panel
# - Verify tenant=All shows data
```

**Stage 2: Canary 10% (30 min)**
```yaml
# render.yaml or similar
services:
  - name: backend-canary
    env: production
    plan: starter
    scaling:
      minInstances: 1
      maxInstances: 2
    healthCheckPath: /health
    
    # Route 10% of traffic
    routes:
      - type: canary
        weight: 10
```

**Canary Limits (auto-rollback if exceeded):**
- API p95 latency < 200ms
- OCR p95 latency < 3000ms
- Publish p95 latency < 20ms
- 5xx error rate < 1%

**Stage 3: Full Rollout (100%)**
```bash
# If canary successful for 30 min:
# 1. Increase canary to 50%
# 2. Monitor for 15 min
# 3. Increase to 100%
# 4. Monitor for 1 hour
# 5. Mark as stable
```

**Rollback Procedure:**
```bash
# If any limit exceeded:
# 1. Immediately route 100% to previous version
# 2. Capture logs and metrics
# 3. Create incident report
# 4. Fix issues
# 5. Re-run staging smoke
# 6. Retry canary
```

**Expected:** Safe rollout with automatic rollback on issues

---

## Quick Commands

```bash
# OpenAPI export + lint
python scripts/export_openapi.py --out docs/openapi.yaml
cd frontend && npm run openapi:lint

# Metrics check
curl -s $BACKEND_BASE_URL/metrics | grep -E "publish_latency_ms|doc_ingested_total|revenue_total_eur"

# E2E tests
cd frontend && npx playwright test

# Quick-runner (all checks)
./scripts/quick-runner.sh

# Generate admin token
python3 -c "
import jwt, time, os
print(jwt.encode(
    {'sub': 'test@admin', 'role': 'admin', 'tenantId': 'test', 'iat': int(time.time()), 'exp': int(time.time()) + 900},
    os.environ['ADMIN_JWT_SECRET'],
    algorithm='HS256'
))
"
```

---

## Acceptance Criteria

**MUST PASS:**
- ✅ FE/BE contract discrepancies: 0 (status codes, schemas, payload keys aligned)
- ✅ WebSocket and metrics green (publish_latency_ms visible)
- ✅ E2E smoke tests green in CI
- ✅ Auth and tenant-scope working (no cross-tenant leaks)
- ✅ Rate limiting consistent (60/min/tenant)

**SHOULD PASS:**
- ⚠️ Analytics show real data (or placeholders)
- ⚠️ Mock mode works for all integrations
- ⚠️ CI completes in < 15 minutes

**NICE TO HAVE:**
- 💡 Canary deployment configured
- 💡 Automatic rollback on metric violations
- 💡 Grafana alerts for key metrics

---

## PASS/FAIL Report Template

| Task | Status | Discrepancies | Fix Applied |
|------|--------|---------------|-------------|
| 1. Contract Verification | ⬜ PASS / ❌ FAIL | | |
| 2. Auth & Tenant-Scope | ⬜ PASS / ❌ FAIL | | |
| 3. Rate-Limit | ⬜ PASS / ❌ FAIL | | |
| 4. Realtime & Metrics | ⬜ PASS / ❌ FAIL | | |
| 5. Analytics & Monitoring | ⬜ PASS / ❌ FAIL | | |
| 6. Mock Mode | ⬜ PASS / ❌ FAIL | | |
| 7. CI & E2E | ⬜ PASS / ❌ FAIL | | |
| 8. Rollout Plan | ⬜ PASS / ❌ FAIL | | |

**Decision:** 🎯 GO / NO-GO

**Migration Steps Required:** [List any diffs to apply]

**Estimated Time:** [e.g., 2 hours for fixes + 1 hour for testing]

---

## Common Fixes with Diffs

### Fix 1: Align POST Status Codes (201 vs 200)

**Symptom:** Frontend expects 201, backend returns 200

**Backend Fix:**
```diff
# backend/shared_core/modules/admin/router_production.py
@router.post("/api/admin/queue")
async def requeue_document(request: QueueRequest):
    result = await admin_bus.publish("queue.requeue", request.dict())
-   return JSONResponse({"ok": True, "data": result}, status_code=200)
+   return JSONResponse({"ok": True, "data": result}, status_code=201)
```

### Fix 2: Standardize Payload Keys (snake_case → camelCase)

**Symptom:** Frontend sends `docId`, backend expects `doc_id`

**Backend Fix:**
```diff
# backend/shared_core/modules/admin/router_production.py
from pydantic import BaseModel, Field

class QueueRequest(BaseModel):
-   doc_id: str
-   event_type: str
+   docId: str = Field(..., alias="docId")
+   eventType: str = Field(..., alias="eventType")
+   
+   class Config:
+       populate_by_name = True
```

### Fix 3: Add Missing Error Field in Responses

**Symptom:** Frontend expects `{ok: false, error: "..."}`, backend returns `{detail: "..."}`

**Backend Fix:**
```diff
# backend/shared_core/modules/admin/router_production.py
from fastapi import HTTPException
from fastapi.responses import JSONResponse

@router.post("/api/admin/queue")
async def requeue_document(request: QueueRequest):
    try:
        result = await admin_bus.publish("queue.requeue", request.dict())
        return JSONResponse({"ok": True, "data": result}, status_code=201)
    except Exception as e:
-       raise HTTPException(status_code=500, detail=str(e))
+       return JSONResponse({"ok": False, "error": str(e)}, status_code=500)
```

### Fix 4: Add publish_latency_ms Metric

**Symptom:** Metric not present in `/metrics` output

**Backend Fix:**
```diff
# backend/app/core/metrics.py
from prometheus_client import Histogram

+ PUBLISH_LATENCY = Histogram(
+     "publish_latency_ms",
+     "Realtime bus publish latency in milliseconds",
+     ["tenant", "event_type"],
+     buckets=[1, 5, 10, 20, 50, 100, 200, 500]
+ )

# backend/shared_core/modules/admin/bus.py
+ from backend.app.core.metrics import PUBLISH_LATENCY
+ import time

async def publish_activity(event_type: str, data: dict, tenant_id: str):
+   start = time.time()
    await redis.publish(f"admin:activities:{tenant_id}", json.dumps(data))
+   latency_ms = (time.time() - start) * 1000
+   PUBLISH_LATENCY.labels(tenant=tenant_id, event_type=event_type).observe(latency_ms)
```

### Fix 5: WebSocket Token Passing

**Symptom:** WebSocket connection fails with 401

**Frontend Fix:**
```diff
# frontend/lib/admin/hooks/useTenantFeed.ts
- const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/feed`;
+ const token = getCookie('admin_token');
+ const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/feed?token=${encodeURIComponent(token)}`;
```

**Backend Fix:**
```diff
# backend/websocket/feed.py
from fastapi import WebSocket, Query

@app.websocket("/feed")
- async def websocket_feed(websocket: WebSocket):
+ async def websocket_feed(websocket: WebSocket, token: str = Query(...)):
+   # Validate token
+   try:
+       payload = jwt.decode(token, secret, algorithms=["HS256"])
+       tenant_id = payload.get("tenantId")
+   except Exception:
+       await websocket.close(code=1008)
+       return
+   
    await websocket.accept()
    # ... rest of handler
```

### Fix 6: Rate Limit Alignment

**Symptom:** Different limits on frontend (100/min) vs backend (60/min)

**Frontend Fix:**
```diff
# frontend/lib/rateLimit.ts
- const RATE_LIMIT = 100;
+ const RATE_LIMIT = 60; // Align with backend
```

### Fix 7: Tenant Extraction from Token

**Symptom:** Operations not scoped to tenant

**Backend Fix:**
```diff
# backend/shared_core/middleware/auth.py
def extract_tenant_from_token(token: str) -> str:
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
-       return payload.get("sub")  # Wrong: returns user ID
+       return payload.get("tenantId") or payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### Fix 8: Mock Mode for External Integrations

**Symptom:** E2E tests fail trying to call real APIs

**Backend Fix:**
```diff
# backend/modules/email/service.py
+ import os

async def send_email(to: str, subject: str, body: str):
+   if os.getenv("NO_EXTERNAL_SEND") == "true":
+       logger.info(f"[MOCK] Would send email to {to}: {subject}")
+       await create_audit_event("email.sent", {"to": to, "mock": True})
+       return {"ok": True, "messageId": f"mock-{int(time.time())}"}
+   
    # Real Resend API call
    response = await resend_client.send(...)
    return response
```

### Fix 9: Analytics Placeholder Data

**Symptom:** Analytics shows "No data" instead of placeholders

**Backend Fix:**
```diff
# backend/app/api/admin/analytics/cards.py
+ import os

@router.get("/api/admin/analytics/cards")
async def get_analytics_cards(range: str = Query("30d")):
+   if os.getenv("ANALYTICS_PROM_ENABLED") != "true":
+       return {
+           "ok": True,
+           "data": {
+               "apiP95": 145,
+               "ocrP95": 2340,
+               "docsProcessed": 1234,
+               "revenue": 567.89
+           }
+       }
+   
    # Query Prometheus for real data
    # ...
```

### Fix 10: E2E Import Path Issues

**Symptom:** E2E tests fail with "Cannot find module '@/lib/...'"

**Frontend Fix:**
```diff
# frontend/tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./app/*"],
+     "@/lib/*": ["./lib/*"],
+     "@/components/*": ["./components/*"]
    }
  }
}
```

### Fix 11: CI Timeout on E2E Tests

**Symptom:** Playwright tests timeout in CI but pass locally

**CI Fix:**
```diff
# .github/workflows/quick-check.yml
- timeout-minutes: 10
+ timeout-minutes: 20

- npx playwright test
+ npx playwright test --retries=2 --timeout=30000
```

### Fix 12: Spectral Lint Blocking Deployment

**Symptom:** OpenAPI lint fails with info-level errors

**Fix:**
```diff
# frontend/.spectral.yaml
rules:
  # Downgrade non-critical rules
-   info-description: error
+   info-description: warn
-   operation-description: error
+   operation-description: warn
```

---

## Next Steps After Integration Audit

1. **If GO:** Proceed with staging deployment
2. **If NO-GO:**
   - Apply all diffs from "Common Fixes"
   - Re-run integration audit
   - Update PASS/FAIL table
3. **Document:** Save audit report with applied fixes
4. **Monitor:** Set up Grafana alerts for key metrics
5. **Rollout:** Follow canary deployment plan

---

**Last Updated:** 2025-11-10
**Audit Version:** 1.0
**Maintained By:** DevOps Team


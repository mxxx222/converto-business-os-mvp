# Quick-Runner System: Usage Guide

Complete guide for using the Quick-Runner validation system for backend + admin dashboard testing.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Local Usage](#local-usage)
4. [CI Usage](#ci-usage)
5. [Environment Setup](#environment-setup)
6. [Expected Outputs](#expected-outputs)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Usage](#advanced-usage)

---

## Overview

The Quick-Runner system provides fast, comprehensive validation for backend and admin dashboard:

**Components:**
- `scripts/quick-runner.sh` - Bash script for local/CI execution
- `.github/workflows/quick-check.yml` - GitHub Actions workflow
- `docs/ADMIN_DASHBOARD_AUDIT.md` - Dashboard audit prompt for Cursor
- `docs/DASHBOARD_BACKEND_INTEGRATION.md` - Integration audit prompt for Cursor

**What it checks:**
- ✅ OpenAPI schema export + Spectral lint
- ✅ Prometheus metrics (request_duration, publish_latency, doc_ingested, revenue)
- ✅ Admin API endpoints (401/201/429 status codes)
- ✅ E2E smoke tests (Queue, OCR, Customers, Analytics, Billing)
- ✅ TypeScript typecheck + build

**Time:** ~5-10 minutes for full run

---

## Quick Start

### Prerequisites

```bash
# Required tools
node --version    # 20+
python --version  # 3.11+
curl --version    # any recent version

# Install dependencies
pip install -r requirements.txt
pip install pyjwt  # For token generation

cd frontend
npm install
npx playwright install --with-deps chromium
```

### Run Quick-Runner

```bash
# 1. Set environment variables
export BACKEND_BASE_URL=http://localhost:8000
export FRONTEND_BASE_URL=http://localhost:3000
export ADMIN_JWT_SECRET=your-secret-here
export NO_EXTERNAL_SEND=true
export ANALYTICS_PROM_ENABLED=true

# 2. Start backend (in separate terminal)
cd backend
uvicorn main:app --reload

# 3. Start frontend (in separate terminal)
cd frontend
npm run dev

# 4. Run quick-runner
./scripts/quick-runner.sh
```

**Expected output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quick-Runner: Backend + Admin Dashboard Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[INFO] Environment:
  BACKEND_BASE_URL: http://localhost:8000
  FRONTEND_BASE_URL: http://localhost:3000
  NO_EXTERNAL_SEND: true
  ANALYTICS_PROM_ENABLED: true

[OK] Admin token generated
[OK] OpenAPI schema exported
[OK] OpenAPI lint: PASS
[OK] Metrics endpoint reachable
[OK] request_duration_ms_bucket: present
[OK] publish_latency_ms: present
[OK] doc_ingested_total: present
[OK] revenue_total_eur: present
[OK] /api/admin/queue 401 without token: PASS
[OK] /api/admin/queue POST: PASS (status 201)
[OK] E2E modules (Queue + OCR): PASS
[OK] E2E customers: PASS
[OK] E2E analytics/billing: PASS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quick-Runner Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ OpenAPI schema exported
✅ OpenAPI lint: PASS
✅ Metrics endpoint reachable
✅ request_duration_ms_bucket: present
✅ publish_latency_ms: present
✅ doc_ingested_total: present
✅ revenue_total_eur: present
✅ /api/admin/queue 401 without token: PASS
✅ /api/admin/queue POST: PASS (status 201)
✅ /api/admin/analytics/cards: PASS
✅ TypeScript typecheck: PASS
✅ Frontend build: PASS
✅ E2E modules (Queue + OCR): PASS
✅ E2E customers: PASS
✅ E2E analytics/billing: PASS

🎯 Decision: GO
📝 Reason: All critical checks passed
```

---

## Local Usage

### Scenario 1: Quick Validation Before Commit

```bash
# Run quick-runner to verify changes
./scripts/quick-runner.sh

# If PASS, commit and push
git add .
git commit -m "feat: add new admin feature"
git push
```

### Scenario 2: Debug Specific Failure

```bash
# Run with verbose output
set -x
./scripts/quick-runner.sh 2>&1 | tee quick-runner.log

# Check specific log files
cat /tmp/metrics.out           # Metrics output
cat /tmp/openapi-lint.log      # OpenAPI lint errors
cat /tmp/e2e-modules.log       # E2E test output
```

### Scenario 3: Test Against Staging

```bash
# Point to staging environment
export BACKEND_BASE_URL=https://backend.staging.example.com
export FRONTEND_BASE_URL=https://staging.example.com
export ADMIN_JWT_SECRET=$STAGING_JWT_SECRET

# Run quick-runner
./scripts/quick-runner.sh
```

### Scenario 4: Skip E2E Tests (Faster)

```bash
# Comment out E2E section in script
# Or run individual steps manually:

# 1. OpenAPI
python scripts/export_openapi.py --out docs/openapi.yaml
cd frontend && npm run openapi:lint

# 2. Metrics
curl -s $BACKEND_BASE_URL/metrics | grep -E "request_duration|publish_latency"

# 3. Admin API
curl -s -o /dev/null -w "%{http_code}" $FRONTEND_BASE_URL/api/admin/queue
# Expected: 401
```

---

## CI Usage

### GitHub Actions Workflow

The workflow runs automatically on:
- Pull requests to `main` or `staging`
- Changes to `backend/**`, `frontend/**`, `shared_core/**`, or `scripts/**`

**Workflow file:** `.github/workflows/quick-check.yml`

### Manual Trigger

```bash
# Via GitHub UI:
# 1. Go to Actions tab
# 2. Select "Quick Check - Backend + Admin Dashboard"
# 3. Click "Run workflow"
# 4. Select branch
# 5. Optionally skip E2E tests

# Via GitHub CLI:
gh workflow run quick-check.yml
```

### CI Environment Variables

Set these as GitHub Secrets:

```
BACKEND_BASE_URL          # https://backend.staging.example.com
FRONTEND_BASE_URL         # https://staging.example.com
ADMIN_JWT_SECRET          # Your admin JWT secret
SUPABASE_URL              # https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY # Your Supabase service role key
```

### Viewing Results

**In PR comments:**
```markdown
## 🔍 Quick-Runner Validation Results

**Decision:** GO

<details>
<summary>📊 Full Report</summary>

[Full output from quick-runner.sh]

</details>

---

**Commit:** abc123
**Workflow:** [View run](https://github.com/...)
```

**In Actions tab:**
- Green checkmark = All checks passed
- Red X = One or more checks failed
- Click run to see detailed logs

**Artifacts:**
- `quick-runner-results.zip` - Contains all log files
- Available for 7 days after run

---

## Environment Setup

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `BACKEND_BASE_URL` | Backend API URL | `http://localhost:8000` | Yes |
| `FRONTEND_BASE_URL` | Frontend URL | `http://localhost:3000` | Yes |
| `ADMIN_JWT_SECRET` | Secret for JWT signing | `your-secret-here` | Yes* |
| `ADMIN_TOKEN` | Pre-generated token | `eyJhbGc...` | Yes* |

*Either `ADMIN_JWT_SECRET` (for auto-generation) or `ADMIN_TOKEN` (manual) required

### Optional Variables

| Variable | Description | Default | Notes |
|----------|-------------|---------|-------|
| `NO_EXTERNAL_SEND` | Mock external APIs | `true` | Set to `false` for real API calls |
| `ANALYTICS_PROM_ENABLED` | Enable Prometheus | `true` | Set to `false` to use placeholders |
| `ADMIN_REQUIRED_ROLE` | Required admin role | `admin` | Must match token role |
| `PROMETHEUS_BASE_URL` | Prometheus URL | - | Optional, for real analytics |

### Example .env File

```bash
# .env.local
BACKEND_BASE_URL=http://localhost:8000
FRONTEND_BASE_URL=http://localhost:3000
ADMIN_JWT_SECRET=dev-secret-change-in-production
NO_EXTERNAL_SEND=true
ANALYTICS_PROM_ENABLED=true
ADMIN_REQUIRED_ROLE=admin

# Supabase (required for backend)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SUPABASE_AUTH_ENABLED=false

# Optional
PROMETHEUS_BASE_URL=http://localhost:9090
```

**Load environment:**
```bash
source .env.local
./scripts/quick-runner.sh
```

---

## Expected Outputs

### Success (GO)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quick-Runner Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ OpenAPI schema exported
✅ OpenAPI lint: PASS
✅ Metrics endpoint reachable
✅ request_duration_ms_bucket: present
✅ publish_latency_ms: present
✅ doc_ingested_total: present
✅ revenue_total_eur: present
✅ /api/admin/queue 401 without token: PASS
✅ /api/admin/queue POST: PASS (status 201)
✅ /api/admin/analytics/cards: PASS
✅ TypeScript typecheck: PASS
✅ Frontend build: PASS
✅ E2E modules (Queue + OCR): PASS
✅ E2E customers: PASS
✅ E2E analytics/billing: PASS

🎯 Decision: GO
📝 Reason: All critical checks passed
```

**Exit code:** 0

### Failure (NO-GO)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quick-Runner Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ OpenAPI schema exported
❌ OpenAPI lint: FAIL
✅ Metrics endpoint reachable
✅ request_duration_ms_bucket: present
❌ publish_latency_ms: missing
✅ doc_ingested_total: present
✅ revenue_total_eur: present
✅ /api/admin/queue 401 without token: PASS
❌ /api/admin/queue POST expected 201/200, got 500
✅ /api/admin/analytics/cards: PASS
✅ TypeScript typecheck: PASS
✅ Frontend build: PASS
❌ E2E modules: FAIL
✅ E2E customers: PASS
✅ E2E analytics/billing: PASS

🎯 Decision: NO-GO
📝 Reason: 3 check(s) failed

Failed checks:
  - OpenAPI lint: FAIL
  - publish_latency_ms: missing
  - /api/admin/queue POST expected 201/200, got 500
  - E2E modules: FAIL
```

**Exit code:** 1

### Fix Hints

Each failure includes a fix hint:

```
[FAIL] publish_latency_ms: missing
💡 Fix hint: Add to backend/app/core/metrics.py:
PUBLISH_LATENCY = Histogram(
    'publish_latency_ms',
    'Realtime bus publish latency in milliseconds',
    ['tenant', 'event_type'],
    buckets=[1, 5, 10, 20, 50, 100, 200, 500]
)
And measure around publishActivity calls
```

---

## Troubleshooting

### Issue 1: "ADMIN_JWT_SECRET not set"

**Symptom:**
```
[FAIL] ADMIN_JWT_SECRET not set and ADMIN_TOKEN not provided
💡 Fix hint: Set ADMIN_JWT_SECRET in your environment or provide ADMIN_TOKEN manually
```

**Solution:**
```bash
# Option A: Set secret (recommended)
export ADMIN_JWT_SECRET=your-secret-here

# Option B: Generate token manually
export ADMIN_TOKEN=$(node -e "
const jwt = require('jsonwebtoken');
console.log(jwt.sign(
  { sub: 'test@admin', role: 'admin', tenantId: 'test' },
  'your-secret-here',
  { expiresIn: '1h' }
));
")

# Option C: Use Python
export ADMIN_TOKEN=$(python3 -c "
import jwt, time
print(jwt.encode(
    {'sub': 'test@admin', 'role': 'admin', 'tenantId': 'test', 'iat': int(time.time()), 'exp': int(time.time()) + 3600},
    'your-secret-here',
    algorithm='HS256'
))
")
```

### Issue 2: "Metrics endpoint unreachable"

**Symptom:**
```
[FAIL] Metrics endpoint unreachable: http://localhost:8000/metrics
💡 Fix hint: Ensure backend is running and /metrics route is exposed
```

**Solution:**
```bash
# 1. Check backend is running
curl http://localhost:8000/health

# 2. Check metrics route exists
curl http://localhost:8000/metrics

# 3. If not found, verify route is registered
# backend/main.py should include:
from backend.app.routes.metrics import router as metrics_router
app.include_router(metrics_router)

# 4. Restart backend
cd backend
uvicorn main:app --reload
```

### Issue 3: "OpenAPI lint FAIL"

**Symptom:**
```
[FAIL] OpenAPI lint: FAIL
💡 Fix hint: Review errors in /tmp/openapi-lint.log
```

**Solution:**
```bash
# 1. View lint errors
cat /tmp/openapi-lint.log

# 2. Common issues:
# - Missing operation descriptions
# - Invalid $ref paths
# - Inconsistent naming (camelCase vs snake_case)

# 3. Fix in backend code
# Add descriptions to routes:
@router.post("/api/admin/queue", description="Requeue a document for processing")
async def requeue_document(...):
    ...

# 4. Re-export and lint
python scripts/export_openapi.py --out docs/openapi.yaml
cd frontend && npm run openapi:lint
```

### Issue 4: "E2E tests timeout"

**Symptom:**
```
[FAIL] E2E modules: FAIL
💡 Fix hint: Check /tmp/e2e-modules.log
```

**Solution:**
```bash
# 1. Check if frontend is running
curl http://localhost:3000

# 2. Check if admin token is valid
echo $ADMIN_TOKEN | cut -d. -f2 | base64 -d

# 3. Increase timeout in playwright.config.ts
# frontend/playwright.config.ts
export default defineConfig({
  timeout: 30000, // 30 seconds
  retries: 2,
});

# 4. Run tests manually with debug
cd frontend
DEBUG=pw:api npx playwright test e2e/admin.modules.spec.ts
```

### Issue 5: "TypeScript typecheck FAIL"

**Symptom:**
```
[FAIL] TypeScript typecheck: FAIL
💡 Fix hint: Fix TypeScript errors shown in /tmp/typecheck.log
```

**Solution:**
```bash
# 1. View errors
cat /tmp/typecheck.log

# 2. Run typecheck locally
cd frontend
npm run typecheck

# 3. Common fixes:
# - Add missing type imports
# - Fix 'any' types
# - Add null checks for optional props

# 4. Example fix:
# Before:
const data = response.data;  // Type 'any'

# After:
interface ResponseData {
  ok: boolean;
  data: { items: Item[] };
}
const data: ResponseData = response.data;
```

### Issue 6: "Frontend build FAIL"

**Symptom:**
```
[FAIL] Frontend build: FAIL
💡 Fix hint: Fix build errors shown in /tmp/build.log
```

**Solution:**
```bash
# 1. View errors
cat /tmp/build.log

# 2. Common issues:
# - Missing dependencies
# - Environment variables not set
# - Import errors

# 3. Clean and rebuild
cd frontend
rm -rf .next node_modules
npm install
npm run build

# 4. Check environment variables
# Ensure all NEXT_PUBLIC_* vars are set at build time
```

### Issue 7: "Rate limit exceeded (429)"

**Symptom:**
```
[FAIL] /api/admin/queue POST expected 201/200, got 429
```

**Solution:**
```bash
# Wait 60 seconds for rate limit to reset
sleep 60

# Or increase rate limit for testing
# backend/shared_core/middleware/rate_limit.py
RATE_LIMIT = 100  # Increase from 60

# Or disable rate limiting for testing
# Comment out rate limit middleware in route
```

### Issue 8: "WebSocket connection failed"

**Symptom:**
E2E tests show WebSocket errors in console

**Solution:**
```bash
# 1. Check WebSocket URL
echo $NEXT_PUBLIC_WS_URL

# 2. Verify WebSocket server is running
# If using separate WS server:
cd activity-feed-server
npm start

# 3. Check token is passed correctly
# frontend/lib/admin/hooks/useTenantFeed.ts
const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/feed?token=${token}`;

# 4. Test WebSocket manually
wscat -c "ws://localhost:3001/feed?token=$ADMIN_TOKEN"
```

### Issue 9: "Mock mode not working"

**Symptom:**
E2E tests fail with external API errors

**Solution:**
```bash
# 1. Ensure NO_EXTERNAL_SEND is set
export NO_EXTERNAL_SEND=true

# 2. Check backend code checks the flag
# backend/modules/email/service.py
if os.getenv("NO_EXTERNAL_SEND") == "true":
    logger.info("[MOCK] Would send email")
    return {"ok": True, "messageId": "mock-123"}

# 3. Restart backend with flag
NO_EXTERNAL_SEND=true uvicorn main:app --reload
```

### Issue 10: "Permission denied: ./scripts/quick-runner.sh"

**Symptom:**
```
bash: ./scripts/quick-runner.sh: Permission denied
```

**Solution:**
```bash
# Make script executable
chmod +x scripts/quick-runner.sh

# Run again
./scripts/quick-runner.sh
```

---

## Advanced Usage

### Custom Metrics Validation

Add your own metrics to check:

```bash
# Edit scripts/quick-runner.sh
# Add after existing metric checks:

# custom_metric_total
if grep -qE "custom_metric_total" /tmp/metrics.out; then
    log_success "custom_metric_total: present"
else
    log_fail "custom_metric_total: missing"
    print_fix_hint "Add CUSTOM_METRIC = Counter('custom_metric_total', 'Description') to metrics.py"
fi
```

### Parallel Execution

Run multiple checks in parallel for faster execution:

```bash
# Run metrics and E2E tests in parallel
(
  curl -fsSL "$BACKEND_BASE_URL/metrics" -o /tmp/metrics.out &
  cd frontend && npx playwright test &
  wait
)
```

### Integration with Other Tools

**Pre-commit hook:**
```bash
# .git/hooks/pre-commit
#!/bin/bash
./scripts/quick-runner.sh || exit 1
```

**Makefile target:**
```makefile
# Makefile
.PHONY: quick-check
quick-check:
	@./scripts/quick-runner.sh
```

**Docker Compose:**
```yaml
# docker-compose.yml
services:
  quick-runner:
    build: .
    command: ./scripts/quick-runner.sh
    environment:
      - BACKEND_BASE_URL=http://backend:8000
      - FRONTEND_BASE_URL=http://frontend:3000
```

---

## Related Documentation

- [ADMIN_DASHBOARD_AUDIT.md](./ADMIN_DASHBOARD_AUDIT.md) - Full dashboard audit prompt
- [DASHBOARD_BACKEND_INTEGRATION.md](./DASHBOARD_BACKEND_INTEGRATION.md) - Integration audit prompt
- [API_Contracts.md](./API_Contracts.md) - API contract documentation
- [QUICK_START.md](../QUICK_START.md) - Project quick start guide

---

## Support

**Issues?**
1. Check [Troubleshooting](#troubleshooting) section above
2. Review log files in `/tmp/`
3. Run with verbose output: `set -x && ./scripts/quick-runner.sh`
4. Open GitHub issue with logs attached

**Questions?**
- Slack: #devops channel
- Email: devops@example.com

---

**Last Updated:** 2025-11-10
**Version:** 1.0
**Maintained By:** DevOps Team


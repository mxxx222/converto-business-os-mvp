# 🧪 Sentry Integration - Validation Guide

**Purpose:** Quick validation checklist for Sentry + Vercel Pro integration.

**Time Required:** 15-30 minutes

**Prerequisites:**
- Sentry projects created (docflow-frontend, docflow-backend)
- Environment variables configured
- Code deployed to staging

---

## ✅ Validation Checklist

### Phase 1: Basic Functionality (15 min)

- [ ] **1.1 Frontend Error Tracking**
  - Create test error
  - Verify in Sentry
  - Check sourcemaps resolve
  - Verify PII scrubbed

- [ ] **1.2 Backend Error Tracking**
  - Create test error
  - Verify in Sentry
  - Check tenant tags present
  - Verify PII scrubbed

- [ ] **1.3 CSP Violation Tracking**
  - Trigger CSP violation
  - Verify in Sentry
  - Check noise filtered

- [ ] **1.4 Sampling Rate**
  - Verify ~10% of transactions tracked
  - Check quota usage

### Phase 2: Dashboards & Alerts (10 min)

- [ ] **2.1 Create Dashboards**
  - Auth Health dashboard
  - Tenant Isolation dashboard
  - Frontend UX dashboard

- [ ] **2.2 Configure Alerts**
  - Performance degradation alert
  - Auth refresh failure alert
  - 401/403 spike alert
  - CSP violation burst alert

- [ ] **2.3 Test Alerts**
  - Trigger test alert
  - Verify Slack notification

### Phase 3: 24h Monitoring (ongoing)

- [ ] **3.1 Monitor Error Rate**
  - Check error rate < 1%
  - No unexpected spikes

- [ ] **3.2 Monitor Performance**
  - Check Apdex > 0.85
  - No performance regressions

- [ ] **3.3 Monitor Quota**
  - Check usage < 80%
  - Adjust sampling if needed

- [ ] **3.4 Verify PII Compliance**
  - Spot check 10 random events
  - No emails, tokens, or headers

---

## 🧪 Test 1: Frontend Error + Sourcemaps

### Create Test Endpoint

**File:** `frontend/app/api/test-sentry/route.ts`

```typescript
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  try {
    // Simulate error with stack trace
    const data = JSON.parse('invalid json')
    return NextResponse.json({ data })
  } catch (error) {
    // Capture with context
    Sentry.captureException(error, {
      tags: {
        test: 'frontend-validation',
      },
      extra: {
        timestamp: new Date().toISOString(),
      },
    })
    
    throw error
  }
}
```

### Test Command

```bash
# Trigger error
curl https://staging.docflow.fi/api/test-sentry

# Expected: 500 error
```

### Verify in Sentry

**Go to:** Sentry → docflow-frontend → Issues

**Check:**
- ✅ New issue appears within 30 seconds
- ✅ Error message: "Unexpected token 'i', \"invalid json\" is not valid JSON"
- ✅ Stack trace shows original TypeScript file paths (not minified)
- ✅ Line numbers correct
- ✅ Release tag matches Vercel commit SHA
- ✅ Tags include: `test: frontend-validation`
- ✅ No PII in request data (no cookies, authorization headers)

**Screenshot:** Save for documentation

---

## 🧪 Test 2: Backend Error + Tenant Tags

### Create Test Endpoint

**File:** `backend/app/routes/test.py`

```python
from fastapi import APIRouter, HTTPException, Depends
from backend.sentry_init import capture_auth_error
import sentry_sdk

router = APIRouter(prefix="/api/test", tags=["testing"])

@router.post("/sentry-error")
async def test_sentry_error(request: Request):
    """Test Sentry backend integration with tenant context."""
    
    # Simulate authenticated user (in real scenario, from middleware)
    # In staging, use actual auth or mock in middleware
    
    try:
        # Simulate error
        raise ValueError("Test Sentry Backend Integration - Tenant Context")
    except Exception as e:
        # Capture with context
        sentry_sdk.capture_exception(e, extras={
            "test": "backend-validation",
            "endpoint": "/api/test/sentry-error",
        })
        raise HTTPException(status_code=500, detail="Test error sent to Sentry")
```

### Test Command

```bash
# Get auth token (staging)
TOKEN=$(curl -s -X POST https://staging.docflow.fi/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@docflow.fi","password":"test123"}' \
  | jq -r '.session.access_token')

# Trigger error with auth
curl -X POST https://staging-api.docflow.fi/api/test/sentry-error \
  -H "Authorization: Bearer $TOKEN"

# Expected: 500 error
```

### Verify in Sentry

**Go to:** Sentry → docflow-backend → Issues

**Check:**
- ✅ New issue appears within 30 seconds
- ✅ Error message: "Test Sentry Backend Integration - Tenant Context"
- ✅ Tags include:
  - `tenant_id: <uuid>`
  - `user_role: user`
- ✅ User context includes:
  - `id: <user-uuid>`
  - `tenant_id: <tenant-uuid>`
  - ❌ NO email, ip_address
- ✅ Request data has NO:
  - Authorization header
  - Cookies
  - Query parameters
- ✅ Extra context includes: `test: backend-validation`

**Screenshot:** Save for documentation

---

## 🧪 Test 3: CSP Violation + Noise Filtering

### Test Legitimate Violation

```bash
# Send CSP violation report
curl -X POST https://staging.docflow.fi/api/csp-report \
  -H "Content-Type: application/csp-report" \
  -d '{
    "csp-report": {
      "document-uri": "https://staging.docflow.fi/dashboard",
      "violated-directive": "script-src",
      "blocked-uri": "https://malicious.example.com/evil.js",
      "source-file": "https://staging.docflow.fi/dashboard",
      "line-number": 42,
      "column-number": 15
    }
  }'

# Expected: 200 OK
```

### Verify in Sentry

**Go to:** Sentry → docflow-frontend → Issues

**Check:**
- ✅ Message: "CSP Violation"
- ✅ Level: Warning
- ✅ Tags:
  - `csp_directive: script-src`
  - `csp_disposition: enforce`
- ✅ Extra data:
  - `violatedDirective: script-src`
  - `blockedUri: https://malicious.example.com/evil.js`
- ✅ Fingerprint groups similar violations

---

### Test Noise Filtering

```bash
# Send chrome-extension violation (should be ignored)
curl -X POST https://staging.docflow.fi/api/csp-report \
  -H "Content-Type: application/csp-report" \
  -d '{
    "csp-report": {
      "document-uri": "https://staging.docflow.fi/dashboard",
      "violated-directive": "script-src",
      "blocked-uri": "chrome-extension://abc123/script.js",
      "source-file": "https://staging.docflow.fi/dashboard"
    }
  }'

# Expected: 200 OK with status "ignored"
```

### Verify in Sentry

**Check:**
- ✅ NO new issue created
- ✅ Noise filtered successfully

---

## 🧪 Test 4: Sampling Rate Verification

### Check Transaction Sampling

**Go to:** Sentry → Performance

**Verify:**
1. Check total requests to staging in last hour
2. Check transactions captured in Sentry
3. Calculate: `(transactions / total_requests) * 100`
4. Should be ~10% (±2%)

**Example:**
```
Total requests: 1000
Transactions in Sentry: 98
Sampling rate: 9.8% ✅
```

### Adjust if Needed

**If too high (quota concerns):**
```bash
# Vercel
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.05  # 5%

# Backend
SENTRY_TRACES_SAMPLE_RATE=0.05  # 5%
```

**If too low (missing data):**
```bash
# Increase to 20%
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.2
SENTRY_TRACES_SAMPLE_RATE=0.2
```

---

## 📊 Dashboard Creation

### Dashboard 1: Auth Health

**Create:** Sentry → Dashboards → Create Dashboard

**Name:** Auth Health

**Widgets:**

```yaml
1. Token Refresh Success Rate (Big Number):
   - Query: percentage(count_if(http.status_code, equals, 200), count())
   - Filter: transaction:/api/auth/refresh
   - Display: 98.5%

2. 401/403 Errors (Time Series):
   - Query: count()
   - Filter: http.status_code:[401,403]
   - Group by: http.status_code
   - Time range: 24h

3. Active Sessions (Big Number):
   - Query: count_unique(user.id)
   - Filter: age:<15m
   - Display: 145

4. Top Auth Errors (Table):
   - Query: count()
   - Filter: transaction:/api/auth/*
   - Group by: error.type
   - Order by: count DESC
   - Limit: 10
```

**Checklist:**
- [ ] Dashboard created
- [ ] All 4 widgets showing data
- [ ] Screenshot saved

---

### Dashboard 2: Tenant Isolation

**Create:** Sentry → Dashboards → Create Dashboard

**Name:** Tenant Isolation

**Widgets:**

```yaml
1. RLS Violations (Big Number - Should be 0!):
   - Query: count()
   - Filter: tags.component:rls OR tags.security:critical
   - Display: 0 ✅

2. 403 by Endpoint (Table):
   - Query: count()
   - Filter: http.status_code:403
   - Group by: transaction
   - Order by: count DESC

3. Active Tenants (Big Number):
   - Query: count_unique(tags.tenant_id)
   - Filter: age:<1h
   - Display: 23

4. Cross-Tenant Attempts (Time Series):
   - Query: count()
   - Filter: http.status_code:403 AND transaction:*/api/*
   - Time range: 24h
```

**Checklist:**
- [ ] Dashboard created
- [ ] All 4 widgets showing data
- [ ] RLS violations = 0
- [ ] Screenshot saved

---

### Dashboard 3: Frontend UX

**Create:** Sentry → Dashboards → Create Dashboard

**Name:** Frontend UX

**Widgets:**

```yaml
1. Page Load P95 (Time Series):
   - Query: p95(measurements.lcp)
   - Filter: transaction.op:pageload
   - Time range: 24h
   - Target: < 2.5s

2. API Error Rate (Time Series):
   - Query: percentage(count_if(http.status_code, gte, 400), count())
   - Filter: transaction.op:http.client
   - Time range: 24h
   - Target: < 1%

3. CSP Violations (Table):
   - Query: count()
   - Filter: message:"CSP Violation"
   - Group by: tags.csp_directive
   - Order by: count DESC

4. Top Errors (Table):
   - Query: count()
   - Filter: level:error
   - Group by: error.type
   - Order by: count DESC
   - Limit: 10
```

**Checklist:**
- [ ] Dashboard created
- [ ] All 4 widgets showing data
- [ ] Page load < 2.5s
- [ ] Error rate < 1%
- [ ] Screenshot saved

---

## 🚨 Alert Configuration

### Alert 1: Performance Degradation

**Create:** Sentry → Alerts → Create Alert

```yaml
Name: Performance Degradation (Apdex < 0.85)
Project: docflow-backend
Type: Metric Alert

Metric:
  - Function: apdex(300)
  - Threshold: < 0.85
  - Time Window: 15 minutes

Actions:
  - Slack: #incidents
  - Email: ops@docflow.fi

Severity: High
```

**Test:**
```bash
# Simulate slow responses (in staging)
# Add artificial delay to endpoints
time.sleep(2)  # Python
await new Promise(r => setTimeout(r, 2000))  # TypeScript
```

**Verify:**
- [ ] Alert triggers after 15 min
- [ ] Slack message received in #incidents
- [ ] Email received

---

### Alert 2: Auth Refresh Failures

**Create:** Sentry → Alerts → Create Alert

```yaml
Name: Auth Refresh Failure Rate > 2%
Project: docflow-frontend
Type: Metric Alert

Metric:
  - Function: percentage(count_if(http.status_code, notEquals, 200), count())
  - Filter: transaction:/api/auth/refresh
  - Threshold: > 2
  - Time Window: 5 minutes

Actions:
  - Slack: #incidents
  - PagerDuty: On-call (if configured)

Severity: Critical
```

**Test:**
```bash
# Simulate refresh failures
# Temporarily break refresh endpoint or use expired tokens
for i in {1..100}; do
  curl -X POST https://staging.docflow.fi/api/auth/refresh \
    -H "Authorization: Bearer expired_token"
done
```

**Verify:**
- [ ] Alert triggers after 5 min
- [ ] Slack message received
- [ ] PagerDuty alert (if configured)

---

### Alert 3: 401/403 Spike

**Create:** Sentry → Alerts → Create Alert

```yaml
Name: 401/403 Spike (3x baseline)
Project: docflow-backend
Type: Metric Alert

Metric:
  - Function: count()
  - Filter: http.status_code:[401,403]
  - Threshold: > baseline * 3
  - Time Window: 10 minutes
  - Comparison: Percent change

Actions:
  - Slack: #incidents

Severity: Medium
```

**Test:**
```bash
# Generate 401/403 errors
for i in {1..50}; do
  curl https://staging-api.docflow.fi/api/receipts/fake-id \
    -H "Authorization: Bearer invalid_token"
done
```

**Verify:**
- [ ] Alert triggers after 10 min
- [ ] Slack message received

---

### Alert 4: CSP Violation Burst

**Create:** Sentry → Alerts → Create Alert

```yaml
Name: CSP Violation Burst
Project: docflow-frontend
Type: Metric Alert

Metric:
  - Function: count()
  - Filter: message:"CSP Violation"
  - Threshold: > 50
  - Time Window: 15 minutes

Actions:
  - Slack: #incidents

Severity: Low
```

**Test:**
```bash
# Send multiple CSP violations
for i in {1..60}; do
  curl -X POST https://staging.docflow.fi/api/csp-report \
    -H "Content-Type: application/csp-report" \
    -d "{\"csp-report\":{\"violated-directive\":\"script-src\",\"blocked-uri\":\"https://test-$i.example.com/script.js\"}}"
done
```

**Verify:**
- [ ] Alert triggers after 15 min
- [ ] Slack message received

---

## 📈 24-Hour Monitoring Checklist

### Day 1 (0-24h)

**Hour 1-4:**
- [ ] Monitor error rate (should be < 1%)
- [ ] Check Apdex score (should be > 0.85)
- [ ] Verify no PII leaks (spot check 10 events)
- [ ] Check quota usage (should be < 20% for 4h)

**Hour 4-12:**
- [ ] Review top errors (fix critical issues)
- [ ] Check alert noise (adjust thresholds if needed)
- [ ] Monitor CSP violations (legitimate vs noise)
- [ ] Verify tenant context tags working

**Hour 12-24:**
- [ ] Calculate MTTR for issues found
- [ ] Review dashboard metrics
- [ ] Check sampling rate accuracy
- [ ] Document any issues found

### Success Criteria (24h)

- [ ] Error rate < 1%
- [ ] Apdex > 0.85
- [ ] Zero PII leaks
- [ ] Quota usage < 80%
- [ ] All alerts working correctly
- [ ] MTTR < 30 minutes for critical issues
- [ ] No false positive alerts

---

## 🚀 Production Rollout (After 24h)

### Prerequisites

- [ ] All validation tests passed
- [ ] 24h monitoring successful
- [ ] No critical issues found
- [ ] Team trained on dashboards
- [ ] Rollback plan documented

### Rollout Steps

1. **Update Production ENV:**
   ```bash
   # Vercel Production
   NEXT_PUBLIC_SENTRY_DSN=<prod-dsn>
   SENTRY_AUTH_TOKEN=<token>
   
   # Backend Production
   SENTRY_DSN=<prod-dsn>
   ```

2. **Deploy to Production:**
   ```bash
   git tag sentry-integration-v1.0
   git push origin sentry-integration-v1.0
   # Trigger production deployment
   ```

3. **Verify Production:**
   - [ ] Sourcemaps uploading
   - [ ] Errors tracked
   - [ ] Dashboards showing data
   - [ ] Alerts configured

4. **Monitor 48h:**
   - [ ] Error rate stable
   - [ ] Performance stable
   - [ ] No PII leaks
   - [ ] Quota within limits

---

## 📞 Support

**Issues:** Create ticket with tag `sentry-integration`  
**Sentry Support:** https://sentry.io/support/  
**Team:** team@docflow.fi

---

**Last Updated:** 2025-01-15  
**Version:** 1.0  
**Owner:** DocFlow DevOps Team


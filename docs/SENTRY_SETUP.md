# 🔍 Sentry + Vercel Pro Integration - Setup Guide

**Purpose:** Complete setup guide for Sentry error tracking and performance monitoring in DocFlow.

**Time Required:** 30 minutes

**Prerequisites:**
- Sentry Team account
- Vercel Pro account
- Access to Supabase project
- Admin access to Slack workspace

---

## 📋 Overview

This integration provides:
- ✅ **Error Tracking** - Frontend + Backend
- ✅ **Performance Monitoring** - API latency, page load times
- ✅ **Auth Flow Monitoring** - Token refresh, RLS violations
- ✅ **CSP Violation Tracking** - Security policy monitoring
- ✅ **Tenant Context** - Filter errors by tenant
- ✅ **GDPR-Compliant** - Aggressive PII scrubbing

**ROI:** MTTR -70%, proactive bug detection, $50/month cost

---

## 🚀 Quick Start (15 minutes)

### 1. Create Sentry Projects

**Go to:** https://sentry.io/organizations/docflow/projects/

**Create Frontend Project:**
```
Name: docflow-frontend
Platform: Next.js
Team: DocFlow Team
```

**Create Backend Project:**
```
Name: docflow-backend
Platform: Python (FastAPI)
Team: DocFlow Team
```

**Save DSNs:**
- Frontend DSN: `https://xxx@xxx.ingest.sentry.io/xxx`
- Backend DSN: `https://yyy@yyy.ingest.sentry.io/yyy`

---

### 2. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install @sentry/nextjs
```

**Backend:**
```bash
cd backend
pip install 'sentry-sdk[fastapi]'
```

---

### 3. Configure Environment Variables

**Vercel (Frontend):**

Go to: Vercel Dashboard → docflow-frontend → Settings → Environment Variables

```bash
# Production
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_ORG=docflow
SENTRY_PROJECT=docflow-frontend
SENTRY_AUTH_TOKEN=<get from Sentry>

# Staging (same variables)
# Development (optional - can disable)
```

**Backend (.env):**
```bash
# Add to .env file
SENTRY_DSN=https://yyy@yyy.ingest.sentry.io/yyy
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1
SENTRY_ORG=docflow
SENTRY_PROJECT=docflow-backend
SENTRY_RELEASE=  # Auto-set in CI/CD
```

---

### 4. Get Sentry Auth Token

**Go to:** https://sentry.io/settings/account/api/auth-tokens/

**Create Token:**
```
Name: Vercel Sourcemaps Upload
Scopes:
  ✅ project:read
  ✅ project:releases
  ✅ org:read
```

**Copy token** and add to Vercel environment variables as `SENTRY_AUTH_TOKEN`

---

### 5. Enable Vercel Integration (Recommended)

**Go to:** Vercel Dashboard → Integrations → Browse Marketplace

**Search:** "Sentry"

**Install:** Official Sentry Integration

**Connect:**
- Select docflow-frontend project
- Select Sentry organization: docflow
- Select Sentry project: docflow-frontend
- Grant permissions

**Benefits:**
- Automatic sourcemap upload
- Release tracking
- Deploy notifications in Sentry

---

### 6. Deploy and Verify

**Deploy to Staging:**
```bash
git add .
git commit -m "feat: Add Sentry integration"
git push origin main
```

**Verify Sourcemaps:**
1. Go to Sentry → docflow-frontend → Releases
2. Check latest release (commit SHA)
3. Click release → Artifacts
4. Should see sourcemaps uploaded

**Test Error Tracking:**
```bash
# Create synthetic error (see Validation section below)
curl https://staging.docflow.fi/api/test-sentry-error
```

---

## 🧪 Validation (3 Synthetic Faults)

### Test 1: Frontend Error

**Create test endpoint:**
```typescript
// frontend/app/api/test-sentry/route.ts
import { NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export async function GET() {
  // Test error
  Sentry.captureException(new Error('Test Sentry Frontend Integration'))
  
  return NextResponse.json({ status: 'error sent to Sentry' })
}
```

**Test:**
```bash
curl https://staging.docflow.fi/api/test-sentry
```

**Expected in Sentry:**
- Error appears in docflow-frontend project
- Sourcemaps resolve file/line correctly
- No PII in error data

---

### Test 2: Backend Error

**Create test endpoint:**
```python
# backend/app/routes/test.py
from fastapi import APIRouter
import sentry_sdk

router = APIRouter()

@router.get("/test-sentry")
async def test_sentry():
    """Test Sentry backend integration."""
    sentry_sdk.capture_exception(Exception("Test Sentry Backend Integration"))
    return {"status": "error sent to Sentry"}
```

**Test:**
```bash
curl https://staging-api.docflow.fi/test-sentry
```

**Expected in Sentry:**
- Error appears in docflow-backend project
- Tenant context tags visible (if authenticated)
- No PII in error data

---

### Test 3: CSP Violation

**Trigger CSP violation:**
```html
<!-- In browser console on staging.docflow.fi -->
<script>
const script = document.createElement('script');
script.src = 'https://evil.com/malicious.js';
document.body.appendChild(script);
</script>
```

**Expected in Sentry:**
- Message "CSP Violation" in docflow-frontend
- Tags: `csp_directive`, `csp_disposition`
- Extra: blocked-uri, violated-directive
- No chrome-extension noise

---

## 📊 Dashboards Setup

### Dashboard 1: Auth Health

**Create in Sentry:** Dashboards → Create Dashboard → "Auth Health"

**Widgets:**

1. **Token Refresh Success Rate** (Big Number)
```
Function: percentage(count_if(http.status_code, equals, 200), count()) AS "Success Rate"
Filter: transaction:/api/auth/refresh
```

2. **401/403 Error Rate** (Time Series)
```
Function: count()
Filter: http.status_code:[401,403]
Group By: http.status_code
```

3. **Active Sessions** (Big Number)
```
Function: count_unique(user.id)
Filter: event.type:transaction AND age:<15m
```

4. **Top Auth Errors** (Table)
```
Function: count()
Filter: transaction:/api/auth/*
Group By: error.type
Order By: count() DESC
Limit: 10
```

---

### Dashboard 2: Tenant Isolation

**Create:** Dashboards → Create Dashboard → "Tenant Isolation"

**Widgets:**

1. **RLS Violations** (Big Number - Should be 0!)
```
Function: count()
Filter: tags.component:rls OR tags.security:critical
```

2. **403 Rate by Endpoint** (Table)
```
Function: count()
Filter: http.status_code:403
Group By: transaction
Order By: count() DESC
```

3. **Unique Tenants Active** (Big Number)
```
Function: count_unique(tags.tenant_id)
Filter: age:<1h
```

4. **Cross-Tenant Access Attempts** (Time Series)
```
Function: count()
Filter: http.status_code:403 AND transaction:*/api/*
```

---

### Dashboard 3: Frontend UX

**Create:** Dashboards → Create Dashboard → "Frontend UX"

**Widgets:**

1. **Page Load Time P95** (Time Series)
```
Function: p95(measurements.lcp)
Filter: transaction.op:pageload
```

2. **API Error Rate** (Time Series)
```
Function: percentage(count_if(http.status_code, gte, 400), count())
Filter: transaction.op:http.client
```

3. **CSP Violations** (Table)
```
Function: count()
Filter: message:"CSP Violation"
Group By: tags.csp_directive
Order By: count() DESC
```

4. **Top Errors** (Table)
```
Function: count()
Filter: level:error
Group By: error.type
Order By: count() DESC
Limit: 10
```

---

## 🚨 Alert Rules

### Alert 1: Performance Degradation

**Create:** Alerts → Create Alert Rule

```
Name: Performance Degradation (Apdex < 0.85)
Project: docflow-backend
Metric: apdex(300)
Threshold: < 0.85
Time Window: 15 minutes
Actions:
  - Slack: #incidents
  - Email: ops@docflow.fi
Severity: High
```

---

### Alert 2: Auth Refresh Failures

**Create:** Alerts → Create Alert Rule

```
Name: Auth Refresh Failure Rate > 2%
Project: docflow-frontend
Metric: percentage(count_if(http.status_code, notEquals, 200), count())
Filter: transaction:/api/auth/refresh
Threshold: > 2
Time Window: 5 minutes
Actions:
  - Slack: #incidents
  - PagerDuty: On-call
Severity: Critical
```

---

### Alert 3: 401/403 Spike

**Create:** Alerts → Create Alert Rule

```
Name: 401/403 Spike (3x baseline)
Project: docflow-backend
Metric: count()
Filter: http.status_code:[401,403]
Threshold: > baseline * 3
Time Window: 10 minutes
Actions:
  - Slack: #incidents
Severity: Medium
```

---

### Alert 4: CSP Violation Burst

**Create:** Alerts → Create Alert Rule

```
Name: CSP Violation Burst
Project: docflow-frontend
Metric: count()
Filter: message:"CSP Violation"
Threshold: > 50
Time Window: 15 minutes
Actions:
  - Slack: #incidents
Severity: Low
```

---

## 🔧 Slack Integration

### Setup Slack Notifications

**Go to:** Sentry → Settings → Integrations → Slack

**Install:** Slack Integration

**Configure:**
1. Authorize Sentry app in Slack
2. Select channel: `#incidents`
3. Configure notification rules:
   - All alerts → #incidents
   - Critical errors → #incidents
   - Weekly digest → #engineering

**Test:**
```bash
# Trigger test alert
curl https://staging.docflow.fi/api/test-sentry
```

**Expected:** Message in #incidents channel

---

## 📈 Monitoring Best Practices

### Sampling Rates

**Start Conservative:**
```
tracesSampleRate: 0.1 (10%)
```

**Adjust Based on Traffic:**
- < 1000 users/day: 0.1-0.2 OK
- 1000-10000 users/day: 0.05-0.1
- > 10000 users/day: 0.01-0.05

**Monitor Quota:**
- Sentry Team = 50K transactions/month
- Check: Settings → Subscription → Usage

---

### PII Scrubbing Verification

**Check event in Sentry:**
1. Go to Issues → Select any error
2. Click "JSON" tab
3. Verify:
   - ✅ No `authorization` headers
   - ✅ No `cookie` data
   - ✅ No email addresses
   - ✅ No tokens
   - ✅ tenant_id and user_id present (not PII)

---

### Performance Budget

**Set budgets in Sentry:**
```
Page Load (LCP): < 2.5s
API Response: < 500ms
Error Rate: < 1%
Apdex: > 0.85
```

---

## 🔄 Rollback Plan

### Emergency Disable

**Frontend (Vercel):**
```bash
# Set empty DSN
NEXT_PUBLIC_SENTRY_DSN=""
```

**Backend:**
```bash
# Set empty DSN in .env
SENTRY_DSN=""
```

**Redeploy** - Sentry will be disabled

---

### Reduce Sampling

**If quota exceeded:**
```bash
# Frontend
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.01  # 1%

# Backend
SENTRY_TRACES_SAMPLE_RATE=0.01  # 1%
```

---

## 🐛 Troubleshooting

### Issue: Sourcemaps not uploading

**Symptoms:** Errors show minified code, not original

**Check:**
1. `SENTRY_AUTH_TOKEN` set in Vercel
2. `SENTRY_ORG` and `SENTRY_PROJECT` correct
3. Build logs show "Uploading sourcemaps"

**Solution:**
```bash
# Manual upload (test)
cd frontend
npx @sentry/cli sourcemaps upload \
  --org docflow \
  --project docflow-frontend \
  --release $VERCEL_GIT_COMMIT_SHA \
  .next
```

---

### Issue: Too many events (quota exceeded)

**Symptoms:** Sentry stops accepting events

**Solution:**
1. Lower sampling rate (see above)
2. Add more `ignoreErrors` patterns
3. Filter noisy transactions

---

### Issue: PII visible in Sentry

**Symptoms:** Email/tokens visible in events

**Solution:**
1. Check `beforeSend` function is working
2. Add more patterns to scrubber
3. Report to security team immediately

---

## 📞 Support

**Sentry Support:** https://sentry.io/support/  
**DocFlow Team:** team@docflow.fi  
**On-Call:** PagerDuty

---

**Last Updated:** 2025-01-15  
**Version:** 1.0  
**Owner:** DocFlow DevOps Team


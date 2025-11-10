# Admin Dashboard PR Checklist

**Based on:** [ADMIN_DASHBOARD_AUDIT_REPORT.md](./ADMIN_DASHBOARD_AUDIT_REPORT.md)  
**Status:** GO/GO ✅✅ - Production Ready with Recommended Improvements  
**Date:** November 10, 2025

## 🎯 IMPLEMENTATION TASKS

### Task 1: ENV Validation Enhancement
**Priority:** High  
**Estimated Time:** 15 minutes

#### Requirements:
- [ ] Add `ADMIN_JWT_SECRET` validation at application startup
- [ ] Fail-fast if critical admin environment variables are missing
- [ ] Log clear error messages for missing configuration

#### Implementation:
```typescript
// frontend/lib/admin/adminToken.ts - Add validation
export function validateAdminEnv(): void {
  const required = ['ADMIN_JWT_SECRET', 'NEXT_PUBLIC_API_URL', 'NEXT_PUBLIC_WS_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required admin environment variables: ${missing.join(', ')}`);
  }
}

// Call in frontend/app/admin/dashboard/page.tsx
```

#### Acceptance Criteria:
- [ ] Application fails to start with clear error if `ADMIN_JWT_SECRET` missing
- [ ] All required admin env vars validated at startup
- [ ] Error messages are developer-friendly

---

### Task 2: WebSocket Handshake Enhancement
**Priority:** Medium  
**Estimated Time:** 20 minutes

#### Requirements:
- [ ] Enhanced token validation in WebSocket handshake
- [ ] Better error logging for connection failures
- [ ] Graceful degradation when WebSocket fails

#### Implementation:
```typescript
// frontend/lib/admin/hooks/useTenantFeed.ts - Enhanced validation
const connect = useCallback(() => {
  if (!token) {
    setStatus({ 
      status: 'error', 
      attempts: 0, 
      lastError: 'No admin token provided - check ADMIN_JWT_SECRET' 
    });
    return;
  }

  // Validate token format before connecting
  try {
    const payload = jwt.decode(token);
    if (!payload || typeof payload !== 'object' || !payload.role) {
      throw new Error('Invalid admin token format');
    }
  } catch (error) {
    setStatus({ 
      status: 'error', 
      attempts: 0, 
      lastError: `Token validation failed: ${error.message}` 
    });
    return;
  }

  // Enhanced WebSocket connection with better error handling
  const ws = new WebSocket(`${defaultWsUrl}/api/admin/feed?token=${encodeURIComponent(token)}`);
  // ... rest of connection logic
}, [defaultWsUrl, token, tenantId]);
```

#### Acceptance Criteria:
- [ ] Token format validated before WebSocket connection
- [ ] Clear error messages for authentication failures
- [ ] Connection failures logged with specific reasons
- [ ] Graceful fallback when WebSocket unavailable

---

### Task 3: React Error Boundaries
**Priority:** Medium  
**Estimated Time:** 25 minutes

#### Requirements:
- [ ] Add error boundaries to each admin segment
- [ ] Route errors to toast notifications
- [ ] Ensure no PII in error messages
- [ ] Fallback UI for broken segments

#### Implementation:
```typescript
// frontend/components/admin/ui/ErrorBoundary.tsx - New component
'use client';

import React from 'react';
import { useToast } from './useToast';

interface Props {
  children: React.ReactNode;
  segmentName: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AdminSegmentErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry without PII
    console.error(`Admin segment error in ${this.props.segmentName}:`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <h3 className="text-sm font-medium text-red-900 mb-1">
            {this.props.segmentName} Error
          </h3>
          <p className="text-sm text-red-700 mb-3">
            This segment encountered an error and needs to be refreshed.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage in AdminDashboardClient.tsx
<AdminSegmentErrorBoundary segmentName={activeModuleData?.title || 'Unknown'}>
  <ActiveComponent {...(activeModuleData.props as any)} />
</AdminSegmentErrorBoundary>
```

#### Acceptance Criteria:
- [ ] Each admin segment wrapped in error boundary
- [ ] Errors logged to console/Sentry without PII
- [ ] Fallback UI shows clear error state
- [ ] Users can recover by refreshing

---

## 🧪 TESTING CHECKLIST

### Pre-PR Testing:
- [ ] **TypeScript Check:** `npm --prefix frontend run typecheck`
- [ ] **Build Test:** `npm --prefix frontend run build`
- [ ] **E2E Tests:** `npx --yes playwright test frontend/e2e`
- [ ] **OpenAPI Validation:** `python scripts/export_openapi.py --out docs/openapi.yaml && npm run openapi:lint --prefix frontend`

### Manual Testing:
- [ ] Admin dashboard loads without console errors
- [ ] All 7 segments render correctly
- [ ] WebSocket connection establishes successfully
- [ ] Error boundaries trigger correctly (simulate errors)
- [ ] ENV validation prevents startup with missing vars
- [ ] Toast notifications work for all error cases

### Integration Testing:
- [ ] Backend `/api/admin/activities` responds correctly
- [ ] WebSocket `/api/admin/feed` accepts connections
- [ ] Rate limiting (60/min/tenant) enforced
- [ ] Prometheus metrics updating (`/metrics` endpoint)

---

## 🚀 DEPLOYMENT STEPS

### 1. Environment Setup:
```bash
# Ensure all required environment variables are set
export ADMIN_JWT_SECRET="your-secret-key"
export NEXT_PUBLIC_API_URL="https://your-backend.com"
export NEXT_PUBLIC_WS_URL="wss://your-backend.com"
export ANALYTICS_PROM_ENABLED=true
export NO_EXTERNAL_SEND=true  # For staging
```

### 2. Build and Deploy:
```bash
# Frontend build
cd frontend
npm run typecheck
npm run build

# Backend validation
cd ../backend
python -m pytest tests/admin/ -v

# Deploy to staging
# ... your deployment process
```

### 3. Smoke Tests:
```bash
# Test admin dashboard
curl -I https://your-app.com/admin/dashboard

# Test admin API
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
     https://your-backend.com/api/admin/activities

# Test WebSocket
wscat -c "wss://your-backend.com/api/admin/feed?token=$ADMIN_TOKEN"

# Test metrics
curl https://your-backend.com/metrics | grep -E "publish_latency_ms|doc_ingested_total"
```

---

## 📊 SUCCESS CRITERIA

### Performance Targets:
- [ ] Admin dashboard loads < 2 seconds
- [ ] WebSocket connection < 500ms
- [ ] API responses < 200ms p95
- [ ] OCR processing < 3000ms p95

### Reliability Targets:
- [ ] 99.9% uptime for admin endpoints
- [ ] < 1% 5xx error rate
- [ ] WebSocket reconnection < 10 seconds
- [ ] Zero PII in error logs

### Security Validation:
- [ ] Admin JWT validation working
- [ ] Rate limiting enforced (429 responses)
- [ ] Tenant isolation verified
- [ ] No sensitive data in client bundles

---

## 🔍 ROLLBACK PLAN

If issues are discovered post-deployment:

1. **Immediate:** Revert to previous version
2. **Monitor:** Check Grafana dashboards for error rates
3. **Investigate:** Review Sentry error reports
4. **Fix:** Address issues in hotfix branch
5. **Redeploy:** After validation in staging

---

## 📝 COMPLETION CHECKLIST

- [ ] All 3 tasks implemented and tested
- [ ] PR created with clear description
- [ ] Code review completed
- [ ] E2E tests passing in CI
- [ ] Staging deployment successful
- [ ] Production deployment approved
- [ ] Monitoring alerts configured
- [ ] Documentation updated

---

**Ready for Production:** ✅  
**Estimated Total Time:** 60 minutes  
**Risk Level:** Low (non-breaking improvements)

**Next Review:** Post-deployment monitoring for 24 hours to ensure stability.

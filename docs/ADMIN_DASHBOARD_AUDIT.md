# Admin Dashboard + Application UI: Full Audit (GO/NO-GO)

## How to Use in Cursor

1. **Copy this entire document** into a new Cursor chat
2. **Fill in your environment URLs** in the ENV section below (staging/production)
3. **Run**: `@Codebase Execute this audit step-by-step and report PASS/FAIL for each task`
4. **Review**: Cursor will check each item and populate the PASS/FAIL table
5. **Decision**: Use the GO/NO-GO output to approve or block deployment

---

## Objective

Ensure that the Admin Dashboard and application UI are production-ready: views, state and error paths, realtime, actions (Queue, OCR Triage, Customers, Analytics, Billing, API Monitoring), exports, i18n, access control, tests, and CI.

---

## Scope

### Frontend Paths
```
frontend/app/admin/dashboard/page.tsx
frontend/app/admin/dashboard/segments/
  - QueueManager.tsx
  - OcrTriage.tsx
  - Customers.tsx
  - Analytics.tsx
  - Billing.tsx
  - ApiMonitoring.tsx

frontend/components/admin/ui/
  - useToast.tsx
  - CommonStates.tsx

frontend/lib/admin/hooks/
  - useAuthedFetch.ts
  - useTenantFeed.ts

frontend/app/api/admin/
  - queue/route.ts
  - ocr/errors/route.ts
  - customers/contact/route.ts
  - analytics/cards/route.ts
  - analytics/series/route.ts
  - analytics/export/pdf/route.ts
  - billing/cards/route.ts
  - billing/events/route.ts
  - monitoring/summary/route.ts
```

### E2E Tests
```
frontend/e2e/admin.modules.spec.ts
frontend/e2e/admin.customers.spec.ts
frontend/e2e/admin.analytics_billing.spec.ts
```

### Shared Hooks
- `useTenantFeed` (WebSocket)
- `useAuthedFetch` (authenticated API calls)
- Toast notifications

---

## ENV Expectations (Staging)

```bash
# Frontend
NEXT_PUBLIC_API_URL=https://api.staging.example.com
NEXT_PUBLIC_WS_URL=wss://ws.staging.example.com

# Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_BILLING=true
NEXT_PUBLIC_ENABLE_API_MON=true

# Analytics
ANALYTICS_PROM_ENABLED=true

# Mock mode (CI/staging)
NO_EXTERNAL_SEND=true

# Admin auth
ADMIN_JWT_SECRET=your-secret-here
ADMIN_REQUIRED_ROLE=admin
```

---

## Audit Tasks

### Task 1: Routes and Views

**Objective:** Verify all dashboard segments render without errors

**Checks:**
- [ ] Dashboard loads at `/admin/dashboard`
- [ ] All 6 segments are visible based on feature flags:
  - Queue Manager
  - OCR Triage
  - Customers
  - Analytics
  - Billing
  - API Monitoring
- [ ] Each segment shows proper empty/loading/error states
- [ ] No console errors during normal navigation
- [ ] Tab switching works smoothly without state loss

**Commands:**
```bash
# Navigate to dashboard
open http://localhost:3000/admin/dashboard

# Check console for errors
# Inspect Network tab for failed requests
```

**Expected:** All segments render, no 404s, no unhandled errors

---

### Task 2: Actions (Optimistic Updates)

**Objective:** Verify all interactive actions work with optimistic updates and rollback

**Queue Manager:**
- [ ] Requeue button shows optimistic state (disabled + loading text)
- [ ] Success: Button re-enables, toast shows success
- [ ] Failure: Rollback occurs, error toast shown
- [ ] Duplicate clicks are prevented (button stays disabled)

**OCR Triage:**
- [ ] Retry button works with optimistic update
- [ ] Acknowledge button removes item optimistically
- [ ] Rollback on failure restores item
- [ ] Error messages are user-friendly (no stack traces)

**Customers:**
- [ ] Contact modal opens and closes properly
- [ ] Email validation works (required field)
- [ ] Character limits enforced (subject: 140, message: 5000)
- [ ] Send button disabled until email entered
- [ ] Mock mode works (NO_EXTERNAL_SEND=true)
- [ ] Success toast appears after send

**Commands:**
```bash
# Test in browser with DevTools open
# Monitor Network tab for API calls
# Check Application > Cookies for admin_token
```

**Expected:** All actions complete successfully with proper UI feedback

---

### Task 3: Realtime (WebSocket)

**Objective:** Verify WebSocket connection and real-time updates

**useTenantFeed Hook:**
- [ ] WebSocket connects on dashboard load
- [ ] Connection status indicator shows "Live" when connected
- [ ] Token passed in query string or Authorization header
- [ ] Reconnect logic with exponential backoff (0.5s → 1s → 2s → 4s → 8s, max 10s)
- [ ] Backpressure handling: closes if bufferedAmount > 1MB
- [ ] Tenant scope is properly filtered
- [ ] Events appear in UI < 1 second after seed

**Test Scenario:**
1. Open Admin Dashboard
2. Seed 3 queue events via API
3. Verify events appear in Queue Manager < 1s
4. Disconnect network briefly
5. Verify reconnection with backoff

**Commands:**
```bash
# Seed events
curl -X POST http://localhost:3000/api/admin/queue \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"docId":"TEST1","action":"requeue"}'

# Monitor WebSocket in DevTools > Network > WS
```

**Expected:** Real-time updates work, reconnection is automatic and graceful

---

### Task 4: Access Control

**Objective:** Verify authentication and authorization work correctly

**requireAdminAuth Middleware:**
- [ ] All `/api/admin/*` routes return 401 without token
- [ ] Valid admin token grants access (200/201)
- [ ] Non-admin roles are rejected (403)
- [ ] Expired tokens are rejected (401)

**Rate Limiting:**
- [ ] POST requests limited to 60/min/tenant
- [ ] 429 response returned when limit exceeded
- [ ] Rate limit headers present (X-RateLimit-*)
- [ ] Retry-After header suggests wait time

**Input Validation (Zod):**
- [ ] Invalid payloads return 400 with clear error messages
- [ ] Size limits enforced (e.g., details ≤ 10KB)
- [ ] Required fields validated
- [ ] Type coercion works (strings to numbers, etc.)

**Commands:**
```bash
# Test 401
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/admin/queue
# Expected: 401

# Test 201 with token
curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"docId":"QR1","action":"requeue"}' \
  http://localhost:3000/api/admin/queue
# Expected: 201

# Test rate limit (send 61 requests rapidly)
for i in {1..61}; do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"docId\":\"QR$i\",\"action\":\"requeue\"}" \
    http://localhost:3000/api/admin/queue
done
# Expected: Last few return 429
```

**Expected:** Auth works, rate limits enforced, validation errors are clear

---

### Task 5: Exports and File Downloads

**Objective:** Verify CSV and PDF exports work correctly

**Analytics Exports:**
- [ ] CSV export generates valid CSV file
- [ ] CSV filename includes range (e.g., `analytics_30d.csv`)
- [ ] CSV contains expected columns (date, metric, value)
- [ ] PDF export generates valid PDF or HTML
- [ ] PDF filename includes range (e.g., `analytics_30d.pdf`)
- [ ] Export buttons show loading state during generation
- [ ] Success toast appears after download
- [ ] Placeholder data works when no real data available

**Commands:**
```bash
# Test in browser
# Click "Export CSV" and "Export PDF" buttons
# Verify files download and open correctly
```

**Expected:** Both export formats work, files are valid and properly named

---

### Task 6: Tests and CI

**Objective:** Verify E2E tests pass and CI is green

**Playwright Tests:**
- [ ] `admin.modules.spec.ts` passes (Queue + OCR Triage)
  - Seed 3 events → appear in UI < 1s
  - Requeue/Retry actions work
  - Optimistic updates verified
- [ ] `admin.customers.spec.ts` passes
  - Contact modal opens/closes
  - Validation works
  - Mock mode successful
- [ ] `admin.analytics_billing.spec.ts` passes
  - Segments render
  - Exports work
  - API routes return 200

**CI Configuration:**
- [ ] NO_EXTERNAL_SEND=true set in CI
- [ ] TEST_ADMIN_TOKEN or ADMIN_JWT_SECRET set
- [ ] All E2E tests run and pass
- [ ] Build succeeds without warnings
- [ ] TypeScript typecheck passes

**Commands:**
```bash
# Run locally
cd frontend
npm run typecheck
npm run build
npx playwright test

# Check CI status
# Review .github/workflows/quick-check.yml
```

**Expected:** All tests green, CI passes

---

### Task 7: I18n and Accessibility

**Objective:** Verify internationalization and accessibility basics

**I18n (if enabled):**
- [ ] Finnish (FI) translations present for key UI text
- [ ] English (EN) translations present
- [ ] Language switcher works (if implemented)
- [ ] No missing translation keys in console

**Accessibility:**
- [ ] Important buttons have proper labels (aria-label or text)
- [ ] Role attributes present (button, heading, etc.)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Responsive design works on mobile (≥375px width)

**Commands:**
```bash
# Test keyboard navigation
# Tab through dashboard, verify focus order
# Press Escape to close modals

# Test responsive
# Resize browser to 375px width
# Verify no horizontal scroll, content readable
```

**Expected:** Basic accessibility requirements met, responsive design works

---

### Task 8: Error Logs and Telemetry

**Objective:** Verify error handling and logging work correctly

**Toast Notifications:**
- [ ] Error toasts show user-friendly messages (no PII)
- [ ] Success toasts appear for completed actions
- [ ] Toasts auto-dismiss after 3-5 seconds
- [ ] Multiple toasts stack properly

**Console Logs:**
- [ ] No errors during normal operation
- [ ] Warnings are acceptable (document if intentional)
- [ ] Network errors logged with context
- [ ] Sensitive data (tokens, emails) not logged

**Error Boundaries:**
- [ ] Component errors caught and displayed gracefully
- [ ] Error boundary shows fallback UI
- [ ] Errors reported to Sentry (if configured)

**Commands:**
```bash
# Monitor browser console during testing
# Trigger intentional errors (invalid API responses)
# Verify error handling is graceful
```

**Expected:** Errors handled gracefully, no sensitive data in logs

---

## Quick Commands

```bash
# Typecheck + Build
npm --prefix frontend run typecheck
npm --prefix frontend run build

# Run E2E tests
npx --yes playwright test frontend/e2e

# Start dev server
npm --prefix frontend run dev

# Generate admin token (for testing)
node -e "
const jwt = require('jsonwebtoken');
console.log(jwt.sign(
  { sub: 'test@admin', role: 'admin', tenantId: 'test' },
  process.env.ADMIN_JWT_SECRET || 'test-secret',
  { expiresIn: '1h' }
));
"
```

---

## Acceptance Criteria (Fail Fast)

**MUST PASS:**
- ✅ All 6 segments render without errors
- ✅ WebSocket feed updates < 1s
- ✅ 401/429 auth paths work correctly
- ✅ Exports (CSV/PDF) generate valid files
- ✅ E2E smoke tests are green

**SHOULD PASS:**
- ⚠️ I18n translations complete (if enabled)
- ⚠️ Accessibility basics met
- ⚠️ No console errors during normal use

**NICE TO HAVE:**
- 💡 Advanced accessibility (ARIA live regions, etc.)
- 💡 Performance metrics (Lighthouse score > 90)
- 💡 Visual regression tests

---

## PASS/FAIL Report Template

Copy this table and fill in after audit:

| Task | Status | Notes |
|------|--------|-------|
| 1. Routes and Views | ⬜ PASS / ❌ FAIL | |
| 2. Actions (Optimistic) | ⬜ PASS / ❌ FAIL | |
| 3. Realtime (WebSocket) | ⬜ PASS / ❌ FAIL | |
| 4. Access Control | ⬜ PASS / ❌ FAIL | |
| 5. Exports | ⬜ PASS / ❌ FAIL | |
| 6. Tests and CI | ⬜ PASS / ❌ FAIL | |
| 7. I18n and A11y | ⬜ PASS / ❌ FAIL | |
| 8. Error Logs | ⬜ PASS / ❌ FAIL | |

**Decision:** 🎯 GO / NO-GO

**Reason:** [Brief explanation]

**Blockers:** [List any critical issues]

---

## Common Fixes

### Fix 1: WebSocket Not Connecting

**Symptom:** Connection status shows "Offline" or "Error"

**Solution:**
```typescript
// frontend/lib/admin/hooks/useTenantFeed.ts
const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/feed?token=${token}`;
// Ensure NEXT_PUBLIC_WS_URL is set and token is valid
```

### Fix 2: 401 on Admin API Routes

**Symptom:** All admin API calls return 401

**Solution:**
```typescript
// frontend/app/api/admin/queue/route.ts
import { requireAdminAuth } from '@/lib/adminAuth';

export async function POST(request: Request) {
  const auth = await requireAdminAuth(request);
  if (!auth.authorized) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of handler
}
```

### Fix 3: Optimistic Update Not Rolling Back

**Symptom:** UI shows success even when API fails

**Solution:**
```typescript
// Use try-catch and revert on error
const [items, setItems] = useState([]);

const handleRequeue = async (docId: string) => {
  const optimisticItem = { docId, status: 'queued' };
  setItems(prev => [...prev, optimisticItem]);
  
  try {
    await fetch('/api/admin/queue', { method: 'POST', body: JSON.stringify({ docId }) });
  } catch (error) {
    // Rollback on error
    setItems(prev => prev.filter(item => item.docId !== docId));
    toast.error('Failed to requeue document');
  }
};
```

### Fix 4: Rate Limit Not Working

**Symptom:** Can send unlimited requests

**Solution:**
```typescript
// Add rate limit middleware
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  const auth = await requireAdminAuth(request);
  const limited = await rateLimit(auth.tenantId, 60, 60); // 60 req/min
  
  if (limited) {
    return Response.json(
      { ok: false, error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  // ... rest of handler
}
```

### Fix 5: E2E Tests Failing (NO_EXTERNAL_SEND)

**Symptom:** E2E tests fail with external API errors

**Solution:**
```bash
# Set in CI and local testing
export NO_EXTERNAL_SEND=true

# In code, check flag before external calls
if (process.env.NO_EXTERNAL_SEND !== 'true') {
  await sendEmail(...);
} else {
  console.log('[MOCK] Would send email:', emailData);
}
```

### Fix 6: CSV Export Empty or Malformed

**Symptom:** Downloaded CSV is empty or has wrong format

**Solution:**
```typescript
// Ensure proper CSV formatting
const csvContent = [
  ['Date', 'Metric', 'Value'].join(','),
  ...data.map(row => [row.date, row.metric, row.value].join(','))
].join('\n');

const blob = new Blob([csvContent], { type: 'text/csv' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `analytics_${range}.csv`;
a.click();
```

### Fix 7: Toast Not Appearing

**Symptom:** Success/error toasts don't show

**Solution:**
```typescript
// Ensure toast provider is in layout
// frontend/app/layout.tsx
import { ToastProvider } from '@/components/admin/ui/useToast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
```

### Fix 8: Segment Not Visible (Feature Flag)

**Symptom:** Analytics or Billing segment missing

**Solution:**
```bash
# Set environment variables
export NEXT_PUBLIC_ENABLE_ANALYTICS=true
export NEXT_PUBLIC_ENABLE_BILLING=true
export NEXT_PUBLIC_ENABLE_API_MON=true

# Rebuild frontend
npm run build
```

### Fix 9: TypeScript Errors on Build

**Symptom:** `npm run build` fails with type errors

**Solution:**
```bash
# Run typecheck to see all errors
npm run typecheck

# Common fixes:
# - Add missing type imports
# - Fix any vs unknown types
# - Add null checks for optional props
# - Update tsconfig.json if needed
```

### Fix 10: WebSocket Reconnect Loop

**Symptom:** WebSocket keeps reconnecting infinitely

**Solution:**
```typescript
// Add max retry limit and exponential backoff
const MAX_RETRIES = 10;
const BACKOFF_MS = [500, 1000, 2000, 4000, 8000, 10000];

let retryCount = 0;

const connect = () => {
  if (retryCount >= MAX_RETRIES) {
    console.error('Max retries reached, giving up');
    return;
  }
  
  const ws = new WebSocket(wsUrl);
  
  ws.onerror = () => {
    const delay = BACKOFF_MS[Math.min(retryCount, BACKOFF_MS.length - 1)];
    retryCount++;
    setTimeout(connect, delay);
  };
  
  ws.onopen = () => {
    retryCount = 0; // Reset on successful connection
  };
};
```

### Fix 11: Placeholder Data Not Showing

**Symptom:** Analytics/Billing shows "No data" instead of placeholders

**Solution:**
```typescript
// Add placeholder data when real data unavailable
const mockData = {
  apiP95: 145,
  ocrP95: 2340,
  docsProcessed: 1234,
  revenue: 567.89
};

const data = realData || mockData;
```

### Fix 12: Contact Modal Validation Not Working

**Symptom:** Can send without email or with invalid email

**Solution:**
```typescript
// Add Zod schema validation
import { z } from 'zod';

const contactSchema = z.object({
  email: z.string().email('Invalid email address'),
  subject: z.string().max(140, 'Subject too long').optional(),
  message: z.string().max(5000, 'Message too long').optional()
});

const handleSubmit = () => {
  const result = contactSchema.safeParse(formData);
  if (!result.success) {
    toast.error(result.error.errors[0].message);
    return;
  }
  // ... proceed with send
};
```

### Fix 13: Mobile Layout Broken

**Symptom:** Dashboard unusable on mobile screens

**Solution:**
```css
/* Add responsive breakpoints */
@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .segment-tabs {
    overflow-x: auto;
    white-space: nowrap;
  }
  
  .data-table {
    display: block;
    overflow-x: auto;
  }
}
```

### Fix 14: Sentry Errors Not Captured

**Symptom:** Errors not appearing in Sentry dashboard

**Solution:**
```typescript
// Ensure Sentry is initialized
// frontend/sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Filter sensitive data
    if (event.request?.headers?.authorization) {
      delete event.request.headers.authorization;
    }
    return event;
  }
});
```

### Fix 15: CI Tests Timeout

**Symptom:** E2E tests timeout in CI but pass locally

**Solution:**
```yaml
# .github/workflows/quick-check.yml
# Increase timeout and add retry
- name: Run E2E tests
  timeout-minutes: 15
  run: |
    npx playwright test --retries=2 --timeout=30000
```

---

## Next Steps After Audit

1. **If GO:** Proceed with deployment to staging/production
2. **If NO-GO:** 
   - Fix all FAIL items
   - Re-run audit
   - Update PASS/FAIL table
3. **Document:** Save completed audit report in `docs/audits/YYYY-MM-DD-admin-dashboard.md`
4. **Monitor:** Set up alerts for key metrics (WebSocket uptime, API errors, etc.)

---

**Last Updated:** 2025-11-10
**Audit Version:** 1.0
**Maintained By:** DevOps Team


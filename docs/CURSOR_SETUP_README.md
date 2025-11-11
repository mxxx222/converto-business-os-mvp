# DocFlow Cursor Setup & Minipatches Implementation

## 📋 Overview

This document provides a complete Cursor setup for DocFlow with implemented minipatches for RBAC, rate limiting, WebSocket backpressure handling, and export utilities with Finnish locale support.

## 🚀 Quick Start

```bash
# 1. Copy Cursor configuration to your project root
cp .cursorrules /your-project-root/
cp cursor-user-rules.md /your-project-root/

# 2. Apply the minipatches to your codebase
# (See Implementation section below)

# 3. Validate the setup
./scripts/validate-cursor-setup.sh

# 4. Run quick tests
./scripts/quick-runner-cursor.sh
```

## 📁 File Structure

```
.
├── .cursorrules                    # Main Cursor configuration
├── cursor-user-rules.md           # High-ROI Cursor rules
├── .github/workflows/ci.yml       # CI pipeline
├── frontend/
│   ├── lib/
│   │   ├── adminAuth.ts           # RBAC with 401/403 handling
│   │   ├── ratelimit.ts           # 429 + Retry-After headers
│   │   └── export.ts              # CSV/PDF with fi-FI locale
│   └── lib/admin/hooks/
│       └── useTenantFeed.ts       # WS backpressure guard
└── scripts/
    ├── validate-cursor-setup.sh   # Validation script
    └── quick-runner-cursor.sh     # Quick testing
```

## 🔧 Implementation Details

### 1. RBAC Minipatch: admin/support/readonly + 401/403

**File:** `frontend/lib/adminAuth.ts`

```typescript
export type AdminRole = 'admin' | 'support' | 'readonly';

export async function requireAdminAuth(req: Request): Promise<{tenantId: string; role: AdminRole}> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const { tenantId, role } = await verifyAdminToken(token);
  if (!tenantId) throw new Response('Unauthorized', { status: 401 });
  if (!['admin','support','readonly'].includes(role)) {
    throw new Response('Forbidden', { status: 403 });
  }
  return { tenantId, role };
}

export function assertRole(role: AdminRole, allowed: AdminRole[]) {
  if (!allowed.includes(role)) throw new Response('Forbidden', { status: 403 });
}
```

**Usage in API routes:**
```typescript
export async function POST(req: Request) {
  const { tenantId, role } = await requireAdminAuth(req);
  assertRole(role, ['admin','support']); // Only admin and support can access
  // ... business logic
}
```

### 2. Rate Limiting Minipatch: 429 + Retry-After Headers

**File:** `frontend/lib/ratelimit.ts`

```typescript
export async function enforceRateLimit(key: string, limitPerMin = 60) {
  const { count, ttl } = await rlConsume(key, limitPerMin);
  if (count > limitPerMin) {
    const retryAfter = Math.max(1, Math.ceil(ttl));
    const headers = new Headers();
    headers.set('Retry-After', String(retryAfter));
    headers.set('X-RateLimit-Limit', String(limitPerMin));
    headers.set('X-RateLimit-Remaining', String(Math.max(0, limitPerMin - count)));
    headers.set('X-RateLimit-Reset', String(Math.ceil(Date.now()/1000 + ttl)));
    throw new Response('Too Many Requests', { status: 429, headers });
  }
}
```

**Usage in POST routes:**
```typescript
export async function POST(req: Request) {
  await enforceRateLimit(`${tenantId}:queue:post`); // Rate limit by tenant
  // ... business logic
}
```

### 3. WebSocket Backpressure Minipatch

**File:** `frontend/lib/admin/hooks/useTenantFeed.ts`

```typescript
// Check backpressure before sending
if (ws.bufferedAmount > 1024 * 1024) { // 1MB
  console.warn('WebSocket backpressure too high, closing connection');
  ws.close(4000, 'backpressure'); // Custom close code
  return;
}

// Reconnect with exponential backoff: 0.5→1→2→4→8→10s
let backoff = 500;
ws.addEventListener('close', () => {
  clearInterval(interval);
  setTimeout(connect, backoff);
  backoff = Math.min(backoff * 2, 10000);
});
```

### 4. Export Minipatch: fi-FI Locale + Europe/Helsinki Timezone

**File:** `frontend/lib/export.ts`

```typescript
export function exportCsv(rows: any[]) {
  const csv = toCsv(rows);
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  return new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
}

export async function exportPdf(html: string, options?: { 
  locale?: string; 
  timeZone?: string; 
  format?: string; 
}) {
  const pdf = await htmlToPdf(html, { 
    locale: 'fi-FI', 
    timeZone: 'Europe/Helsinki', 
    format: 'A4',
    ...options 
  });
  return new Response(pdf, { headers: { 'Content-Type': 'application/pdf' } });
}
```

## 🎯 Cursor Commands

### Available Commands (from .cursorrules)

```bash
# Audit admin dashboard + UI (claude-3.5-sonnet)
cursor:audit-admin

# Contract check FE↔BE (gpt-4.1)
cursor:migrate-fe-be

# Generate Playwright tests (gpt-4o-mini)
cursor:gen-tests

# Bulk refactor (deepseek-coder-v2)
cursor:bulk-refactor
```

### Quick Commands

```bash
# Full validation
./scripts/validate-cursor-setup.sh

# Quick testing
./scripts/quick-runner-cursor.sh

# Individual minipatch tests
npm run typecheck --prefix frontend
npm run build --prefix frontend
python scripts/export_openapi.py --out docs/openapi.yaml
```

## 🔄 CI Pipeline Commands

```bash
# 1. Install dependencies
npm ci --prefix frontend && pip install -r requirements.txt

# 2. Typecheck + build
npm --prefix frontend run typecheck && npm --prefix frontend run build

# 3. Generate OpenAPI docs + lint
python scripts/export_openapi.py --out docs/openapi.yaml && npm run openapi:lint --prefix frontend

# 4. Contract testing (Prism + Dredd)
npx -y @stoplight/prism-cli mock docs/openapi.yaml &
npx -y dredd docs/openapi.yaml http://127.0.0.1:4010 --reporter junit --level error

# 5. E2E tests
npx --yes playwright test frontend/e2e
```

## 🧪 Testing Scenarios

### 1. RBAC Testing

```bash
# Test 401 (no token)
curl -X POST http://localhost:3000/api/admin/analytics/export/pdf \
  -H "Content-Type: application/json" \
  -d '{"range": "30d"}'

# Test 403 (wrong role)
curl -X POST http://localhost:3000/api/admin/analytics/export/pdf \
  -H "Authorization: Bearer <readonly-token>" \
  -H "Content-Type: application/json" \
  -d '{"range": "30d"}'
```

### 2. Rate Limiting Testing

```bash
# Test 429 with Retry-After header
for i in {1..65}; do
  curl -X POST http://localhost:3000/api/admin/queue \
    -H "Authorization: Bearer <admin-token>" \
    -H "Content-Type: application/json" \
    -d '{"data": "test"}'
done
# Should get 429 with Retry-After header on 61st request
```

### 3. WebSocket Testing

```javascript
// Test backpressure handling
const ws = new WebSocket('ws://localhost:8000/api/admin/feed?token=<token>');
ws.onopen = () => {
  // Send large amount of data to trigger backpressure
  for (let i = 0; i < 1000; i++) {
    ws.send(JSON.stringify({ large: 'x'.repeat(10000) }));
  }
};
```

### 4. Export Testing

```bash
# Test CSV with UTF-8 BOM
curl -X POST http://localhost:3000/api/admin/analytics/export/csv \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"range": "30d"}' | hexdump -C | head -1
# Should show EF BB BF (UTF-8 BOM)

# Test PDF with fi-FI locale
curl -X POST http://localhost:3000/api/admin/analytics/export/pdf \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json" \
  -d '{"range": "30d"}' --output report.pdf
# PDF should be in A4 format with Finnish locale settings
```

## ✅ Validation Checklist

- [x] .cursorrules file created with proper model configuration
- [x] Cursor user rules (High-ROI) documented
- [x] RBAC implemented with admin/support/readonly roles
- [x] 401/403 responses properly handled
- [x] 429 responses include Retry-After + X-RateLimit headers
- [x] WebSocket backpressure guard (close code 4000)
- [x] WebSocket reconnection with 0.5→10s backoff
- [x] CSV export includes UTF-8 BOM
- [x] PDF export uses fi-FI + Europe/Helsinki + A4
- [x] CI workflow includes OpenAPI + Spectral + Dredd + Playwright
- [x] Validation scripts created and tested
- [x] Documentation complete with usage examples

## 🚨 Important Notes

1. **Security:** All admin routes now require proper authentication and role validation
2. **Rate Limiting:** Respects client rate limits with proper headers for retry logic
3. **WebSocket:** Handles backpressure gracefully with custom close codes
4. **Localization:** All exports default to Finnish locale and timezone
5. **CI/CD:** Full pipeline includes contract testing and E2E validation

## 🔗 Related Files

- `.cursorrules` - Main Cursor configuration
- `cursor-user-rules.md` - High-ROI rules documentation
- `frontend/lib/adminAuth.ts` - RBAC implementation
- `frontend/lib/ratelimit.ts` - Rate limiting with headers
- `frontend/lib/export.ts` - Export utilities with locale support
- `frontend/lib/admin/hooks/useTenantFeed.ts` - WebSocket with backpressure
- `.github/workflows/ci.yml` - CI pipeline
- `scripts/validate-cursor-setup.sh` - Validation script
- `scripts/quick-runner-cursor.sh` - Quick testing script

---

**Status:** ✅ All minipatches implemented and validated
**Last Updated:** 2025-11-10
**Version:** 1.0.0
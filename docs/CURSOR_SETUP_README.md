# Cursor Setup & Minipatches - Complete Documentation

## Overview

This document describes the complete Cursor AI setup for DocFlow project, including all configuration files, minipatches, and testing procedures.

## 📁 File Structure

```
.
├── .cursorrules                    # Cursor AI model configuration
├── cursor-user-rules.md            # High-ROI user rules
├── .github/workflows/ci.yml        # CI pipeline
├── frontend/lib/
│   ├── adminAuth.ts                # RBAC implementation
│   ├── ratelimit.ts                # Rate limiting
│   └── export.ts                   # Export utilities
├── frontend/app/admin/dashboard/
│   ├── types.ts                    # TypeScript types
│   ├── activityHelpers.ts          # Helper functions
│   └── styles.module.css           # Dashboard styles
├── shared_core/modules/admin/
│   └── router_production.py        # Backend API & WebSocket
└── scripts/
    ├── validate-cursor-setup.sh    # Validation script
    └── quick-runner-cursor.sh      # Quick test runner
```

## 🔧 Configuration Files

### `.cursorrules`

Main Cursor configuration with AI model settings:
- **Primary**: claude-3.5-sonnet (complex reasoning)
- **Secondary**: gpt-4o-mini (fast, cost-effective)
- **Code**: deepseek-coder-v2 (code generation)
- **Fallback**: gpt-4.1

Includes code style guidelines, locale settings (fi-FI), security practices, and testing requirements.

### `cursor-user-rules.md`

High-ROI rules for Cursor AI:
- Finnish locale defaults
- Code organization patterns
- API design conventions
- Error handling guidelines
- Performance optimizations
- Security best practices

## 🛡️ Minipatches

### 1. RBAC Security Patch (`frontend/lib/adminAuth.ts`)

**Features:**
- Role hierarchy: `admin > support > readonly`
- `requireAdminAuth()` - Returns 401 for missing/invalid tokens
- `assertRole()` - Returns 403 for insufficient roles
- Token verification with JWT support
- Helper functions for creating error responses

**Usage:**
```typescript
import { requireAdminAuth, getAdminTokenFromHeaders } from '@/lib/adminAuth';

// In API route
const token = getAdminTokenFromHeaders(request.headers);
const payload = requireAdminAuth(token, 'admin'); // Throws if unauthorized
```

### 2. Rate Limiting Patch (`frontend/lib/ratelimit.ts`)

**Features:**
- 429 responses with `Retry-After` headers
- `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers
- TTL-based retry calculations
- Configurable limits per tenant/user/IP
- In-memory store (upgradeable to Redis)

**Usage:**
```typescript
import { withRateLimit, DEFAULT_RATE_LIMITS } from '@/lib/ratelimit';

const handler = withRateLimit(DEFAULT_RATE_LIMITS.tenant, async (request) => {
  // Your handler code
  return new Response('OK');
});
```

### 3. WebSocket Resilience Patch (`frontend/lib/admin/hooks/useTenantFeed.ts`)

**Features:**
- Backpressure guard with 1MB threshold
- Custom close code 4000 for backpressure
- Exponential backoff reconnection (0.5s → 10s)
- Automatic reconnection logic
- Token validation

**Already implemented** in existing `useTenantFeed.ts` hook.

### 4. Export Localization Patch (`frontend/lib/export.ts`)

**Features:**
- CSV export with UTF-8 BOM for Excel compatibility
- PDF export with A4 format
- Finnish locale (fi-FI) for dates/numbers
- Europe/Helsinki timezone
- Consistent business formatting

**Usage:**
```typescript
import { exportToCSV, exportToPDF, exportAnalytics } from '@/lib/export';

// Export to CSV
exportToCSV(data, 'raportti.csv');

// Export to PDF
exportToPDF(data, 'raportti.pdf', 'Raportti');

// Export analytics with Finnish formatting
exportAnalytics(data, 'csv', 'Analytiikkaraportti');
```

## 🏗️ Dashboard Architecture

### Frontend Components

**Types** (`frontend/app/admin/dashboard/types.ts`):
- `Activity` - Activity data structure
- `ActivityResponse` - API response format
- `WebSocketMessage` - WebSocket message format
- `ConnectionStatus` - Connection state

**Helpers** (`frontend/app/admin/dashboard/activityHelpers.ts`):
- `formatTime()` - Finnish time formatting
- `getActivityIcon()` - Icon mapping
- `getActivityTitle()` - Title generation
- `getActivityDetails()` - Details formatting
- `getStatusBadge()` - Status badge config
- `getActivityTypeClass()` - CSS class mapping

**Styles** (`frontend/app/admin/dashboard/styles.module.css`):
- Complete dashboard styling
- Responsive design
- Status indicators
- Activity item layouts

### Backend API

**Router** (`shared_core/modules/admin/router_production.py`):

**Endpoints:**
- `GET /api/admin/activities` - Fetch activities (with pagination)
- `POST /api/admin/activities` - Create activity (for testing)
- `WebSocket /api/admin/feed` - Real-time activity feed

**Features:**
- In-memory activity storage (upgradeable to Redis)
- WebSocket broadcasting to all connected clients
- Token authentication
- Tenant isolation

## 🧪 Testing

### Validation Script

Run full validation:
```bash
bash scripts/validate-cursor-setup.sh
```

Checks:
- ✅ Configuration files exist
- ✅ Frontend lib files present
- ✅ Dashboard files complete
- ✅ Backend router exists
- ✅ WebSocket resilience configured

### Quick Test Runner

```bash
# Run all validations
bash scripts/quick-runner-cursor.sh all

# Test specific components
bash scripts/quick-runner-cursor.sh rbac
bash scripts/quick-runner-cursor.sh ratelimit
bash scripts/quick-runner-cursor.sh export
bash scripts/quick-runner-cursor.sh websocket
bash scripts/quick-runner-cursor.sh backend
bash scripts/quick-runner-cursor.sh frontend
```

### Manual Testing

**Backend API:**
```bash
# Start backend
cd backend
uvicorn main:app --reload

# Get activities
curl http://localhost:8000/api/admin/activities?limit=10

# Create activity
curl -X POST http://localhost:8000/api/admin/activities \
  -H "Content-Type: application/json" \
  -d '{"type":"test","status":"success","title":"Test Activity"}'
```

**WebSocket:**
```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c "ws://localhost:8000/api/admin/feed?token=admin_test"

# Send ping
{"type":"ping"}

# Should receive pong
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev

# Visit http://localhost:3000/admin/dashboard
# Check browser console for WebSocket connection
```

## 🔄 CI Pipeline

The CI pipeline (`.github/workflows/ci.yml`) includes:

1. **TypeScript Build** - Compile frontend
2. **OpenAPI Validation** - Validate API spec
3. **Spectral Linting** - API design linting
4. **Dredd Contract Testing** - API contract tests
5. **Playwright E2E** - End-to-end tests
6. **Python Type Checking** - mypy validation

## 📝 Usage Examples

### Using RBAC in API Route

```typescript
// app/api/admin/example/route.ts
import { requireAdminAuth, getAdminTokenFromHeaders, createUnauthorizedResponse } from '@/lib/adminAuth';

export async function GET(request: Request) {
  const token = getAdminTokenFromHeaders(request.headers);
  
  try {
    const payload = requireAdminAuth(token, 'admin');
    // Your protected code here
    return Response.json({ data: 'protected data' });
  } catch (error) {
    if (error.message === 'UNAUTHORIZED') {
      return createUnauthorizedResponse();
    }
    // Handle other errors
  }
}
```

### Using Rate Limiting

```typescript
import { withRateLimit, DEFAULT_RATE_LIMITS } from '@/lib/ratelimit';

export const GET = withRateLimit(DEFAULT_RATE_LIMITS.tenant, async (request: Request) => {
  return Response.json({ message: 'Rate limited endpoint' });
});
```

### Using Export Functions

```typescript
import { exportAnalytics } from '@/lib/export';

// In component
const handleExport = (format: 'csv' | 'pdf') => {
  exportAnalytics(analyticsData, format, 'Analytiikkaraportti');
};
```

## 🚀 Production Considerations

1. **Rate Limiting**: Upgrade to Redis for distributed rate limiting
2. **Activity Storage**: Move from in-memory to Redis/database
3. **JWT Validation**: Use proper JWT library (e.g., `jose` or `pyjwt`)
4. **WebSocket**: Consider using Redis Pub/Sub for multi-server support
5. **PDF Generation**: Use server-side library (e.g., `puppeteer` or `pdfkit`) for better control

## 📚 Additional Resources

- [Cursor AI Documentation](https://cursor.sh/docs)
- [FastAPI WebSocket Guide](https://fastapi.tiangolo.com/advanced/websockets/)
- [Finnish Locale Formatting](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)

## ✅ Checklist

- [x] `.cursorrules` configured
- [x] `cursor-user-rules.md` created
- [x] CI pipeline set up
- [x] RBAC implemented
- [x] Rate limiting implemented
- [x] Export utilities created
- [x] Dashboard types and helpers
- [x] Backend API and WebSocket
- [x] Validation scripts
- [x] Documentation complete

## 🐛 Troubleshooting

**WebSocket not connecting:**
- Check backend is running
- Verify token is valid
- Check browser console for errors
- Ensure WebSocket path matches (`/api/admin/feed`)

**Rate limiting not working:**
- Check headers in response
- Verify identifier extraction
- Check rate limit config

**Export not working:**
- Check browser console
- Verify data format
- Check date-fns-tz is installed

**RBAC errors:**
- Verify ADMIN_JWT_SECRET is set
- Check token format
- Verify role hierarchy


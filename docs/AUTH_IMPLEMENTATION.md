# DocFlow Auth MVP (v0) - Implementation Guide

**Version:** 1.0  
**Date:** 2025-01-15  
**Status:** ✅ Implemented  

---

## 📋 Overview

DocFlow Auth MVP implements enterprise-grade authentication and authorization with:

- **Supabase Auth** - Magic link authentication (password optional)
- **JWT Token Rotation** - Access 15 min, Refresh 14 days, automatic rotation
- **Row Level Security (RLS)** - Database-level tenant isolation
- **Silent Reauth** - Seamless token refresh 2 min before expiry
- **Multi-Tab Sync** - BroadcastChannel prevents refresh storms
- **Security Headers** - HSTS, CSP, X-Frame-Options, etc.

---

## 🏗️ Architecture

### Authentication Flow

```
1. User enters email → Magic link sent
2. User clicks link → Supabase creates session
3. Session stored in HttpOnly cookies (Secure, SameSite=Strict)
4. Access token (15 min) + Refresh token (14 days)
5. Auto-refresh 2 min before expiry
6. BroadcastChannel syncs across tabs
```

### Token Lifecycle

```typescript
// Access Token (15 min)
{
  sub: "user-uuid",
  email: "user@docflow.fi",
  role: "user",
  tenant_id: "tenant-123",
  exp: 1705334400,
  iat: 1705333500
}

// Refresh Token (14 days)
// Rotated on every use
// Device-bound via session_id
```

### Tenant Isolation (RLS)

```sql
-- Every query automatically filtered by tenant_id
-- Set via PostgreSQL session variables

SELECT set_config('app.current_tenant_id', 'tenant-123', true);
SELECT set_config('app.user_role', 'user', true);

-- RLS policy enforces:
WHERE tenant_id = current_setting('app.current_tenant_id')::text
```

---

## 📁 File Structure

### Frontend (`/frontend`)

```
lib/
├── auth/
│   └── session.ts              # Silent reauth + BroadcastChannel
├── supabase/
│   └── client.ts               # Supabase client config
hooks/
└── useAuth.ts                  # React auth hook
middleware.ts                   # Security headers + CSP
app/
└── api/
    └── csp-report/
        └── route.ts            # CSP violation reports
```

### Backend (`/backend`, `/shared_core`)

```
shared_core/
└── middleware/
    ├── supabase_auth.py        # JWT validation (existing)
    ├── rbac.py                 # Role-based access (existing)
    └── tenant_context.py       # RLS context setter (NEW)
```

### Database (`/supabase`)

```
migrations/
└── 20250115_enable_rls.sql    # RLS policies + indexes
```

### Tests (`/frontend/tests`)

```
e2e/
├── auth-multi-tab.spec.ts     # Multi-tab sync tests
└── tenant-isolation.spec.ts   # RLS boundary tests
```

---

## 🔐 Security Features

### 1. Token Security

- ✅ **HttpOnly Cookies** - No localStorage, prevents XSS token theft
- ✅ **Secure Flag** - HTTPS only in production
- ✅ **SameSite=Strict** - CSRF protection
- ✅ **Short-lived Access** - 15 min reduces exposure window
- ✅ **Refresh Rotation** - New refresh token on every use
- ✅ **Device Binding** - session_id prevents token reuse

### 2. Row Level Security (RLS)

Tables with RLS enabled:
- `receipts` - Kuittien eristys
- `documents` - Dokumenttien eristys
- `ocr_results` - OCR-tulosten eristys
- `p2e_wallet` - Lompakkojen eristys
- `p2e_token_ledger` - Token-tapahtumien eristys
- `clients` - Asiakkaiden eristys

**Defense in Depth:**
- Application-level: Middleware checks tenant_id
- Database-level: RLS policies enforce isolation
- Admin override: Requires audit trail (X-Admin-Override-Reason header)

### 3. Security Headers

```typescript
// HSTS - Force HTTPS
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

// Prevent MIME sniffing
X-Content-Type-Options: nosniff

// Prevent clickjacking
X-Frame-Options: DENY

// Control referrer
Referrer-Policy: strict-origin-when-cross-origin

// Disable browser features
Permissions-Policy: camera=(), microphone=(), geolocation=()

// CSP (staging: report-only, prod: enforce after 2 weeks)
Content-Security-Policy: default-src 'self'; ...
```

### 4. Content Security Policy (CSP)

**Staging:** Report-Only mode
- Collects violations at `/api/csp-report`
- Analyze for 2 weeks before enforcing

**Production:** Enforce mode (after analysis)
- Blocks unauthorized scripts/styles
- Prevents XSS attacks
- Allows: Supabase, Stripe, DocFlow domains

---

## 🚀 Configuration

### Supabase Dashboard Settings

Navigate to: **Authentication → Settings**

```
Access Token Lifetime: 900 seconds (15 min)
Refresh Token Lifetime: 1209600 seconds (14 days)
Refresh Token Rotation: ✅ Enabled
Refresh Token Reuse Interval: 10 seconds
PKCE Flow: ✅ Enabled
```

### Environment Variables

```bash
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_ENV=staging  # or production

# Backend (.env)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
SUPABASE_JWT_ISS=https://xxx.supabase.co/auth/v1
SUPABASE_JWT_AUD=authenticated
SUPABASE_AUTH_ENABLED=true
```

---

## 🧪 Testing

### Run E2E Tests

```bash
# Install Playwright
cd frontend
npm install -D @playwright/test

# Run all auth tests
npx playwright test tests/e2e/auth-*.spec.ts

# Run specific test
npx playwright test tests/e2e/auth-multi-tab.spec.ts

# Debug mode
npx playwright test --debug
```

### Manual Testing Checklist

- [ ] Magic link login works
- [ ] Session persists across page reloads
- [ ] Auto-refresh happens 2 min before expiry
- [ ] Multi-tab: only one tab refreshes
- [ ] Sign out broadcasts to all tabs
- [ ] Tenant data isolation (no cross-tenant access)
- [ ] Admin override works with reason header
- [ ] CSP violations logged (staging)
- [ ] Security headers present in responses

---

## 📊 Monitoring

### Key Metrics

1. **Token Refresh Success Rate** - Should be >99.5%
2. **Multi-Tab Refresh Storms** - Should be 0 (BroadcastChannel working)
3. **RLS Policy Violations** - Should be 0 (tenant isolation working)
4. **CSP Violations** - Monitor in staging, fix before prod enforce

### Logging

```typescript
// Frontend
console.debug('[Auth] Session refreshed successfully')
console.error('[Auth] Session refresh failed:', error)

// Backend
logger.info(f"Set tenant context: tenant_id={tenant_id}, role={role}")
logger.warning(f"User {user_id} has no tenant_id")
logger.error(f"Failed to set tenant context: {error}")
```

---

## 🔧 Troubleshooting

### Issue: Token refresh fails repeatedly

**Symptoms:** User sees "Yhteys katkesi" notification

**Causes:**
1. Network connectivity issues
2. Supabase service outage
3. Invalid refresh token

**Solution:**
1. Check network connectivity
2. Check Supabase status: https://status.supabase.com
3. Check browser console for detailed error
4. Ask user to sign out and back in

### Issue: Multi-tab refresh storm

**Symptoms:** Multiple refresh requests from same user

**Causes:**
1. BroadcastChannel not supported (old browser)
2. BroadcastChannel initialization failed

**Solution:**
1. Check browser compatibility
2. Check console for BroadcastChannel errors
3. Fallback: User may experience multiple refreshes (not critical)

### Issue: Cross-tenant data leakage

**Symptoms:** User sees another tenant's data

**Causes:**
1. RLS not enabled on table
2. Tenant context not set in middleware
3. Admin override without audit trail

**Solution:**
1. Run RLS verification queries (see migration file)
2. Check middleware logs for tenant context
3. Check admin override header is present

### Issue: CSP blocks legitimate resources

**Symptoms:** Images/scripts not loading

**Causes:**
1. CSP policy too strict
2. New third-party service added

**Solution:**
1. Check CSP violation reports: `/api/csp-report`
2. Add domain to CSP whitelist in `middleware.ts`
3. Test in staging before prod

---

## 🔄 Rollback Plan

### If RLS causes issues:

```sql
-- Disable RLS temporarily (EMERGENCY ONLY)
ALTER TABLE receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
-- ... repeat for all tables

-- Re-enable after fix
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
```

### If token refresh causes issues:

```typescript
// Increase access token lifetime (temporary)
// Supabase Dashboard → Authentication → Settings
// Access Token Lifetime: 3600 (1 hour)

// Revert to 900 (15 min) after fix
```

### If CSP blocks critical functionality:

```typescript
// Temporarily disable CSP enforcement
// In middleware.ts:
const cspHeader = 'Content-Security-Policy-Report-Only'  // Always report-only

// Fix CSP policy, then re-enable:
const cspHeader = isProduction ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only'
```

---

## 📚 References

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [BroadcastChannel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)

---

## 🎯 Next Steps (Future Enhancements)

- [ ] **TOTP 2FA** - Authenticator app support
- [ ] **WebAuthn/Passkeys** - Biometric authentication
- [ ] **Trusted Types** - DOM XSS prevention
- [ ] **Advanced Sessions UI** - "Active devices", "Logout all"
- [ ] **Anomaly Detection** - IP/device change alerts
- [ ] **Session Recording** - Audit trail for compliance

---

**Last Updated:** 2025-01-15  
**Maintained By:** DocFlow Security Team


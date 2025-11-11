# 🔐 Authentication & Tenant Context Guide

## Quick Start (Development)

### 1. Generate a dev token

```bash
python scripts/mint_token.py demo user_demo 86400
```

This outputs a JWT token valid for 24 hours.

### 2. Add to frontend/.env.local

```bash
echo "NEXT_PUBLIC_DEV_JWT=<paste_token_here>" >> frontend/.env.local
```

### 3. Test authentication

```bash
# Backend
source venv/bin/activate
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm run dev
```

Visit http://localhost:3000/dashboard - should work without errors!

---

## How It Works

### Backend (FastAPI)

#### 1. JWT Structure

```json
{
  "iss": "converto",
  "aud": "converto-app",
  "sub": "user_demo",
  "tenant_id": "demo",
  "uid": "user_demo",
  "scopes": ["user"],
  "iat": 1234567890,
  "exp": 1234654290
}
```

#### 2. Extract tenant context in routes

```python
from fastapi import Depends
from app.core.auth import tenant_ctx

@router.get("/summary")
def summary(ctx=Depends(tenant_ctx)):
    tenant_id = ctx["tenant_id"]
    user_id = ctx["user_id"]
    # Use these instead of hardcoded "demo"
    ...
```

#### 3. Require admin scope

```python
from app.core.auth import require_scope

@router.post("/admin/action", dependencies=[Depends(require_scope("admin"))])
def admin_action():
    ...
```

### Frontend (Next.js)

#### Use the api() helper

```typescript
import { api } from '@/lib/api';

// GET request
const data = await api('/api/v1/gamify/summary');

// POST request
const result = await api('/api/v1/p2e/mint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 10, reason: 'test' })
});
```

#### With SWR

```typescript
import useSWR from 'swr';
import { apiFetcher } from '@/lib/api';

const { data } = useSWR('/api/v1/gamify/summary', apiFetcher);
```

---

## Development vs Production

### Development (Current)

**Backend:** Accepts both JWT and `x-tenant-id` + `x-user-id` headers
- JWT: Production-ready, secure
- Headers: Quick testing with curl/Postman

**Frontend:** Uses `NEXT_PUBLIC_DEV_JWT` from .env.local
- Simple: No login flow needed
- Fast: Start coding immediately

### Production (TODO)

**Backend:** Only JWT, no header fallback

```python
# Remove header fallback in app/core/auth.py:
if tenant_hdr and user_hdr:
    # DELETE THIS BLOCK IN PRODUCTION
    ...
```

**Frontend:** Replace dev JWT with real auth provider

Options:
1. **Auth0** - Easiest, $0-25/month
2. **Clerk** - Great UX, $25/month
3. **AWS Cognito** - Scalable, complex setup
4. **Supabase Auth** - Open source, simple

Example with Auth0:
```typescript
import { useAuth0 } from '@auth0/auth0-react';

const { getAccessTokenSilently } = useAuth0();
const token = await getAccessTokenSilently();

// Use token instead of NEXT_PUBLIC_DEV_JWT
```

---

## Common Tasks

### Add JWT to all API routes

In `app/main.py`:

```python
from fastapi import Depends
from app.core.auth import tenant_ctx

# Add to all routers that need auth
app.include_router(gamify_api.router, dependencies=[Depends(tenant_ctx)])
app.include_router(p2e_api.router, dependencies=[Depends(tenant_ctx)])
app.include_router(rewards_api.router, dependencies=[Depends(tenant_ctx)])
```

### Remove hardcoded "demo" / "user_demo"

**Before:**
```python
def get_summary():
    return summary_since(db, tenant_id="demo", user_id="user_demo")
```

**After:**
```python
def get_summary(ctx=Depends(tenant_ctx)):
    return summary_since(db, tenant_id=ctx["tenant_id"], user_id=ctx["user_id"])
```

### Test with curl

```bash
# Generate token
TOKEN=$(python scripts/mint_token.py demo user_demo 3600 | grep -o 'eyJ[^[:space:]]*')

# Use in request
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/gamify/summary
```

---

## Security Best Practices

### ✅ Do

1. **Use strong JWT_SECRET** (32+ random characters)
2. **Short TTL** (1-24 hours)
3. **HTTPS only** in production
4. **Refresh tokens** for long sessions
5. **Log all auth failures**

### ❌ Don't

1. **Don't commit .env** (use .env.example)
2. **Don't use "dev" secrets** in production
3. **Don't log JWT tokens**
4. **Don't accept expired tokens**
5. **Don't trust client input** (validate tenant_id server-side)

---

## Troubleshooting

### "invalid_token" error

1. Check JWT_SECRET matches between mint and verify
2. Token expired? Generate new one
3. Check `iss` and `aud` match

### "missing_auth" error

1. Is Authorization header set?
2. Format: `Bearer <token>` (note the space)
3. Check NEXT_PUBLIC_DEV_JWT in frontend/.env.local

### Frontend can't reach backend

1. Check NEXT_PUBLIC_API_BASE is correct
2. Backend running on correct port?
3. CORS enabled in FastAPI?

---

## Next Steps

1. ✅ **Add JWT to all routes** (remove hardcoded tenant/user)
2. ✅ **Test with real multi-tenant data**
3. 🔄 **Add refresh token flow**
4. 🔄 **Integrate Auth0/Clerk**
5. 🔄 **Add rate limiting per tenant**
6. 🔄 **Add audit logging**

---

**Questions?** Check `app/core/auth.py` for implementation details!

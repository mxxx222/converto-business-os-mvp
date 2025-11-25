# Sentry Tagging Verification Guide

## ✅ Backend Sentry Tagging Implementation

### Automatic Tags Added

The backend Sentry middleware (`backend/main.py`) automatically adds:

1. **`request_id`** tag
   - Reads from `x-request-id` header
   - Generates UUID if header is missing
   - Added to ALL Sentry events

2. **`tenant_id`** tag
   - From authenticated user: `user.tenant_id`
   - From header: `x-tenant-id` (for unauthenticated requests)
   - Added when available

3. **`user_id`** tag (via `set_tenant_context`)
   - From authenticated user: `user.id`
   - Only for authenticated requests

4. **`user_role`** tag (via `set_tenant_context`)
   - From authenticated user: `user.role`
   - Only for authenticated requests

### Verification Steps

#### 1. Check Sentry Dashboard

1. Go to https://sentry.io/organizations/your-org/issues/
2. Open any recent error
3. Check "Tags" section - you should see:
   - `request_id`: UUID string
   - `tenant_id`: UUID string (if available)
   - `user_id`: UUID string (if authenticated)
   - `user_role`: role string (if authenticated)

#### 2. Test Request ID Propagation

```bash
# Make a request with custom request ID
curl -H "x-request-id: test-123-456" \
     https://api.converto.fi/health

# Check Sentry - should see request_id: test-123-456
```

#### 3. Test Tenant ID from Header

```bash
# Make unauthenticated request with tenant ID
curl -H "x-tenant-id: tenant-abc-123" \
     https://api.converto.fi/health

# Check Sentry - should see tenant_id: tenant-abc-123
```

#### 4. Test Authenticated User Context

```bash
# Make authenticated request
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.converto.fi/api/v1/receipts

# Check Sentry - should see:
# - tenant_id: from user.tenant_id
# - user_id: from user.id
# - user_role: from user.role
# - request_id: auto-generated or from header
```

### Code Reference

**Backend Middleware** (`backend/main.py` lines 118-145):
```python
@app.middleware("http")
async def sentry_tenant_middleware(request: Request, call_next):
    """Add tenant context and request ID to Sentry events."""
    import uuid
    from sentry_sdk import set_tag
    
    # Generate or read request ID
    request_id = request.headers.get("x-request-id")
    if not request_id:
        request_id = str(uuid.uuid4())
    
    # Set request_id tag for all Sentry events
    set_tag("request_id", request_id)
    
    # Add tenant context if user is authenticated
    user = getattr(request.state, 'user', None)
    if user and hasattr(user, 'tenant_id'):
        set_tenant_context(
            tenant_id=str(user.tenant_id),
            user_id=str(user.id),
            role=str(user.role)
        )
    
    # Also set tenant_id from header if available
    tenant_id_header = request.headers.get("x-tenant-id")
    if tenant_id_header:
        set_tag("tenant_id", tenant_id_header)
    
    return await call_next(request)
```

**Frontend Middleware** (`frontend/middleware.ts`):
- Generates `x-request-id` header automatically
- Reads `tenant_id` from cookie and sets `x-tenant-id` header

### Expected Behavior

✅ **All requests** get `request_id` tag  
✅ **Authenticated requests** get `tenant_id`, `user_id`, `user_role` tags  
✅ **Unauthenticated requests** with `x-tenant-id` header get `tenant_id` tag  
✅ **Request ID** propagates from frontend → backend via header  

### Troubleshooting

**Problem:** No `request_id` in Sentry events
- Check that middleware runs before route handlers
- Verify Sentry SDK is initialized (`init_sentry()` called)

**Problem:** No `tenant_id` for authenticated users
- Check that auth middleware runs before Sentry middleware
- Verify `request.state.user` has `tenant_id` attribute

**Problem:** Request ID not propagating
- Check frontend middleware sets `x-request-id` header
- Verify backend reads header correctly


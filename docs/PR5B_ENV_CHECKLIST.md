# PR5b Environment Variables Checklist

## Required Environment Variables for PR5b (Customers Contact)

### Resend Email Integration
- **`RESEND_API_KEY`** ✅ Already configured
  - Location: `backend/config.py` → `resend_api_key`
  - Usage: Email sending via Resend API
  - Example: `re_xxxxxxxxxxxxx`
  
- **`RESEND_FROM`** or **`EMAIL_FROM`** ✅ Already configured
  - Location: `backend/config.py` → `email_from` (default: `"noreply@converto.fi"`)
  - Usage: Default sender email address
  - Can be overridden with `RESEND_FROM` env var
  - Example: `"DocFlow <noreply@docflow.fi>"` or `"noreply@docflow.fi"`

### Pipedrive CRM Integration (Optional)
- **`PIPEDRIVE_API_TOKEN`** ⚠️ Not yet configured
  - Usage: Pipedrive API authentication
  - Example: `your-pipedrive-api-token`
  - Required: Only if Pipedrive integration is enabled
  
- **`PIPEDRIVE_BASE_URL`** ⚠️ Not yet configured (Optional)
  - Usage: Pipedrive API base URL (defaults to `https://api.pipedrive.com/v1`)
  - Example: `https://api.pipedrive.com/v1`
  - Required: Only if using custom Pipedrive instance

### CI/Testing
- **`NO_EXTERNAL_SEND`** ⚠️ Not yet configured
  - Usage: Mock mode for CI/testing (prevents actual API calls)
  - Set to `"true"` in CI to enable mock mode
  - Example: `NO_EXTERNAL_SEND=true`

### Backend API
- **`BACKEND_API_URL`** or **`NEXT_PUBLIC_API_URL`** ✅ Already configured
  - Usage: Backend API URL for activity publishing
  - Default: `http://localhost:8000`
  - Example: `https://api.docflow.fi`

## Environment Setup Instructions

### For Local Development:
```bash
# .env.local (frontend)
RESEND_API_KEY=re_xxxx
RESEND_FROM="DocFlow <noreply@docflow.fi>"
PIPEDRIVE_API_TOKEN=your-token  # Optional
PIPEDRIVE_BASE_URL=https://api.pipedrive.com/v1  # Optional
BACKEND_API_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### For CI (GitHub Actions):
```yaml
env:
  NO_EXTERNAL_SEND: "true"
  RESEND_API_KEY: ""  # Not needed in CI (mock mode)
  PIPEDRIVE_API_TOKEN: ""  # Not needed in CI (mock mode)
```

### For Production:
```bash
RESEND_API_KEY=re_live_xxxx
RESEND_FROM="DocFlow <noreply@docflow.fi>"
PIPEDRIVE_API_TOKEN=your-production-token  # If enabled
PIPEDRIVE_BASE_URL=https://api.pipedrive.com/v1
BACKEND_API_URL=https://api.docflow.fi
NEXT_PUBLIC_API_URL=https://api.docflow.fi
```

## Notes
- `RESEND_FROM` can use `EMAIL_FROM` from backend config as fallback
- `PIPEDRIVE_API_TOKEN` and `PIPEDRIVE_BASE_URL` are optional (integration works without them in mock mode)
- `NO_EXTERNAL_SEND=true` enables mock mode for all external API calls (Resend, Pipedrive)


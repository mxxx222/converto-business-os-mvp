# 🔐 API Keys & Secrets Inventory

**Käytössä olevat API-avaimet ja secret keys Converto Business OS -projektissa**

---

## 📋 **Yhteenveto**

| API/Service | Variable Name | Käyttötarkoitus | Tiedosto | Status |
|------------|---------------|-----------------|----------|--------|
| **OpenAI** | `OPENAI_API_KEY` | AI Chat, Vision OCR | `shared_core/modules/ai/router.py` | ✅ Käytössä |
| **Resend** | `RESEND_API_KEY` | Email automations | `backend/modules/email/` | ✅ Käytössä |
| **Supabase** | `SUPABASE_URL` | Auth, Database, Storage | `backend/config.py` | ✅ Käytössä |
| **Supabase** | `SUPABASE_SERVICE_ROLE_KEY` | Backend admin access | `backend/config.py` | ✅ Käytössä |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Frontend public access | `frontend/lib/supabase/` | ✅ Käytössä |
| **Database** | `DATABASE_URL` | PostgreSQL connection | `backend/config.py` | ✅ Käytössä |
| **Stripe** | `STRIPE_API_KEY` | Payment processing | `requirements.txt` | ⚠️ Asennettu, ei käytössä |
| **Notion** | `NOTION_API_KEY` | Documentation sync | `shared_core/modules/notion/` | ⚠️ Asennettu, ei käytössä |
| **Linear** | `LINEAR_API_KEY` | Issue tracking | `shared_core/modules/linear/` | ⚠️ Asennettu, ei käytössä |
| **Render** | `RENDER_API_KEY` | Deployment automation | `mcp_render_server.js` | ✅ MCP Server |
| **GitHub** | `GITHUB_TOKEN` | GitHub automation | `mcp_github_server.cjs` | ✅ MCP Server |
| **Vercel** | `VERCEL_TOKEN` | Vercel deployment | `mcp_auto_deploy_server.js` | ✅ MCP Server |
| **Notion** | `NOTION_TOKEN` | Notion automation | `mcp_notion_server.js` | ✅ MCP Server |
| **Sentry** | `SENTRY_DSN` | Error tracking (Frontend) | `sentry.client.config.ts` | ⚠️ Asennettu, ei aktiivisessa käytössä |
| **Sentry** | `SENTRY_DSN` | Error tracking (Backend) | `requirements.txt` (sentry-sdk) | ⚠️ Asennettu, ei aktiivisessa käytössä |

---

## 🔑 **Käytössä olevat API-avaimet**

### 1. **OpenAI API Key**

**Environment Variable:** `OPENAI_API_KEY`

**Käyttötarkoitus:**
- AI Chat (`/api/v1/ai/chat`)
- Vision AI OCR (`/api/v1/receipts/scan`)
- Receipt/Invoice processing

**Koodi:**
```python
# shared_core/modules/ai/router.py
def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured")
    return OpenAI(api_key=api_key)
```

**Required:** ✅ **Kyllä** (AI-featureit vaativat)

**Where to get:**
- https://platform.openai.com/api-keys
- Model: `gpt-4o-mini` (recommended)

---

### 2. **Resend API Key**

**Environment Variable:** `RESEND_API_KEY` / `resend_api_key`

**Käyttötarkoitus:**
- Email automations (Pilot Onboarding, Deployment Notifications, Error Alerts)
- Email templates (layouts + locales)
- Email monitoring & cost guardrails

**Koodi:**
```python
# backend/config.py
resend_api_key: str = ""

# backend/modules/email/service.py
EmailService(api_key=settings.resend_api_key)
```

**Required:** ✅ **Kyllä** (Email-automaatiot vaativat)

**Where to get:**
- https://resend.com/api-keys
- Domain verification required (converto.fi)

---

### 3. **Supabase Keys**

#### **3a. Supabase URL**
**Environment Variable:** `SUPABASE_URL`

**Käyttötarkoitus:**
- Backend JWT validation
- Database connection
- Storage access

**Koodi:**
```python
# backend/config.py
supabase_url: str = ""
```

**Required:** ✅ **Kyllä** (Supabase-integration vaatii)

---

#### **3b. Supabase Service Role Key**
**Environment Variable:** `SUPABASE_SERVICE_ROLE_KEY`

**Käyttötarkoitus:**
- Backend admin operations
- Storage webhook authentication
- Service-level database access

**Koodi:**
```python
# backend/config.py
supabase_service_role_key: str = ""
```

**Required:** ✅ **Kyllä** (Backend Supabase-operations vaativat)

**Security:** ⚠️ **KRITISKI** - Never expose to frontend!

---

#### **3c. Supabase Anon Key (Frontend)**
**Environment Variable:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Käyttötarkoitus:**
- Frontend authentication
- Client-side database queries (RLS-protected)
- Realtime subscriptions

**Koodi:**
```typescript
// frontend/lib/supabase/client.ts
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
```

**Required:** ✅ **Kyllä** (Frontend Supabase-integration vaatii)

**Security:** ✅ Safe for frontend (Row Level Security protects data)

---

### 4. **Database URL**

**Environment Variable:** `DATABASE_URL`

**Käyttötarkoitus:**
- PostgreSQL connection
- SQLAlchemy database sessions

**Koodi:**
```python
# backend/config.py
database_url: str = "postgresql://demo:demo@demo.supabase.co:5432/demo"
```

**Required:** ✅ **Kyllä** (Backend database access vaatii)

**Format:** `postgresql://user:password@host:port/database`

---

## ⚠️ **Asennettu mutta ei aktiivisesti käytössä**

### 5. **Stripe API Key**

**Environment Variable:** `STRIPE_API_KEY` / `STRIPE_SECRET_KEY`

**Koodi:**
- Package: `stripe>=10.0.0` (requirements.txt)
- Not yet integrated in backend

**Required:** ❌ **Ei** (Payment processing tulevaisuudessa)

---

### 6. **Notion API Key**

**Environment Variable:** `NOTION_API_KEY`

**Koodi:**
- Module: `shared_core/modules/notion/router.py`
- Not yet integrated

**Required:** ❌ **Ei** (Documentation sync tulevaisuudessa)

---

### 7. **Linear API Key**

**Environment Variable:** `LINEAR_API_KEY`

**Koodi:**
- Module: `shared_core/modules/linear/router.py`
- Not yet integrated

**Required:** ❌ **Ei** (Issue tracking tulevaisuudessa)

---

## 🔌 **MCP Server API Keys** (Cursor Integration)

### 8. **Render API Key**

**Environment Variable:** `RENDER_API_KEY`

**Käyttötarkoitus:**
- MCP Server: Deployment automation
- Render service management
- Log fetching, SSL status, deployment triggers

**Koodi:**
- `mcp_render_server.js`
- `package-mcp.json`

**Required:** ✅ **Kyllä** (Jos käytät Render MCP-tools)

---

### 9. **GitHub Token**

**Environment Variable:** `GITHUB_TOKEN`

**Käyttötarkoitus:**
- MCP Server: GitHub automation
- Repository management
- Actions & workflows

**Koodi:**
- `mcp_github_server.cjs`
- `package-mcp.json`

**Required:** ✅ **Kyllä** (Jos käytät GitHub MCP-tools)

---

### 10. **Vercel Token**

**Environment Variable:** `VERCEL_TOKEN`

**Käyttötarkoitus:**
- MCP Server: Auto-deploy automation
- Vercel deployment management

**Koodi:**
- `mcp_auto_deploy_server.js`
- `package-mcp.json`

**Required:** ⚠️ **Valinnainen** (Jos käytät Vercel-auto-deploya)

---

### 11. **Notion Token** (MCP)

**Environment Variable:** `NOTION_TOKEN`

**Käyttötarkoitus:**
- MCP Server: Notion automation
- Page creation, task management
- Documentation sync

**Koodi:**
- `mcp_notion_server.js`
- `package-mcp.json`

**Required:** ⚠️ **Valinnainen** (Jos käytät Notion MCP-tools)

---

## 🐛 **Error Tracking (Sentry)**

### 12. **Sentry DSN**

**Environment Variable:** `SENTRY_DSN`

**Käyttötarkoitus:**
- Error tracking & monitoring
- Frontend: Browser errors, React errors
- Backend: FastAPI exception tracking
- Performance monitoring

**Koodi:**
- Frontend: `sentry.client.config.ts`, `sentry.server.config.ts`
- Backend: `sentry-sdk[fastapi]` (requirements.txt)

**Status:** ⚠️ **Asennettu, mutta EI konfiguroitu käyttöön**

**Syy:**
- Frontend: Config-tiedostot löytyvät, mutta ei ole aktiivista integraatiota `layout.tsx`:ään
- Backend: Package asennettu, mutta ei ole `main.py`:ssä Sentry-initialisointia
- DSN ei ole konfiguroitu environment variablesissa

**Käyttöönotto:**
1. **Frontend:**
   ```typescript
   // frontend/app/layout.tsx
   import * as Sentry from '@sentry/nextjs';
   // Sentry init tapahtuu automaattisesti sentry.client.config.ts:ssä
   ```

2. **Backend:**
   ```python
   # backend/main.py
   import sentry_sdk
   from sentry_sdk.integrations.fastapi import FastApiIntegration
   
   sentry_sdk.init(
       dsn=os.getenv("SENTRY_DSN"),
       integrations=[FastApiIntegration()],
       traces_sample_rate=0.2,
       environment=settings.environment,
   )
   ```

3. **Environment Variables:**
   ```env
   SENTRY_DSN=https://xxxx@xxxx.ingest.sentry.io/xxxx
   ```

**Required:** ❌ **Ei** (Error tracking on valinnainen)

**Where to get:**
- https://sentry.io/ → Create project → Get DSN

---

## 🔧 **Frontend Environment Variables**

### **Next.js Public Variables** (Safe for browser)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_P源于LIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

### **Server-Only Variables** (Never exposed to browser)

```env
# Ei NEXT_PUBLIC_-prefixiä = server-only
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key
RESEND_API_KEY=your-resend-key
```

---

## 📝 **Environment Setup Checklist**

### **Backend (Render):**
- [ ] `OPENAI_API_KEY` - OpenAI API key
- [ ] `RESEND_API_KEY` - Resend API key
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `SUPABASE_AUTH_ENABLED=true` - Enable Supabase auth
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `CORS_ORIGINS_STR` - Allowed origins (optional)

### **Frontend (Vercel/Render):**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `NEXT_PUBLIC_API_URL` - Backend API URL (optional)

---

## 🔒 **Security Best Practices**

1. **Never commit secrets to git**
   - ✅ Use `.env.example` for documentation
   - ✅ Use `.gitignore` to exclude `.env`
   - ✅ Use environment variables in production

2. **Separate public/private keys**
   - ✅ `NEXT_PUBLIC_*` = safe for browser
   - ⚠️ No prefix = server-only (never expose)

3. **Rotate keys regularly**
   - 🔄 Quarterly rotation recommended
   - 🔄 Immediately if compromised

4. **Use vaults in production**
   - 🔄 1Password/Doppler for secrets management
   - 🔄 AWS Secrets Manager / Render secrets

---

## 📚 **Related Documentation**

- [Supabase Setup](docs/SUPABASE_SETUP.md)
- [Backend Supabase Status](docs/BACKEND_SUPABASE_STATUS.md)
- [Resend Maximization Guide](RESEND_MAXIMIZATION_GUIDE.md)
- [MCP OpenAI Setup](docs/MCP_OPENAI_SETUP.md)

---

**Last Updated:** 2025-01-XX © 2025 Converto Business OS


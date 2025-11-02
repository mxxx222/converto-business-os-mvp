# 🚀 COMPLETE MIGRATION GUIDE: Render → Vercel + Cloudflare

## 📊 CURRENT STATE

### Render Services (TO REMOVE):
1. converto-marketing (converto.fi)
2. converto-dashboard (app.converto.fi)
3. converto-business-os-quantum-mvp-1 (api.converto.fi)

### NEW INFRASTRUCTURE:
```
Vercel: Marketing + Dashboard
Cloudflare: Backend API via Workers + DNS
```

---

## 🎯 STEP-BY-STEP MIGRATION

### PHASE 1: Vercel Setup

#### Option A: Vercel CLI (FASTEST - 5 minutes)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy marketing site (converto.fi)
cd frontend
vercel --prod --name converto-marketing

# Deploy dashboard site (app.converto.fi)
vercel --prod --name converto-dashboard
```

#### Option B: Vercel Dashboard (Recommended)

1. **Go to:** https://vercel.com/new
2. **Click:** "Continue with GitHub"
3. **Authorize** GitHub access
4. **Import:** `mxxx222/converto-business-os-mvp`

**Configure Marketing Site:**
```
Project Name: converto-marketing
Framework: Next.js
Root Directory: frontend
Build Command: npm ci && npm run build
Output Directory: .next
Environment Variables:
  NODE_ENV=production
  NEXT_PUBLIC_STATIC_EXPORT=false
  NEXT_PUBLIC_SUPABASE_URL=https://pwghuqkxryxgnnsnsiah.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
  RESEND_API_KEY=<your-key>
```

**Configure Dashboard Site:**
```
Project Name: converto-dashboard
Framework: Next.js
Root Directory: frontend
Build Command: npm ci && npm run build
Output Directory: .next
Environment Variables:
  NODE_ENV=production
  NEXT_PUBLIC_STATIC_EXPORT=false
  NEXT_PUBLIC_SUPABASE_URL=https://pwghuqkxryxgnnsnsiah.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
  NEXT_PUBLIC_API_URL=https://api.converto.fi
  NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
```

---

### PHASE 2: Cloudflare Workers Setup

#### 1. Deploy Workers API Proxy:
```bash
cd workers

# Login to Cloudflare
wrangler login

# Deploy production
wrangler publish --env production
```

#### 2. Configure Environment Variables:
Go to Cloudflare Dashboard → Workers → converto-api-proxy → Settings → Variables

```bash
SUPABASE_URL=https://pwghuqkxryxgnnsnsiah.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
OPENAI_API_KEY=<your-openai-key>
RESEND_API_KEY=<your-resend-key>
KILO_CODE_API_KEY=<your-kilo-code-key>
SENTRY_DSN=<your-sentry-dsn>
```

#### 3. Configure Routes:
```
Routes:
  - api.converto.fi/* → converto-api-proxy
  - converto.fi/api/* → converto-api-proxy (optional)
```

---

### PHASE 3: DNS Configuration

#### At hostingpalvelu.fi DNS Zone Editor:

**Remove old Render DNS:**
```
converto.fi          A       216.24.57.1          DELETE
www.converto.fi      CNAME   converto-marketing.onrender.com   DELETE
app.converto.fi      A       (old-Render-IP)      DELETE
api.converto.fi      A       (old-Render-IP)      DELETE
```

**Add new Vercel DNS:**
```
converto.fi          CNAME   cname.vercel-dns.com
www.converto.fi      CNAME   cname.vercel-dns.com
app.converto.fi      CNAME   cname.vercel-dns.com
```

**Add new Cloudflare DNS:**
```
api.converto.fi      A       104.16.0.1
```

**(Note: Get actual IPs from Vercel/Cloudflare dashboards)**

---

### PHASE 4: Remove Render Services

```bash
# Go to Render Dashboard
https://dashboard.render.com

# For each service:
1. converto-marketing
2. converto-dashboard
3. converto-business-os-quantum-mvp-1

# Click: Settings → Delete Service → Confirm
```

#### Update render.yaml:
```yaml
# Empty file or delete entirely
services: []
```

---

## ✅ VERIFICATION CHECKLIST

### Marketing Site:
- [ ] https://converto.fi loads
- [ ] https://www.converto.fi loads
- [ ] Contact form works
- [ ] Pilot signup works
- [ ] SSL certificate active

### Dashboard:
- [ ] https://app.converto.fi loads
- [ ] Authentication works
- [ ] Supabase connection active
- [ ] Real-time updates working

### API:
- [ ] https://api.converto.fi/health responds
- [ ] API endpoints working
- [ ] Rate limiting active
- [ ] CORS configured

### DNS:
- [ ] All domains resolve correctly
- [ ] SSL certificates valid
- [ ] No DNS propagation issues

---

## 💰 COST BENEFITS

| Metric | Render | Vercel + Cloudflare | Savings |
|--------|--------|---------------------|---------|
| Marketing Site | $7/mo | Free | $7 |
| Dashboard Site | $7/mo | Free | $7 |
| Backend API | $7/mo | Free | $7 |
| SSL Certs | Included | Automatic | - |
| CDN | Basic | Enterprise | - |
| **TOTAL** | **$21/mo** | **$0/mo** | **$252/year** |

---

## 🚀 RAPID DEPLOYMENT (15 MINUTES)

```bash
#!/bin/bash
# Run this from project root

echo "🚀 CONVERTO MIGRATION - RAPID DEPLOYMENT"

# 1. Deploy to Vercel
cd frontend
vercel --prod --name converto-marketing --yes
vercel --prod --name converto-dashboard --yes

# 2. Deploy to Cloudflare
cd ../workers
wrangler publish --env production

echo "✅ DEPLOYMENT COMPLETE!"
echo "Next: Update DNS at hostingpalvelu.fi"
echo "Then: Remove Render services"
```

---

**🎯 RESULT:** Complete migration = $0/month hosting with enterprise features!

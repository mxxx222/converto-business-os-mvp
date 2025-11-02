# 🚀 MIGRATION PLAN: Render → Vercel + Cloudflare

## 📊 CURRENT STATE

### Render Services (TO BE REMOVED):
1. **converto-marketing** - Marketing website (converto.fi)
2. **converto-dashboard** - SSR Dashboard (app.converto.fi)
3. **converto-business-os-quantum-mvp-1** - FastAPI Backend (api.converto.fi)

### New Infrastructure Plan:
```
┌─────────────────────────────────────────────────┐
│  VERCEL (Marketing + Dashboard)                 │
│  - converto.fi (marketing website)             │
│  - app.converto.fi (dashboard)                 │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  CLOUDFLARE (Backend Infrastructure)            │
│  - Workers API Proxy (api.converto.fi)         │
│  - R2 Storage (file uploads)                   │
│  - DNS Management                              │
└─────────────────────────────────────────────────┘
```

---

## 🎯 MIGRATION STRATEGY

### Phase 1: Vercel Setup (15 min)
1. Import repository to Vercel
2. Configure marketing site (converto.fi)
3. Configure dashboard (app.converto.fi)
4. Add environment variables
5. Deploy both sites

### Phase 2: Cloudflare Setup (20 min)
1. Deploy Workers API Proxy
2. Configure R2 storage
3. Set up DNS records
4. Test API endpoints

### Phase 3: DNS Switchover (5 min)
1. Update DNS at hostingpalvelu.fi
2. Point converto.fi → Vercel
3. Point api.converto.fi → Cloudflare Workers
4. Verify SSL certificates

### Phase 4: Remove Render (5 min)
1. Remove Render services
2. Update documentation
3. Clean up render.yaml

---

## 📋 DETAILED STEPS

### 1. VERCEL DEPLOYMENT

#### A) Marketing Site (converto.fi)
```yaml
Project Name: converto-marketing
Framework: Next.js
Root Directory: frontend
Build Command: npm ci && npm run build
Output Directory: .next
Environment Variables:
  - NODE_ENV=production
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - RESEND_API_KEY
  - NEXT_PUBLIC_CLOUDFLARE_IMAGE_ENABLED=false
  - NEXT_PUBLIC_STATIC_EXPORT=false
```

#### B) Dashboard Site (app.converto.fi)
```yaml
Project Name: converto-dashboard
Framework: Next.js
Root Directory: frontend
Build Command: npm ci && npm run build
Output Directory: .next
Environment Variables:
  - NODE_ENV=production
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - NEXT_PUBLIC_API_URL=https://api.converto.fi
  - NEXT_PUBLIC_STATIC_EXPORT=false
  - NEXT_PUBLIC_SENTRY_DSN
```

---

### 2. CLOUDFLARE WORKERS

#### API Proxy Configuration
```bash
cd workers
wrangler publish
```

**Environment Variables:**
```bash
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
RESEND_API_KEY
KILO_CODE_API_KEY
SENTRY_DSN
```

**Routes:**
- `api.converto.fi/*` → Workers API Proxy
- Workers proxy to Supabase backend

---

### 3. DNS CONFIGURATION

#### Vercel DNS Records:
```bash
converto.fi       CNAME   cname.vercel-dns.com
www.converto.fi   CNAME   cname.vercel-dns.com
app.converto.fi   CNAME   cname.vercel-dns.com
```

#### Cloudflare DNS Records:
```bash
api.converto.fi   A       (Cloudflare Workers IP)
```

---

## ✅ POST-MIGRATION CHECKLIST

### Marketing Site:
- [ ] converto.fi loads
- [ ] www.converto.fi loads
- [ ] Contact form works
- [ ] Pilot signup works
- [ ] SSL certificate active

### Dashboard:
- [ ] app.converto.fi loads
- [ ] Authentication works
- [ ] Supabase connection active
- [ ] Real-time updates working

### API:
- [ ] api.converto.fi responds
- [ ] Health check `/health` works
- [ ] OCR endpoints working
- [ ] Rate limiting active

### DNS:
- [ ] All domains resolve correctly
- [ ] SSL certificates valid
- [ ] No DNS propagation issues

---

## 💰 COST COMPARISON

| Service | Render | Vercel + Cloudflare | Savings |
|---------|--------|---------------------|---------|
| Marketing Site | $7/mo | Free | $7 |
| Dashboard Site | $7/mo | Free | $7 |
| Backend API | $7/mo | Free (Workers) | $7 |
| **Total** | **$21/mo** | **$0/mo** | **$252/year** |

---

## 🚀 DEPLOYMENT COMMANDS

### Vercel Deployment:
```bash
# Marketing site
cd frontend
vercel --prod

# Dashboard site (same code, different settings)
vercel --prod --name converto-dashboard
```

### Cloudflare Deployment:
```bash
cd workers
wrangler publish --env production
```

---

## 📞 SUPPORT

- **Vercel Docs:** https://vercel.com/docs
- **Cloudflare Workers:** https://developers.cloudflare.com/workers/
- **DNS Management:** https://dash.cloudflare.com

---

**🎯 RESULT:** Complete migration from Render to Vercel + Cloudflare = $0/month hosting!

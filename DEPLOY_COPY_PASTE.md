# 🚀 VEROPILOT-AI - Kopioi-Liitä Deployment

**Täsmäohjeet tuotantoon 15 minuutissa**

---

## 1️⃣ SUPABASE SETUP

### Luo projekti
```
1. Mene: https://app.supabase.com/projects
2. Click: "New Project"
3. Name: veropilot-ai-prod
4. Database Password: [generoi vahva salasana]
5. Region: North Europe (eu-north-1)
6. Click: "Create new project"
7. Odota 2-3 min
```

### Kopioi API Keys
```
1. Mene: https://app.supabase.com/project/_/settings/api
2. Kopioi:
   - Project URL → tallenna muistiin
   - anon public → tallenna muistiin
   - service_role → tallenna muistiin (SALAINEN!)
```

### Aja SQL Migrations
```
1. Mene: https://app.supabase.com/project/_/sql/new
2. Kopioi ja aja JOKAINEN tiedosto järjestyksessä:
```

#### Migration 1: Documents Table
```sql
-- Kopioi koko sisältö: supabase/migrations/20241114_001_documents_table.sql
-- Liitä SQL Editoriin
-- Click: "Run"
-- Varmista: "Success" -viesti
```

#### Migration 2: VAT Analysis Table
```sql
-- Kopioi koko sisältö: supabase/migrations/20241114_002_vat_analysis_table.sql
-- Liitä SQL Editoriin
-- Click: "Run"
-- Varmista: "Success" -viesti
```

#### Migration 3: Storage Bucket
```sql
-- Kopioi koko sisältö: supabase/migrations/20241114_003_storage_bucket.sql
-- Liitä SQL Editoriin
-- Click: "Run"
-- Varmista: "Success" -viesti
```

#### Migration 4: Functions
```sql
-- Kopioi koko sisältö: supabase/migrations/20241114_004_functions.sql
-- Liitä SQL Editoriin
-- Click: "Run"
-- Varmista: "Success" -viesti
```

### Varmista taulut
```
1. Mene: https://app.supabase.com/project/_/editor
2. Tarkista että näkyvät:
   ✅ documents
   ✅ vat_analysis
   ✅ document_processing_logs
```

### Varmista Storage Bucket
```
1. Mene: https://app.supabase.com/project/_/storage/buckets
2. Tarkista että näkyy:
   ✅ documents (private)
```

### Varmista RLS Policies
```
1. Mene: https://app.supabase.com/project/_/auth/policies
2. Tarkista että näkyvät:
   ✅ documents: 4 policies (SELECT, INSERT, UPDATE, DELETE)
   ✅ vat_analysis: 3 policies (SELECT, INSERT, UPDATE)
   ✅ storage.objects: 3 policies (INSERT, SELECT, DELETE)
```

---

## 2️⃣ OPENAI API KEY

### Luo API Key
```
1. Mene: https://platform.openai.com/api-keys
2. Click: "Create new secret key"
3. Name: veropilot-ai-prod
4. Permissions: All (tai vain "Model capabilities")
5. Click: "Create secret key"
6. KOPIOI AVAIN HETI (näkyy vain kerran!)
7. Tallenna turvalliseen paikkaan
```

### Lisää krediittiä
```
1. Mene: https://platform.openai.com/account/billing/overview
2. Click: "Add payment method"
3. Lisää luottokortti
4. Click: "Add to credit balance"
5. Summa: $50 (suositus Phase 1:lle)
6. Confirm
```

### Aseta spending limit
```
1. Mene: https://platform.openai.com/account/limits
2. Set monthly budget: $100
3. Enable email notifications: 50%, 80%, 100%
4. Save
```

---

## 3️⃣ VERCEL DEPLOYMENT

### Asenna Vercel CLI
```bash
npm install -g vercel
```

### Login
```bash
vercel login
# Seuraa ohjeita selaimessa
```

### Build ja Deploy
```bash
cd frontend
vercel build --prod
vercel deploy --prebuilt --prod
```

**Odota deployment valmistumista (2-5 min)**

### Kopioi Deployment URL
```
Deployment URL näkyy terminaalissa:
https://veropilot-ai-xxxxxxxxx.vercel.app

TALLENNA TÄMÄ!
```

---

## 4️⃣ ENVIRONMENT VARIABLES

### Vercel Dashboard
```
1. Mene: https://vercel.com/dashboard
2. Valitse: veropilot-ai (tai projektin nimi)
3. Click: "Settings"
4. Click: "Environment Variables"
```

### Lisää muuttujat (Production + Preview)

#### NEXT_PUBLIC_SUPABASE_URL
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-ref.supabase.co
Environments: ✅ Production ✅ Preview
Click: "Save"
```

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon public key)
Environments: ✅ Production ✅ Preview
Click: "Save"
```

#### SUPABASE_SERVICE_ROLE_KEY
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role key)
Environments: ✅ Production ✅ Preview
⚠️ SALAINEN - ÄLÄ JAA KENELLEKÄÄN!
Click: "Save"
```

#### OPENAI_API_KEY
```
Key: OPENAI_API_KEY
Value: sk-proj-... (OpenAI API key)
Environments: ✅ Production ✅ Preview
⚠️ SALAINEN - ÄLÄ JAA KENELLEKÄÄN!
Click: "Save"
```

#### NEXT_PUBLIC_BACKEND_URL
```
Key: NEXT_PUBLIC_BACKEND_URL
Value: /api/v1
Environments: ✅ Production ✅ Preview
Click: "Save"
```

#### NEXT_PUBLIC_APP_URL
```
Key: NEXT_PUBLIC_APP_URL
Value: https://docflow.fi (tai Vercel URL jos ei vielä domainia)
Environments: ✅ Production ✅ Preview
Click: "Save"
```

#### NODE_ENV
```
Key: NODE_ENV
Value: production
Environments: ✅ Production
Click: "Save"
```

### Redeploy uusilla env varsilla
```bash
vercel --prod
```

---

## 5️⃣ DOMAIN SETUP (docflow.fi)

### Lisää domain Verceliin
```
1. Vercel Dashboard → Domains
2. Click: "Add Domain"
3. Domain: docflow.fi
4. Click: "Add"
```

### DNS Records (Domain providerissa)

#### Apex domain (docflow.fi)
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

#### WWW subdomain
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### WWW → Apex Redirect
```
Vercel automaattisesti:
www.docflow.fi → docflow.fi (301 redirect)
Query parametrit säilyvät
```

---

## 6️⃣ TURVALLISUUS

### Security Headers (Vercel)

Tarkista `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### CORS Configuration

Tarkista että API routes sallii vain:
- `docflow.fi`
- `*.vercel.app` (preview deployments)

### robots.txt

Luo `frontend/public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://docflow.fi/sitemap.xml
```

### sitemap.xml

Luo `frontend/public/sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://docflow.fi/</loc>
    <lastmod>2024-11-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://docflow.fi/pricing</loc>
    <lastmod>2024-11-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://docflow.fi/demo</loc>
    <lastmod>2024-11-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## 7️⃣ PIKAVERIFIOINTI

### HSTS Header
```bash
curl -Ik https://docflow.fi | egrep -i "strict-transport-security|200"
```
**Odotettu tulos:**
```
HTTP/2 200
strict-transport-security: max-age=31536000; includeSubDomains; preload
```

### WWW Redirect
```bash
curl -Ik https://www.docflow.fi | egrep -i "301|location:"
```
**Odotettu tulos:**
```
HTTP/2 301
location: https://docflow.fi/
```

### robots.txt
```bash
curl -I https://docflow.fi/robots.txt
```
**Odotettu tulos:**
```
HTTP/2 200
content-type: text/plain
```

### sitemap.xml
```bash
curl -I https://docflow.fi/sitemap.xml
```
**Odotettu tulos:**
```
HTTP/2 200
content-type: application/xml
```

### Health Check
```bash
curl https://docflow.fi/api/health
```
**Odotettu tulos:**
```json
{"status":"healthy"}
```

### Full Test
```bash
# Kaikki testit kerralla
curl -Ik https://docflow.fi | egrep -i "strict-transport-security|200" && \
curl -Ik https://www.docflow.fi | egrep -i "301|location:" && \
curl -I https://docflow.fi/robots.txt | grep "200" && \
curl -I https://docflow.fi/sitemap.xml | grep "200" && \
curl https://docflow.fi/api/health | grep "healthy"
```

**Jos kaikki OK:**
```
✅ HSTS enabled
✅ WWW redirect toimii
✅ robots.txt OK
✅ sitemap.xml OK
✅ API health check OK
```

---

## 8️⃣ FUNCTIONAL TESTING

### 1. Sign Up Flow
```
1. Mene: https://docflow.fi
2. Click: "Aloita ilmaiseksi"
3. Täytä: Email + Password
4. Click: "Rekisteröidy"
5. Tarkista: Email confirmation
6. Click: Confirmation link
7. Varmista: Redirect to dashboard
```

### 2. Upload Receipt
```
1. Dashboard → "Lataa kuitti"
2. Valitse: Testikuitti (jpg/png)
3. Click: "Lataa"
4. Varmista: Status "Käsitellään..."
5. Odota: 5-10 sekuntia
6. Varmista: Status "Valmis"
```

### 3. OCR Results
```
1. Click: Uploaded receipt
2. Varmista näkyvät:
   ✅ Vendor name
   ✅ Total amount
   ✅ VAT amount
   ✅ Receipt date
   ✅ Line items
   ✅ OCR confidence %
```

### 4. VAT Analysis
```
1. Same receipt view
2. Varmista näkyvät:
   ✅ Y-tunnus (jos löytyy)
   ✅ Company info (PRH)
   ✅ VAT breakdown per item
   ✅ Total deductible VAT
   ✅ Suggested booking code
   ✅ VAT confidence %
```

---

## 9️⃣ MONITORING SETUP

### Vercel Analytics
```
1. Vercel Dashboard → Analytics
2. Enable: Web Analytics
3. Enable: Speed Insights
4. Save
```

### Vercel Logs
```
1. Vercel Dashboard → Logs
2. Filter: Errors only
3. Enable: Email notifications for errors
```

### Supabase Monitoring
```
1. Supabase Dashboard → Logs
2. Enable: Postgres logs
3. Enable: API logs
4. Set retention: 7 days
```

### OpenAI Usage Tracking
```
1. https://platform.openai.com/usage
2. Monitor daily usage
3. Set alerts: 80% of budget
```

---

## 🎉 DEPLOYMENT COMPLETE!

### ✅ Checklist
- [ ] Supabase project created (EU-north)
- [ ] All 4 migrations executed
- [ ] Tables verified (documents, vat_analysis)
- [ ] Storage bucket created (documents)
- [ ] RLS policies active
- [ ] OpenAI API key created
- [ ] OpenAI credits added ($50)
- [ ] Vercel CLI installed
- [ ] Vercel deployed
- [ ] All 7 env vars configured
- [ ] Domain added (docflow.fi)
- [ ] DNS records configured
- [ ] HSTS header verified
- [ ] WWW redirect verified
- [ ] robots.txt verified
- [ ] sitemap.xml verified
- [ ] Health check passing
- [ ] Sign up flow tested
- [ ] Upload receipt tested
- [ ] OCR results verified
- [ ] VAT analysis verified
- [ ] Monitoring enabled

### 📊 Expected Costs (Month 1)
- **Supabase**: $0 (free tier)
- **Vercel**: $0 (free tier)
- **OpenAI**: ~$25 (1000 receipts @ $0.025 each)
- **Domain**: ~$12/year
- **Total**: ~$25/month

### 🚀 Next Steps
1. **Beta Testing**: Invite 10 users
2. **Feedback Collection**: Google Forms
3. **Bug Fixes**: Monitor Sentry/Vercel logs
4. **Phase 2 Planning**: Enhanced VAT, Procountor, Mobile

---

## 🆘 Troubleshooting

### "Unauthorized" Error
```bash
# Check Supabase RLS policies
# Verify JWT token in browser devtools
# Check user is logged in
```

### OCR Not Processing
```bash
# Check OpenAI API key is correct
# Verify credits available
# Check Vercel function logs
```

### Upload Fails
```bash
# Check Supabase storage bucket exists
# Verify RLS policies on storage.objects
# Check file size < 10MB
```

### Slow Performance
```bash
# Check Vercel function region (should be arn1)
# Verify database indexes exist
# Monitor OpenAI API response time
```

---

**🎯 VEROPILOT-AI on nyt tuotannossa!**

**Deployment aika**: ~15 minuuttia  
**Kustannus**: ~$25/kk (Phase 1)  
**Uptime**: 99.9% (Vercel SLA)

**Seuraava**: Kutsu beta-käyttäjiä ja aloita Phase 2! 🚀


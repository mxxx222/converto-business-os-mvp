# 🚀 VEROPILOT-AI Production Deploy Runbook

**Target**: docflow.fi  
**Estimated Time**: 15 minutes  
**Status**: Ready to deploy

---

## ✅ Pre-Deploy Checklist

- [x] Phase 1 MVP code complete
- [x] All tests passed locally
- [x] Git pushed to `docflow-main`
- [x] Deployment scripts ready
- [x] Documentation complete
- [ ] **Supabase project created**
- [ ] **OpenAI API key obtained**
- [ ] **Vercel project created**

---

## 🗄️ Step 1: Supabase Setup (5 min)

### 1.1 Create Project
```
URL: https://app.supabase.com/projects
Action: Click "New Project"

Settings:
- Name: veropilot-ai-prod
- Database Password: [GENERATE STRONG PASSWORD - SAVE IT!]
- Region: North Europe (eu-north-1)
- Pricing: Free tier

Click: "Create new project"
Wait: 2-3 minutes for provisioning
```

### 1.2 Get API Keys
```
URL: https://app.supabase.com/project/_/settings/api

Copy these values (SAVE SECURELY):
✅ Project URL → NEXT_PUBLIC_SUPABASE_URL
✅ anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ service_role → SUPABASE_SERVICE_ROLE_KEY (SECRET!)
```

### 1.3 Run SQL Migrations

**Option A: Supabase Dashboard (Recommended)**
```
URL: https://app.supabase.com/project/_/sql/new

For each migration file in order:
1. Open: supabase/migrations/20241114_001_documents_table.sql
2. Copy entire contents
3. Paste into SQL Editor
4. Click: "Run"
5. Verify: "Success" message

Repeat for:
- 20241114_002_vat_analysis_table.sql
- 20241114_003_storage_bucket.sql
- 20241114_004_functions.sql
```

**Option B: Supabase CLI**
```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

### 1.4 Verify Tables
```
URL: https://app.supabase.com/project/_/editor

Check these tables exist:
✅ documents
✅ vat_analysis
✅ document_processing_logs

URL: https://app.supabase.com/project/_/storage/buckets
Check bucket exists:
✅ documents (private)

URL: https://app.supabase.com/project/_/auth/policies
Check RLS policies exist:
✅ documents: 4 policies
✅ vat_analysis: 3 policies
✅ storage.objects: 3 policies
```

---

## 🔑 Step 2: OpenAI API Key (2 min)

### 2.1 Create API Key
```
URL: https://platform.openai.com/api-keys

Action:
1. Click: "Create new secret key"
2. Name: veropilot-ai-prod
3. Permissions: All (or "Model capabilities")
4. Click: "Create secret key"
5. COPY KEY IMMEDIATELY (shows only once!)
6. Save to: Password manager / secure location
```

### 2.2 Add Credits
```
URL: https://platform.openai.com/account/billing/overview

Action:
1. Click: "Add payment method"
2. Add credit card
3. Click: "Add to credit balance"
4. Amount: $50 (recommended for Phase 1)
5. Confirm
```

### 2.3 Set Spending Limit
```
URL: https://platform.openai.com/account/limits

Settings:
- Monthly budget: $100
- Email notifications: 50%, 80%, 100%
- Save
```

---

## 🚀 Step 3: Vercel Deployment (5 min)

### 3.1 Install Vercel CLI (if not installed)
```bash
npm install -g vercel
```

### 3.2 Login to Vercel
```bash
vercel login
# Follow browser instructions
```

### 3.3 Deploy Frontend
```bash
cd /Users/herbspotturku/docflow/docflow/frontend
vercel --prod
```

**Follow prompts:**
- Link to existing project? **No** (first time) or **Yes** (if exists)
- Project name: **veropilot-ai** or **docflow**
- Directory: **./frontend**
- Override settings? **No**

**Wait for deployment** (2-5 minutes)

**Copy deployment URL:**
```
✅ Production: https://docflow-xxxxxxxxx.vercel.app
```

---

## 🔧 Step 4: Configure Environment Variables (2 min)

### 4.1 Via Vercel Dashboard (Recommended)

```
URL: https://vercel.com/dashboard
Action: Select your project → Settings → Environment Variables
```

### 4.2 Add Each Variable

**For BOTH Production AND Preview environments:**

#### NEXT_PUBLIC_SUPABASE_URL
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-ref.supabase.co
Environments: ✅ Production ✅ Preview
```

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environments: ✅ Production ✅ Preview
```

#### SUPABASE_SERVICE_ROLE_KEY
```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environments: ✅ Production ✅ Preview
⚠️ SECRET - DO NOT SHARE!
```

#### OPENAI_API_KEY
```
Key: OPENAI_API_KEY
Value: sk-proj-...
Environments: ✅ Production ✅ Preview
⚠️ SECRET - DO NOT SHARE!
```

#### NEXT_PUBLIC_BACKEND_URL
```
Key: NEXT_PUBLIC_BACKEND_URL
Value: /api/v1
Environments: ✅ Production ✅ Preview
```

#### NEXT_PUBLIC_APP_URL
```
Key: NEXT_PUBLIC_APP_URL
Value: https://docflow.fi
Environments: ✅ Production
Value: https://preview-domain.vercel.app
Environments: ✅ Preview
```

#### NODE_ENV
```
Key: NODE_ENV
Value: production
Environments: ✅ Production
```

#### NEXTAUTH_URL (if using next-auth)
```
Key: NEXTAUTH_URL
Value: https://docflow.fi
Environments: ✅ Production
```

#### NEXTAUTH_SECRET (if using next-auth)
```
Key: NEXTAUTH_SECRET
Value: [Generate with: openssl rand -base64 32]
Environments: ✅ Production ✅ Preview
⚠️ SECRET - DO NOT SHARE!
```

### 4.3 Redeploy with Environment Variables
```bash
cd /Users/herbspotturku/docflow/docflow/frontend
vercel --prod
```

---

## 🌐 Step 5: Domain Setup - docflow.fi (1 min)

### 5.1 Add Domain to Vercel
```
URL: https://vercel.com/dashboard
Action: Select project → Domains → Add Domain

Domain: docflow.fi
Click: "Add"
```

### 5.2 Configure DNS (at your domain provider)

**A Record (Apex domain)**
```
Type: A
Name: @ (or leave blank)
Value: 76.76.21.21
TTL: 3600
```

**CNAME Record (WWW subdomain)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**Wait for DNS propagation** (5-60 minutes, sometimes up to 48h)

### 5.3 Verify Domain
```bash
# Check if domain resolves to Vercel
dig docflow.fi +short
# Should return: 76.76.21.21

# Check WWW CNAME
dig www.docflow.fi +short
# Should return: cname.vercel-dns.com
```

---

## ✅ Step 6: Verification (1 min)

### 6.1 Automated Verification
```bash
cd /Users/herbspotturku/docflow/docflow
./verify-deployment.sh
# Enter domain: docflow.fi
```

### 6.2 Manual Verification Commands

#### HSTS Header
```bash
curl -Ik https://docflow.fi | egrep -i "strict-transport-security|200"
```
**Expected:**
```
HTTP/2 200
strict-transport-security: max-age=31536000; includeSubDomains; preload
```

#### WWW → Apex Redirect
```bash
curl -Ik https://www.docflow.fi | egrep -i "301|location:"
```
**Expected:**
```
HTTP/2 301
location: https://docflow.fi/
```

#### robots.txt
```bash
curl -I https://docflow.fi/robots.txt
```
**Expected:**
```
HTTP/2 200
content-type: text/plain
```

#### sitemap.xml
```bash
curl -I https://docflow.fi/sitemap.xml
```
**Expected:**
```
HTTP/2 200
content-type: application/xml
```

#### API Health Check
```bash
curl https://docflow.fi/api/health
```
**Expected:**
```json
{"status":"healthy"}
```

#### All Tests at Once
```bash
curl -Ik https://docflow.fi | egrep -i "strict-transport-security|200" && \
curl -Ik https://www.docflow.fi | egrep -i "301|location:" && \
curl -I https://docflow.fi/robots.txt | grep "200" && \
curl -I https://docflow.fi/sitemap.xml | grep "200" && \
curl https://docflow.fi/api/health | grep "healthy"
```

---

## 🧪 Step 7: Functional Testing (5 min)

### 7.1 Sign Up Flow
```
1. Go to: https://docflow.fi
2. Click: "Aloita ilmaiseksi" or "Sign Up"
3. Enter: Email + Password
4. Click: "Rekisteröidy"
5. Check: Email for confirmation
6. Click: Confirmation link
7. Verify: Redirected to dashboard
```

### 7.2 Upload Receipt
```
1. Dashboard → "Lataa kuitti"
2. Select: Test receipt (jpg/png)
3. Click: "Lataa"
4. Verify: Status "Käsitellään..."
5. Wait: 5-10 seconds
6. Verify: Status "Valmis"
```

### 7.3 OCR Results
```
1. Click: Uploaded receipt
2. Verify visible:
   ✅ Vendor name
   ✅ Total amount
   ✅ VAT amount
   ✅ Receipt date
   ✅ Line items
   ✅ OCR confidence %
```

### 7.4 VAT Analysis
```
1. Same receipt view
2. Verify visible:
   ✅ Y-tunnus (if found)
   ✅ Company info (PRH)
   ✅ VAT breakdown per item
   ✅ Total deductible VAT
   ✅ Suggested booking code
   ✅ VAT confidence %
```

---

## 🐛 Troubleshooting

### Issue: Frontend 500 Error

**Symptoms:**
- Homepage shows 500 Internal Server Error
- Error mentions `next-auth`

**Solutions:**

1. **Add NEXTAUTH environment variables** (if using next-auth):
```bash
# In Vercel Dashboard → Environment Variables
NEXTAUTH_URL=https://docflow.fi
NEXTAUTH_SECRET=[generate with: openssl rand -base64 32]
```

2. **Remove next-auth** (if NOT using it):
```bash
cd frontend
npm uninstall next-auth
git commit -am "Remove unused next-auth dependency"
git push
vercel --prod
```

3. **Check App Router compatibility**:
```typescript
// frontend/app/api/auth/[...nextauth]/route.ts
// Ensure proper exports:
export { GET, POST } from './handler'
// No "edge" runtime if provider doesn't support it
```

4. **Update dependencies**:
```bash
cd frontend
npm update next next-auth
npm run build
vercel --prod
```

5. **Local verification**:
```bash
NEXTAUTH_URL=http://localhost:3000 NEXTAUTH_SECRET=devsecret npm run dev
# Test at http://localhost:3000
```

### Issue: "Unauthorized" Error

**Solutions:**
- Check Supabase RLS policies are active
- Verify user is logged in
- Check JWT token in browser devtools
- Verify `SUPABASE_SERVICE_ROLE_KEY` in Vercel

### Issue: OCR Not Processing

**Solutions:**
- Verify `OPENAI_API_KEY` is correct
- Check OpenAI account has credits
- Check Vercel function logs for errors
- Verify Supabase storage bucket exists

### Issue: Upload Fails

**Solutions:**
- Check Supabase storage bucket exists
- Verify RLS policies on `storage.objects`
- Check file size < 10MB
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set

### Issue: Slow Performance

**Solutions:**
- Check Vercel function region (should be arn1)
- Verify database indexes exist
- Monitor OpenAI API response time
- Check Supabase query performance

---

## 📊 Monitoring Setup

### Vercel Analytics
```
URL: https://vercel.com/dashboard → Your Project → Analytics
Action: Enable Web Analytics
Action: Enable Speed Insights
```

### Vercel Logs
```
URL: https://vercel.com/dashboard → Your Project → Logs
Action: Filter by "Errors only"
Action: Enable email notifications for errors
```

### Supabase Monitoring
```
URL: https://app.supabase.com/project/_/logs
Action: Enable Postgres logs
Action: Enable API logs
Action: Set retention to 7 days
```

### OpenAI Usage Tracking
```
URL: https://platform.openai.com/usage
Action: Monitor daily usage
Action: Set alerts at 80% of budget
```

---

## ✅ Deployment Complete Checklist

### Pre-Deployment
- [x] Code complete and tested
- [x] Git pushed to GitHub
- [x] Documentation ready

### Supabase
- [ ] Project created (North Europe)
- [ ] API keys copied
- [ ] 4 SQL migrations executed
- [ ] Tables verified (documents, vat_analysis)
- [ ] Storage bucket created
- [ ] RLS policies active

### OpenAI
- [ ] API key created
- [ ] Credits added ($50)
- [ ] Spending limit set ($100/month)

### Vercel
- [ ] CLI installed
- [ ] Logged in
- [ ] Frontend deployed
- [ ] All 9 env vars configured
- [ ] Domain added (docflow.fi)
- [ ] DNS configured

### Verification
- [ ] HSTS header verified
- [ ] WWW redirect verified
- [ ] robots.txt verified (200)
- [ ] sitemap.xml verified (200)
- [ ] API health check passing
- [ ] Sign up flow tested
- [ ] Receipt upload tested
- [ ] OCR results verified
- [ ] VAT analysis verified

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Vercel Logs monitored
- [ ] Supabase Logs enabled
- [ ] OpenAI Usage tracked

---

## 🎉 Success Criteria

**All checks must pass:**

✅ HTTPS working (200)  
✅ HSTS header present  
✅ WWW → apex redirect (301)  
✅ robots.txt accessible (200)  
✅ sitemap.xml accessible (200)  
✅ API health check passing  
✅ Sign up flow working  
✅ Receipt upload working  
✅ OCR processing working  
✅ VAT analysis working  

**When all pass:**
```
🎉 VEROPILOT-AI IS LIVE IN PRODUCTION! 🚀
```

---

## 📈 Expected Results

### Performance
- OCR processing: 3-5 seconds (gpt-4o-mini)
- OCR fallback: 8-12 seconds (gpt-4o)
- Accuracy: >90%
- Uptime: 99.9% (Vercel SLA)

### Costs (Month 1)
- Supabase: $0 (free tier)
- Vercel: $0 (free tier)
- OpenAI: ~$25 (1000 receipts)
- Domain: ~$1/month
- **Total: ~$26/month**

### Revenue Projections
- Month 1: 50 users × €19.90 = €995 MRR
- Month 2: 200 users × €24.90 = €4,980 MRR
- Month 3: 500 users × €29.90 = €14,950 MRR

---

## 📞 Support

**Documentation:**
- `DEPLOY_COPY_PASTE.md` - Step-by-step guide
- `DEPLOYMENT_CHECKLIST.md` - Full checklist
- `VEROPILOT_DEPLOYMENT_SUMMARY.md` - Complete summary

**Scripts:**
- `./deploy-veropilot.sh` - Automated deployment
- `./verify-deployment.sh` - Verification tests

**Monitoring:**
- Vercel: https://vercel.com/dashboard
- Supabase: https://app.supabase.com
- OpenAI: https://platform.openai.com/usage

---

**Version**: 1.0.0  
**Last Updated**: November 14, 2024  
**Status**: Production Runbook Ready  
**Deployment Time**: 15 minutes  
**ROI**: Live demo + payment flow same session


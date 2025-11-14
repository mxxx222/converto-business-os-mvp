# ⚡ VEROPILOT-AI Quick Deploy Guide

**Deploy in 15 minutes!** 🚀

## 📋 Prerequisites

You need:
- Supabase account (free tier OK)
- OpenAI API key with $10 credits
- Vercel account (free tier OK)
- GitHub account

---

## 🚀 Step 1: Supabase Setup (5 min)

### 1.1 Create Project

```bash
# Go to: https://app.supabase.com
# Click: "New Project"
# Name: veropilot-ai-prod
# Password: [generate strong password]
# Region: North Europe (eu-north-1)
# Wait 2-3 minutes for provisioning
```

### 1.2 Run Migrations

**Option A: Supabase Dashboard (Easiest)**

1. Go to https://app.supabase.com/project/_/sql/new
2. Copy-paste each file from `supabase/migrations/` in order:
   - `20241114_001_documents_table.sql`
   - `20241114_002_vat_analysis_table.sql`
   - `20241114_003_storage_bucket.sql`
   - `20241114_004_functions.sql`
3. Click "Run" for each

**Option B: Supabase CLI**

```bash
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

### 1.3 Get API Keys

```bash
# Go to: https://app.supabase.com/project/_/settings/api
# Copy:
# - Project URL → NEXT_PUBLIC_SUPABASE_URL
# - anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
# - service_role → SUPABASE_SERVICE_ROLE_KEY (keep secret!)
```

---

## 🔑 Step 2: OpenAI API Key (2 min)

```bash
# Go to: https://platform.openai.com/api-keys
# Click: "Create new secret key"
# Name: veropilot-ai-prod
# Copy: sk-proj-... → OPENAI_API_KEY

# Add credits:
# Go to: https://platform.openai.com/account/billing
# Add: $10 minimum (recommended $50 for production)
```

---

## 🚀 Step 3: Deploy to Vercel (5 min)

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 3.2 Deploy Frontend

```bash
cd frontend
vercel --prod
```

Follow prompts:
- Link to existing project? **No**
- Project name: **veropilot-ai**
- Directory: **./frontend**
- Override settings? **No**

### 3.3 Add Environment Variables

**Via Vercel Dashboard (Recommended):**

1. Go to https://vercel.com/dashboard
2. Select `veropilot-ai` project
3. Go to **Settings** → **Environment Variables**
4. Add these variables (for **Production**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (keep secret!)
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_BACKEND_URL=/api/v1
NEXT_PUBLIC_APP_URL=https://veropilot-ai.vercel.app
NODE_ENV=production
```

**Via CLI:**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste value and press Enter
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production
vercel env add NEXT_PUBLIC_BACKEND_URL production
# Value: /api/v1
```

### 3.4 Redeploy with Environment Variables

```bash
vercel --prod
```

---

## ✅ Step 4: Verify Deployment (3 min)

### 4.1 Check Health Endpoint

```bash
curl https://your-app.vercel.app/api/health
# Expected: {"status": "healthy"}
```

### 4.2 Test Full Flow

1. Go to https://your-app.vercel.app
2. Sign up for a new account
3. Verify email (check spam folder)
4. Login
5. Upload a receipt image
6. Wait 5-10 seconds
7. Verify OCR results and VAT analysis appear

---

## 🎉 Done!

Your VEROPILOT-AI MVP is now live! 🚀

**Next Steps:**

1. **Custom Domain** (Optional)
   - Go to Vercel Dashboard → Domains
   - Add `veropilot.fi`
   - Update DNS records

2. **Monitoring**
   - Enable Vercel Analytics
   - Check Supabase Logs
   - Monitor OpenAI Usage

3. **Phase 2 Features**
   - Enhanced VAT intelligence
   - Procountor integration
   - Mobile app
   - ML learning pipeline

---

## 🐛 Troubleshooting

### "Unauthorized" Error
- Check Supabase RLS policies
- Verify user is logged in
- Check JWT token expiration

### OCR Not Working
- Verify OpenAI API key is correct
- Check OpenAI account has credits
- Check Vercel function logs

### Upload Fails
- Check Supabase storage bucket exists
- Verify RLS policies on storage
- Check file size (max 10MB)

### Slow Performance
- Check Vercel function region (should be arn1)
- Verify database indexes exist
- Check OpenAI API response time

---

## 📞 Support

- **GitHub Issues**: https://github.com/your-repo/issues
- **Email**: support@veropilot.fi
- **Docs**: See `DEPLOYMENT_GUIDE_VEROPILOT.md`

---

**Deployment Time**: ~15 minutes
**Cost**: ~$0.10/user/month (Supabase free + OpenAI usage)
**Uptime**: 99.9% (Vercel SLA)

**Last Updated**: November 14, 2024


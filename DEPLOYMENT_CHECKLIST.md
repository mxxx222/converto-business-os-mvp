# 🚀 VEROPILOT-AI Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Supabase Setup
- [ ] Create Supabase project (Region: North Europe - eu-north-1)
- [ ] Copy Project URL and API keys
- [ ] Run database migrations (see instructions below)
- [ ] Verify `documents` and `vat_analysis` tables exist
- [ ] Verify `documents` storage bucket exists
- [ ] Test RLS policies (try accessing data from different user)

### 2. OpenAI API
- [ ] Create OpenAI API key
- [ ] Add credits to account (minimum $10 recommended for testing)
- [ ] Test API key with curl or Postman

### 3. Environment Variables
- [ ] Copy `.env.production.example` to `.env.local` for local testing
- [ ] Fill in all required values
- [ ] Verify no placeholder values remain

### 4. Code Quality
- [ ] All tests pass locally
- [ ] No linter errors
- [ ] No TypeScript errors in frontend
- [ ] Backend health check responds

### 5. Git & GitHub
- [ ] All changes committed
- [ ] Pushed to `docflow-main` branch
- [ ] No sensitive data in commits (API keys, passwords)

---

## 🗄️ Supabase Migration Instructions

### Option 1: Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push

# Verify
supabase db status
```

### Option 2: Manual SQL Execution

1. Go to https://app.supabase.com/project/_/sql/new
2. Copy and paste each migration file in order:
   - `supabase/migrations/20241114_001_documents_table.sql`
   - `supabase/migrations/20241114_002_vat_analysis_table.sql`
   - `supabase/migrations/20241114_003_storage_bucket.sql`
   - `supabase/migrations/20241114_004_functions.sql`
3. Click "Run" for each migration
4. Verify tables in Database → Tables

---

## 🚀 Vercel Deployment Instructions

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy Frontend

```bash
cd frontend
vercel --prod
```

### Step 4: Configure Environment Variables

```bash
# Set environment variables via Vercel dashboard or CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production
vercel env add NEXT_PUBLIC_BACKEND_URL production
```

Or via Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable from `.env.production.example`

### Step 5: Deploy Backend (Vercel Serverless)

The backend API routes are already configured as Vercel serverless functions in:
- `frontend/app/api/documents/upload/route.ts`
- `frontend/app/api/documents/[id]/route.ts`
- `frontend/app/api/documents/[id]/status/route.ts`
- `frontend/app/api/documents/list/route.ts`
- `frontend/app/api/documents/stats/route.ts`

These will be deployed automatically with the frontend.

### Step 6: Verify Deployment

```bash
# Test health endpoint
curl https://your-app.vercel.app/api/health

# Test document upload (requires authentication)
# Use the web UI to test full flow
```

---

## 🧪 Post-Deployment Testing

### 1. Authentication Flow
- [ ] Sign up new user
- [ ] Verify email confirmation
- [ ] Login with credentials
- [ ] Test password reset

### 2. Document Upload Flow
- [ ] Upload a receipt image
- [ ] Verify status changes to "processing"
- [ ] Wait for OCR completion
- [ ] Verify status changes to "completed"
- [ ] Check extracted data accuracy

### 3. VAT Analysis
- [ ] Verify Y-tunnus validation works
- [ ] Check PRH company lookup
- [ ] Verify VAT calculations
- [ ] Test suggested booking codes

### 4. Performance
- [ ] Page load time < 2 seconds
- [ ] OCR processing time < 10 seconds (gpt-4o-mini)
- [ ] No console errors in browser
- [ ] No 500 errors in Vercel logs

### 5. Security
- [ ] RLS policies prevent cross-user data access
- [ ] API routes require authentication
- [ ] Storage bucket is private
- [ ] No API keys exposed in client-side code

---

## 📊 Monitoring Setup

### Vercel Analytics
1. Go to Vercel Dashboard → Your Project → Analytics
2. Enable Web Analytics
3. Monitor page views, performance, and errors

### Supabase Logs
1. Go to Supabase Dashboard → Logs
2. Monitor database queries
3. Check for slow queries or errors

### OpenAI Usage
1. Go to https://platform.openai.com/usage
2. Monitor API usage and costs
3. Set up billing alerts

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" errors
- **Solution**: Check Supabase RLS policies, verify JWT token

### Issue: OCR not processing
- **Solution**: Check OpenAI API key, verify credits, check Vercel logs

### Issue: Storage upload fails
- **Solution**: Check storage bucket policies, verify file size limits

### Issue: Slow performance
- **Solution**: Check database indexes, enable caching, optimize images

---

## 🎉 Launch Checklist

- [ ] All tests pass
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Monitoring enabled
- [ ] Documentation complete
- [ ] Domain configured (optional)
- [ ] SSL certificate active
- [ ] Backup strategy in place
- [ ] Support email configured

---

## 📈 Next Steps (Phase 2)

After successful Phase 1 deployment:

1. **Enhanced VAT Intelligence** (Week 5-6)
   - Item-level classification
   - Accounting code suggestions
   - Multi-VAT rate handling

2. **YTJ Official API** (Week 6)
   - Replace PRH with official YTJ
   - Enhanced company data

3. **Procountor Integration** (Week 7-8)
   - Automatic receipt export
   - Two-way sync

4. **Mobile App** (Week 7-8)
   - React Native Expo app
   - Camera capture
   - Real-time OCR

5. **Learning Pipeline** (Week 9-10)
   - ML model training
   - User correction feedback
   - Continuous improvement

---

## 🆘 Support

For issues or questions:
- GitHub Issues: https://github.com/your-repo/issues
- Email: support@veropilot.fi
- Documentation: https://docs.veropilot.fi

---

**Last Updated**: November 14, 2024
**Version**: 1.0.0 (Phase 1 MVP)


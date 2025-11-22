# Vercel Deployment Guide for OCR Pipeline

This guide walks you through deploying the DocFlow dashboard with OCR pipeline to Vercel.

## Prerequisites

- Vercel account connected to your GitHub repository
- All environment variables ready
- Supabase Storage bucket `documents` created
- Supabase RLS policies configured

---

## Step 1: Environment Variables Setup

### Required Environment Variables

Add these in **Vercel Dashboard → Project Settings → Environment Variables**:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...                    # Your OpenAI API key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...      # Server-side only

# App URL (Vercel will auto-set this, but verify)
NEXT_PUBLIC_APP_URL=https://dashboard-xxx.vercel.app

# Optional: Sentry (if using)
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### How to Add Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (or create new project)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key**: Variable name (e.g., `OPENAI_API_KEY`)
   - **Value**: Variable value
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

### Verify Environment Variables

After deployment, verify variables are loaded:
- Check build logs for any missing variable warnings
- Test API endpoints to ensure they work

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to dashboard directory
cd apps/dashboard

# Deploy to production
vercel --prod
```

### Option B: Deploy via GitHub (Auto-deploy)

1. **Connect Repository** (if not already connected):
   - Vercel Dashboard → **Add New Project**
   - Import your GitHub repository
   - Select `apps/dashboard` as root directory

2. **Configure Build Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/dashboard`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

3. **Deploy**:
   - Push to `main` branch (auto-deploys)
   - Or manually trigger from Vercel Dashboard

---

## Step 3: Verify Deployment

### 3.1 Check Build Status

1. Go to Vercel Dashboard → **Deployments**
2. Verify latest deployment shows **Ready** status
3. Check build logs for any errors

### 3.2 Test Production URL

1. Open production URL: `https://dashboard-xxx.vercel.app`
2. Navigate to `/test` page
3. Verify page loads correctly

### 3.3 Test OCR Pipeline

1. **Upload Test**:
   - Go to `https://dashboard-xxx.vercel.app/test`
   - Upload a test receipt image
   - Verify upload succeeds

2. **Processing Test**:
   - Wait for processing to complete
   - Verify OCR results display correctly

3. **API Test**:
   ```bash
   # Test upload endpoint
   curl -X POST https://dashboard-xxx.vercel.app/api/documents/upload \
     -F "file=@receipt.jpg" \
     -F "userId=test-user"
   ```

### 3.4 Check Logs

1. Vercel Dashboard → **Deployments** → Select deployment
2. Click **Functions** tab
3. Check for any runtime errors

---

## Step 4: Post-Deployment Checklist

- [ ] Environment variables configured correctly
- [ ] Production build successful
- [ ] `/test` page accessible
- [ ] File upload works
- [ ] OCR processing completes
- [ ] Results display correctly
- [ ] No errors in Vercel logs
- [ ] Supabase Storage accessible
- [ ] OpenAI API calls working

---

## Troubleshooting

### Build Fails

**Issue**: Build fails with missing dependencies
- **Solution**: Ensure `package.json` includes `openai` package
- Run `npm install` locally to verify

**Issue**: Build fails with TypeScript errors
- **Solution**: Run `npm run type-check` locally
- Fix any TypeScript errors before deploying

### Runtime Errors

**Issue**: "OPENAI_API_KEY not configured"
- **Solution**: Verify environment variable is set in Vercel
- Check variable name matches exactly (case-sensitive)
- Redeploy after adding variable

**Issue**: "Failed to upload file"
- **Solution**: 
  - Verify `SUPABASE_SERVICE_ROLE_KEY` is set
  - Check Supabase Storage bucket `documents` exists
  - Verify RLS policies are configured

**Issue**: "Document not found"
- **Solution**: 
  - Check Supabase `documents` table exists
  - Verify table schema matches expected structure
  - Check RLS policies allow service role access

### API Endpoints Not Working

**Issue**: 404 on API routes
- **Solution**: 
  - Verify Next.js App Router structure
  - Check route files are in `app/api/` directory
  - Ensure files are named `route.ts`

**Issue**: CORS errors
- **Solution**: 
  - Vercel handles CORS automatically for API routes
  - Check if error is from external domain (may need CORS headers)

---

## Monitoring

### Vercel Analytics

1. Enable Vercel Analytics in project settings
2. Monitor:
   - Page views
   - API endpoint usage
   - Error rates

### Function Logs

1. Vercel Dashboard → **Deployments** → **Functions**
2. Monitor:
   - Function execution time
   - Error rates
   - Memory usage

### External Monitoring

Consider setting up:
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry (already configured)
- **Performance**: Vercel Analytics

---

## Rollback Plan

If deployment has issues:

1. **Quick Rollback**:
   - Vercel Dashboard → **Deployments**
   - Find previous working deployment
   - Click **⋯** → **Promote to Production**

2. **Fix and Redeploy**:
   - Fix issues locally
   - Test thoroughly
   - Redeploy to production

---

## Next Steps

After successful deployment:

1. ✅ Test with real receipts
2. ✅ Share demo URL with prospects
3. ✅ Monitor usage and errors
4. ✅ Collect feedback
5. ✅ Iterate based on real-world usage

---

## Support

If you encounter issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Check build logs in Vercel Dashboard
3. Review function logs for runtime errors
4. Test locally to isolate issues

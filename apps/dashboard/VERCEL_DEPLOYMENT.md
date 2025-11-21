# Vercel Deployment Guide for DocFlow Dashboard

This guide explains how to deploy the DocFlow Admin Dashboard to Vercel with all required environment variables.

## Prerequisites

1. Vercel account (sign up at https://vercel.com)
2. Supabase project with tables and RLS policies configured
3. Supabase API keys (URL, Anon Key, Service Role Key)

## Step 1: Create Vercel Project

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Navigate to dashboard directory:
   ```bash
   cd apps/dashboard
   ```

3. Link to Vercel project:
   ```bash
   vercel link
   ```

   Or create a new project via Vercel Dashboard:
   - Go to https://vercel.com/new
   - Import your Git repository
   - Set root directory to `apps/dashboard`

## Step 2: Configure Environment Variables

Add the following environment variables in Vercel Dashboard:

### Required Environment Variables

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: Your Supabase project URL
   - Example: `https://foejjbrcudpvuwdisnpz.supabase.co`
   - Scope: Production, Preview, Development
   - Note: Must be prefixed with `NEXT_PUBLIC_` to be available in browser

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: Your Supabase anon/public key
   - Example: `sb_publishable_r5h9a67JPdv_wGbSsYLQow_FHznio6w`
   - Scope: Production, Preview, Development
   - Note: Safe to expose in browser (protected by RLS)

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: Your Supabase service role key (secret)
   - Example: `sb_secret_FiceWb9D3W3JeIZii1Rcmw_OXKQqZrB`
   - Scope: Production, Preview, Development
   - Note: **NEVER expose to client** - server-side only

### Optional Environment Variables

4. **NEXT_PUBLIC_SENTRY_DSN** (if using Sentry)
   - Value: Your Sentry DSN
   - Example: `https://05d83543fe122b7a6a232d6e8194321b@o4510201257787392.ingest.de.sentry.io/4510398360518736`
   - Scope: Production, Preview

5. **NEXT_PUBLIC_ENV**
   - Value: `production` (for production deployments)
   - Scope: Production

6. **NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE**
   - Value: `0.1` (10% sampling rate)
   - Scope: Production

## Step 3: Add Environment Variables in Vercel

### Via Vercel Dashboard:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - Click **Add New**
   - Enter variable name
   - Enter variable value
   - Select environments (Production, Preview, Development)
   - Click **Save**

### Via Vercel CLI:

```bash
# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# For preview/development environments
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
```

## Step 4: Deploy

### Automatic Deployment (via Git):

1. Push to your main branch
2. Vercel will automatically deploy

### Manual Deployment:

```bash
cd apps/dashboard
vercel --prod
```

## Step 5: Verify Deployment

1. Check deployment logs in Vercel Dashboard
2. Visit your deployment URL
3. Verify:
   - Dashboard loads correctly
   - Connection status shows "Live"
   - Documents load from Supabase
   - Real-time updates work

## Troubleshooting

### Build Errors

- **Missing environment variables**: Ensure all required variables are set
- **TypeScript errors**: Check `next.config.js` - `ignoreBuildErrors` is set to `true` for known issues

### Runtime Errors

- **"Failed to fetch"**: Check Supabase URL and keys are correct
- **RLS errors**: Verify RLS policies are configured in Supabase
- **CORS errors**: Check Supabase CORS settings

### Environment Variable Issues

- Variables prefixed with `NEXT_PUBLIC_` are available in browser
- Variables without `NEXT_PUBLIC_` are server-side only
- After adding variables, redeploy the application

## Security Notes

1. **Never commit** `.env.local` or `.env` files to Git
2. **Service Role Key** should only be used server-side
3. Use **RLS policies** in Supabase to protect data
4. **Anon Key** is safe to expose (protected by RLS)

## Next Steps

After successful deployment:
1. Configure custom domain (optional)
2. Set up monitoring and alerts
3. Configure CI/CD pipeline
4. Set up staging environment


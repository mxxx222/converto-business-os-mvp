# Vercel Deployment Quick Start Guide

**Quick Reference:** Step-by-step commands for deploying to Vercel with domain redirection

**Full Documentation:** See [`VERCEL_DEPLOYMENT_CHECKLIST.md`](VERCEL_DEPLOYMENT_CHECKLIST.md) for detailed instructions

---

## Overview

**What's Already Done:**
- ✅ Redirect logic configured in [`next.config.mjs`](next.config.mjs:15-30)
- ✅ converto.fi → docflow.fi redirect with path preservation
- ✅ www.converto.fi → docflow.fi redirect

**What You Need to Do:**
1. Authenticate with Vercel (browser required)
2. Deploy the application
3. Configure DNS records
4. Set environment variables
5. Verify redirects and functionality

---

## 🚀 Quick Deployment (5 Steps)

### Step 1: Login & Link (2 minutes)

```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login (opens browser)
vercel login

# Navigate to frontend directory and link project
cd frontend
vercel link
```

### Step 2: Deploy to Production (5 minutes)

```bash
# Deploy from frontend directory
vercel --prod

# Save the deployment URL that's returned
# Format: https://converto-frontend-xxx.vercel.app
```

### Step 3: Add Domains (5 minutes)

```bash
# Add all four domains
vercel domains add docflow.fi
vercel domains add www.docflow.fi
vercel domains add converto.fi
vercel domains add www.converto.fi

# Verify each domain (follow on-screen instructions)
vercel domains verify docflow.fi
vercel domains verify www.docflow.fi
vercel domains verify converto.fi
vercel domains verify www.converto.fi

# Set primary alias
vercel alias YOUR-DEPLOYMENT-URL.vercel.app docflow.fi
```

### Step 4: Configure DNS (10-60 minutes for propagation)

**At your DNS provider (Cloudflare, Namecheap, etc.), add these records:**

**For docflow.fi:**
```
Type: A, Name: @, Value: 76.76.21.21
Type: CNAME, Name: www, Value: cname.vercel-dns.com
```

**For converto.fi:**
```
Type: A, Name: @, Value: 76.76.21.21
Type: CNAME, Name: www, Value: cname.vercel-dns.com
```

**Verify DNS:**
```bash
dig docflow.fi +short
dig converto.fi +short
# Both should return: 76.76.21.21
```

### Step 5: Set Environment Variables (5 minutes)

**Option A: Via CLI**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter: https://xxxxx.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Enter: https://xxx@xxx.ingest.sentry.io/xxx

vercel env add NEXT_PUBLIC_API_BASE production
# Enter: https://api.converto.fi

# Redeploy to apply variables
vercel --prod
```

**Option B: Via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project → Settings → Environment Variables
3. Add all required variables for Production environment
4. Redeploy from dashboard

---

## ✅ Verification Commands

**Test domains are live:**
```bash
curl -I https://docflow.fi
# Expected: HTTP/2 200 OK

curl -I https://www.docflow.fi
# Expected: HTTP/2 200 OK
```

**Test redirect works:**
```bash
curl -L -I https://converto.fi
# Expected: HTTP/2 301, Location: https://docflow.fi

curl -L -I https://www.converto.fi
# Expected: HTTP/2 301, Location: https://docflow.fi
```

**Test path preservation:**
```bash
curl -L -I https://converto.fi/dashboard
# Expected redirect to: https://docflow.fi/dashboard

curl -L -I https://converto.fi/api/test
# Expected redirect to: https://docflow.fi/api/test
```

**Test API connectivity:**
```bash
# Test frontend loads
curl https://docflow.fi | head -n 20

# Test API connection (if backend deployed)
curl https://api.converto.fi/health
```

---

## 📋 Required Environment Variables

### Essential (Required)
- `NEXT_PUBLIC_SUPABASE_URL` - Get from Supabase Dashboard
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Get from Supabase Dashboard → Settings → API → anon public
- `NEXT_PUBLIC_API_BASE` - Your backend URL (e.g., https://api.converto.fi)
- `NEXT_PUBLIC_SENTRY_DSN` - Get from Sentry Dashboard

### Recommended
- `NEXT_PUBLIC_STATIC_EXPORT=false` - Enable SSR
- `NEXT_PUBLIC_I18N_ENABLED=true` - Enable Finnish/English
- `NEXT_PUBLIC_THEME=neotech` - UI theme

### Optional
- `NEXT_PUBLIC_GA4_ID` - Google Analytics
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` - Plausible Analytics
- Analytics and monitoring variables

**Get your keys from:**
- Supabase: https://app.supabase.com → Project → Settings → API
- Sentry: https://sentry.io → Settings → Projects → Client Keys (DSN)

---

## 🔧 Common Operations

**View deployments:**
```bash
vercel ls
```

**View logs:**
```bash
vercel logs --follow
```

**Rollback to previous deployment:**
```bash
vercel ls  # Find previous working deployment
vercel alias PREVIOUS-DEPLOYMENT-URL.vercel.app docflow.fi
```

**Update environment variable:**
```bash
vercel env add VARIABLE_NAME production
# Enter new value
vercel --prod  # Redeploy
```

**Check domain status:**
```bash
vercel domains ls
```

---

## 🐛 Quick Troubleshooting

### Domain not verified?
```bash
# Check DNS records
dig _vercel.docflow.fi TXT +short

# Retry verification
vercel domains verify docflow.fi
```

### DNS not propagating?
```bash
# Check with Google DNS
dig docflow.fi @8.8.8.8 +short

# Clear local DNS cache (macOS)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Wait 5-60 minutes for full propagation
```

### Environment variables not working?
```bash
# List current variables
vercel env ls

# Trigger new deployment
vercel --prod
```

### Redirect not working?
```bash
# Verify latest code is deployed
vercel inspect YOUR-DEPLOYMENT-URL

# Force redeploy
vercel --prod --force

# Clear browser cache and test
```

### Build failing?
```bash
# View build logs
vercel logs YOUR-DEPLOYMENT-URL

# Test build locally
cd frontend
npm run build

# Common fixes:
# 1. Update dependencies: npm install
# 2. Check Node version: node --version (should be >=18)
# 3. Clear cache: vercel --force
```

---

## 📊 Post-Deployment Checklist

- [ ] All four domains respond correctly
- [ ] SSL certificates active (https works)
- [ ] converto.fi redirects to docflow.fi
- [ ] Path preservation works in redirects
- [ ] Environment variables applied
- [ ] API connectivity verified
- [ ] Mobile responsive (test on phone)
- [ ] Browser console has no errors (F12)
- [ ] Performance acceptable (< 2s load time)
- [ ] Analytics tracking working (if enabled)

---

## 📚 Documentation

- **Full Deployment Guide:** [`VERCEL_DEPLOYMENT_CHECKLIST.md`](VERCEL_DEPLOYMENT_CHECKLIST.md)
- **Next.js Config:** [`next.config.mjs`](next.config.mjs)
- **Domain Setup Guide:** [`docs/domain-binding-and-dns.md`](docs/domain-binding-and-dns.md)
- **Environment Variables:** [`docs/API_KEYS_INVENTORY.md`](docs/API_KEYS_INVENTORY.md)

---

## 🎯 Next Steps After Deployment

1. **Test thoroughly** - Check all pages and functionality
2. **Monitor errors** - Check Sentry dashboard
3. **Set up alerts** - Configure Vercel/Sentry notifications
4. **Document** - Update team documentation with production URLs
5. **Backup** - Save deployment configuration for reference
6. **Plan updates** - Create process for future deployments

---

## ⚡ One-Line Commands Reference

```bash
# Complete deployment flow
vercel login && cd frontend && vercel link && vercel --prod

# Add all domains
vercel domains add docflow.fi && vercel domains add www.docflow.fi && vercel domains add converto.fi && vercel domains add www.converto.fi

# Quick verification
curl -I https://docflow.fi && curl -L -I https://converto.fi

# View status
vercel ls && vercel domains ls

# Emergency rollback
vercel ls && vercel alias PREVIOUS-URL.vercel.app docflow.fi
```

---

## 🆘 Need Help?

1. **Full details:** See [`VERCEL_DEPLOYMENT_CHECKLIST.md`](VERCEL_DEPLOYMENT_CHECKLIST.md)
2. **Troubleshooting:** Sections 10-11 in full checklist
3. **Vercel docs:** https://vercel.com/docs
4. **Vercel support:** https://vercel.com/support
5. **Check status:** https://vercel-status.com

---

**Estimated Time:** 30-90 minutes total
- Setup & Deploy: 15 minutes
- DNS Propagation: 10-60 minutes  
- Testing & Verification: 15 minutes

**Prerequisites:** Vercel account, domain registrar access, API keys ready

**Status:** Ready to deploy - follow Step 1-5 above
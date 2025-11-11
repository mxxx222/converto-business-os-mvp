# 🚀 Render Deployment - Step-by-Step Guide

## Pre-Deployment

### ✅ Run Pre-Deploy Check

```bash
./scripts/pre_deploy_check.sh
```

**Expected:** All checks pass (green ✓)

If any failures (red ✗), fix them before proceeding.

---

## Render Deployment

### **Step 1: Create Render Account**

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### **Step 2: Create New Blueprint**

1. Click **"New"** → **"Blueprint"**
2. Select repository: `converto-business-os-quantum-mvp-1`
3. Render automatically detects `render.yaml`
4. Click **"Apply"**

### **Step 3: Configure Environment Secrets**

Render will create 3 services:
- `converto-api` (backend)
- `converto-frontend` (frontend)
- `converto-db` (PostgreSQL)

**For `converto-api`, add these secrets:**

1. Go to **converto-api** → **Environment**
2. Click **"Add Environment Variable"**
3. Add each secret:

```env
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
SENTRY_DSN=https://YOUR_SENTRY_DSN
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
RESEND_API_KEY=re_YOUR_KEY
```

**Optional (if using integrations):**
```env
NOTION_API_KEY=secret_YOUR_KEY
WA_META_TOKEN=EAAG_YOUR_TOKEN
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR_WEBHOOK
```

4. Click **"Save Changes"**

**For `converto-frontend`, add:**

```env
NEXT_PUBLIC_SENTRY_DSN=https://YOUR_FRONTEND_SENTRY_DSN
```

### **Step 4: Trigger First Deploy**

1. Click **"Manual Deploy"** on both services
2. Wait 5-10 minutes for build
3. Check logs for errors

### **Step 5: Run Database Migration**

1. Go to **converto-api** → **Shell**
2. Run:
```bash
python -m alembic upgrade head
python scripts/seed_demo.py  # Optional demo data
```

### **Step 6: Test Deployment**

**Backend:**
```bash
curl https://converto-api.onrender.com/health
# Should return: {"status": "healthy"}

curl https://converto-api.onrender.com/docs
# Should show API documentation
```

**Frontend:**
```bash
# Open in browser
https://converto-frontend.onrender.com

# Should show dashboard
```

### **Step 7: Configure Custom Domain**

**Backend API:**
1. Go to **converto-api** → **Settings** → **Custom Domain**
2. Add: `api.converto.fi`
3. Update DNS:
   ```
   Type: CNAME
   Name: api
   Value: converto-api.onrender.com
   ```

**Frontend:**
1. Go to **converto-frontend** → **Settings** → **Custom Domain**
2. Add: `app.converto.fi`
3. Update DNS:
   ```
   Type: CNAME
   Name: app
   Value: converto-frontend.onrender.com
   ```

4. Wait 5-10 minutes for SSL certificate

### **Step 8: Update Frontend API URL**

1. Go to **converto-frontend** → **Environment**
2. Update:
```env
NEXT_PUBLIC_API_BASE=https://api.converto.fi
```
3. Click **"Save Changes"** (triggers redeploy)

### **Step 9: Test Production URLs**

```bash
# Backend
curl https://api.converto.fi/health

# Frontend
open https://app.converto.fi
```

### **Step 10: Configure Stripe Webhook**

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. URL: `https://api.converto.fi/api/v1/billing/webhook`
4. Events: Select all `checkout.*` and `invoice.*`
5. Copy webhook secret → Add to Render env vars

### **Step 11: Test End-to-End**

1. Open https://app.converto.fi
2. Sign up with magic link
3. Scan a receipt
4. Check VAT calculation
5. Test billing flow
6. Verify all features work

---

## Post-Deployment

### **Monitor First 24 Hours**

**Check every hour:**
- [ ] Render logs (no errors)
- [ ] Sentry (no exceptions)
- [ ] API response times (<500ms)
- [ ] Database connections stable
- [ ] SSL certificates valid
- [ ] Custom domains working

### **Set Up Monitoring Alerts**

**Sentry:**
- Alert on error rate >1%
- Alert on response time >2s
- Email: your-email@domain.com

**Render:**
- Enable email notifications
- Set up Slack integration (optional)

### **Create Status Page**

Use https://status.io or https://statuspage.io

**Monitor:**
- API uptime
- Frontend uptime
- Database uptime
- Response times

---

## Scaling

### **When to Upgrade:**

**Free Tier Limits:**
- 750 hours/month (enough for 1 service)
- Cold starts after 15min inactivity
- 512MB RAM

**Upgrade to Starter ($7/mo) when:**
- [ ] >100 daily active users
- [ ] Cold starts annoying users
- [ ] Need more RAM (1GB)

**Upgrade to Standard ($25/mo) when:**
- [ ] >1000 daily active users
- [ ] Need autoscaling
- [ ] Need 2GB+ RAM

### **Database Scaling:**

**Free Tier:**
- 256MB storage
- Good for 1000-5000 receipts

**Upgrade to Starter ($7/mo):**
- 1GB storage
- Good for 50,000 receipts

---

## Troubleshooting

### **Build Fails**

**Check logs:**
```bash
# In Render dashboard → Logs
# Look for:
# - Missing dependencies
# - Python version mismatch
# - Import errors
```

**Common fixes:**
```bash
# Add missing package to requirements.txt
pip freeze > requirements.txt
git commit -am "fix: Add missing dependency"
git push
```

### **Database Connection Fails**

**Check:**
- [ ] DATABASE_URL env var set
- [ ] Database service running
- [ ] Network connectivity

**Fix:**
```python
# Ensure using Render's DATABASE_URL
import os
DATABASE_URL = os.getenv("DATABASE_URL")
```

### **Frontend Can't Reach API**

**Check:**
- [ ] NEXT_PUBLIC_API_BASE correct
- [ ] CORS configured in backend
- [ ] API service running

**Fix:**
```python
# app/main.py - Add frontend URL to CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://converto-frontend.onrender.com",
        "https://app.converto.fi"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Rollback

If critical issue:

1. **Render Dashboard** → **Manual Deploy**
2. Select previous successful deploy
3. Click **"Deploy"**
4. Notify users via email/Slack

---

## Success Checklist

- [ ] All services deployed (green status)
- [ ] Health checks passing
- [ ] Custom domains configured
- [ ] SSL certificates active
- [ ] Database migrated
- [ ] Seed data loaded (optional)
- [ ] Environment secrets set
- [ ] Stripe webhook configured
- [ ] Monitoring alerts set
- [ ] Status page created
- [ ] Team notified
- [ ] Users can sign up
- [ ] Users can scan receipts
- [ ] Users can view reports
- [ ] Billing flow works
- [ ] No critical errors in 24h

---

## 🎉 Launch Announcement

Once everything is stable:

1. **Email beta users:**
   ```
   Subject: 🚀 Converto™ 2.0 is Live!

   We're excited to announce that Converto™ Business OS 2.0
   is now live and ready for you to use!

   Login: https://app.converto.fi

   New features:
   - Self-learning AI (gets smarter over time)
   - 100% local option (GDPR-compliant)
   - Mobile apps (iOS + Android)
   - Command Palette (⌘K shortcuts)

   Questions? Reply to this email or book a demo:
   https://calendly.com/converto-demo

   Kiitos!
   Converto Team
   ```

2. **Instagram post:**
   (Use prepared content from INSTAGRAM_SETUP.md)

3. **LinkedIn announcement**

4. **Update website**

---

**🚀 Congratulations - You're Live!**

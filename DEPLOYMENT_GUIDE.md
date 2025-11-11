# 🚀 Converto 2.0 - Complete Deployment Guide

Step-by-step guide for deploying Converto Business OS to production.

---

## 📋 Pre-Deployment Checklist

Run automated checklist:
```bash
./scripts/deploy_checklist.sh
```

All checks must pass before deployment.

---

## 🌐 Option 1: Render Deployment (Recommended)

### Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Connect your repository

### Step 2: Create Services

#### A. PostgreSQL Database
1. Dashboard → New → PostgreSQL
2. Name: `converto-db`
3. Plan: Starter ($7/mo) or Free
4. Region: Frankfurt (EU)
5. Create Database
6. **Save** `Internal Database URL` for later

#### B. Backend Service
1. Dashboard → New → Web Service
2. Connect: `converto-business-os-quantum-mvp-1`
3. Name: `converto-backend`
4. Region: Frankfurt
5. Branch: `main`
6. Build Command: `pip install -r requirements.txt`
7. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
8. Plan: Starter ($7/mo) or Free
9. Add environment variables (see below)
10. Create Web Service

#### C. Frontend Service
1. Dashboard → New → Static Site
2. Connect: Same repository
3. Name: `converto-frontend`
4. Region: Frankfurt
5. Branch: `main`
6. Build Command: `cd frontend && npm install && npm run build`
7. Publish Directory: `frontend/out`
8. Add environment variables:
   - `NEXT_PUBLIC_API_BASE=https://converto-backend.onrender.com`
9. Create Static Site

### Step 3: Configure Backend Environment Variables

**Critical:**
```bash
DATABASE_URL=<from PostgreSQL service>
JWT_SECRET=<generate random 32+ chars>
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
ENVIRONMENT=production
FRONTEND_URL=https://converto-frontend.onrender.com
```

**Optional but Recommended:**
```bash
SENTRY_DSN=https://...@sentry.io/...
RESEND_API_KEY=re_...
NOTION_API_KEY=secret_...
WA_PROVIDER=meta
WA_META_TOKEN=...
SLACK_WEBHOOK_URL=...
```

**Feature Flags:**
```bash
FEATURES_GAMIFY=1
FEATURES_LEGAL_SYNC=1
FEATURES_REMINDERS=1
```

### Step 4: Custom Domains

#### Backend API
1. Render → converto-backend → Settings → Custom Domain
2. Add: `api.converto.fi`
3. Add DNS records:
   ```
   Type: CNAME
   Name: api
   Value: converto-backend.onrender.com
   ```

#### Frontend
1. Render → converto-frontend → Settings → Custom Domain
2. Add: `app.converto.fi`
3. Add DNS records:
   ```
   Type: CNAME
   Name: app
   Value: converto-frontend.onrender.com
   ```

### Step 5: Database Migrations

```bash
# In Render Shell or locally with DATABASE_URL
render run alembic upgrade head
```

### Step 6: Seed Demo Data (Optional)

```bash
render run python scripts/seed_demo_data.py
```

### Step 7: Verify Deployment

```bash
# Backend health
curl https://api.converto.fi/health

# Frontend
curl https://app.converto.fi

# API test
curl https://api.converto.fi/api/v1/pricing/tiers
```

---

## 🐳 Option 2: Docker Deployment

### Build Images

```bash
# Backend
docker build -t converto-backend .

# Frontend
cd frontend
docker build -t converto-frontend .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

### Environment Variables

Create `.env` in project root with all variables.

---

## ☁️ Option 3: Manual VPS Deployment

### Requirements
- Ubuntu 22.04 LTS
- 2GB RAM minimum
- 20GB storage
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Nginx

### Setup Script

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3-pip python3-venv postgresql nginx certbot

# Clone repository
git clone https://github.com/mxxx222/converto-business-os-quantum-mvp-1.git
cd converto-business-os-quantum-mvp-1

# Setup backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Setup frontend
cd frontend
npm install
npm run build
cd ..

# Setup PostgreSQL
sudo -u postgres createdb converto
sudo -u postgres createuser converto -P

# Setup systemd services
sudo cp deploy/systemd/converto-backend.service /etc/systemd/system/
sudo cp deploy/systemd/converto-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable converto-backend converto-frontend
sudo systemctl start converto-backend converto-frontend

# Setup Nginx
sudo cp deploy/nginx/converto.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/converto.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL
sudo certbot --nginx -d api.converto.fi -d app.converto.fi
```

---

## 🔐 Security Checklist

Before going live:

- [ ] HTTPS enabled (SSL certificates)
- [ ] Environment variables in secure storage (not in code)
- [ ] JWT_SECRET is random and strong (32+ chars)
- [ ] Database password is strong
- [ ] Stripe webhook signature verification enabled
- [ ] CORS configured for production domains only
- [ ] Rate limiting enabled
- [ ] Security headers configured (HSTS, CSP, X-Frame-Options)
- [ ] `.env` not in Git
- [ ] API keys rotated from development
- [ ] Admin endpoints protected

---

## 📊 Post-Deployment Verification

### 1. Health Checks
```bash
# Backend
curl https://api.converto.fi/health
# Expected: {"status": "ok", ...}

# Frontend
curl https://app.converto.fi
# Expected: 200 OK

# Database
curl https://api.converto.fi/api/v1/pricing/tiers
# Expected: JSON with pricing data
```

### 2. Authentication
```bash
# Test magic link
curl -X POST https://api.converto.fi/api/v1/auth/magic/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@converto.fi"}'
# Expected: {"email_sent": true, ...}
```

### 3. Integrations
```bash
# Notion
curl -X POST https://api.converto.fi/api/v1/reminders/test/notion
# Expected: {"status": "ok", ...}

# WhatsApp
curl -X POST https://api.converto.fi/api/v1/reminders/test/whatsapp
# Expected: {"status": "ok", ...}
```

### 4. Stripe Webhook
```bash
# Test webhook endpoint
curl -X POST https://api.converto.fi/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type": "ping"}'
# Should not error
```

---

## 📈 Monitoring Setup

### 1. Sentry (Error Tracking)
1. Create Sentry project: https://sentry.io
2. Add DSN to environment variables
3. Verify errors are captured

### 2. Uptime Monitoring
1. UptimeRobot: https://uptimerobot.com
2. Add monitors:
   - `https://api.converto.fi/health` (every 5 minutes)
   - `https://app.converto.fi` (every 5 minutes)

### 3. Analytics (Optional)
- Plausible: https://plausible.io
- PostHog: https://posthog.com

---

## 🔄 Update Workflow

### Deploy New Version

```bash
# 1. Commit changes
git add -A
git commit -m "feat: new feature"

# 2. Run checklist
./scripts/deploy_checklist.sh

# 3. Push
git push origin main

# 4. Render auto-deploys
# Monitor: https://dashboard.render.com
```

### Rollback

```bash
# In Render dashboard:
# Services → converto-backend → Events → Rollback
```

---

## 🆘 Troubleshooting

### Build Fails
```bash
# Check logs in Render dashboard
# Common issues:
# - Missing environment variables
# - Dependency conflicts
# - Build timeout (increase resources)
```

### Database Connection Issues
```bash
# Verify DATABASE_URL format:
postgresql://user:password@host:port/database

# Test connection
python -c "from app.core.db import engine; print(engine.connect())"
```

### Frontend Not Loading
```bash
# Check NEXT_PUBLIC_API_BASE is correct
# Verify CORS allows frontend domain
# Check browser console for errors
```

---

## 📞 Support

**Deployment Issues:**
- Render: https://render.com/docs
- Email: support@converto.fi

**Service Status:**
- Backend: https://api.converto.fi/health
- Frontend: https://app.converto.fi

---

**✅ Ready to deploy Converto 2.0 to production!**

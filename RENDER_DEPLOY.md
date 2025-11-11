# 🚀 Render Deployment Guide

## Quick Deploy (5 min)

### 1. Push to GitHub
```bash
git add -A
git commit -m "feat: ready for Render deployment"
git push origin main
```

### 2. Create Render Blueprint
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Blueprint**
3. Select your GitHub repo
4. Click **Apply**

### 3. Add Environment Variables
Go to **converto-backend** service → **Environment**:
- `OPENAI_API_KEY` = `sk-...` (your OpenAI key)
- Other vars are auto-generated or from database

### 4. Wait for Build
- Backend: ~3-5 minutes
- Frontend: ~2-3 minutes
- Database: instant

### 5. Verify
- Backend: `https://converto-backend.onrender.com/health`
- Frontend: Render gives you a URL (e.g., `converto-frontend.onrender.com`)

---

## ⏰ Cron Jobs (Optional - ML Training)

### Train Classifier (Daily 02:00 UTC)
```
Service: converto-backend
Schedule: 0 2 * * *
Command: python -m app.ml.train_classifier
```

### Self-Debug Agent (Daily 03:00 UTC)
```
Service: converto-backend
Schedule: 0 3 * * *
Command: CONVERTO_BACKEND_LOG=/tmp/converto_backend.log python -m app.ml.self_debug_agent
```

---

## 💰 Costs (Estimate)

- **Backend** (Starter Plus): ~$7/month
- **Frontend** (Static): $0/month
- **Database** (Starter): $0/month
- **OpenAI API**: ~$10-30/month (depends on usage)

**Total: ~$7-37/month**

---

## 🔧 Troubleshooting

### Frontend can't reach backend
Update `NEXT_PUBLIC_API_BASE` in frontend service to match your actual backend URL.

### Stripe webhooks
Add webhook URL in Stripe Dashboard:
```
https://converto-backend.onrender.com/api/v1/billing/webhook
```

### Database migrations
Render runs migrations automatically on deploy if you have Alembic setup.

---

✅ **READY FOR PRODUCTION!**

# 🚀 RENDER DEPLOYMENT - STEP BY STEP GUIDE

## Prerequisites
- ✅ GitHub repo with latest code
- ✅ OpenAI API key
- ✅ Render account (free tier OK for start)

---

## STEP 1: Prepare Repository

### 1.1 Verify Files Exist
```bash
ls render.yaml
ls .env.example
ls requirements.txt
ls frontend/package.json
```

### 1.2 Final Commit
```bash
git add -A
git commit -m "feat: Production ready for Render deployment"
git push origin main
```

---

## STEP 2: Create Render Services

### 2.1 Go to Render Dashboard
1. Navigate to: https://dashboard.render.com
2. Click **New** → **Blueprint**
3. Connect your GitHub account if not already connected
4. Select repository: `converto-business-os-quantum-mvp-1`

### 2.2 Configure Blueprint
Render will auto-detect `render.yaml` and show:
- ✅ converto-backend (Web Service)
- ✅ converto-frontend (Static Site)
- ✅ converto-db (PostgreSQL)

Click **Apply**

---

## STEP 3: Add Environment Variables

### 3.1 Backend Service
Go to **converto-backend** → **Environment**

Add these variables:
```
OPENAI_API_KEY=sk-proj-...
DATABASE_URL=[auto-filled from database]
JWT_SECRET=[auto-generated]
ADMIN_TOKEN=admin123
P2E_ENABLED=true
SENTRY_DSN=[optional]
```

### 3.2 Frontend Service
Go to **converto-frontend** → **Environment**

```
NEXT_PUBLIC_API_BASE=https://converto-backend.onrender.com
```

**⚠️ Important:** Replace `converto-backend` with your actual backend service name!

---

## STEP 4: Wait for Build

### 4.1 Backend Build (~3-5 minutes)
- Installing Python dependencies
- Running migrations
- Starting Uvicorn server

### 4.2 Frontend Build (~2-3 minutes)
- Installing Node dependencies
- Running Next.js build
- Generating static pages

### 4.3 Database (~instant)
- PostgreSQL instance created
- Connection string available

---

## STEP 5: Verify Deployment

### 5.1 Backend Health Check
```bash
curl https://converto-backend.onrender.com/health
```
Expected: `{"status":"ok"}`

### 5.2 Frontend Access
Open in browser:
```
https://converto-frontend.onrender.com
```
Expected: Dashboard loads with gradient header

### 5.3 Test OCR
1. Go to `/selko/ocr`
2. Upload a test receipt
3. Verify it gets parsed

### 5.4 Test VAT
1. Go to `/vat`
2. Check rates show correctly (25.5% standard)

---

## STEP 6: Custom Domain (Optional)

### 6.1 Add Domain in Render
1. Go to **converto-frontend** → **Settings** → **Custom Domain**
2. Add: `app.converto.fi`
3. Update DNS:
   ```
   CNAME app converto-frontend.onrender.com
   ```

### 6.2 Update Backend URL
Update frontend env:
```
NEXT_PUBLIC_API_BASE=https://api.converto.fi
```

---

## STEP 7: Setup Monitoring

### 7.1 Enable Render Notifications
- Go to **Account Settings** → **Notifications**
- Enable email alerts for deploy failures

### 7.2 Add Sentry (Optional)
```bash
# Backend
SENTRY_DSN=https://...@sentry.io/...

# Frontend
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

---

## STEP 8: Cron Jobs (Optional)

### 8.1 Legal Sync (Daily)
1. **New** → **Cron Job**
2. Name: `legal-sync`
3. Command: `python scripts/sync_legal.py`
4. Schedule: `0 2 * * *` (02:00 UTC)

### 8.2 VAT Rates Sync (Weekly)
1. **New** → **Cron Job**
2. Name: `vat-sync`
3. Command: `python scripts/sync_vat_rates.py`
4. Schedule: `0 3 * * 0` (Sunday 03:00 UTC)

---

## Troubleshooting

### Build Failed
- Check `requirements.txt` has all dependencies
- Verify Python version (3.11)
- Check build logs in Render dashboard

### Frontend 500 Error
- Verify `NEXT_PUBLIC_API_BASE` points to correct backend URL
- Check backend is running and healthy
- Clear browser cache

### Database Connection Error
- Verify `DATABASE_URL` is set correctly
- Check database service is running
- Run migrations manually if needed

### OCR Not Working
- Verify `OPENAI_API_KEY` is set
- Check API quota/billing
- Test with smaller image first

---

## Costs (Estimate)

| Service | Plan | Cost |
|---------|------|------|
| Backend | Starter Plus | $7/month |
| Frontend | Static Site | $0/month |
| Database | Starter | $0/month (1GB) |
| OpenAI API | Pay-as-you-go | $10-30/month |
| **Total** | | **$17-37/month** |

---

## 🎉 SUCCESS!

When you see:
- ✅ Green checkmarks in Render dashboard
- ✅ Backend health returns OK
- ✅ Frontend loads with styles
- ✅ OCR processes a receipt

**YOU'RE LIVE! 🚀**

---

## Next Steps

1. ✅ Test all features
2. ✅ Setup first pilot customer
3. ✅ Monitor logs for errors
4. ✅ Collect feedback
5. ✅ Iterate and improve

**Ready for customers!** 💼

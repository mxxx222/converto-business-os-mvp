# 🚀 Sentry Uptime & Cron Monitoring Setup

## 📊 Value: +$35/mo (Proactive Alerting)

This guide sets up Sentry uptime and cron monitoring for Converto Business OS.

---

## ✅ Prerequisites

- **Sentry Team Plan** ($29/mo) - includes 1 uptime monitor + 1 cron monitor
- **Sentry DSN** configured
- **Sentry ORG** and **PROJECT** in GitHub Secrets

---

## 🎯 Step 1: Uptime Monitoring

### Create Uptime Check

1. **Navigate to Sentry Dashboard:**
   - https://sentry.io/organizations/[ORG]/monitors/uptime/

2. **Create New Monitor:**
   - Click "Create Monitor"
   - Name: "Frontend Health Check"
   - URL: `https://converto.fi/api/health`
   - Expected Status: `200`
   - Check Interval: `1 minute`
   - Regions: `All regions` (or select specific)

3. **Configure Alerts:**
   - Alert Threshold: `3 consecutive failures`
   - Notification Channels: Email, Slack (optional)

4. **Repeat for Other Endpoints:**
   - Backend Health: `https://converto-business-os-quantum-mvp-1.onrender.com/health`
   - Dashboard API: `https://converto.fi/api/dashboard`
   - Chat API: `https://converto.fi/api/chat`

---

## ⏰ Step 2: Cron Monitoring

### Create Cron Monitor

1. **Navigate to Sentry Dashboard:**
   - https://sentry.io/organizations/[ORG]/monitors/crons/

2. **Create New Monitor:**
   - Click "Create Monitor"
   - Name: "Daily Backup"
   - Schedule: `0 2 * * *` (Daily at 2 AM)
   - Endpoint: `https://converto-business-os-quantum-mvp-1.onrender.com/api/backup`
   - Expected Execution Time: `5 minutes`
   - Timeout: `10 minutes`

3. **Configure Alerts:**
   - Alert if: `Missed` or `Failed`
   - Notification Channels: Email

---

## 🔧 Configuration

### Environment Variables

Add to Vercel/Render environment variables:

```bash
# Sentry Monitoring (already configured)
SENTRY_DSN=https://sntryu_...@o4507887226847232.ingest.sentry.io/4507887226847232
SENTRY_ORG=[ORG-SLUG]  # Add when available
SENTRY_PROJECT=[PROJECT-SLUG]  # Add when available
```

### Health Check Endpoints

Ensure these endpoints exist and return `200 OK`:

**Frontend:**
```typescript
// frontend/app/api/health/route.ts
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}
```

**Backend:**
```python
# backend/main.py
@app.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}
```

---

## 📊 Monitoring Dashboard

### View Uptime Status

1. **Sentry Dashboard** → **Monitors** → **Uptime**
2. View:
   - Current uptime percentage
   - Response times
   - Failure history
   - Regional availability

### View Cron Status

1. **Sentry Dashboard** → **Monitors** → **Crons**
2. View:
   - Last execution time
   - Execution history
   - Success/failure rate

---

## 🚨 Alerts

### Configure Alerts

1. **Sentry Dashboard** → **Settings** → **Alerts**
2. Create alert rules:
   - **Uptime Alert:** Trigger when endpoint is down for 3+ minutes
   - **Cron Alert:** Trigger when cron job fails or is missed

3. **Notification Channels:**
   - Email: `max@herbspot.fi`
   - Slack: Optional (if configured)

---

## 💰 ROI Analysis

**Investment:** $0 (included in Sentry Team plan)

**Value:** +$35/mo
- Proactive issue detection
- Reduced downtime (faster response)
- Better SLA tracking
- Improved customer satisfaction

**ROI:** Infinite (no additional cost, included in existing plan)

---

## ✅ Checklist

- [ ] Sentry Team plan active
- [ ] Uptime monitor created for frontend
- [ ] Uptime monitor created for backend
- [ ] Cron monitor created for daily backup
- [ ] Alerts configured
- [ ] Health check endpoints verified
- [ ] Notification channels configured

---

## 📝 Next Steps

1. **Test Monitoring:**
   - Temporarily disable health endpoint
   - Verify alert is triggered
   - Re-enable endpoint

2. **Review Metrics:**
   - Check uptime percentage weekly
   - Review cron execution history
   - Optimize based on data

3. **Expand Monitoring:**
   - Add more critical endpoints
   - Monitor database connections
   - Track API response times

---

**Status:** ⏳ Ready to configure - requires Sentry ORG and PROJECT from dashboard

**Configuration file:** `frontend/sentry.uptime.config.ts`

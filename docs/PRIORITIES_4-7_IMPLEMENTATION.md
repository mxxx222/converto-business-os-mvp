# 🎯 Prioriteetit 4-7 - Toteutusohjeet

**Seuraavat askeleet prioriteettien 1-全是 jälkeen**

---

## 📊 **PRIORITEETTI 4: Monitoring & Alerts (0.5 päivä)**

### **1. Sentry Alerts Setup**

**Vaiheet:**

1. **Sentry Dashboard:**
   - https://sentry.io/
   - Projects → Your Project → Alerts

2. **Create Alert Rule:**
   ```
   Name: "New Error Alert"
   Conditions:
   - When an issue is created
   - Or when an issue's event count increases by 50% in 1 hour
   
   Actions:
   - Send email to: your-email@example.com
   - Send to Slack: #ops-alerts (jos konfiguroitu)
   ```

3. **Performance Alert:**
   ```
   Name: "Slow Performance"
   Conditions:
   - P95 latency > 1000ms
   - For 5 minutes
   
   Actions:
   - Email notification
   ```

### **2. Health Check Monitoring**

**UptimeRobot (Ilmainen):**
- https://uptimerobot.com/
- Add Monitor:
  - Type: HTTP(s)
  - URL: `https://your-backend.onrender.com/health`
  - Interval: 5 minutes
  - Alert Contacts: Email

**Render Built-in:**
- Auto health checks already configured
- Manual checks: Dashboard → Service → Health

### **3. Metrics Dashboard**

**Sentry Performance:**
- Already active (20% sampling)
- View: Sentry Dashboard → Performance

**Custom Grafana (Optional):**
- Setup Prometheus scraping
- Create dashboard: `grafana/grafana-dashboard-business-os.json`

---

## 🧪 **PRIORITEETTI 5: Testing & Validation**

### **1. Automated Tests**

**Run Integration Tests:**
```bash
chmod +x scripts/test-integrations.sh
./scripts/test-integrations.sh
```

**Expected Results:**
- ✅ Backend health: 200 OK
- ✅ Frontend pages: 200 OK
- ✅ Metrics endpoint: 200 OK

### **2. Smoke Tests**

```bash
make test-premium
```

**Checks:**
- Premium page loads
- No console errors
- Analytics tracking works

### **3. Lighthouse Performance**

```bash
make test-lighthouse
```

**Target Scores:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

## 🚢 **PRIORITEETTI 6: Production Launch Checklist**

### **Pre-Launch (1 päivä):**

- [ ] ✅ Environment variables set (Prioriteetti 1)
- [ ] ✅ Frontend environment variables set (Prioriteetti 2)
- [ ] ✅ Supabase Realtime enabled (Prioriteetti 3)
- [ ] ✅ Sentry error tracking active
- [ ] ✅ Integration tests pass
- [ ] ✅ Smoke tests pass
- [ ] ✅ Lighthouse scores > 90
- [ ] ✅ Health checks working
- [ ] ✅ Alerts configured
- [ ] ✅ DNS configured (converto.fi)
- [ ] ✅ SSL certificates valid

### **Launch Day:**

1. **Tag Release:**
   ```bash
   git tag v1.0.0-production
   git push origin v1.0.0-production
   ```

2. **Deploy:**
   - Backend: Automatic (Render)
   - Frontend: Automatic (Vercel/Render)

3. **Verifyหลัง:**
   - Health checks: ✅
   - Premium page: ✅
   - Error tracking: ✅

4. **Monitor:**
   - Check Sentry dashboard
   - Monitor error rates
   - Check performance metrics

### **Post-Launch (Ensimmäiset 72h):**

- [ ] Monitor Sentry daily
- [ ] Check error rates (< 0.1%)
- [ ] Monitor performance (P95 < 500ms)
- [ ] Collect user feedback
- [ ] Fix critical issues immediately

---

## 💡 **PRIORITEETTI 7: Quick Wins**

### **1. Supabase Anon Key - Frontend**

**Problem:** Frontend needs `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Solution:**
1. Supabase Dashboard → Settings → API
2. Copy "anon public" key
3. Add to frontend environment variables

**Time:** 2 minutes

### **2. Domain Configuration**

**DNS Status:**
- Check: `dig converto.fi`
- Verify nameservers: `hostingpalvelu.fi`
- Wait for propagation (24-48h)

**SSL Status:**
- Render auto-provisions SSL
- Check: Render Dashboard → SSL

### **3. Email Domain Verification**

**Resend Setup:**
1. Resend Dashboard → Domains
2. Add `converto.fi`
3. Add DNS records:
   - SPF: `v=spf1 include:spf.resend.com ~all`
   - DKIM: (3-4 CNAME records from Resend)
   - DMARC: `v=DMARC1; p=none; rua=mailto:dmarc@converto.fi`

**Time:** 15 minutes

---

## 📈 **PRIORITEETTI 8: Business Growth**

### **1. Pilot Customer Onboarding**

**Target Interviews:** 3-5 pilot customers

**Steps:**
1. Collect emails via `/premium` form
2. Manual email: "Welcome to Converto Pilot"
3. Setup guide: Create Notion page
4. Collect feedback: Weekly check-ins

### **2. Analytics Setup**

**Plausible:**
- ✅ Already configured
- Track: page views, conversions

**Custom Events:**
- ✅ Already implemented in `lib/analytics.ts`
- Events: `view_premium`, `cta_click`, `form_submit`

### **3. Marketing Automation**

**Resend Workflows:**
- Pilot onboarding (automated)
- Weekly digest (opt-in)
- Feature announcements

---

## ✅ **Implementation Checklist**

### **Tänään:**
- [ ] Run validation script: `./scripts/validate-setup.sh`
- [ ] Run integration tests:舅舅`./scripts/test-integrations.sh`
- [ ] Setup Sentry alerts
- [ ] Configure health check monitoring

### **Huomenna:**
- [ ] Complete smoke tests
- [ ] Lighthouse performance optimization
- [ ] Email domain verification (Resend)
- [ ] DNS/SSL verification

### **Tällä Viikolla:**
- [ ] Production launch checklist
- [ ] Tag v1.0.0-production
- [ ] Monitor first 72 hours
- [ ] Collect pilot customer feedback

---

## 🎯 **Success Criteria**

**Production Ready:**
- ✅ All tests pass
- ✅ Error rate < 0.1%
- ✅ P95 latency < 500ms
- ✅ Uptime > 99.9%
- ✅ Lighthouse scores > 90

**Business Ready:**
- ✅ Pilot customers onboarded
- ✅ Analytics tracking
- ✅ Email automation active
- ✅ Feedback collection setup

---

**Last Updated:** 2025-01-XX © 2025 Converto Business OS


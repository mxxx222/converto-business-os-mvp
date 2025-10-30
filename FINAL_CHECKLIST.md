# ✅ Converto Business OS - Final Checklist

**Production Launch Checklistthin**

---

## 🔴 **KRIITTISET (Tehdä ennen launchia):**

### **1. Backend Environment Variables** ⏱️ 5 min
- [ ] Render Dashboard → `converto-business-os-quantum-mvp-1`
- [ ] `SENTRY_DSN` = (asennettuna)
- [ ] `SUPABASE_URL` = (päivitä!)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = (asennettuna)
- [ ] `SUPABASE_AUTH_ENABLED` = `true`
- [ ] `OPENAI_API_KEY` = (asennettuna)
- [ ] `RESEND_API_KEY` = (asennettuna)
- [ ] `DATABASE_URL` = (asennettuna)

**Testaa:**
```bash
curl https://converto-business-os-quantum-mvp-1.onrender.com/health
# Pitäisi palauttaa: {"status": "healthy"}
```

### **2. Frontend Marketing (Static)** ⏱️ 2 min
- [ ] Render Dashboard → `converto-marketing`
- [ ] Tarkista että build onnistuu
- [ ] Testaa: https://converto.fi/premium

### **3. Frontend Dashboard (SSR)** ⏱️ 5 min
- [ ] Render Dashboard → `converto-dashboard`
- [ ] `NEXT_PUBLIC_STATIC_EXPORT` = `false`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = (päivitä!)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (päivitä!)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` = (asennettuna)

**Testaa:**
```bash
curl https://converto-dashboard.onrender.com/dashboard
# Pitäisi palauttaa dashboard page
```

### **4. Supabase Realtime** ⏱️ 2 min
- [ ] Supabase Dashboard → Table Editor → `receipts`
- [ ] Settings → Realtime → Enable → ON
- [ ] Events: INSERT, UPDATE, DELETE
- [ ] Save

**Testaa:**
- Avaa dashboard
- Lisää testi-kuitti Supabase Table Editorissa
- Dashboard pitäisi päivittyä automaattisesti!

---

## 🟡 **TÄRKEÄT (Tehdä tänään):**

### **5. Sentry Alerts** ⏱ protections min
- [ ] Sentry Dashboard → Alerts
- [ ] New Error Alert (Issue created → Email)
- [ ] Performance Alert (P95 > 1000ms → Email)
- [ ] Test alert toimii

### **6. Health Check Monitoring** ⏱️ 5 min
- [ ] Setup UptimeRobot tai Render health checks
- [ ] Monitor: Backend `/health` endpoint
- [ ] Monitor: Frontend pages
- [ ] Email notifications configured

### **7. Integration Tests** ⏱️ 5 min
```bash
# Run all tests
make validate-setup
make test-integrations
make validate-dashboard
make test-dashboard
```

**Kaikki testit pitäisi mennä läpi!**

---

## 🟢 **HYVÄ TEHDÄ (Tällä viikolla):**

### **8. DNS & SSL** ⏱️ 15 min
- [ ] Verify DNS: `dig converto.fi`
- [ ] Check SSL: https://converto.fi
- [ ] Verify SSL certificate valid
- [ ] Test HTTPS redirects

### **9. Email Domain Verification** ⏱️ 15 min
- [ ] Resend Dashboard → Domains
- [ ] Add `converto.fi`
- [ ] Add DNS records:
  - SPF: `v=spf1 include:spf.resend.com ~all`
  - DKIM: (3-4 CNAME records)
  - DMARC: `v=DMARC1; p=none; rua=mailto:dmarc@converto.fi`
- [ ] Verify domain

### **10. Performance Optimization** ⏱️ 30 min
- [ ] Run Lighthouse: `make test-lighthouse`
- [ ] Target scores: Performance > 90, Accessibility > 90
- [ ] Optimize images if needed
- [ ] Check bundle size

### **11. Documentation Review** ⏱️ 15 min
- [ ] README.md up to date
- [ ] SETUP_NOW.md accurate
- [ ] API documentation complete
- [ ] Deployment guides reviewed

---

## 📊 **MONITORING (Ensimmäiset 72h):**

### **12. Daily Checks**
- [ ] Sentry dashboard: Error rate < 0.1%
- [ ] Performance: P95 latency < 500ms
- [ ] Uptime: > 99.9%
- [ ] Health checks: All green

### **13. User Feedback**
- [ ] Collect pilot customer feedback
- [ ] Monitor analytics (Plausible)
- [ ] Track conversion metrics
- [ ] Document issues

---

## 🎯 **SUCCESS CRITERIA:**

### **Technical:**
- ✅ All tests pass
- ✅ Error rate < 0.1%
- ✅ P95 latency < 500ms
- ✅ Uptime > 99.9%
- ✅ Lighthouse scores > 90

### **Business:**
- ✅ Pilot customers onboarded
- ✅ Analytics tracking
- ✅ Email automation active
- ✅ Feedback collection setup

---

## 📚 **QUICK LINKS:**

### **Setup Guides:**
- ⚡ **SETUP_NOW.md** - Quick setup (12 min)
- 🔧 **DASHBOARD_FIX_GUIDE.md** - Dashboard setup
- 📋 **RENDER_ENV_VARS_CHECKLIST.md** - Environment variables

### **Status & Documentation:**
- 📊 **IMPLEMENTATION_COMPLETE.md** - Project status
- 📈 **COMPLETED_TASKS_SUMMARY.md** - Completed tasks
- 📖 **docs一次性/DASHBOARD_STATUS.md** - Dashboard status

---

## 🚀 **LAUNCH DAY:**

1. **Final Checks:**
   ```bash
   make validate-setup
   make test-integrations
   make validate-dashboard
   make test-dashboard
   make test-lighthouse
   ```

2. **Tag Release:**
   ```bash
   git tag v1.0.0-production
   git push origin v1.0.0-production
   ```

3. **Deploy:**
   - Render auto-deploys on push
   - Monitor deployment status
   - Verify health checks

4. **Monitor:**
   - Check Sentry for errors
   - Monitor performance metrics
   - Collect user feedback

---

## ✅ **READY TO LAUNCH?**

**Kun kaikki kriittiset (1-4) ja tärkeät (5-7) ovat valmiit:**
- ✅ → **LAUNCH!** 🚀

**Jos jotain puuttuu:**
- 📋 Tarkista tämä checklist
- 📖 Katso relevantti dokumentaatio
- 🔧 Korjaa ennen launchia

---

**Last Updated:** 2025-01-XX © 2025 Converto Business OS

# 🎯 Seuraavat Askeleet - Suositukset

**Priorisoidut toimenpiteet Converto Business OS -projektin kehitykselle**

---

## 🚀 **PRIORITEETTI 1: Production Setup (1-2 päivää)**

### **1. Environment Variables Setup**

#### **Backend (Render):**

**Välittömät (kriittiset):**
```env
# Sentry Error Tracking
SENTRY_DSN=https://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@o4507887226847232.ingest.sentry.io/4507887226847232

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sbp_3239ba703a96cee5e258396939111c5db2aecd9c
SUPABASE_AUTH_ENABLED=true

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# OpenAI
OPENAI_API_KEY=sk-proj-xxxx

# Resend Email
RESEND_API_KEY=re_xxxx

# Environment
ENVIRONMENT=production
LOG_LEVEL=info
```

**Vaiheet:**
1. Render Dashboard → Service → Environment
2. Lisää kaikki yllä olevat muuttujat
3. Redeploy service
4. Testaa: `curl https://your-backend.onrender.com/health`

#### **Frontend (Vercel/Render Static):**

```env
# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://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@o4507887226847232.ingest.sentry.io/4507887226847232

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Vaiheet:**
1. Vercel rul：/Render → Project Settings → Environment Variables
2. Lisää kaikki `NEXT_PUBLIC_*` muuttujat
3. Redeploy
4. Testaa: Avaa https://converto.fi/premium

---

## 🔧 **PRIORITEETTI 2: Supabase Configuration (0.5 päivä)**

### **1 supervisor Enable Realtime**

**Vaiheet:**
1. Supabase Dashboard → Table Editor
2. Valitse `receipts` table
3. Settings → Realtime
4. Enable Realtime: ✅ ON
5. Enable `INSERT`, `UPDATE`, `DELETE` events

**Tulos:**
- Frontend dashboard päivittyy automaattisesti kun uusi kuitti lisätään
- Ei tarvitse refresh-nappia

### **2. Storage Bucket Setup**

**Vaiheet:**
1. Supabase Dashboard → Storage
2. Create bucket: `receipts` (private)
3. Policies → Add policy:
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Users can upload receipts"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'receipts');
   
   -- Allow users to read their own receipts
   CREATE POLICY "Users can read own receipts"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

### **3. Storage Webhook Setup**

**Vaiheet:**
1. Supabase Dashboard → Database → Webhooks
2. Create webhook:
   - Name: `receipt-storage-ingest`
   - Table: `storage.objects`
   - Events: `INSERT`
   - HTTP Request:
     - URL: `https://your-backend.onrender.com/api/v1/receipts/storage-ingest`
     - Method: `POST`
     - Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`

---

## 🧪 **PRIORITEETTI 3: Testing & Validation (1 päivä)**

### **1. Smoke Tests**

```bash
# Run smoke tests
make test-premium

# Expected results:
# ✅ Frontend loads
# ✅ Health check returns 200
# ✅ Premium page accessible
```

### **2. Integration Tests**

**Testaa:**
- ✅ Sentry error tracking: Trigger test error → check Sentry dashboard
- ✅ Supabase auth: Login → check JWT validation
- ✅ Receipt upload: Upload kuitti → check Realtime update
- ✅ Email: Trigger email → check Resend dashboard

### **3. Performance Tests**

```bash
# Lighthouse test
make test-lighthouse

# Target scores:
# Performance: > 90
# Accessibility: > 90
# Best Practices: > 90
# SEO: > 90
```

---

## 📊 **PRIORITEETTI 4: Monitoring & Alerts (0.5 päivä)**

### **1. Sentry Alerts**

**Vaiheet:**
1. Sentry Dashboard → Alerts
2. Create alert:
   - Name: "New Error Alert"
   - Conditions: New issue created
   - Actions: Email + Slack (jos konfiguroitu)

### **2. Health Check Monitoring**

**Render:**
- Automaattinen health check: `/health`
- Auto-restart jos unhealthy

**Custom:**
- Setup UptimeRobot / Pingdom
- Monitor: `https://your-backend.onrender.com/health`
- Alert jos down > 5 min

### **3. Metrics Dashboard**

**Sentry Performance:**
- Track endpoint latencies
- Monitor error rates
- Set alerts for P95 > 1000ms

---

## 🚢 **PRIORITEETTI 5: Production Launch (1 päivä)**

### **1. Final Checklist**

- [ ] Kaikki environment variables asetettu
- [ ] Sentry dashboard toimii
- [ ] Supabase Realtime enabled
- [ ] Storage webhooks konfiguroitu
- [ ] Smoke tests pass
- [ ] Lighthouse scores > 90
- [ ] Error tracking testattu
- [ ] Alerts konfiguroitu

### **2. Go-Live Steps**

```bash
# 1. Tag release
git tag v1.0.0-production
git push origin v1.0.0-production

# 2. Deploy backend
# (Automaattinen Render deploy kun push main)

# 3. Deploy frontend
# (Automaattinen Vercel/Render deploy)

# 4. Verify
curl https://your-backend.onrender.com/health
open https://converto.fi/premium
```

### **3. Post-Launch Monitoring**

**Ensimmäiset 72 tuntia:**
- Monitor Sentry dashboard päivittäin
- Check error rates (< 0.1%)
- Monitor performance (P95 < 500ms)
- Check user feedback

---

## 💡 **PRIORITEETTI 6: Quick Wins (1-2 päivää)**

### **1. Supabase Anon Key - Frontend**

**Ongelma:** Frontend tarvitsee `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Ratkaisu:**
1. Supabase Dashboard → Settings → API
2. Copy "anon public" key
3. Lisää `NEXT_PUBLIC_SUPABASE_ANON_KEY` frontend environment variables

### **2. Domain Configuration**

**Ongelma:** `converto.fi` DNS propagation

**Ratkaisu:**
1. Check DNS status: `dig converto.fi`
2. Verify SSL: Render dashboard → SSL
3. Update CORS: Add `https://converto.fi` to `CORS_ORIGINS_STR`

### **3. Email Domain Verification**

**Ongelma:** Resend domain verification

**Ratkaisu:**
1. Resend Dashboard → Domains
2. Add `converto.fi`
3. Add DNS records (SPF, DKIM, DMARC)
4. Verify domain

---

## 📈 **PRIORITEETTI 7: Business Growth (1 viikko)**

### **1. Pilot Customer Onboarding**

**Target:** 3-5 pilot customers

**Steps:**
- Setup pilot landing page
- Collect emails via `/premium` form
- Manual onboarding (email + setup guide)
- Collect feedback

### **2. Analytics Setup**

**Plausible:**
- ✅ Already configured in `layout.tsx`
- Monitor: page views, conversions, exit pages

**Custom Events:**
- Track: `view_premium`, `cta_click`, `form_submit`
- Already implemented in `lib/analytics.ts`

### **3. Marketing Automation**

**Resend Workflows:**
- Pilot onboarding email (automated)
- Weekly digest (if opted in)
- Feature announcements

---

## 🎯 **Suositukset - Mitä Tehdä Nyt**

### **Tänään (2-4 tuntia):**

1. ✅ **Aseta Backend Environment Variables (Render)**
   - DSN, Supabase keys, OpenAI, Resend
   - Testaa health check

2. ✅ **Aseta Frontend Environment Variables**
   - Sentry DSN, Supabase keys
   - Testaa premium page

3. ✅ **Enable Supabase Realtime**
   - Receipts table → Realtime ON
   - Testaa dashboard live updates

### **Huomenna (4-6 tuntia):**

4. ✅ **Supabase Storage Setup**
   - Create bucket, policies
   - Configure webhook → Backend

5. ✅ **Sentry Testing**
   - Trigger test error
   - Verify dashboard
   - Setup alerts

6. ✅ **Integration Testing**
   - Test receipt upload flow
   - Test authentication
   - Test email automation

### **Tällä Viikolla (8-12 tuntia):**

7. ✅ **Performance Optimization**
   - Lighthouse scores > 90
   - Optimize images
   - Reduce bundle size

8. ✅ **Documentation**
   - API documentation
   - User guide
   - Deployment runbook

9. ✅ **Pilot Customer Setup**
   - Landing page ready
   - Email collection
   - Onboarding flow

---

## 💰 **ROI-Arvio**

**Aika:** 3-5 päivää kaikkeen
**Hyöty:** 
- ✅ Production-ready platform
- ✅ Error tracking active
- ✅ Monitoring setup
- ✅ Ready for pilot customers

**Payback:** 1-2 viikkoa kun pilot customers alkavat käyttää

---

## 🚨 **Jos Jotain Menee Pieleen**

### **Backup Plan:**

1. **Rollback:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Check Logs:**
   - Render: Dashboard → Logs
   - Sentry: Error details
   - Supabase: Database logs

3. **Emergency Contacts:**
   - Sentry support: https://sentry.io/support
   - Supabase support: https://supabase.com/support
   - Render support: https://render.com/support

---

## ✅ **Yhteenveto**

**Aloita näistä 3 askeleesta:**

1. 🔴 **KRIITTINEN:** Aseta environment variables (Backend + Frontend)
2. 🟡 **TÄRKEÄ:** Enable Supabase Realtime
3. 🟢 **HYÖDYLLINEN:** Testaa kaikki integraatiot

**Kun nämä ovat valmiit → Ready for production launch!** 🚀

---

**Last Updated:** 2025-01-XX © 2025 Converto Business OS


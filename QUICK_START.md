# ⚡ Converto Business OS - Quick Start

**Nopein tapa päästä alkuun (~15 minuuttia)**

---

## 🎯 **3 ASKELLET TUILE PRODUCTION READY:**

### **1. Backend Setup** ⏱️ 5 min

👉 **Render Dashboard:** https://dashboard.render.com/web/srv-d3r10pjipnbc73asaod0

**Lisää Environment Variables:**
```
SENTRY_DSN=https://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@o4507887226847232.ingest.sentry.io/4507887226847232
SUPABASE_URL=https://your-project.supabase.co  # PÄIVITÄ!
SUPABASE_SERVICE_ROLE_KEY=sbp_3239ba703a96cee5e258396939 генетикиc5db2aecd9c
SUPABASE_AUTH_ENABLED=true
OPENAI_API_KEY=sk-...  # Jos ei ole
RESEND_API_KEY=re_...  # Jos ei ole
DATABASE_URL=postgresql://...  # Jos ei ole
```

**Testaa:**
```bash
curl https://converto-business-os-quantum-mvp-1.onrender.com/health
```

---

### **2. Dashboard Setup** ⏱️ 5 min

👉 **Render Dashboard:** https://dashboard.render.com/web/srv-d3rcdnpr0fns73bl3kg0

**Lisää Environment Variables:**
```
NEXT_PUBLIC_STATIC_EXPORT=false
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co  # PÄIVITÄ!
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # PÄIVITÄ! (Hae Supabase Dashboardista)
NEXT_PUBLIC_SENTRY_DSN=https://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@o4507887226847232.ingest.sentry.io/4507887226847232
```

**Hae Supabase Keys:**
1. https://app.supabase.com/
2. Settings → API
3. Kopioi: Project URL ja anon public key

---

### **3. Enable Realtime** ⏱️ 2 min

👉 **Supabase Dashboard:** https://app.supabase.com/

1. **Table Editor** → `receipts` table
2. **Settings** (⚙️) → **Realtime**
3. **Enable Realtime** → **ON** ✅
4. Valitse: INSERT, UPDATE, DELETE
5. **Save**

---

## ✅ **VALMIS!**

**Testaa:**
```bash
# Validate setup
make validate-setup
make validate-dashboard

# Test integrations
make test-integrations
make test-dashboard
```

---

## 📚 **Lisätietoja:**

- 📖 **Yksityiskohtainen:** `SETUP_NOW.md`
- 🔧 **Dashboard:** `DASHBOARD_FIX_GUIDE.md`
- ✅ **Checklist:** `FINAL_CHECKLIST.md`

---

**Kun nämä 3 askelta on tehty → Projekti on production ready!** 🚀


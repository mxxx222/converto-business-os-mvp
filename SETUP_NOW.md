# ⚡ SETUP NYT - Prioriteetit 1-3

**Tee nämä 3 asiaa HETI:**

---

## 🔴 **1. BACKEND ENVIRONMENT VARIABLES (Render)**

**Aika:** 5 minuuttia

### **Vaihe 1: Avaa Render Dashboard**
👉 https://dashboard.render.com
- Service: `converto-business-os-quantum-mvp-1` (srv-d3r10pjipnbc73asaod0)

### **Vaihe 2: Lisää Environment Variables**

**Settings → Environment → Add Environment Variable:**

```
1. Key: SENTRY_DSN
   Value: https://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@o4507887226847232.ingest.sentry.io/4507887226847232

2. Key: SUPABASE_URL
   Value: https://your-project.supabase.co
   ⚠️ PÄIVITÄ oma URL

3. Key: SUPABASE_SERVICE_ROLE_KEY
   Value: sbp_3239ba703a96cee5e258396939111c5db2aecd9c

4. Key: SUPABASE_AUTH_ENABLED
   Value: true

5. Key: ENVIRONMENT
   Value: production

6. Key: LOG_LEVEL
   Value: info
```

### **Vaihe 3: Redeploy**
- Manual Deploy → Deploy latest commit

### **Vaihe 4: Testaa**
```bash
curl https://converto-business-os-quantum-mvp-1.onrender.com/health
# Pitäisi palauttaa: {"status": "healthy"}
```

✅ **Valmis kun health check palauttaa 200 OK!**

---

## 🔴 **2. FRONTEND ENVIRONMENT VARIABLES**

**Aika:** 5 minuuttia

### **Vaihe 1: Hae Supabase Anon Key**

1. **Supabase Dashboard:** https://app.supabase.com/
2. **Settings → API**
3. **Kopioi:**
   - Project URL: `https://xxxxx.supabase.co`
   - anon public key: `eyJhbGc...` (pitkä string)

### **Vaihe 2: Lisää Vercel/Render**

**Project Settings → Environment Variables:**

```
1. Key: NEXT_PUBLIC_SENTRY_DSN
   Value: https://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@o4507887226847232.ingest.sentry.io/4507887226847232

2. Key: NEXT_PUBLIC_SUPABASE_URL
   Value: https://xxxxx.supabase.co (oman projektisi URL)

3. Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGc... (anon public key)
```

### **Vaihe 3: Redeploy**
- Save → Redeploy

### **Vaihe 4: Testaa**
- Avaa: https://converto.fi/premium
- Pitäisi latautua ilman virheitä

✅ **Valmis kun premium page latautuu!**

---

## 🟡 **3. ENABLE SUPABASE REALTIME**

**Aika:** 2 minuuttia

### **Vaihe 1: Supabase Dashboard**
👉 https://app.supabase.com/

### **Vaihe 2: Table Editor**
- Vasemmalta: **Table Editor**
- Valitse: **receipts** table

### **Vaihe 3: Enable Realtime**
- **Settings** (⚙️ oikealla ylhäällä)
- **Realtime** -osio
- **Enable Realtime** → **ON** ✅
- Valitse eventit:
  - ✅ **INSERT**
  - ✅ **UPDATE**
  - ✅ **DELETE**
- **Save**

### **Vaihe 4: Testaa**
1. Avaa `/dashboard` frontendissa
2. Lisää testi-kuitti Supabase Table Editorissa (INSERT test row)
3. Dashboard pitäisi päivittyä **automaattisesti** (ei refresh!)

✅ **Valmis kun dashboard päivittyy automaattisesti!**

---

## ✅ **Vahvistus:**

- [ ] Backend health check: `curl https://backend.onrender.com/health` → 200 OK
- [ ] Frontend premium page: https://converto.fi/premium → latautuu
- [ ] Supabase Realtime: Dashboard päivittyy automaattisesti

---

**Aika yhteensä:** ~12 minuuttia

**Kun nämä ovat valmiit → Projekti on valmis tuotantoon!** 🚀

---

**Tarvitset apua?**
- 📖 Katso: `QUICK_SETUP_GUIDE.md`
- 📋 Checklist: `RENDER_ENV_VARS_CHECKLIST.md`



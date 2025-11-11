# 🔧 Dashboard Fix Guide - Kaikki Askeleet

**Toteutettu:** Static export ongelma korjattu (Option B: Eri SSR-palvelu)

---

## ✅ **1. STATIC EXPORT ONGELMA KORJATTU**

### **Tehdyt muutokset:**

1. **`frontend/next.config.js`:**
   - ✅ Lisätty ehdollinen static export
   - ✅ `NEXT_PUBLIC_STATIC_EXPORT=true` → Static export (marketing)
   - ✅ `NEXT_PUBLIC_STATIC_EXPORT=false` → SSR (dashboard)

2. **`render.yaml`:**
   - ✅ `converto-marketing` → Static export (`NEXT_PUBLIC_STATIC_EXPORT=true`)
   - ✅ `converto-dashboard` → SSR (`NEXT_PUBLIC_STATIC_EXPORT=false`)

### **Status:**
✅ **Koodi korjattu ja valmis deploymentiin**

---

## 🔴 **2. ASETA ENVIRONMENT VARIABLES**

### **A) Frontend Marketing (converto-marketing):**

**Render Dashboard:** https://dashboard.render.com/web/srv-d41adhf5r7bs739aqe70

**Environment Variables:**
```bash
NEXT_PUBLIC_STATIC_EXPORT=true  # Static export
```

**Status:** ✅ Ei tarvita muita (static export ei tarvitse Supabase keys)

---

### **B) Frontend Dashboard (converto-dashboard):**

**Render Dashboard:** https://dashboard.render.com/web/srv-d3rcdnpr0fns73bl3kg0

**Environment Variables (KRIITTISET):**
```bash
NEXT_PUBLIC_STATIC_EXPORT=false
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co  # PÄIVITÄ!
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...  # PÄIVITÄ!
NEXT_PUBLIC_SENTRY_DSN=https://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@o4507887226847232.ingest.sentry.io/4507887226847232
```

**How to get Supabase keys:**
1. **Supabase Dashboard:** https://app.supabase.com/
2. **Settings → API**
3. **Kopioi:**
   - **Project URL:** `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Kun lisätty → Manual Deploy → Deploy latest commit**

---

### **C) Backend (converto-business-os-quantum-mvp-1):**

**Render Dashboard:** https://dashboard.render.com/web/srv-d3r10pjipnbc73asaod0

**Katso:** `SETUP_NOW.md` vaihe 1

---

## 🔴 **3. ENABLE SUPABASE REALTIME**

**Aika:** 2 minuuttia

### **Vaiheet:**

1. **Supabase Dashboard:** https://app.supabase.com/
2. **Table Editor** → Valitse **`receipts`** table
3. **Settings** (⚙️ oikealla ylhäällä)
4. **Realtime** section
5. **Enable Realtime** → **ON** ✅
6. Valitse eventit:
   - ✅ **INSERT**
   - ✅ **UPDATE**
   - ✅ **DELETE**
7. **Save**

### **Testaa:**
- Avaa dashboard: https://your-dashboard-url.onrender.com/dashboard
- Lisää testi-kuitti Supabase Table Editorissa
- Dashboard pitäisi päivittyä **automaattisesti** (ei refresh!)

---

## 🔴 **4. KORJAA RENDER DASHBOARD SERVICE**

**Service:** `converto-dashboard` (srv-d3rcdnpr0fns73bl3kg0)

### **A) Tarkista Build Logs:**

**Render Dashboard:** https://dashboard.render.com/web/srv-d3rcdnpr0fns73bl3kg0/logs

**Yleiset virheet ja ratkaisut:**

#### **Virhe 1: `NEXT_PUBLIC_STATIC_EXPORT` not found**
**Ratkaisu:**
- Lisää environment variable: `NEXT_PUBLIC_STATIC_EXPORT=false`

#### **Virhe 2: `NEXT_PUBLIC_SUPABASE_URL` not found**
**Ratkaisu:**
- Lisää environment variable: `NEXT_PUBLIC_SUPABASE_URL=...`

#### **Virhe 3: Module not found errors**
**Ratkaisu:**
```bash
# Tarkista että frontend/package.json on oikein
cd frontend
npm ci
```

#### **Virhe 4: Build succeeds but runtime error**
**Ratkaisu:**
- Tarkista empresivaan environment variables on asetettu
- Tarkista `startCommand` on oikein: `cd frontend && npm run start`

### **B) Manual Deploy:**

1. **Render Dashboard** → **Manual Deploy**
2. **Deploy latest commit**
3. **Tarkista build logs** reaaliajassa
4. **Kun build onnistuu** → Tarkista health check

### **C) Health Check:**

```bash
curl https://converto-dashboard.onrender.com/dashboard
# Pitäisi palauttaa dashboard page (ei 404)
```

---

## 📋 **CHECKLIST:**

### **Koodi:**
- [x] ✅ Static export ongelma korjattu
- [x] ✅ `next.config.js` päivitetty
- [x] ✅ `render.yaml` päivitetty dashboard-palvelulla

### **Deployment:**
- [ ] ⏳ Environment variables asetettu (marketing)
- [ ] ⏳ Environment variables asetettu (dashboard)
- [ ] ⏳ Supabase Realtime aktivoitu
- [ ] ⏳ Dashboard service build onnistuu
- [ ] ⏳ Health check toimii

---

## 🚀 **TESTAUS:**

### **1. Marketing Site (Static):**
```bash
# Pitäisi toimia ilman Supabase keys
curl https://converto.fi/premium
```

### **2. Dashboard (SSR):**
```bash
# Pitäisi toimia Supabase keysillä
curl https://dashboard-url.onrender.com/dashboard
```

### **3. Realtime Test:**
1. Avaa dashboard selaimessa
2. Supabase Table Editor → Lisää receipt
3. Dashboard pitäisi päivittyä automaattisesti

---

## 📚 **LINKKIT:**

- ⚡ **Setup:** `SETUP_NOW.md`
- 📊 **Dashboard Status:** `docs/DASHBOARD_STATUS.md`
- 🔧 **Supabase:** `docs/SUPABASE_SETUP.md`

---

## ✅ **SEURAAVAT ASKELET:**

1. **Commit & Push:**
   ```bash
   git add frontend/next.config.js render.yaml
   git commit -m "fix: separate SSR dashboard service from static export marketing"
   git push origin main
   ```

2. **Set Environment Variables:**
   - Dashboard service: Supabase keys
   - Marketing service: `NEXT_PUBLIC_STATIC_EXPORT=true`

3. **Enable Supabase Realtime:**
   - Receipts table → Settings → Realtime → ON

4. **Deploy & Test:**
   - Render auto-deploys
   - Test dashboard toimii
   - Test realtime updates

---

**💡 Kun kaikki on tehty → Dashboard toimii täydellisesti!** 🚀


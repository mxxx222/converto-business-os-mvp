# ⚡ Nopea Setup-Guide (Prioriteetit 1-3)

**Tee nämä 3 asiaa heti:**

---

## 🔴 **PRIORITEETTI 1: Backend Environment Variables (Render)**

### **Vaihtoehto A: Script (Automaattinen)**

```bash
# 1. Aseta Render API key (jos ei vielä)
export RENDER_API_KEY=your-render-api-key

# 2. Aja setup script
./scripts/setup-render-env.sh

# 3. Seuraa ohjeita
```

### **Vaihtoehto B: Manual (Render Dashboard)**

1. **Avaa Render Dashboard:**
   - https://dashboard.render.com
   - Service: `converto-business-os-quantum-mvp-1` (tai oma service ID)

2. **Environment Variables:**
   - Settings → Environment
   - Add Environment Variable → Lisää nämä:

```
SENTRY_DSN=https://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@o4507887226847232.ingest.sentry.io/4507887226847232

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sbp_3239ba703a96cee5e258396939111c5db2aecd9c
SUPABASE_AUTH_ENABLED=true

ENVIRONMENT=production
LOG_LEVEL=info
```

3. **⚠️ Päivitä vielä:**
   - `SUPABASE_URL` → Oma Supabase project URL
   - `DATABASE_URL` → PostgreSQL connection string
   - `OPENAI_API_KEY` → Oma OpenAI key
   - `RESEND_API_KEY` → Oma Resend key

4. **Save & Redeploy:**
   - Save changes
   - Manual Deploy (tai odota automaattinen)

5. **Testaa:**
   ```bash
   curl https://your-backend.onrender.com/health
   # Pitäisi palauttaa: {"status": "healthy"}
   ```

---

## 🔴 **PRIORITEETTI 2: Frontend Environment Variables**

### **Render Static Site / Vercel:**

1. **Avaa Dashboard:**
   - Vercel: https://vercel.com/dashboard
   - TAI Render: https://dashboard.render.com

2. **Project Settings:**
   - Valitse frontend-projekti
   - Settings → Environment Variables

3. **Lisää Nämä:**

```
NEXT_PUBLIC_SENTRY_DSN=https://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@o4507887226847232.ingest.sentry.io/4507887226847232

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **⚠️ Hae Supabase Anon Key:**
   - Supabase Dashboard → Settings → API
   - Kopioi AAA "anon public" key
   - Liitä `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. **Save & Redeploy:**
   - Save changes
   - Redeploy frontend

6. **Testaa:**
   - Avaa: https://converto.fi/premium
   - Pitäisi latautua ilman virheitä

---

## 🟡 **PRIORITEETTI 3: Enable Supabase Realtime**

### **Nopea 5-minuuttinen setup:**

1. **Supabase Dashboard:**
   - https://app.supabase.com/
   - Valitse projektisi

2. **Table Editor:**
   - Vasemmalta: **Table Editor**
   - Valitse: **receipts** table

3. **Enable Realtime:**
   - Settings (⚙️ oikealla ylhäällä)
   - **Realtime** -osio
   - **Enable Realtime** → **ON** ✅
   - Valitse eventit:
     - ✅ **INSERT**
     - ✅ **UPDATE**
     - ✅ **DELETE**
   - **Save**

4. **Testaa:**
   - Avaa `/dashboard` frontendissa
   - Lisää testi-kuitti Supabase Table Editorissa
   - Dashboard pitäisi päivittyä **automaattisesti**!

**✅ Valmis!** Realtime toimii nyt.

---

## ✅ **Vahvistus Checklist:**

- [ ] Backend environment variables asetettu Renderissä
- [ ] Backend health check toimii: `curl https://backend.onrender.com/health`
- [ ] Frontend environment variables asetettu
- [ ] Frontend premium page latautuu
- [ ] Supabase Realtime enabled receipts-taululle
- [ ] Testattu: Dashboard päivittyy automaattisesti

---

## 🚨 **Jos Jotain Menee Pieleen:**

### **Backend ei käynnisty:**
- Tarkista Render logs: Dashboard → Service → Logs
- Tarkista että kaikki environment variables on oikein
- Tarkista että `SENTRY_DSN` on oikeassa muodossa

### **Frontend ei lataudu:**
- Tarkista browser console (F12)
- Tarkista että `NEXT_PUBLIC_*` muuttujat on asetettu
- Tarkista network tab → onko API-kutsut toimivat

### **Realtime ei toimi:**
- Varmista että Realtime on enabled Supabase Dashboardissa
- Tarkista browser console → onko WebSocket-yhteys
- Testaa uudelleen: Lisää kuitti → dashboard pitäisi päivittyä

---

## 📞 **Tarvitset Apua?**

- **Render:** Dashboard → Support
- **Supabase:** https://supabase.com/support
- **Sentry:** https://sentry.io/support

---

**Aika:** ~15-20 minuuttia kaikkeen

**Kun nämä ovat valmiit → Projekti on valmis tuotantoon!** 🚀

---

© 2025 Converto Business OS


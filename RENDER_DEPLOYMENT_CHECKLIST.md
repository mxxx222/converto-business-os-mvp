# ✅ RENDER DEPLOYMENT CHECKLIST

**Converto™ Business OS MVP**
**Target**: Production-ready deployment
**Time**: ~30 min

---

## 📋 **PRE-DEPLOYMENT**

### **1. Lokaalit testit** (5 min)
- [ ] Backend käynnistyy: `uvicorn app.main:app --reload`
- [ ] Frontend käynnistyy: `cd frontend && npm run dev`
- [ ] Health-endpointit toimivat:
  - [ ] `curl http://localhost:8010/health`
  - [ ] `curl http://localhost:3004`
- [ ] Auth-sivu näkyy: `http://localhost:3004/auth`
- [ ] Dashboard näkyy: `http://localhost:3004/dashboard`

### **2. Ympäristömuuttujat valmiina** (5 min)
- [ ] OpenAI API key: `sk-proj-xxx`
- [ ] JWT Secret generoitu: `openssl rand -hex 32`
- [ ] (Optional) Resend API key: `re_xxx`
- [ ] (Optional) Sentry DSN

### **3. Git valmis** (2 min)
- [ ] Kaikki muutokset commitoitu
- [ ] Pushattu GitHub:iin: `git push origin main`
- [ ] Ei `.env` tiedostoja repossa
- [ ] `.gitignore` kunnossa

---

## 🚀 **RENDER DEPLOYMENT**

### **STEP 1: Luo Backend Service** (5 min)

1. **Mene**: https://dashboard.render.com/
2. **Klikkaa**: "New +" → "Web Service"
3. **Valitse**: GitHub repo `converto-business-os-quantum-mvp`
4. **Täytä**:
   ```
   Name:           converto-backend
   Region:         Frankfurt
   Branch:         main
   Root Directory: (tyhjä)
   Runtime:        Python 3
   Build Command:  pip install -U pip && pip install -r requirements.txt
   Start Command:  uvicorn app.main:app --host 0.0.0.0 --port $PORT
   Plan:           Starter ($7/mo)
   ```

5. **Environment Variables**:
   ```
   ENV             = production
   AI_PROVIDER     = openai
   OPENAI_API_KEY  = sk-proj-xxx
   JWT_SECRET      = <your-32-char-secret>
   ```

6. **Klikkaa**: "Create Web Service"

7. **Odota**: Build valmistuu (~3-5 min)

### **STEP 2: Lisää PostgreSQL** (2 min)

1. **Dashboard** → "New +" → "PostgreSQL"
2. **Täytä**:
   ```
   Name:   converto-db
   Region: Frankfurt
   Plan:   Starter ($7/mo)
   ```
3. **Klikkaa**: "Create Database"
4. **Linkitä**: Database → "Connect to" → valitse `converto-backend`
5. ✅ `DATABASE_URL` asettuu automaattisesti!

### **STEP 3: Testaa Backend** (1 min)

```bash
# Kopioi backend-URL Renderistä (esim. https://converto-backend.onrender.com)
curl https://YOUR-BACKEND-URL/health

# Odotettu vastaus:
# {"status":"healthy","version":"0.1.0","service":"adas-llm",...}
```

- [ ] Health check toimii
- [ ] Database yhteys OK (katso Render logs)

### **STEP 4: Luo Frontend Service** (5 min)

1. **Mene**: Dashboard → "New +" → "Web Service"
2. **Valitse**: Sama GitHub repo
3. **Täytä**:
   ```
   Name:           converto-frontend
   Region:         Frankfurt
   Branch:         main
   Root Directory: (tyhjä)
   Runtime:        Node
   Build Command:  cd frontend && npm ci && npm run build
   Start Command:  cd frontend && npm run start
   Plan:           Starter ($7/mo)
   ```

4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_BASE    = https://YOUR-BACKEND-URL
   NEXT_PUBLIC_APP_ENV     = production
   FEATURE_PREMIUM_HOME    = 1
   ```

5. **Klikkaa**: "Create Web Service"

6. **Odota**: Build valmistuu (~5-7 min)

### **STEP 5: Testaa Frontend** (2 min)

```bash
# Kopioi frontend-URL (esim. https://converto-frontend.onrender.com)
curl https://YOUR-FRONTEND-URL

# Pitäisi palauttaa HTML jossa "Converto™"
```

- [ ] Etusivu latautuu
- [ ] Navbar näkyy
- [ ] Theme switcher toimii
- [ ] Lang switcher toimii

### **STEP 6: Testaa Integraatio** (3 min)

1. **Avaa selaimessa**: `https://YOUR-FRONTEND-URL/auth`
2. **Testaa**:
   - [ ] Auth-sivu latautuu
   - [ ] Magic Link -lomake näkyy
   - [ ] TOTP-lomake näkyy
3. **Testaa API-kutsu**:
   ```bash
   curl -X POST https://YOUR-BACKEND-URL/api/v1/auth/magic/request \
     -H "Content-Type: application/json" \
     -d '{"email":"test@converto.fi"}'
   ```
   - [ ] Palauttaa `{"status":"sent",...}` (tai virheen jos RESEND_API_KEY puuttuu)

### **STEP 7: Custom Domains (Optional)** (10 min)

1. **Backend**:
   - Render Dashboard → `converto-backend` → "Settings" → "Custom Domain"
   - Lisää: `api.converto.fi`
   - Kopioi CNAME-tietue domain-rekisteröijällesi

2. **Frontend**:
   - Render Dashboard → `converto-frontend` → "Settings" → "Custom Domain"
   - Lisää: `app.converto.fi`
   - Kopioi CNAME-tietue domain-rekisteröijällesi

3. **Odota**: DNS propagaatio (~5-30 min)

4. **Päivitä frontend ENV**:
   ```
   NEXT_PUBLIC_API_BASE = https://api.converto.fi
   ```

5. **Redeploy**: Frontend → "Manual Deploy" → "Deploy latest commit"

---

## ✅ **POST-DEPLOYMENT TESTS**

### **Smoke Tests:**
- [ ] **Etusivu**: `https://app.converto.fi`
- [ ] **Features**: `https://app.converto.fi/features`
- [ ] **Auth**: `https://app.converto.fi/auth`
- [ ] **Dashboard**: `https://app.converto.fi/dashboard`
- [ ] **OCR**: `https://app.converto.fi/selko/ocr`
- [ ] **VAT**: `https://app.converto.fi/vat`
- [ ] **Billing**: `https://app.converto.fi/billing`

### **API Tests:**
```bash
# Health
curl https://api.converto.fi/health

# Docs
curl https://api.converto.fi/docs

# Auth
curl -X POST https://api.converto.fi/api/v1/auth/magic/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@converto.fi"}'
```

### **UI Tests (selaimessa):**
- [ ] Navbar näkyy kaikilla sivuilla
- [ ] Theme switcher toimii (☀️🌙🖥️)
- [ ] Lang switcher toimii (🇫🇮🇬🇧🇷🇺)
- [ ] Command Palette (⌘K / Ctrl+K)
- [ ] Logos + Testimonials + Trust Badges etusivulla
- [ ] ROI Calculator billing-sivulla
- [ ] Status Chips dashboard/OCR/VAT -sivuilla
- [ ] Toast notifications toimivat

---

## 📊 **MONITORING**

### **Render Dashboard:**
- [ ] Backend service: "Healthy"
- [ ] Frontend service: "Healthy"
- [ ] Database: "Available"
- [ ] Ei error-logeja

### **Sentry (jos käytössä):**
- [ ] Ei kriittisiä virheitä
- [ ] Performance OK

### **PostHog (jos käytössä):**
- [ ] Events tallentuvat
- [ ] Käyttäjäsessiot näkyvät

---

## 🎉 **SUCCESS CRITERIA**

✅ **Backend**: Käynnissä, health check OK, database yhdistetty
✅ **Frontend**: Käynnissä, kaikki sivut latautuvat, API-yhteys toimii
✅ **Auth**: Magic Link ja TOTP-lomakkeet näkyvät
✅ **UI**: Premium UI yhtenäinen kaikilla sivuilla
✅ **Themes**: Dark/Light toimivat
✅ **i18n**: FI/EN/RU vaihtuvat

---

## 🐛 **YLEISIMMÄT ONGELMAT**

### **"Backend ei käynnisty"**
- Tarkista Render logs
- Varmista että `requirements.txt` on repo-juuressa
- Testaa lokaalisti: `uvicorn app.main:app --reload`

### **"Frontend ei löydä API:a"**
- Tarkista `NEXT_PUBLIC_API_BASE`
- Varmista että backend URL on oikein
- Tarkista CORS-asetukset backendissä

### **"Database connection error"**
- Varmista että PostgreSQL on linkitetty backend-serviceen
- Tarkista `DATABASE_URL` Environment Variables -listasta
- Katso database logs Render dashboardista

### **"Magic Link ei toimi"**
- Lisää `RESEND_API_KEY` (vapaaehtoinen MVP:ssä)
- Tai käytä TOTP-kirjautumista (ei vaadi email-API:a)

---

## 📞 **TUKI**

**Render Docs**: https://render.com/docs
**Converto Docs**: `docs/ENV_REQUIREMENTS_MVP.md`
**Support**: support@converto.fi

---

**DEPLOYMENT TIME**: ~30 min
**MONTHLY COST**: $14-21 (Starter plan x2 + PostgreSQL)
**UPTIME**: 99.9%

**VALMIS! 🚀**

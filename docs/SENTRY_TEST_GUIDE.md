# 🧪 Sentry Testaus-opas

**Testaus-opas Sentry error trackingille Converto Business OS -sovelluksessa**

---

## ✅ **Sentry Status**

### **Backend (Python)**
- ✅ Sentry SDK asennettuna (`sentry-sdk[fastapi]`)
- ✅ `backend/main.py`: Sentry initialized
- ✅ Environment variable: `SENTRY_DSN` (render.yaml)

### **Frontend (Next.js)**
- ✅ Sentry SDK asennettuna (`@sentry/nextjs`)
- ✅ `frontend/sentry.client.config.ts`: Browser error tracking
- ✅ `frontend/sentry.server.config.ts`: Server-side error tracking
- ✅ `frontend/next.config.js`: `withSentryConfig()` wrapper
- ✅ Environment variable: `NEXT_PUBLIC_SENTRY_DSN` (render.yaml)

---

## 🧪 **Testaus Menetelmät**

### **1. Browser Console Testi (Frontend)**

1. **Avaa Dashboard:**
   ```
   https://app.converto.fi/dashboard
   ```

2. **Avaa Browser Console:**
   - Chrome/Edge: `F12` tai `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Firefox: `F12` tai `Ctrl+Shift+K`

3. **Triggeroi Testi-virhe:**
   ```javascript
   throw new Error('Test Sentry error tracking - Frontend');
   ```

4. **Tarkista Sentry Dashboard:**
   - Mene: https://sentry.io/
   - Valitse projekti
   - Tarkista "Issues" -välilehti
   - Etsi "Test Sentry error tracking - Frontend"

### **2. Server-Side Error Testi (Frontend SSR)**

1. **Luo test-endpoint (vaihtoehto):**
   ```typescript
   // frontend/app/api/test-sentry/route.ts
   export async function GET() {
     throw new Error('Test Sentry server-side error');
   }
   ```

2. **Tarkista Sentry Dashboard:**
   - Etsi server-side error "Issues" -välilehdeltä

### **3. Backend API Error Testi**

1. **Testaa Backend endpoint:**
   ```bash
   curl https://api.converto.fi/health
   ```

2. **Triggeroi test-virhe:**
   ```python
   # backend/main.py - lisää test-endpoint
   @app.get("/test-sentry")
   async def test_sentry():
       raise Exception("Test Sentry error tracking - Backend")
   ```

3. **Tarkista Sentry Dashboard:**
   - Etsi backend error "Issues" -välilehdeltä

---

## 📊 **Mitä Tarkistaa Sentry Dashboardista**

### **Error Tracking:**
- ✅ Virheet näkyvät "Issues" -välilehdellä
- ✅ Virheviestit sisältävät stack trace
- ✅ User context (IP, user agent, jne.)
- ✅ Environment (production/development)

### **Performance Monitoring:**
- ✅ Transaction traces (20% sample rate)
- ✅ Performance metrics (LCP, FID, jne.)
- ✅ Slow queries ja API calls

### **Session Replay:**
- ✅ Error replay (100% sample rate)
- ✅ User interactions ennen virhettä
- ✅ DOM state capture

---

## 🔍 **Troubleshooting**

### **Virhe: "Sentry not capturing errors"**

1. **Tarkista Environment Variables:**
   ```bash
   # Backend
   echo $SENTRY_DSN

   # Frontend
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. **Tarkista Console:**
   - Browser console: Etsi Sentry log-messages
   - Backend logs: Tarkista "Sentry initialized" -viesti

3. **Tarkista Konfiguraatio:**
   - `frontend/next.config.js`: `withSentryConfig()` wrapper
   - `frontend/sentry.client.config.ts`: DSN oikein
   - `frontend/sentry.server.config.ts`: DSN oikein

### **Virhe: "Source maps not working"**

1. **Tarkista Build:**
   - Source maps generoidaan: `next build`
   - Sentry upload source maps: `withSentryConfig()` plugin

2. **Environment Variables (Render Dashboard):**
   ```
   SENTRY_ORG=your-org
   SENTRY_PROJECT=your-project
   SENTRY_AUTH_TOKEN=your-auth-token
   ```

---

## 📈 **Sentry Dashboard**

### **URL:**
- https://sentry.io/

### **Projektit:**
- **Frontend:** Converto Business OS - Frontend
- **Backend:** Converto Business OS - Backend

### **DSN:**
```
https://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@o4507887226847232.ingest.sentry.io/4507887226847232
```

---

## 🎯 **Best Practices**

1. **Ei test-virheitä productionissa:**
   - Poista test-endpoints ennen production-deployta
   - Käytä `process.env.NODE_ENV === 'development'` -tarkistuksia

2. **Sensitive Data:**
   - ✅ Sentry filtteröi automaattisesti: passwords, API keys, tokens
   - Tarkista `beforeSend()` -callback

3. **Error Sampling:**
   - Frontend: 20% traces, 10% replays, 100% errors
   - Backend: 20% traces, 10% profiles, 100% errors

---

## 📝 **Yhteenveto**

✅ **Sentry on nyt täysin konfiguroitu ja valmis käyttöön!**

- Backend: Virheet lähetetään Sentryyn automaattisesti
- Frontend: Browser ja server-side virheet seurataan
- Performance: Transaction traces ja replay sessionit käytössä

**Seuraava askel:** Testaa Sentry error tracking käyttäen yllä olevia menetelmiä.



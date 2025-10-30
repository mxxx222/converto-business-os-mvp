# 🔍 Sentry - Taustalla Tapahtuva

**Selitys Sentryn toiminnasta ja mitä se tekee automaattisesti taustalla**

---

## 🎯 **Mitä Sentry Tekee?**

Sentry on **error tracking ja performance monitoring** -järjestelmä, joka kerää ja analysoi automaattisesti:

1. **Virheet ja poikkeukset** (errors & exceptions)
2. **Suorituskyvyn mittarit** (performance metrics)
329. **Käyttäjäistuntojen tallennus** (session replay)
4. **Release-seuranta** (deployment tracking)

---

## ⚙️ **Taustalla Tapahtuva**

### **1. Error Tracking (Automaattinen)**

#### **Frontend (Browser):**

```typescript
// sentry.client.config.ts
// Sentry automaattisesti:
// 1. Kaappaa kaikki uncaught JavaScript-errors
window.addEventListener('error', (event) => {
  Sentry.captureException(event.error);
});

// 2. React-komponenttien virheet
// Error Boundaries → Sentry
componentDidCatch(error, errorInfo) {
  Sentry.captureException(error, {
    contexts: { react: { componentStack: errorInfo.componentStack } }
  });
}

// 3. Promise-rejections
window.addEventListener('unhandledrejection', (event) => {
  Sentry固化Exception(event.reason);
});
```

**Mitä tapahtuu:**
- ✅ Automaattinen error capture kaikista JavaScript-virheistä
- ✅ Stack trace kerätään (mikä rivi, mikä funktio)
- ✅ Browser info (Chrome, Firefox, versio)
- ✅ URL missä virhe tapahtui
- ✅ Käyttäjän IP (anonymisoitu)
- ✅ Session ID (jotta voidaan seurata samaa käyttäjää)

#### **Backend (FastAPI):**

```python
# backend/main.py
# Sentry automaattisesti:
# 1. Kaappaa kaikki FastAPI-exceptionit
@app.exception_handler(Exception)
async def sentry_exception_handler(request, exc):
    sentry_sdk.capture_exception(exc)
    # ... original error handler

# 2. Logging-integration
# Jokainen logger.error() → Sentry
logger.error("Something went wrong")
# ↑ Automaattisesti lähetetään Sentryyn
```

**Mitä tapahtuu:**
- ✅ Kaikki FastAPI HTTP-exceptionit
- ✅ Database-errors (SQLAlchemy exceptions)
- ✅ Network-errors (httpx, requests)
- ✅ Custom exceptions (kaikki Python-exceptionit)
- ✅ Request context (URL, method, headers)
- ✅ User context (user_id jos saatavilla)

---

### **2. Performance Monitoring (Automaattinen)**

#### **Frontend:**

```typescript
// Sentry automaattisesti seuraa:
// - Page load time (LCP, FID, CLS)
// - API call duration
// - Component render time
// - Network requests (fetch, XMLHttpRequest)

// TracesSampleRate: 0.2 = 20% käyttäjistä
// Jokainen 5. käyttäjä → performance data lähetetään
```

**Mitä mitataan:**
- 📊 **Page Load:** Kuinka kauan sivu latautuu
- 📊 **API Calls:** Backend-kutsujen kesto
- 📊 **User Interactions:** Click → response -aika
- 📊 **Resource Loading:** Images, fonts, scripts

#### **Backend:**

```python
# Sentry automaattisesti seuraa:
# - Request duration (GET /api/v1/receipts → 150ms)
# - Database query time
# - External API calls (OpenAI, Resend)

# TracesSampleRate: 0.2 = 20% requesteista
# Jokainen 5. request → performance data lähetetään
```

**Mitä mitataan:**
- 📊 **Endpoint Performance:** `/api/v1/receipts/scan` → 250ms avg
- 📊 **Database Queries:** SELECT receipts → 45ms
- 📊 **External APIs:** OpenAI API → 1.2s
- 📊 **Slow Requests:** P95, P99 latenssit

---

### **3. Session Replay (Valikoiva)**

#### **Frontend:**

```typescript
// ReplayIntegration automaattisesti:
// 1. Tallenna DOM-muutokset (mitä käyttäjä näkee)
// 2. Tallenna hiiren liikkeet ja klikkaukset
// 3. Tallenna keyboard input (ei salasanoja)
// 4. Tallenna network requests

// ReplaysSessionSampleRate: 0.1 = 10% istunnoista
// ReplaysOnErrorSampleRate: 1.0 = 100% jos virhe tapahtuu
```

**Mitä tallennetaan:**
- 🎥 **Visual Replay:** Näet mitä käyttäjä näki ennen virhettä
- 🎥 **User Actions:** Clicks, scrolls, form submissions
- 🎥 **Console Logs:** JavaScript console output
- 🎥 **Network Activity:** API calls, responses

**Käyttötapaus:**
```
Käyttäjä: "En pääse kirjautumaan sisään"
Sentry: → Katso replay → Näet että login-nappi ei toimi
→ Korjaa ongelma 10 minuutissa vs. 2 tuntia debuggausta
```

---

### **4. Context & Metadata (Automaattinen)**

#### **Frontend:**

```typescript
// Sentry automaattisesti lisää:
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",  // Jos saatavilla
    "ip_address": "{{auto}}",      // Anonymisoitu
  },
  "contexts": {
    "browser": {
      "name": "Chrome",
      "version": "120.0.0"
    },
    "device": {
      "family": "Desktop",
      "model": "MacBook Pro"
    },
    "os": {
      "name": "macOS",
      "version": "14.0"
    },
    "location": {
      "country_code": "FI",  // IP-pohjainen
      "city": "Helsinki"
    }
  },
  "tags": {
    "environment": "production",
    "release": "v1.0.0"
  },
  "breadcrumbs": [
    // Automaattisesti kerätty käyttäjän toiminnot:
    { "action": "click", "element": "button#login" },
    { "action": "navigation", "from": "/", "to": "/dashboard" },
    { "action": "http", "url": "/api/v1/receipts", "status": 200 }
  ]
}
```

#### **Backend:**

```python
# Sentry automaattisesti lisää:
{
  "request": {
    "url": "https://api.converto.fi/api/v1/receipts/scan",
    "method": "POST",
    "headers": {
      "user-agent": "Mozilla/5.0...",
      "authorization": "Bearer ***"  # Redactattu
    },
    "data": {...}  # Request body
  },
  "user": {
    "id": "user-123",  # request.state.user_id
    "ip_address": "{{auto}}"
  },
  "tags": {
    "endpoint": "/api/v1/receipts/scan",
    "method": "POST",
    "status_code": 500
  },
  "breadcrumbs": [
    # Automaattisesti kerätty backend-operations:
    { "action": "db.query", "query": "SELECT * FROM receipts" },
    { "action": "http", "url": "https://api.openai.com/...", "duration": 1200 },
    { "action": "cache.get", "key": "receipt:123" }
  ]
}
```

---

## 🔄 **Reaaliaikainen Flow**

### **Kun Virhe Tapahtuu:**

```
1. USER ACTION
   ↓
   Käyttäjä klikkaa "Lataa kuitti" -nappia
   
2. ERROR OCCURS
   ↓
   JavaScript error: "Cannot read property 'vendor' of undefined"
   
3. SENTRY CAPTURES (automaattisesti)
   ↓
   a) Stack trace kerätään
   b) Browser info kerätään
   c) User context lisätään
   d) Breadcrumbs lisätään (mitä käyttäjä teki ennen virhettä)
   e) Session replay tallennetaan (jos error)
   
4. DATA SENT TO SENTRY
   ↓
   POST https://o4507887226847232.ingest.sentry.io/api/123/envelope/
   Headers: Authorization: Sentry sentry_key=sntryu_xxx
   
5. SENTRY PROCESSES
   ↓
   a) Grouping: Sama virhe → sama issue
   b) Deduplication: Identtiset virheet yhdistetään
   c) Alerting: Jos uusi virhe tai suuri määrä → email/Slack
   d) Storage: Virhe tallennetaan Sentry-databaseen
   
6. DASHBOARD UPDATE
   ↓
   https://sentry.io/organizations/xxx/issues/123/
   → Näet virheen, stack tracen, replay-videon, käyttäjät
```

---

## 🛡️ **Sensitive Data Filtering**

### **Automaattinen Suojaus:**

```python
# backend/main.py
before_send=lambda event, hint: event if not any(
    secret in str(event).lower()
    for secret in ["password", "api_key", "token", "secret"]
) else None
```

**Mitä filtteröidään:**
- ❌ Passwords
- ❌ API keys (`OPENAI_API_KEY`, `RESEND_API_KEY`)
- ❌ Tokens (`Bearer token`, JWT)
- ❌ Secrets (`SUPABASE_SERVICE_ROLE_KEY`)
- ❌ Cookies (frontend)

**Mitä säilytetään:**
- ✅ Error messages
- ✅ Stack traces
- ✅ Request URLs
- ✅ User IDs (ei henkilötietoja)
- ✅ Performance data

---

## 📊 **Mitä Näet Sentry Dashboardissa**

### **Issues (Virheet):**

```
1. Error Group
   ├── Title: "Cannot read property 'vendor' of undefined"
   ├── Count: 47 occurrences (24h)
   ├── Users: 12 affected
   ├── First Seen: 2025-01-15 10:23
   ├── Last Seen: 2025-01-15 14:45
   └── Stack Trace:
       app/dashboard/page.tsx:45
       → receipts.map(r => r.vendor)
       → TypeError: Cannot read property...
```

### **Performance (Suorituskyky):**

```
1. Endpoint: POST /api/v1/receipts/scan
   ├── P50: 180ms (50% requesteista < 180ms)
   ├── P95: 450ms (95% requesteista < 450ms)
   ├── P99: 1200ms (99% requesteista < 1200ms)
   ├── Throughput: 120 req/min
   └── Slow деqueries:
       └── SELECT receipts: 45ms avg (database)
```

### **Replays (Session Tallennukset):**

```
1. Session: user-123-session-abc
   ├── Duration: 5m 23s
   ├── Errors: 1 (virhe tapahtui 2:45 kohdalla)
   ├── Actions: 34 clicks, 12 navigations
   └── Video: ▶️ Play replay
       → Näet mitä käyttäjä näki ja teki ennen virhettä
```

---

## 🚨 **Alerting (Automaattinen)**

Sentry lähettää automaattisesti ilmoituksia kun:

1. **Uusi Virhe:** Ensimmäinen kerta kun virhe tapahtuu
2. **High Frequency:** > 100 virhettä tunnissa
3. **Regression:** Virhe palaa takaisin (oli korjattu, mutta tuli uudestaan)
4. **Slow Performance:** P95 latency > 1000ms

**Kanavat:**
- 📧 Email
- 💬 Slack (jos konfiguroitu)
- 🔔 In-app notifications

---

## 💰 **Kustannukset**

### **Hinnat (Sentry Free Tier):**

- ✅ **5,000 errors/month** - ilmainen
- ✅ **10,000 performance units/month** - ilmainen
- ✅ **Session replay** - 1,000 sessions/month - ilmainen
- ✅ **1 team member** - ilmainen

**Ylitykset:**
- 📈 $26/month → 50k errors
- 📈 $80/month → 200k errors + team

**Optimointi:**
- `tracesSampleRate: 0.2` = 20% sampling → vähemmän dataa
- `replaysSessionSampleRate: 0.1` = 10% sessions → vähemmän replaytia
- **Result:** Free tier riittää useimmissa tapauksissa

---

## ✅ **Yhteenveto**

**Sentry tekee taustalla:**

1. ✅ **Automaattinen error tracking** - kaikki virheet lähetetään
2. ✅ **Performance monitoring** - 20% requesteista mitataan
3. ✅ **Session replay** - 10% istunnoista tallennetaan
4. ✅ **Context collection** - user, browser, device info
5. ✅ **Breadcrumbs** Pyrkinut käyttäjän toiminnot
6. ✅ **Alerting** - ilmoitukset uusista virheistä
7. ✅ **Deduplication** - samat virheet yhdistetään
8. ✅ **Security filtering** - salasanoja, API-avaimia ei lähetetä

**Ei vaadi koodimuutoksia** - Sentry toimii automaattisesti kun DSN on asetettu!

---

**Last Updated:** 2025-01-XX © 2025 Converto Business OS


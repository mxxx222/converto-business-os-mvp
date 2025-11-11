# Converto Business OS - Tekninen Yleiskatsaus

## 🏗️ Arkkitehtuuri

### Frontend (Next.js 14)

**Landing Page (Vaihe 1):**
```
converto.fi/
├── /coming-soon          # Pääsivu, pilot signup
├── /privacy-policy       # Tietosuoja
├── /terms               # Käyttöehdot
├── /contact             # Yhteystiedot
├── /blog                # Blogi (tulevaisuudessa)
└── /thanks              # Kiitos-sivu
```

**Business OS (Vaihe 2):**
```
app.converto.fi/
├── /dashboard           # Pääsivu
├── /business-graph      # D3.js visualisointi
├── /receipts            # Kuitit
├── /invoices            # Laskut
├── /analytics           # Gamified analytics
└── /settings            # Asetukset
```

**PWA Features:**
- `manifest.json` - App metadata, installable
- `sw.js` - Service Worker (offline, background sync)
- IndexedDB - Offline cache
- Push notifications - Re-engagement

**I18n (5 kieltä):**
- fi, en, sv, ru, et
- URL routing: `/fi/`, `/en/` jne.
- `locales/*.json` - Käännökset
- `useTranslations()` hook

**Themes:**
- **NeoTech** (oletus) - Sininen, neon, tech
- **Nordic Minimal** - Vihreä, minimal, luonto

### Backend (API Routes)

**Public APIs (Landing):**
```typescript
POST /api/pilot-signup    # Pilot ilmoittautuminen
POST /api/contact         # Yhteystietolomake
GET  /api/health         # Health check
```

**Business OS APIs (Vaihe 2):**
```typescript
POST /api/ocr/upload     # Kuitin tunnistus
GET  /api/receipts       # Kuitit lista
POST /api/invoices       # Lasku luonti
GET  /api/analytics      # Tilastot
POST /api/voice/command  # Äänikomennot
```

**Security:**
- Honeypot field - Spam suojaus
- IP rate limit - 10 req/min
- JWT auth - Business OS
- CORS headers

### Database (Supabase)

**Landing Page:**
```sql
-- Pilot ilmoittautumiset
CREATE TABLE pilot_signups (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  company TEXT,
  role TEXT,
  created_at TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

-- Yhteystietolomakkeet
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  message TEXT,
  created_at TIMESTAMP
);
```

**Business OS (Vaihe 2):**
```sql
-- Käyttäjät
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  tenant_id UUID,
  role TEXT,
  created_at TIMESTAMP
);

-- Yritykset
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  name TEXT,
  theme JSONB,
  settings JSONB
);

-- Kuitit
CREATE TABLE receipts (
  id UUID PRIMARY KEY,
  tenant_id UUID,
  vendor TEXT,
  amount DECIMAL,
  ocr_data JSONB,
  created_at TIMESTAMP
);
```

---

## 🎮 Strategiset Erotusmerkit

### 1. Business Graph (D3.js)
**Tekninen toteutus:**
```typescript
// Force-directed graph
const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links))
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter());

// Interaktiivinen zoom/pan
const zoom = d3.zoom()
  .scaleExtent([0.1, 4])
  .on("zoom", (event) => {
    svg.attr("transform", event.transform);
  });
```

**Myyntiargumentti:** "Näe yrityksesi rakenne yhdellä silmäyksellä"

### 2. Gamified Analytics
**Tekninen toteutus:**
```typescript
// Zustand store
const useAchievements = create((set) => ({
  xp: 0,
  badges: [],
  addXP: (amount) => set(state => ({ xp: state.xp + amount })),
  unlockAchievement: (id) => set(state => ({
    badges: [...state.badges, id]
  }))
}));

// Framer Motion animaatiot
<motion.div
  initial={{ scale: 0.8 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring" }}
>
```

**Myyntiargumentti:** "Tee kirjanpidosta peli - tiimi kilpailee parhaasta"

### 3. AI Voice Commands
**Tekninen toteutus:**
```typescript
// Web Speech API
const recognition = new webkitSpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;
recognition.lang = "fi-FI";

recognition.onresult = (event) => {
  const command = event.results[0][0].transcript;
  processVoiceCommand(command);
};
```

**Myyntiargumentti:** "Puhu yrityksellesi - ei tarvitse klikkailla"

### 4. Tenant Theme Engine
**Tekninen toteutus:**
```typescript
// CSS variables
:root {
  --color-primary: #9333EA;
  --color-accent: #14B8A6;
}

// Middleware
const tenantTheme = getTenantTheme(tenantId);
res.headers.set('x-tenant-theme', JSON.stringify(tenantTheme));

// ThemeProvider
useEffect(() => {
  const theme = JSON.parse(document.body.dataset.theme);
  document.documentElement.style.setProperty("--color-primary", theme.primary);
}, []);
```

**Myyntiargumentti:** "Näytä oma brändi - ei geneeristä"

### 5. Offline PWA
**Tekninen toteutus:**
```typescript
// Service Worker
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/ocr/upload')) {
    event.respondWith(
      navigator.onLine
        ? fetch(event.request)
        : putInQueue(event.request)
    );
  }
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'ocr-sync') {
    event.waitUntil(processQueue());
  }
});
```

**Myyntiargumentti:** "Toimii missä tahansa - myös metsässä"

---

## 💰 Myyntiargumentit

### Pääargumentit

1. **"Älykäs automaatio"** - Ei "AI-hype"
   - Kuitit → laskut → verot automaattisesti
   - Oppiva järjestelmä parantuu ajan myötä
   - OCR tunnistaa 95% kuiteista

2. **"Näe kaikki yhdessä paikassa"**
   - Business Graph näyttää suhteet
   - Ei tarvitse vaihtaa ohjelmia
   - Reaaliaikainen seuranta

3. **"Tiimi tykkää käyttää"**
   - Gamification tekee työstä hauskaa
   - Kilpailu parantaa laatua
   - XP, tasot, saavutukset

4. **"Toimii missä tahansa"**
   - PWA offline-kykyinen
   - Voice commands nopeuttavat
   - Mobile-first design

5. **"Näytä oma brändi"**
   - Tenant themes
   - Ei geneeristä ulkoasua
   - Custom CSS variables

### Kilpailuedut

**vs. Excel:**
- ✅ Automaatio
- ✅ Visualisointi
- ✅ Tiimi collaboration
- ✅ Offline sync

**vs. Perinteiset ERP:**
- ✅ PWA (ei asennusta)
- ✅ Gamification
- ✅ Voice commands
- ✅ Modern UI/UX

**vs. Pilvipalvelut:**
- ✅ Offline capability
- ✅ Tenant themes
- ✅ Suomalainen tuki
- ✅ GDPR compliant

---

## 🔧 Kehittäjälle: Jatkokehitys

### Prioriteetit (järjestyksessä)

1. **Stripe integraatio** - Laskutus toimii
2. **OCR pipeline** - Kuitit tunnistetaan
3. **Business Graph** - D3.js visualisointi
4. **Gamification** - XP, saavutukset
5. **Voice Commands** - Web Speech API
6. **Theme Engine** - Tenant-specific CSS

### Tekninen Stack

**Frontend:**
- Next.js 14 (App Router, RSC)
- Tailwind CSS + Framer Motion
- Zustand (state management)
- D3.js (visualisointi)
- next-intl (i18n)
- Lucide React (icons)

**Backend:**
- Next.js API Routes
- Supabase (database)
- Resend (email)
- Stripe (laskutus)
- OpenAI (OCR)
- ioredis (cache)

**DevOps:**
- Render (hosting)
- GitHub Actions (CI/CD)
- Sentry (error tracking)
- Vercel Analytics (performance)

### Skaalaus

**Kun kasvaa:**
1. **Redis** - Cache, rate limiting
2. **CDN** - Staattiset assetit
3. **Load balancer** - Useita instansseja
4. **Database sharding** - Tenant per shard
5. **Microservices** - OCR, billing erikseen

---

## 📊 Performance

### Core Web Vitals
- **LCP:** < 2.5s (Next.js Image optimization)
- **FID:** < 100ms (React Server Components)
- **CLS:** < 0.1 (Stable layouts)

### Bundle Size
- **Landing:** ~200KB (gzipped)
- **Business OS:** ~500KB (gzipped)
- **Code splitting:** Route-based

### Caching
- **Static assets:** 1 year
- **API responses:** 60s
- **Service Worker:** Offline cache

---

## 🚨 Security

### Authentication
- JWT tokens (HS256)
- Refresh token rotation
- Session timeout

### Data Protection
- GDPR compliant
- Data encryption at rest
- Secure headers (CSP, HSTS)

### Rate Limiting
- IP-based: 10 req/min
- User-based: 100 req/min
- Honeypot fields

---

## 📱 Mobile

### PWA Features
- Installable
- Offline capability
- Push notifications
- Background sync

### Responsive Design
- Mobile-first
- Touch-friendly
- Gesture support

---

**Valmis deploytaamaan! 🚀**

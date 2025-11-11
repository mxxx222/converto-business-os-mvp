# Converto Business OS - Deploy-ohje (Suomi)

## 🚀 Vaihe 1: Landing Page Deploy (NYT)

### Pakolliset ympäristömuuttujat Renderissä

**converto-dashboard** palvelussa aseta:

```bash
# Supabase (pakollinen)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend Email (pakollinen)
RESEND_API_KEY=re_xxx
FROM_EMAIL=noreply@converto.fi

# I18n (pakollinen)
NEXT_PUBLIC_I18N_ENABLED=true

# Theme (pakollinen)
NEXT_PUBLIC_THEME=neotech

# Analytics (valinnainen)
NEXT_PUBLIC_PLAUSIBLE=false
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=converto.fi
NEXT_PUBLIC_PLAUSIBLE_SRC=https://plausible.io/js/script.js

NEXT_PUBLIC_GA4=false
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

### Supabase Setup

1. **Luo taulu pilot_signups:**
```sql
CREATE TABLE pilot_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  company TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- RLS pois päältä service role:lle
ALTER TABLE pilot_signups DISABLE ROW LEVEL SECURITY;
```

2. **Päivittäiset varmuuskopiot:** Supabase Dashboard → Settings → Database → Backups

### Resend Email Setup

1. **Domain verify:** Resend Dashboard → Domains → Add converto.fi
2. **SPF/DKIM:** Lisää DNS-tietueet
3. **Testi:** Lähetä testi-email

### Render Deploy

1. **Deploy render.yaml:**
```bash
# Repo on jo pushattu, Render automaattisesti deployaa
```

2. **Domain binding:** converto.fi → converto-dashboard service
3. **SSL:** Automaattinen Let's Encrypt

### Smoke Test (pakollinen ennen live)

```bash
# 1. Landing page toimii
curl -I https://converto.fi/coming-soon

# 2. Kieli vaihtuu
# Avaa selain → vaihda kieli → tarkista URL muuttuu

# 3. Ilmoittautuminen toimii
# Täytä lomake → tarkista Supabase taulu → tarkista email tulee

# 4. Legal sivut
curl -I https://converto.fi/privacy-policy
curl -I https://converto.fi/terms

# 5. Health check
curl https://converto.fi/api/health
# Pitäisi palauttaa: {"status":"ok","timestamp":"..."}

# 6. PWA
# Chrome DevTools → Application → Manifest → tarkista installable
```

---

## 🎯 Vaihe 2: Business OS Aukeaa (3-4 päivän päästä)

### Ympäristömuuttujat (lisää Renderiin)

```bash
# Stripe (kun laskutus aukeaa)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Auth (kun kirjautuminen aukeaa)
JWT_SECRET_KEY=xxx
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# AI/OCR (kun OCR aukeaa)
OPENAI_API_KEY=sk-xxx
OCR_LANG=fin+eng
VISION_MODEL=gpt-4o-mini

# Database (kun tietokanta aukeaa)
DATABASE_URL=postgresql://xxx

# Redis (kun cache aukeaa)
REDIS_URL=redis://xxx
```

### Domain Strategy

**Suositus:**
- `converto.fi` → Landing page (marketing, pilot signup)
- `app.converto.fi` → Business OS (kirjautuminen vaaditaan)

**Vaihtoehto:**
- `converto.fi/app` → Business OS (sama domain, auth-gated)

### Auth Flow Aukeaa

1. **Middleware päivitä:** Poista `coming-soon` whitelist:stä
2. **Stripe enable:** Lisää keys → billing flow aktivoituu
3. **Database:** Migrate taulut → käyttäjät, yritykset, kuitit
4. **OCR:** OpenAI key → kuitin tunnistus toimii

---

## 🏗️ Tekninen Rakenne

### Frontend (Next.js 14)

**Landing Page:**
- `/coming-soon` - Pääsivu, pilot signup
- `/privacy-policy` - Tietosuoja
- `/terms` - Käyttöehdot
- `/contact` - Yhteystiedot
- `/blog` - Blogi (tulevaisuudessa)

**PWA Features:**
- `manifest.json` - App metadata
- `sw.js` - Service Worker (offline, sync)
- Install button - "Lisää kotiin"

**I18n:**
- 5 kieltä: fi, en, sv, ru, et
- `locales/*.json` - Käännökset
- URL routing: `/fi/`, `/en/` jne.

**Themes:**
- NeoTech (oletus) - Sininen, neon
- Nordic Minimal - Vihreä, minimal

### Backend (API Routes)

**Public APIs:**
- `POST /api/pilot-signup` - Pilot ilmoittautuminen
- `POST /api/contact` - Yhteystietolomake
- `GET /api/health` - Health check

**Security:**
- Honeypot field - Spam suojaus
- IP rate limit - 10 req/min
- Email validation

### Database (Supabase)

**Taulut:**
- `pilot_signups` - Pilot ilmoittautumiset
- `contact_submissions` - Yhteystietolomakkeet

**RLS:** Pois päältä service role:lle

---

## 🎮 Strategiset Erotusmerkit (Business OS)

### 1. Business Graph (D3.js)
- **Mitä:** Visuaalinen verkko tilauksista, kuiteista, veroista
- **Myynti:** "Näe yrityksesi rakenne yhdellä silmäyksellä"

### 2. Gamified Analytics
- **Mitä:** XP, tasot, saavutukset, tiimi ranking
- **Myynti:** "Tee kirjanpidosta peli - tiimi kilpailee parhaasta"

### 3. AI Voice Commands
- **Mitä:** "Lataa kuitti", "Näytä liikevaihto"
- **Myynti:** "Puhu yrityksellesi - ei tarvitse klikkailla"

### 4. Tenant Theme Engine
- **Mitä:** Yrityskohtaiset värit, logo, tyyli
- **Myynti:** "Näytä oma brändi - ei geneeristä"

### 5. Offline PWA
- **Mitä:** Toimii ilman nettiä, synkronoi myöhemmin
- **Myynti:** "Toimii missä tahansa - myös metsässä"

---

## 💰 Myyntiargumentit

### Pääargumentit

1. **"Älykäs automaatio"** - Ei "AI-hype"
   - Kuitit → laskut → verot automaattisesti
   - Oppiva järjestelmä parantuu ajan myötä

2. **"Näe kaikki yhdessä paikassa"**
   - Business Graph näyttää suhteet
   - Ei tarvitse vaihtaa ohjelmia

3. **"Tiimi tykkää käyttää"**
   - Gamification tekee työstä hauskaa
   - Kilpailu parantaa laatua

4. **"Toimii missä tahansa"**
   - PWA offline-kykyinen
   - Voice commands nopeuttavat

5. **"Näytä oma brändi"**
   - Tenant themes
   - Ei geneeristä ulkoasua

### Kilpailuedut

- **vs. Excel:** Automaatio, visualisointi, tiimi
- **vs. Perinteiset ERP:** PWA, gamification, voice
- **vs. Pilvipalvelut:** Offline, tenant themes, suomalainen

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
- Zustand (state)
- D3.js (visualisointi)
- next-intl (i18n)

**Backend:**
- Next.js API Routes
- Supabase (DB)
- Resend (email)
- Stripe (laskutus)
- OpenAI (OCR)

**DevOps:**
- Render (hosting)
- GitHub Actions (CI/CD)
- Sentry (errors)
- Vercel Analytics (perf)

### Skaalaus

**Kun kasvaa:**
1. **Redis** - Cache, rate limiting
2. **CDN** - Staattiset assetit
3. **Load balancer** - Useita instansseja
4. **Database sharding** - Tenant per shard
5. **Microservices** - OCR, billing erikseen

---

## 📞 Asiakkaalle: Käyttöohje

### Landing Page (Nyt)

1. **Avaa** converto.fi
2. **Valitse kieli** oikeasta yläkulmasta
3. **Täytä lomake** - sähköposti, yritys, rooli
4. **Odota** vahvistusviestiä
5. **Saat ilmoituksen** kun pilotti käynnistyy

### Business OS (Tulevaisuudessa)

1. **Kirjaudu sisään** app.converto.fi
2. **Lataa kuitit** - OCR tunnistaa automaattisesti
3. **Tarkista tiedot** - järjestelmä ehdottaa
4. **Hyväksy** - laskut luodaan automaattisesti
5. **Seuraa** Business Graph:issa
6. **Kilpaile** tiimissä - kerää XP
7. **Käytä ääntä** - "Näytä liikevaihto"

### Tuki

- **Email:** support@converto.fi
- **Chat:** Integroitu Slack
- **Docs:** converto.fi/docs (tulevaisuudessa)

---

## 🚨 Tärkeää Muistaa

### Ennen Live Deploy

- [ ] Supabase taulu luotu
- [ ] Resend domain verified
- [ ] Render envs asetettu
- [ ] Smoke test tehty
- [ ] SSL toimii
- [ ] PWA installable

### Vaihe 2 (Business OS)

- [ ] Stripe keys lisätty
- [ ] Auth middleware päivitetty
- [ ] Database migrated
- [ ] OCR pipeline testattu
- [ ] app.converto.fi domain
- [ ] User onboarding flow

### Monitoring

- **Errors:** Sentry
- **Performance:** Vercel Analytics
- **Uptime:** Render health checks
- **Users:** Supabase dashboard

---

**Valmis deploytaamaan! 🚀**

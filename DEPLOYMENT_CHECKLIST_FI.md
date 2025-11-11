# 🚀 Converto Deploy Checklist - Suomi

## ✅ Ennen Deployta

### 1. Supabase Setup
- [ ] **Luo Supabase projekti** (jos ei ole)
- [ ] **Aja SQL-skripti:** `SUPABASE_SETUP.sql` → SQL Editor
- [ ] **Tarkista taulut:**
  - `pilot_signups` taulu luotu
  - `pilot_signups_stats` view luotu
  - RLS = OFF
- [ ] **Päivittäiset varmuuskopiot:** Settings → Database → Backups → Enable

### 2. Resend Email Setup
- [ ] **Luo Resend tili** (jos ei ole)
- [ ] **Domain verify:** converto.fi → DNS-tietueet
- [ ] **SPF/DKIM:** Lisää DNS-tietueet
- [ ] **Testi-email:** Lähetä testi vahvistaaksesi

### 3. Render Setup
- [ ] **render.yaml** on projektin juuressa
- [ ] **Git push** tehty (Render tunnistaa automaattisesti)
- [ ] **Blueprint deploy:** New → Blueprint → From repo

### 4. Ympäristömuuttujat Renderissä

**Pakolliset (sync: false):**
- [ ] `SUPABASE_SERVICE_ROLE` - Supabase → Settings → API → Service Role Key
- [ ] `RESEND_API_KEY` - Resend → Dashboard → API Keys → Create Key

**Valinnaiset:**
- [ ] `REPORT_EMAILS` - "ops@converto.fi,founder@converto.fi" (cron raportit)
- [ ] `SENTRY_DSN` - Jos haluat error tracking

### 5. Domain Setup
- [ ] **converto.fi** → `converto-dashboard` service
- [ ] **staging.converto.fi** → `converto-staging` service (valinnainen)
- [ ] **SSL sertifikaatit** aktivoituvat automaattisesti

---

## 🧪 Smoke Test (Deployin jälkeen)

### Landing Page
- [ ] **Pääsivu:** `https://converto.fi/` → redirect `/coming-soon`
- [ ] **Kieli vaihtuu:** fi/en/sv/ru/et
- [ ] **Lomake toimii:** Täytä → tarkista Supabase rivi
- [ ] **Email tulee:** Vahvistusviesti Resend:stä

### Legal Sivut
- [ ] **Privacy:** `https://converto.fi/privacy-policy` → 200
- [ ] **Terms:** `https://converto.fi/terms` → 200
- [ ] **Footer linkit** toimivat

### API Endpoints
- [ ] **Health:** `https://converto.fi/api/health` → `{"status":"ok"}`
- [ ] **Pilot signup:** POST → Supabase rivi + email
- [ ] **Rate limiting:** 10 req/min toimii

### PWA Features
- [ ] **Manifest:** Chrome DevTools → Application → Manifest
- [ ] **Service Worker:** Rekisteröityy
- [ ] **Install button:** Näkyy selaimessa

### Analytics (jos käytössä)
- [ ] **Plausible:** `https://converto.fi` → dashboard
- [ ] **GA4:** Events lähtevät

---

## 📊 Cron Report Test

### Testaa Päivittäinen Raportti
```bash
# Testaa paikallisesti
curl http://localhost:3000/api/pilot-report

# Vastaus: {"ok": true, "total": X}
```

### Render Cron
- [ ] **Cron job** luotu: `daily-pilot-report`
- [ ] **Schedule:** 0 8 * * * (joka päivä klo 08:00 UTC)
- [ ] **Testi:** Odota seuraava ajo tai aja manuaalisesti

---

## 🔧 Vaihe 2: Business OS (3-4 päivän päästä)

### Ympäristömuuttujat (lisää Renderiin)
- [ ] **Stripe:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`
- [ ] **Auth:** `JWT_SECRET_KEY`, `JWT_ALGORITHM`
- [ ] **AI/OCR:** `OPENAI_API_KEY`, `OCR_LANG`
- [ ] **Database:** `DATABASE_URL` (jos erillinen)

### Domain Strategy
- [ ] **app.converto.fi** → Business OS
- [ ] **converto.fi** → Landing page (pysyy)

### Middleware Päivitys
- [ ] **Poista** `coming-soon` whitelist:stä
- [ ] **Auth routes** takaisin päälle

---

## 🚨 Tärkeää Muistaa

### Security
- [ ] **SUPABASE_SERVICE_ROLE** vain serverillä (Render env)
- [ ] **RESEND_API_KEY** vain serverillä
- [ ] **Rate limiting** toimii
- [ ] **CORS** rajoitettu oikeisiin domain:eihin

### Monitoring
- [ ] **Render logs** seurataan
- [ ] **Supabase logs** tarkistetaan
- [ ] **Resend delivery** varmistetaan
- [ ] **Health checks** toimivat

### Backup
- [ ] **Supabase** päivittäiset varmuuskopiot
- [ ] **Git** kaikki koodi versionhallinnassa
- [ ] **Render** automaattiset varmuuskopiot

---

## 📞 Tuki

### Jos Jotain Menee Pieleen
1. **Render Dashboard** → Logs
2. **Supabase Dashboard** → Logs
3. **Resend Dashboard** → Delivery
4. **GitHub** → Actions (jos CI/CD)

### Yhteystiedot
- **Email:** support@converto.fi
- **Slack:** #deployment (jos käytössä)

---

**🎉 Valmis mennä liveen!**

Kun kaikki ruksit on tehty, Converto Business OS on valmis ottamaan vastaan pilot-ilmoittautumisia!

# 🚀 Vercel Environment Variables - Asetusohje (Dashboard Deploy)

## 📋 Tarvittavat Ympäristömuuttujat

### ✅ Arvot Dokumentaatiosta (VERCEL_ENV_VARS.md):

```bash
# Supabase Configuration (LÖYTYI DOKUMENTAATIOSTA)
NEXT_PUBLIC_SUPABASE_URL=https://foejjbrcudpvuwdisnpz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_r5h9a67JPdv_wGbSsYLQow_FHznio6w
SUPABASE_SERVICE_ROLE_KEY=sb_secret_FiceWb9D3W3JeIZii1Rcmw_OXKQqZrB

# Sentry Configuration (LÖYTYI env.example:stä)
NEXT_PUBLIC_SENTRY_DSN=https://05d83543fe122b7a6a232d6e8194321b@o4510201257787392.ingest.de.sentry.io/4510398360518736
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1

# API Configuration (Fly.io Backend)
NEXT_PUBLIC_API_URL=https://docflow-admin-api.fly.dev
NEXT_PUBLIC_WS_URL=wss://docflow-admin-api.fly.dev/ws

# App URL (asetetaan automaattisesti Vercelissa, mutta voi asettaa manuaalisesti)
NEXT_PUBLIC_APP_URL=https://your-dashboard.vercel.app
```

---

## 🎯 Asetusvaihtoehdot

### Option A: Vercel Dashboard (Suositus)

1. **Avaa Vercel Dashboard:**
   - Mene: https://vercel.com/dashboard
   - Valitse Dashboard-projekti (tai luo uusi jos ei ole)

2. **Aseta Environment Variables:**
   - Valitse projekti → **Settings** → **Environment Variables**
   - Lisää jokainen muuttuja:
     - **Key**: Muuttujan nimi (esim. `NEXT_PUBLIC_SUPABASE_URL`)
     - **Value**: Muuttujan arvo
     - **Environment**: Valitse **Production**, **Preview**, ja **Development**
   - Klikkaa **Save**

3. **Redeploy:**
   - Mene **Deployments**-välilehteen
   - Klikkaa **Redeploy** viimeisimmälle deploymentille
   - TAI odota seuraavaa automaattista deployta

### Option B: Vercel CLI

```bash
# 1. Asenna Vercel CLI (jos ei ole)
npm i -g vercel

# 2. Login
vercel login

# 3. Link projektiin (jos ei ole linkitetty)
cd apps/dashboard
vercel link

# 4. Aseta environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# (Syötä arvo kun kysytään)

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_SENTRY_DSN production
vercel env add NEXT_PUBLIC_ENV production
vercel env add NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE production
vercel env add NEXT_PUBLIC_API_URL production
vercel env add NEXT_PUBLIC_WS_URL production

# 5. Deploy
vercel --prod
```

### Option C: Tarkista Nykyiset Arvot

Jos haluat tarkistaa onko muuttujat jo asetettu:

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Tarkista että kaikki yllä olevat muuttujat on listassa
3. Jos puuttuu, lisää ne Option A:n mukaan

---

## ✅ Tarkistuslista

Aseta seuraavat muuttujat **kaikille ympäristöille** (Production, Preview, Development):

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_SENTRY_DSN`
- [ ] `NEXT_PUBLIC_ENV` (arvo: `production`)
- [ ] `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` (arvo: `0.1`)
- [ ] `NEXT_PUBLIC_API_URL`
- [ ] `NEXT_PUBLIC_WS_URL`
- [ ] `NEXT_PUBLIC_APP_URL` (valinnainen, Vercel asettaa automaattisesti)

---

## 🚀 Deploy Vaiheet

### 1. Aseta Environment Variables (yllä olevat vaihtoehdot)

### 2. Deploy Dashboard

**Automaattinen Deploy:**
- Push `docflow-main` branchiin → Vercel deployaa automaattisesti (jos repo on linkitetty)

**Manuaalinen Deploy:**
```bash
cd apps/dashboard
vercel --prod
```

### 3. Verify Deployment

```bash
# Tarkista että dashboard latautuu
curl -I https://your-dashboard.vercel.app

# Tarkista että API-yhteys toimii (tarvitsee auth)
# Avaa selaimessa: https://your-dashboard.vercel.app/analytics
```

---

## 🔍 Troubleshooting

### Build Epäonnistuu "Missing Environment Variables"

- Tarkista että kaikki muuttujat on asetettu **Production**-ympäristöön
- Tarkista että muuttujien nimet ovat oikein (case-sensitive)
- Redeploy projektin

### API-yhteydet Eivät Toimi

- Tarkista että `NEXT_PUBLIC_API_URL` on oikein: `https://docflow-admin-api.fly.dev`
- Tarkista että `NEXT_PUBLIC_WS_URL` on oikein: `wss://docflow-admin-api.fly.dev/ws`
- Testaa backend: `curl https://docflow-admin-api.fly.dev/health`

### Sentry Ei Toimi

- Tarkista että `NEXT_PUBLIC_SENTRY_DSN` on oikein
- Tarkista Sentry dashboardista että projekti on aktiivinen
- Testaa aiheuttamalla virhe sovelluksessa

---

## 📝 Seuraavat Askeleet

1. ✅ Aseta environment variables (Option A tai B)
2. ✅ Deploy dashboard (automaattinen tai manuaalinen)
3. ✅ Testaa deployment (tarkista että kaikki toimii)
4. ✅ Verify Sentry (tarkista että virheet lähetetään)
5. ✅ Verify WebSocket (tarkista ConnectionStatus komponentti)

---

**Status:** Valmiina deploytaamiseen kun environment variables on asetettu! 🚀


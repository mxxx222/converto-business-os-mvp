# Vercel Environment Variables Setup - Frontend Project

## Overview

Frontend-projektin beta signup API vaatii Supabase service role key:n toimiaakseen oikein. Tämä dokumentti ohjaa sinut läpi env var -asetusten.

## Required Environment Variables

### 1. SUPABASE_SERVICE_ROLE_KEY (NEW - Required)

**Purpose:** Service role key mahdollistaa API:lle kirjoittaa `beta_signups` tauluun ohittaen RLS-säännöt.

**How to get:**
1. Mene: https://supabase.com/dashboard
2. Valitse DocFlow-projekti
3. Settings (vasemmassa sivupalkissa) → **API**
4. Etsi **"service_role" secret** (piilossa, klikkaa "Reveal" nähdäksesi)
5. Kopioi koko key (alkaa yleensä `sb_secret_...`)

**⚠️ Security Warning:**
- Service role key ohittaa kaikki RLS-säännöt
- Älä koskaan committaa tätä repoon
- Älä jaa tätä julkisesti
- Vain server-side koodissa (API routes)

### 2. NEXT_PUBLIC_SUPABASE_URL (Should already exist)

**Purpose:** Supabase projektin URL.

**Value format:** `https://foejjbrcudpvuwdisnpz.supabase.co`

**How to verify:**
- Supabase Dashboard → Settings → API → Project URL

## Step-by-Step: Add to Vercel

### Step 1: Access Vercel Dashboard

1. Mene: https://vercel.com/dashboard
2. Valitse **frontend**-projekti (ei marketing, ei dashboard)

### Step 2: Navigate to Environment Variables

1. Klikkaa **Settings** (projektin yläpalkissa)
2. Klikkaa **Environment Variables** (vasemmassa navigaatiossa)

### Step 3: Add SUPABASE_SERVICE_ROLE_KEY

1. Klikkaa **Add New**
2. Täytä:
   - **Name:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** [Liitä service role key tähän]
   - **Environments:** 
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
3. Klikkaa **Save**

### Step 4: Verify NEXT_PUBLIC_SUPABASE_URL exists

1. Tarkista että listassa on:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - Arvo: `https://foejjbrcudpvuwdisnpz.supabase.co` (tai vastaava)
2. Jos puuttuu, lisää se samalla tavalla kuin yllä

## Verification Checklist

- [ ] Service role key kopioitu Supabasesta
- [ ] `SUPABASE_SERVICE_ROLE_KEY` lisätty Verceliin
- [ ] Valittu kaikki 3 environmenttia (Production, Preview, Development)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` on olemassa ja oikea
- [ ] Molemmat env vars näkyvät Vercel dashboardissa

## After Setup

Kun env vars on asetettu:

1. **Redeploy** projektia (Vercel deployaa automaattisesti jos Git push, mutta voit myös manuaalisesti):
   - Vercel Dashboard → Deployments → "..." → Redeploy

2. **Test API:**
```bash
curl -X POST https://docflow.fi/api/beta-signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Testi Testaaja",
    "company": "Test Oy",
    "email": "test@example.com",
    "phone": "+358401234567",
    "monthly_invoices": "50-200",
    "document_types": ["Laskut (invoices)"],
    "start_timeline": "Within 1 month",
    "weekly_feedback_ok": true
  }'
```

3. **Verify in Supabase:**
   - Supabase Dashboard → Table Editor → `beta_signups`
   - Pitäisi näkyä uusi rivi

## Troubleshooting

### API returns "Database not configured"

**Cause:** `SUPABASE_SERVICE_ROLE_KEY` puuttuu tai on väärä.

**Fix:**
1. Tarkista Vercel env vars
2. Varmista että key on kopioitu kokonaan (ei katkennut)
3. Redeploy projekti

### API returns "Failed to save signup"

**Cause:** Supabase-yhteys ongelma tai RLS-säännöt estävät.

**Fix:**
1. Tarkista että `beta_signups` taulu on luotu Supabasessa
2. Tarkista että service role key on oikea
3. Tarkista Supabase logs: Dashboard → Logs → API Logs

### Build fails

**Cause:** Env vars puuttuvat build-time.

**Fix:**
- Varmista että env vars on lisätty kaikkiin environmentteihin
- Vercel käyttää env vars build-time jos ne on merkitty "Build-time"

## Security Notes

- Service role key on **herkkä** - älä jaa sitä
- Käytä aina Vercel env vars, älä hardcode
- Tarkista että key on oikea projektin service role key (ei anon key)
- Jos key vuotaa, vaihda se heti Supabasessa

## Related Files

- `frontend/app/api/beta-signup/route.ts` - API route joka käyttää näitä env vars
- `apps/dashboard/supabase-beta-signups-schema.sql` - Database schema


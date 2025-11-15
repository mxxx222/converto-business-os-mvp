# 📋 VEROPILOT-AI Deployment - Kopioi-Liitä Checklist

**Käytä tätä listaa kun konfaat environment variablet!**

---

## 🗄️ STEP 1: SUPABASE (5 min)

### 1.1 Kirjaudu ja luo projekti
```
🌐 Avaa: https://app.supabase.com/projects
🔐 Kirjaudu: GitHub / Email
```

### 1.2 Luo uusi projekti
```
📍 Click: "New Project"

Täytä:
- Organization: [Valitse tai luo uusi]
- Name: veropilot-ai-prod
- Database Password: [GENEROI VAHVA - TALLENNA!]
- Region: North Europe (eu-north-1)
- Pricing: Free

⏰ Odota 2-3 min projektin valmistumista
```

### 1.3 Kopioi API Keys
```
🌐 Mene: https://app.supabase.com/project/_/settings/api

📋 KOPIOI NÄMÄ (tallenna turvalliseen paikkaan):

1️⃣ Project URL:
   Näkyy: "Project URL"
   Arvo: https://xxxxxxxxxx.supabase.co
   ➡️ KOPIOI → TALLENNA nimellä: NEXT_PUBLIC_SUPABASE_URL

2️⃣ anon public:
   Näkyy: "Project API keys" → "anon" → "public"
   Arvo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ➡️ KOPIOI → TALLENNA nimellä: NEXT_PUBLIC_SUPABASE_ANON_KEY

3️⃣ service_role:
   Näkyy: "Project API keys" → "service_role"
   Arvo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ⚠️ SALAINEN! ÄLÄ JAA!
   ➡️ KOPIOI → TALLENNA nimellä: SUPABASE_SERVICE_ROLE_KEY
```

### 1.4 Aja SQL Migrations
```
🌐 Mene: https://app.supabase.com/project/_/sql/new

📂 Avaa paikallisesti: /Users/herbspotturku/docflow/docflow/supabase/migrations/

Aja JÄRJESTYKSESSÄ:

1️⃣ 20241114_001_documents_table.sql
   - Avaa tiedosto
   - CTRL+A → CTRL+C (kopioi kaikki)
   - Liitä SQL Editoriin
   - Click: "Run"
   - Varmista: "Success" ✅

2️⃣ 20241114_002_vat_analysis_table.sql
   - Avaa tiedosto
   - CTRL+A → CTRL+C
   - Liitä SQL Editoriin
   - Click: "Run"
   - Varmista: "Success" ✅

3️⃣ 20241114_003_storage_bucket.sql
   - Avaa tiedosto
   - CTRL+A → CTRL+C
   - Liitä SQL Editoriin
   - Click: "Run"
   - Varmista: "Success" ✅

4️⃣ 20241114_004_functions.sql
   - Avaa tiedosto
   - CTRL+A → CTRL+C
   - Liitä SQL Editoriin
   - Click: "Run"
   - Varmista: "Success" ✅
```

### 1.5 Varmista taulut
```
🌐 Mene: https://app.supabase.com/project/_/editor

Tarkista että näkyvät:
✅ documents
✅ vat_analysis
✅ document_processing_logs

🌐 Mene: https://app.supabase.com/project/_/storage/buckets

Tarkista että näkyy:
✅ documents (private)
```

---

## 🔑 STEP 2: OPENAI API KEY (2 min)

### 2.1 Kirjaudu ja luo API key
```
🌐 Avaa: https://platform.openai.com/api-keys
🔐 Kirjaudu: Email / Google / Microsoft
```

### 2.2 Luo uusi API key
```
📍 Click: "+ Create new secret key"

Täytä:
- Name: veropilot-ai-prod
- Permissions: All (tai "Model capabilities")
- Project: Default project

📍 Click: "Create secret key"

⚠️ KOPIOI HETI! (näkyy vain kerran)

📋 KOPIOI:
   Arvo: sk-proj-xxxxxxxxxxxxxxxxxxxxx
   ➡️ KOPIOI → TALLENNA nimellä: OPENAI_API_KEY
```

### 2.3 Lisää krediittiä
```
🌐 Mene: https://platform.openai.com/account/billing/overview

📍 Click: "Add payment method"
- Lisää luottokortti
- Tallenna

📍 Click: "Add to credit balance"
- Amount: $50 (suositus Phase 1:lle)
- Confirm
```

### 2.4 Aseta spending limit
```
🌐 Mene: https://platform.openai.com/account/limits

Aseta:
- Monthly budget: $100
- Email notifications: ✅ 50%, ✅ 80%, ✅ 100%
- Save
```

---

## 🚀 STEP 3: VERCEL DEPLOYMENT (5 min)

### 3.1 Kirjaudu Verceliin
```
🌐 Avaa: https://vercel.com/login
🔐 Kirjaudu: GitHub / GitLab / Bitbucket / Email
```

### 3.2 Deploy frontend (Terminal)
```bash
# Asenna Vercel CLI (jos ei ole)
npm install -g vercel

# Kirjaudu
vercel login

# Deploy
cd /Users/herbspotturku/docflow/docflow/frontend
vercel --prod
```

**Seuraa prompteja:**
- Link to existing project? **No** (ensimmäinen kerta)
- Project name: **veropilot-ai** tai **docflow**
- Directory: **./frontend**
- Override settings? **No**

**⏰ Odota 2-5 min**

**📋 KOPIOI deployment URL:**
```
✅ Production: https://veropilot-ai-xxxxxxxxx.vercel.app
```

---

## 🔧 STEP 4: VERCEL ENVIRONMENT VARIABLES (2 min)

### 4.1 Mene Vercel Dashboardiin
```
🌐 Avaa: https://vercel.com/dashboard
📍 Click: Projektisi nimi (veropilot-ai tai docflow)
📍 Click: "Settings" (yläpalkki)
📍 Click: "Environment Variables" (vasen sivupalkki)
```

### 4.2 Lisää KAIKKI nämä muuttujat

**TÄRKEÄÄ:** Valitse MOLEMMAT ympäristöt jokaiselle:
- ✅ Production
- ✅ Preview

---

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
```
📍 Click: "Add New"

Key: NEXT_PUBLIC_SUPABASE_URL
Value: [LIITÄ Supabase Project URL]
       Esim: https://xxxxxxxxxx.supabase.co

Environments:
✅ Production
✅ Preview

📍 Click: "Save"
```

---

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
📍 Click: "Add New"

Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [LIITÄ Supabase anon public key]
       Esim: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

Environments:
✅ Production
✅ Preview

📍 Click: "Save"
```

---

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY
```
📍 Click: "Add New"

Key: SUPABASE_SERVICE_ROLE_KEY
Value: [LIITÄ Supabase service_role key]
       Esim: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

⚠️ SALAINEN! Älä jaa kenellekään!

Environments:
✅ Production
✅ Preview

📍 Click: "Save"
```

---

#### Variable 4: OPENAI_API_KEY
```
📍 Click: "Add New"

Key: OPENAI_API_KEY
Value: [LIITÄ OpenAI API key]
       Esim: sk-proj-xxxxxxxxxxxxxxxxxxxxx

⚠️ SALAINEN! Älä jaa kenellekään!

Environments:
✅ Production
✅ Preview

📍 Click: "Save"
```

---

#### Variable 5: NEXT_PUBLIC_BACKEND_URL
```
📍 Click: "Add New"

Key: NEXT_PUBLIC_BACKEND_URL
Value: /api/v1

Environments:
✅ Production
✅ Preview

📍 Click: "Save"
```

---

#### Variable 6: NEXT_PUBLIC_APP_URL
```
📍 Click: "Add New"

Key: NEXT_PUBLIC_APP_URL
Value: https://docflow.fi

Environments:
✅ Production ONLY

📍 Click: "Save"

---

Lisää toinen arvo Preview-ympäristölle:

📍 Click: "Add New"

Key: NEXT_PUBLIC_APP_URL
Value: [LIITÄ Vercel deployment URL]
       Esim: https://veropilot-ai-xxxxxxxxx.vercel.app

Environments:
✅ Preview ONLY

📍 Click: "Save"
```

---

#### Variable 7: NODE_ENV
```
📍 Click: "Add New"

Key: NODE_ENV
Value: production

Environments:
✅ Production ONLY

📍 Click: "Save"
```

---

#### Variable 8: NEXTAUTH_URL (jos käytät next-auth)
```
📍 Click: "Add New"

Key: NEXTAUTH_URL
Value: https://docflow.fi

Environments:
✅ Production ONLY

📍 Click: "Save"
```

---

#### Variable 9: NEXTAUTH_SECRET (jos käytät next-auth)
```
🔐 Generoi secret (Terminal):
openssl rand -base64 32

📍 Click: "Add New"

Key: NEXTAUTH_SECRET
Value: [LIITÄ generoitu secret]

⚠️ SALAINEN! Älä jaa kenellekään!

Environments:
✅ Production
✅ Preview

📍 Click: "Save"
```

---

### 4.3 Redeploy uusilla env varsilla
```bash
cd /Users/herbspotturku/docflow/docflow/frontend
vercel --prod
```

---

## 🌐 STEP 5: DOMAIN SETUP (1 min)

### 5.1 Lisää domain Verceliin
```
🌐 Vercel Dashboard → Domains
📍 Click: "Add Domain"

Domain: docflow.fi
📍 Click: "Add"
```

### 5.2 Konfiguroi DNS (domain providerissasi)

**A Record (Apex domain):**
```
Type: A
Name: @ (tai tyhjä)
Value: 76.76.21.21
TTL: 3600
```

**CNAME Record (WWW subdomain):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**⏰ Odota DNS propagaatiota: 5-60 min (joskus 48h)**

---

## ✅ STEP 6: VERIFICATION (1 min)

### 6.1 Automaattinen testaus (Terminal)
```bash
cd /Users/herbspotturku/docflow/docflow
./verify-deployment.sh
# Syötä: docflow.fi
```

### 6.2 Manuaaliset testit (Terminal)

**HSTS Header:**
```bash
curl -Ik https://docflow.fi | egrep -i "strict-transport-security|200"
```

**WWW Redirect:**
```bash
curl -Ik https://www.docflow.fi | egrep -i "301|location:"
```

**robots.txt:**
```bash
curl -I https://docflow.fi/robots.txt
```

**sitemap.xml:**
```bash
curl -I https://docflow.fi/sitemap.xml
```

**API Health:**
```bash
curl https://docflow.fi/api/health
```

**Kaikki kerralla:**
```bash
curl -Ik https://docflow.fi | egrep -i "strict-transport-security|200" && \
curl -Ik https://www.docflow.fi | egrep -i "301|location:" && \
curl -I https://docflow.fi/robots.txt | grep "200" && \
curl -I https://docflow.fi/sitemap.xml | grep "200" && \
curl https://docflow.fi/api/health | grep "healthy"
```

---

## 🧪 STEP 7: FUNCTIONAL TESTING (5 min)

### 7.1 Sign Up Flow
```
1. Mene: https://docflow.fi
2. Click: "Aloita ilmaiseksi" / "Sign Up"
3. Syötä: Email + Password
4. Click: "Rekisteröidy"
5. Tarkista: Email (myös spam)
6. Click: Confirmation link
7. Varmista: Ohjaus dashboardiin
```

### 7.2 Upload Receipt
```
1. Dashboard → "Lataa kuitti"
2. Valitse: Testikuitti (jpg/png)
3. Click: "Lataa"
4. Varmista: "Käsitellään..."
5. Odota: 5-10 sek
6. Varmista: "Valmis" ✅
```

### 7.3 Tarkista OCR Results
```
1. Click: Ladattu kuitti
2. Varmista näkyvät:
   ✅ Vendor name
   ✅ Total amount
   ✅ VAT amount
   ✅ Receipt date
   ✅ Line items
   ✅ OCR confidence %
```

### 7.4 Tarkista VAT Analysis
```
1. Sama kuitti-näkymä
2. Varmista näkyvät:
   ✅ Y-tunnus (jos löytyy)
   ✅ Company info (PRH)
   ✅ VAT breakdown per item
   ✅ Total deductible VAT
   ✅ Suggested booking code
   ✅ VAT confidence %
```

---

## 🎉 DEPLOYMENT COMPLETE!

### ✅ Final Checklist

- [ ] Supabase projekti luotu
- [ ] 3 API keytä kopioitu Supabasesta
- [ ] 4 SQL migrationia ajettu
- [ ] Taulut ja bucket verifioitu
- [ ] OpenAI API key luotu
- [ ] OpenAI krediittiä lisätty ($50)
- [ ] Vercel deployment tehty
- [ ] 9 environment variablea lisätty
- [ ] Domain lisätty (docflow.fi)
- [ ] DNS konffattu
- [ ] Verification testit läpäisty
- [ ] Sign up flow toimii
- [ ] Receipt upload toimii
- [ ] OCR results näkyvät
- [ ] VAT analysis näkyy

---

## 📊 Mitä odottaa

**Suorituskyky:**
- OCR: 3-5 sek (gpt-4o-mini)
- Tarkkuus: >90%
- Uptime: 99.9%

**Kustannukset (Month 1):**
- Supabase: $0 (free tier)
- Vercel: $0 (free tier)
- OpenAI: ~$25 (1000 kuittiä)
- **Total: ~$25/kk**

---

## 🆘 Troubleshooting

**Frontend 500 Error?**
→ Lisää NEXTAUTH_URL ja NEXTAUTH_SECRET

**"Unauthorized" Error?**
→ Tarkista Supabase RLS policies

**OCR ei toimi?**
→ Tarkista OPENAI_API_KEY ja krediitti

**Upload failaa?**
→ Tarkista Supabase storage bucket

---

**🎉 VALMIS! VEROPILOT-AI on nyt tuotannossa! 🚀**

**Deployment aika**: 15 minuuttia  
**Status**: Production Ready  
**Next**: Kutsu beta-käyttäjiä!


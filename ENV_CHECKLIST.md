# ENV_CHECKLIST.md
Ympäristömuuttujat ja tarkistuslista Dashboard (Next.js, apps/dashboard) + Render-backendille.

## 1) Minimi (Hobby, turvallinen aloitus)
# Julkiset (Frontend, ei salaisuuksia)
NEXT_PUBLIC_BASE_URL=https://app.converto.fi
NEXT_PUBLIC_I18N_ENABLED=true
NEXT_PUBLIC_CSV_EXPORT_ENABLED=true
NEXT_PUBLIC_UPLOAD_V2_ENABLED=false

# Server (ei koskaan NEXT_PUBLIC)
NODE_ENV=production
FROM_EMAIL=noreply@converto.fi
RESEND_API_KEY=  # lisää kun käytössä
NEXT_TELEMETRY_DISABLED=1

## 2) Backend (Render) viitteet
# Savutesti käyttää näitä
BACKEND_URL=https://converto-business-os-quantum-mvp-1.onrender.com
HEALTH_PATH=/health

## 3) Supabase (lisää vasta kun otat käyttöön)
# Julkinen
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Server
SUPABASE_SERVICE_ROLE=  # ÄLÄ LAITA NEXT_PUBLIC

## 4) Sähköposti (Resend tms.)
RESEND_API_KEY=
FROM_EMAIL=noreply@converto.fi

## 5) Valinnaiset feature-flägit
NEXT_PUBLIC_SECURITY_STRICT_HEADERS=false
NEXT_PUBLIC_OCR_PROVIDER=tesseract
NEXT_PUBLIC_CSV_EXPORT_ENABLED=true

---

## A) Vercel UI — Project Settings
Framework: Next.js
Root Directory: apps/dashboard
Install Command: npm ci
Build Command: npm run build
Output Directory: .next

## B) Aseta envit (Hobby)
Vercel → Project → Settings → Environment Variables
- Lisää kaikki yllä olevat avain-arvot Environment = Production
- Älä koskaan tallenna server-salaisuuksia NEXT_PUBLIC_-prefiksillä

## C) Verifiointi (ennen Deploy)
- Tarkista että NEXT_PUBLIC_BASE_URL osoittaa tulevaan domainiin tai preview-URLiin
- BACKEND_URL vastaa 200 OK → GET $BACKEND_URL$HEALTH_PATH
- Puuttuvat arvot on tyhjinä, ei feikkiarvoja prodissa

## D) Deploy ja testaus
- Deploy → odota build OK
- Aja savutesti:
  FRONTEND_URL=$NEXT_PUBLIC_BASE_URL \
  BACKEND_URL=$BACKEND_URL \
  ./scripts/smoke-test.sh

Odotetut tulokset:
- Backend: 200 OK { "status": "ok" }
- Frontend: 200 OK perusreitti /dashboard
- CORS ok

## E) Domain (kun valmis)
- Add Domain: app.converto.fi
- Nosta CNAME → *.vercel.app target
- Vahvista HTTPS

## F) Troubleshooting
- 404 /health → käytä /health (ei /api/health) kunnes uusi endpoint deployattu
- 500 buildissa → tarkista puuttuvat envit (varsinkin NEXT_PUBLIC_* ja server-avaimet)
- CORS → salli Vercel-domain + app.converto.fi backendissä

## G) Päivitys Prohon
- Team Settings → Upgrade to Pro
- Ei katkoa. Laskutus alkaa päivityshetkestä.

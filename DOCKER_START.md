# 🐳 Docker Quick Start - Käynnistä KAIKKI yhdellä komennolla!

## ✅ HELPOIN TAPA KÄYNNISTÄÄ CONVERTO!

---

## 1. Luo .env tiedosto

```bash
cd "/Users/mxjlh/Documents/converto-business-os-quantum-mvp (1)"

cat > .env << 'EOF'
OPENAI_API_KEY=SINUN_OPENAI_AVAIN_TÄHÄN
SENTRY_DSN=
NEXT_PUBLIC_DEV_JWT=
EOF
```

**🔑 Hae avain:** https://platform.openai.com/api-keys

---

## 2. Käynnistä KAIKKI (yksi komento!)

```bash
docker-compose up
```

**Tai taustalla:**
```bash
docker-compose up -d
```

---

## 3. Avaa selaimessa

**Odota 30-60 sekuntia** (ensimmäisellä kerralla Docker buildaa imaget)

Sitten avaa:

- 📸 **OCR**: http://localhost:3000/selko/ocr
- 📊 **Dashboard**: http://localhost:3000/dashboard
- 💳 **Billing**: http://localhost:3000/billing
- 🔧 **Backend API**: http://localhost:8000/docs

---

## 🎯 Mitä Docker tekee:

✅ **PostgreSQL** - Tietokanta (port 5432)
✅ **Redis** - Cache (port 6379)
✅ **Backend** - FastAPI (port 8000)
✅ **Frontend** - Next.js (port 3000)

**Kaikki käynnistyy automaattisesti oikeassa järjestyksessä!**

---

## 🛠️ Hyödyllisiä komentoja

```bash
# Katso logeja
docker-compose logs -f

# Katso vain backendin logit
docker-compose logs -f backend

# Pysäytä kaikki
docker-compose down

# Pysäytä ja poista data (fresh start)
docker-compose down -v

# Uudelleenkäynnistä
docker-compose restart

# Katso mitä pyörii
docker-compose ps
```

---

## ✅ Tarkista että toimii

```bash
# Backend health
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000

# Gamify API
curl "http://localhost:8000/api/v1/gamify/summary?tenant_id=demo&user_id=user_demo&days=7"
```

---

## 🎉 VALMIS!

**Docker hoitaa KAIKEN:**
- ✅ Ei tarvitse asentaa Python/Node lokaalisti
- ✅ Ei versio-konflikteja
- ✅ Toimii Macilla, Windowsilla, Linuxilla
- ✅ Helppo jakaa muille kehittäjille

**Käynnistä uudelleen:** `docker-compose up -d`
**Pysäytä:** `docker-compose down`

---

## 🚀 Seuraavat askeleet:

1. **Testaa OCR**: Raahaa kuitti → http://localhost:3000/selko/ocr
2. **Katso dashboard**: http://localhost:3000/dashboard
3. **Deploy tuotantoon**: Railway/Render (samalla docker-compose.yml!)

**Kaikki valmiina! Nauti! 🎊**

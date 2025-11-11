# ⚡ ALOITA NYT - Converto Business OS

## Tilanne NOJT:

✅ **Kaikki koodi on GitHubissa** (21 committia tänään!)
✅ **135 tied ostoa, 4,617 riviä koodia**
✅ **Täysi järjestelmä valmis**: OCR AI, Gamify, P2E, Rewards, Billing, Admin

---

## 🚀 KÄYNNISTÄ 3 ASKELEESSA:

### 1. Luo .env tiedosto (KERRAN)

```bash
cd "/Users/mxjlh/Documents/converto-business-os-quantum-mvp (1)"

cat > .env << 'EOF'
DATABASE_URL=sqlite:///./converto.db
OPENAI_API_KEY=VAIHDA_TÄHÄN_OPENAI_AVAIN
JWT_SECRET=dev-secret-test
ADMIN_TOKEN=test123
EOF
```

**🔑 Hae OpenAI avain:** https://platform.openai.com/api-keys

### 2. Käynnistä palvelut

```bash
bash START_HERE.sh
```

TAI manuaalisesti:

```bash
# Terminaali 1 (Backend):
source venv/bin/activate
uvicorn app.main:app --reload

# Terminaali 2 (Frontend):
cd frontend
npm run dev
```

### 3. Avaa selaimessa

**HUOM: Frontend on portissa 3001!**

- 📸 **OCR**: http://localhost:3001/selko/ocr
- 📊 **Dashboard**: http://localhost:3001/dashboard
- 💳 **Billing**: http://localhost:3001/billing
- ⚙️ **Admin**: http://localhost:3001/admin/economy

---

## ✅ TOIMIIKO?

### Pikatesti:

```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:3001
```

Jos molemmat vastaavat → **TOIMII!** 🎉

---

## 📸 TESTAA OCR:

1. Avaa: http://localhost:3001/selko/ocr
2. Raahaa kuva kuitista
3. Näet AI-analyysin (kauppa, summa, ALV)!

**Hotkeys:**
- `Shift + O` → Avaa skannaus
- `Shift + S` → Viimeisin
- `Shift + R` → Uudelleen

---

## ❌ JOS EI TOIMI:

### Backend-virhe:

```bash
# Katso loki
tail -50 backend.log

# Tarkista Python-versio (pitää olla 3.9+)
python3 --version

# Asenna uudelleen
pip install -r requirements.txt
```

### Frontend-virhe:

```bash
cd frontend

# Asenna uudelleen
rm -rf node_modules
npm install --legacy-peer-deps

# Käynnistä
npm run dev
```

### ".env puuttuu":

Luo .env (katso kohta 1 yllä)

---

## 🌍 JULKAISE NETTIIN (5 min):

1. Mene: https://railway.app
2. Sign up (GitHub)
3. "New Project" → Deploy from GitHub
4. Valitse: `converto-business-os-quantum-mvp-1`
5. Lisää env: `OPENAI_API_KEY`
6. **VALMIS!**

Railway antaa ilmaisen domainin:
- `https://converto.up.railway.app`

---

## 📚 LISÄOHJEET:

- `PIKAOHJE.md` - 5 min quick start
- `ALOITA_TÄSTÄ.md` - Täydellinen opas
- `MAC_MINI_SETUP.md` - Mac mini palvelin
- `QUICK_TEST.md` - Testausohjeet

---

## 🆘 TARVITSETKO APUA?

Katso backend-loki:
```bash
tail -f backend.log
```

Testaa API:
```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/gamify/summary?tenant_id=demo&user_id=user_demo&days=7
```

---

**🎉 ONNEA! Sinulla on MAAILMAN ÄLYKKÄIN kuitintunnistusjärjestelmä valmiina!** 🚀

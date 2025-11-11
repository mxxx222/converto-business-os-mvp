# ⚡ PIKATESTI - Varmista että kaikki toimii (5 min)

## Ennen testiä

### 1. Luo .env tiedosto

```bash
cd "/Users/mxjlh/Documents/converto-business-os-quantum-mvp (1)"
cat > .env << 'EOF'
DATABASE_URL=sqlite:///./converto.db
OPENAI_API_KEY=VAIHDA_TÄHÄN_OPENAI_AVAIN
JWT_SECRET=dev-secret-test
ADMIN_TOKEN=test123
EOF
```

### 2. Asenna (jos ei vielä tehty)

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cd frontend
npm install
cd ..
```

---

## Testi 1: Backend toimii ✅

```bash
source venv/bin/activate
uvicorn app.main:app --reload &
sleep 5

# Test health
curl http://127.0.0.1:8000/health

# Test Gamify
curl -X POST http://127.0.0.1:8000/api/v1/gamify/event \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: demo" \
  -H "x-user-id: user_demo" \
  -d '{"tenant_id":"demo","kind":"test","points":10}'

# Check summary
curl "http://127.0.0.1:8000/api/v1/gamify/summary?tenant_id=demo&user_id=user_demo&days=7"
```

**Odotettu tulos**: JSON-vastaus pisteistä

---

## Testi 2: Frontend toimii ✅

```bash
cd frontend
npm run dev &
sleep 10

# Avaa selaimessa:
open http://localhost:3000/dashboard
```

**Odotettu tulos**:
- Dashboard näkyy
- GamifyCard näyttää pisteitä
- WalletWidget näyttää CT-saldoa
- OCRDropzone näkyy

---

## Testi 3: OCR AI toimii ✅

### 3.1 Testaa API suoraan

```bash
# Lataa testikuva (tai käytä omaa kuittia)
curl -o test-receipt.jpg https://picsum.photos/400/600

# Lähetä OCR-analyysiin
curl -X POST http://127.0.0.1:8000/api/v1/ocr-ai/scan \
  -H "x-tenant-id: demo" \
  -H "x-user-id: user_demo" \
  -F "file=@test-receipt.jpg" \
  -F "auto_confirm=false"
```

**Odotettu tulos**: JSON jossa merchant, total, category

### 3.2 Testaa UI:ssa

1. Avaa: http://localhost:3000/dashboard
2. Raahaa kuva OCRDropzone-laatikkoon
3. Klikkaa "Analysoi"
4. Näet: merchant, summa, kategoria, ALV

**Jos tämä toimii → OCR AI on LIVE!** 🎉

---

## Testi 4: Gamify + P2E integraatio ✅

```bash
# Tee OCR-skannaus (yllä)
# Tarkista pisteet kasvoivat:
curl "http://127.0.0.1:8000/api/v1/gamify/summary?tenant_id=demo&user_id=user_demo&days=7"

# Tarkista CT-saldo kasvoi:
curl "http://127.0.0.1:8000/api/v1/p2e/wallet?t=demo&u=user_demo"
```

**Odotettu tulos**:
- Pisteet +10
- CT-saldo +5

---

## Testi 5: Rewards-lunastus ✅

```bash
# 1. Seed rewards
python scripts/seed_rewards.py

# 2. Listaa palkinnot
curl "http://127.0.0.1:8000/api/v1/rewards/catalog?tenant_id=demo"

# 3. Lunasta (kopioi reward ID edellisestä)
curl -X POST http://127.0.0.1:8000/api/v1/rewards/redeem \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: demo" \
  -H "x-user-id: user_demo" \
  -d '{"tenant_id":"demo","user_id":"user_demo","reward_id":"PASTE_ID_HERE"}'
```

**Odotettu tulos**: "Lunastettu: Kahvilahjakortti 10€"

---

## Testi 6: Hotkeys toimii ✅

1. Avaa: http://localhost:3000/dashboard
2. Paina `Shift + O` → Pitäisi scrollata OCRDropzoneen
3. Paina `Shift + S` → Konsolissa näkyy "show_last"
4. Vasen alas-kulma näyttää hotkey-oppaan

**Jos näppäimet reagoivat → Hotkeys LIVE!** ⌨️

---

## Testi 7: Admin Economy Panel ✅

```bash
# Avaa:
open http://localhost:3000/admin/economy
```

**Odotettu tulos**:
- Näet weights-taulukon
- Voit editoida pisteitä
- Trend-kaavio näkyy

---

## 🎉 Jos kaikki 7 testiä meni läpi:

**ONNEKSI OLKOON! Koko järjestelmä toimii!** 🚀

Seuraavat askeleet:
1. ✅ Hanki OpenAI API key (jos ei vielä)
2. ✅ Deploy Railway
3. ✅ Kutsu 5 betakäyttäjää
4. ✅ Kerää palautetta
5. ✅ Iteroi!

---

## ❌ Jos jotain epäonnistui:

### Backend ei käynnisty
```bash
# Tarkista Python-versio (tarvitaan 3.11+)
python3 --version

# Asenna uudelleen
pip install --upgrade pip
pip install -r requirements.txt
```

### Frontend ei buildaudu
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### OCR palauttaa virheen
- Tarkista että `OPENAI_API_KEY` on .env-tiedostossa
- Tarkista että API key on voimassa
- Testaa OpenAI API suoraan: https://platform.openai.com/playground

### Tietokanta-virhe
```bash
# Luo uusi tietokanta
rm converto.db
python scripts/seed_p2e.py
python scripts/seed_rewards.py
```

---

**Ongelmia?** Lue `ALOITA_TÄSTÄ.md` tarkemmat ohjeet!

**Kaikki toimii?** Jatka → Deploy Railway → Julkaise! 🚀

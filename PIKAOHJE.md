# ⚡ PIKAOHJE - Käynnistä 5 minuutissa

## 1. Asenna (kerran)

```bash
cd "/Users/mxjlh/Documents/converto-business-os-quantum-mvp (1)"

# Backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
cd ..
```

## 2. Luo .env tiedosto

Luo tiedosto `.env` projektin juureen:

```bash
DATABASE_URL=sqlite:///./converto.db
OPENAI_API_KEY=SINUN_OPENAI_AVAIN_TÄHÄN
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
ADMIN_TOKEN=secret123
```

**🔑 Hae OpenAI avain:** https://platform.openai.com/api-keys

## 3. Luo tietokanta

```bash
source venv/bin/activate
python scripts/seed_p2e.py
python scripts/seed_rewards.py
```

## 4. Käynnistä

**Terminaali 1 (Backend):**
```bash
source venv/bin/activate
uvicorn app.main:app --reload
```

**Terminaali 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## 5. Avaa selaimessa

- Dashboard: http://localhost:3000/dashboard
- Billing: http://localhost:3000/billing
- Admin: http://localhost:3000/admin/economy

## 6. Testaa!

1. Avaa Dashboard
2. Ota kuva kuitista
3. Vedä kuva selaimeen
4. Näet tuloksen + saat pisteitä!

---

**Jos jotain menee pieleen:**
- Tarkista että Python on 3.11+
- Tarkista että OpenAI API key on oikein
- Katso virheet terminaalissa
- Lue `ALOITA_TÄSTÄ.md` tarkemmat ohjeet

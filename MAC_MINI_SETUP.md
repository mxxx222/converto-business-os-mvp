# 🍎 Mac mini Server Setup Guide
## Converto Business OS - Kehitys + Staging + Demo

> **Mac mini (M1/M2/M3, 8-16 GB RAM)** on täydellinen alusta MVP-kehitykseen ja pieneen tuotantoon!

---

## ✅ Miksi Mac mini riittää?

| Ominaisuus | Mac mini | Pilvipalvelin (vastaava) |
|------------|----------|--------------------------|
| CPU | M2 8-core | AWS t3.large (2 vCPU) |
| RAM | 8-16 GB | 8-16 GB |
| Hinta | €699 (kertaluontoinen) | ~$70/kk ($840/vuosi) |
| Teho | Natiivi ARM, tehokas | x86, hitaampi |
| Verkko | 1 Gbit/s (koti) | 5 Gbit/s (pilvi) |
| **Tulos** | ✅ Riittää MVP:lle! | Kalliimpi, sama tulos |

### Mihin Mac mini riittää:
- ✅ Lokaalinen kehitys (backend + frontend + DB)
- ✅ Staging-palvelin (Cloudflare Tunnel → julkinen HTTPS)
- ✅ Pienimuotoinen tuotanto (10-100 käyttäjää)
- ✅ OCR + AI API (kutsut OpenAI-pilveen)
- ✅ Docker Compose -stack (Postgres, Redis, FastAPI, Next.js)

---

## 🛠️ Automaattinen Asennus (10 min)

### 1. Homebrew + Dependencies

```bash
# Asenna Homebrew (jos ei vielä)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Päivitä Homebrew
brew update

# Asenna riippuvuudet
brew install python@3.11 node@20 postgresql@16 redis docker docker-compose git

# Käynnistä PostgreSQL ja Redis taustalla
brew services start postgresql@16
brew services start redis
```

### 2. Luo projektin kansiorakenne

```bash
# Data-kansiot
mkdir -p ~/converto-data/{receipts,exports,backups}

# Kloonaa repo (jos ei vielä tehty)
cd ~/Documents
git clone https://github.com/mxxx222/converto-business-os-quantum-mvp-1.git converto
cd converto
```

### 3. Luo .env tiedosto

```bash
cat > .env << 'EOF'
# Database (PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/converto

# JWT Auth
JWT_SECRET=$(openssl rand -hex 32)
JWT_ISS=converto
JWT_AUD=converto-app

# OpenAI (REQUIRED for OCR)
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE

# Admin
ADMIN_TOKEN=$(openssl rand -hex 16)

# P2E Economy
P2E_ENABLED=true
P2E_DAILY_MINT_LIMIT=500
P2E_DAILY_REDEEM_LIMIT=500

# Sentry (optional)
SENTRY_DSN=
SENTRY_ENV=staging

# Paths
ECONOMY_WEIGHTS_PATH=./config/weights.yaml
EOF

echo "✅ .env created! Edit OPENAI_API_KEY now."
```

### 4. Asenna Python-riippuvuudet

```bash
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Luo tietokanta

```bash
# Luo Postgres-tietokanta
createdb converto

# Seed data
python scripts/seed_p2e.py
python scripts/seed_rewards.py

echo "✅ Database created and seeded!"
```

### 6. Asenna Frontend-riippuvuudet

```bash
cd frontend
npm install
cd ..
```

---

## 🚀 Käynnistä palvelut

### Vaihtoehto A: Manuaalinen käynnistys (Dev)

```bash
# Terminaali 1: Backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminaali 2: Frontend
cd frontend
npm run dev
```

**Avaa:** http://localhost:3000/dashboard

### Vaihtoehto B: Docker Compose (Staging)

Luo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: converto
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: .
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000
    volumes:
      - .:/app
      - ~/converto-data/receipts:/receipts
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    command: npm run start
    volumes:
      - ./frontend:/app
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_BASE=http://backend:8000
    depends_on:
      - backend

volumes:
  postgres_data:
```

Käynnistä:

```bash
docker compose up -d
```

**Tarkista:**
```bash
docker compose ps
docker compose logs -f backend
```

---

## 🌐 Julkaise Internetiin (Cloudflare Tunnel)

### 1. Asenna Cloudflare Tunnel

```bash
brew install cloudflared

# Kirjaudu
cloudflared login
```

### 2. Luo tunnel

```bash
# Luo uusi tunnel
cloudflared tunnel create converto-demo

# Huomaa: kopioi tunnel ID ja credentials-polku
```

### 3. Konfiguroi tunnel

Luo `~/.cloudflared/config.yml`:

```yaml
tunnel: YOUR_TUNNEL_ID
credentials-file: /Users/YOURUSER/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  # Frontend
  - hostname: converto-demo.yourdomain.com
    service: http://localhost:3000

  # Backend API
  - hostname: api.converto-demo.yourdomain.com
    service: http://localhost:8000

  # Catch-all
  - service: http_status:404
```

### 4. Käynnistä tunnel

```bash
cloudflared tunnel run converto-demo
```

**Nyt appisi on julkisesti saatavilla:**
- Frontend: `https://converto-demo.yourdomain.com`
- API: `https://api.converto-demo.yourdomain.com`

### 5. Automaattinen käynnistys

```bash
# Asenna palveluna (käynnistyy automaattisesti)
sudo cloudflared service install
sudo launchctl start com.cloudflare.cloudflared
```

---

## 🔒 Turvallisuus

### 1. Firewall

```bash
# Avaa vain SSH ja Tunnel
sudo defaults write /Library/Preferences/com.apple.alf globalstate -int 1

# Salli vain paikallisverkko
# System Settings → Network → Firewall → Advanced
```

### 2. FileVault

```bash
# Salaa koko levy
sudo fdesetup enable
```

### 3. Auto-päivitykset

```bash
# Ota käyttöön automaattiset päivitykset
sudo softwareupdate --schedule on
```

### 4. Backup

```bash
# Time Machine USB-levylle TAI
# Rsync pilveen
rsync -avz ~/Documents/converto user@backup-server:/backups/
```

---

## 📊 Seuranta & Ylläpito

### 1. Käyttöönotto-skripti (automaattinen restart)

Luo `~/scripts/start-converto.sh`:

```bash
#!/bin/bash
cd ~/Documents/converto

# Käynnistä backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 &

# Käynnistä frontend
cd frontend
npm run start &

echo "✅ Converto started!"
echo "   Backend: http://localhost:8000"
echo "   Frontend: http://localhost:3000"
```

Tee ajettavaksi:
```bash
chmod +x ~/scripts/start-converto.sh
```

### 2. LaunchDaemon (käynnistyy Mac mini bootissa)

Luo `/Library/LaunchDaemons/com.converto.app.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.converto.app</string>
    <key>ProgramArguments</key>
    <array>
        <string>/Users/YOURUSER/scripts/start-converto.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Lataa:
```bash
sudo launchctl load /Library/LaunchDaemons/com.converto.app.plist
```

**Nyt Converto käynnistyy automaattisesti kun Mac mini bootaa!**

### 3. Lokit ja virheet

```bash
# Backend logs
tail -f ~/Documents/converto/logs/backend.log

# Frontend logs
tail -f ~/Documents/converto/frontend/.next/trace

# Sentry Dashboard (jos käytössä)
open https://sentry.io
```

---

## 📈 Suorituskykytestit

### Testi 1: API latenssi

```bash
# Test health endpoint
time curl http://localhost:8000/health

# Expected: <50ms
```

### Testi 2: OCR throughput

```bash
# Upload 10 receipts simultaneously
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/v1/ocr-ai/scan \
    -F "file=@test-receipt-$i.jpg" &
done
wait

# Expected: All complete in <30s
```

### Testi 3: Database connections

```bash
# Check Postgres connections
psql -d converto -c "SELECT count(*) FROM pg_stat_activity;"

# Expected: <20 connections
```

---

## 🌍 Skaalaus: Mac mini → Pilvi

### Milloin siirtyä pilveen?

| Signaali | Toimenpide |
|----------|------------|
| >100 aktiivista käyttäjää/päivä | Siirrä backend Railway/Render |
| >1000 kuittia/päivä | Lisää Postgres Replica (Aiven) |
| Globaali käyttö | CDN (Cloudflare) + Edge workers |
| >10 GB dataa | S3/R2 kuittien säilytykseen |

### Hybridimalli (suositus):

**Mac mini** = Dev + staging
**Railway** = Production backend + DB
**Vercel** = Production frontend (edge-optimized)
**S3/R2** = Kuitit ja backupit

Näin saat parhaan molemmista maailmoista:
- Nopea kehitys lokaalisti
- Skaalautuva tuotanto pilvessä
- Kustannustehokas (ei turhia VM-kuluja devissä)

---

## 🧪 Pikatesti (varmista että kaikki toimii)

```bash
# 1. Tarkista että palvelut pyörii
brew services list | grep -E 'postgresql|redis'

# 2. Tarkista Docker
docker ps

# 3. Tarkista backend
curl http://localhost:8000/health

# 4. Tarkista frontend
curl http://localhost:3000

# 5. Tarkista tietokanta
psql -d converto -c "SELECT count(*) FROM gamify_events;"
```

**Jos kaikki OK → Mac mini on valmis! 🎉**

---

## 💾 Varmuuskopiointi

### Automaattinen päivittäinen backup

Luo `~/scripts/backup-converto.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M)
BACKUP_DIR=~/converto-backups

# Luo backup-kansio
mkdir -p $BACKUP_DIR

# 1. Postgres dump
pg_dump converto | gzip > $BACKUP_DIR/db-$DATE.sql.gz

# 2. Kuitit
rsync -az ~/converto-data/receipts/ $BACKUP_DIR/receipts-$DATE/

# 3. Koodi (jos ei GitHubissa)
cd ~/Documents/converto
git archive --format=zip HEAD > $BACKUP_DIR/code-$DATE.zip

# 4. Poista vanhat (>30 päivää)
find $BACKUP_DIR -mtime +30 -delete

echo "✅ Backup complete: $BACKUP_DIR"
```

Ajasta cron-jobina:

```bash
# Editoi crontab
crontab -e

# Lisää rivi (backup klo 03:00 joka yö)
0 3 * * * /Users/YOURUSER/scripts/backup-converto.sh
```

---

## 🔥 Pro Tips

### 1. Kehitysympäristön eristys

Käytä Docker-volumeita jotta dev-data ei sekoitu stagingiin:

```bash
# Dev
docker compose -f docker-compose.dev.yml up

# Staging
docker compose -f docker-compose.staging.yml up
```

### 2. Nopea restart

```bash
# Luo alias
echo 'alias converto-restart="cd ~/Documents/converto && docker compose restart"' >> ~/.zshrc
source ~/.zshrc

# Käytä
converto-restart
```

### 3. Lokien seuranta reaaliajassa

```bash
# Backend + Frontend + DB yhdellä komennolla
docker compose logs -f --tail=50
```

### 4. Resurssien seuranta

```bash
# CPU + RAM + Disk
brew install htop
htop

# Docker-resurssit
docker stats
```

---

## 🌍 Julkinen Demo (Cloudflare Tunnel)

### Nopea setup (5 min)

```bash
# 1. Asenna
brew install cloudflared

# 2. Kirjaudu
cloudflared login

# 3. Luo tunnel
cloudflared tunnel create converto-demo

# 4. Yhdistä domain (jos sinulla on)
cloudflared tunnel route dns converto-demo demo.converto.fi

# 5. Käynnistä
cloudflared tunnel --config ~/.cloudflared/config.yml run converto-demo
```

**Nyt appisi on live:** `https://demo.converto.fi` 🚀

### Ilman omaa domainia:

Cloudflare antaa ilmaisen `*.trycloudflare.com` -subdomain:

```bash
cloudflared tunnel --url http://localhost:3000
```

Saat linkin tyyliin: `https://random-word-1234.trycloudflare.com`

---

## 📊 Resurssien arviointi

### MVP-vaihe (1-100 käyttäjää):

| Palvelu | CPU | RAM | Disk |
|---------|-----|-----|------|
| PostgreSQL | 5% | 500 MB | 1 GB |
| Redis | 2% | 100 MB | 100 MB |
| Backend (FastAPI) | 10% | 1 GB | - |
| Frontend (Next.js) | 5% | 500 MB | - |
| **Yhteensä** | **22%** | **2.1 GB** | **1.2 GB** |

**Mac mini (8 GB RAM) → riittää hyvin! ✅**

### Skaalaus (100-1000 käyttäjää):

| Palvelu | Suositus |
|---------|----------|
| Postgres | Siirrä Aiven/Render (managed) |
| Backend | Railway/Fly.io (auto-scale) |
| Frontend | Vercel (edge CDN) |
| Kuitit | S3/Cloudflare R2 |

**Mac mini → Dev + Staging, Pilvi → Production**

---

## ⚡ Päivittäiset komennot

```bash
# Käynnistä kaikki
cd ~/Documents/converto
docker compose up -d

# Tarkista status
docker compose ps

# Katso logeja
docker compose logs -f

# Pysäytä kaikki
docker compose down

# Päivitä koodi GitHubista
git pull origin main
docker compose restart

# Luo uusi dev-token
python scripts/mint_token.py demo user_demo 86400
```

---

## 🎯 Checklist: Mac mini → Tuotantovalmis

- [ ] Homebrew + dependencies asennettu
- [ ] PostgreSQL + Redis käynnissä
- [ ] .env luotu ja OPENAI_API_KEY asetettu
- [ ] Tietokanta luotu ja seedattu
- [ ] Backend käynnistyy ilman virheitä
- [ ] Frontend käynnistyy ilman virheitä
- [ ] Dashboard näkyy selaimessa
- [ ] OCR-skannaus toimii (testaa kuitilla)
- [ ] Gamify-pisteet kasvavat
- [ ] Cloudflare Tunnel käytössä (jos haluat julkisen demon)
- [ ] Backupit ajastettu (cron)
- [ ] LaunchDaemon käynnistää palvelut bootissa

---

## 💡 Kun kaikki toimii

**Sinulla on nyt:**
- ✅ Täysi kehitysympäristö Mac minillä
- ✅ Staging-palvelin Cloudflare Tunnelilla
- ✅ Automaattiset backupit
- ✅ Julkinen demo-URL
- ✅ Valmius siirtyä pilveen kun kasvu alkaa

**Seuraavat askeleet:**
1. Testaa OCR 10 kuitilla
2. Jaa demo-linkki 5 kaverille
3. Kerää palautetta
4. Iteroi!

---

## 🆘 Ongelmien ratkaisu

### "PostgreSQL ei käynnisty"

```bash
brew services stop postgresql@16
rm -rf /opt/homebrew/var/postgresql@16
brew reinstall postgresql@16
initdb /opt/homebrew/var/postgresql@16
brew services start postgresql@16
```

### "Docker Desktop ei aukea"

```bash
# Poista preferences
rm -rf ~/Library/Group\ Containers/group.com.docker
# Käynnistä uudelleen
open -a Docker
```

### "Port 8000 already in use"

```bash
# Etsi mikä käyttää porttia
lsof -i :8000

# Tapa prosessi
kill -9 <PID>
```

### "Out of memory"

```bash
# Lisää Dockerin RAM-määrää
# Docker Desktop → Settings → Resources → Memory: 6-8 GB
```

---

## 📚 Lisäresurssit

- **Docker for Mac**: https://docs.docker.com/desktop/install/mac-install/
- **Cloudflare Tunnel**: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **PostgreSQL Mac**: https://postgresapp.com/
- **Homebrew Services**: `brew services --help`

---

**🎉 Onnea Mac mini -serverisi kanssa!**

Sinulla on nyt täysi kontrolli kehitysympäristöstäsi ilman pilvikuluja. Skaalaa pilveen vain kun oikeasti tarvitset! 🚀

# Fly.io Backend Deployment - Vianmääritysdokumentti

## 📋 Yhteenveto

Backend-sovellus ei käynnisty Fly.io:ssa. Sovellus kaatuu käynnistyksessä, koska se ei löydä Python-moduuleja oikein. Ongelma liittyy monorepo-rakenteeseen ja siihen, miten Fly.io buildpack/Dockerfile käsittelee `backend/` ja `shared_core/` -kansioita.

## 🔍 Nykyinen Tila

### Status
- ✅ **Build onnistuu**: Docker-kuva rakennetaan onnistuneesti (212 MB)
- ❌ **Sovellus kaatuu**: Sovellus ei käynnisty, koska se ei löydä moduuleja
- ❌ **Health check epäonnistuu**: Sovellus ei vastaa portissa 8080

### Lokit näyttävät:
```
ERROR: Error loading ASGI app. Could not import module "main".
```

Tai aiemmin:
```
ModuleNotFoundError: No module named 'backend'
```

## 🐛 Ongelma: Monorepo-rakenne Fly.io:ssa

### Projektirakenne
```
docflow/
├── backend/          # Backend-koodi
│   ├── main.py       # Entry point (importtaa backend.xxx)
│   ├── requirements.txt
│   └── ...
├── shared_core/      # Jaettu koodi (tarvitaan backendissä)
│   └── ...
├── requirements.txt  # Projektin juuren requirements
└── Dockerfile        # Production Dockerfile
```

### Ongelma
1. **Backend tarvitsee `shared_core/`**: `main.py` importtaa `from shared_core.xxx`
2. **Fly.io build context**: Fly.io käyttää `fly.toml`-tiedoston sijaintia build-kontekstina
3. **Entry point**: `main.py` käyttää `from backend.xxx`, joten PYTHONPATH pitää olla `/app` ja moduulit `/app/backend/` ja `/app/shared_core/`

## 🔄 Mitä Yritettiin (Ja Missä Kompastuin)

### 1️⃣ Ensimmäinen Yritys: Buildpack + backend-kansio
**Ongelma**: Buildpack kopioi vain `backend/`-kansion, joten `shared_core/` puuttui.

**Ratkaisu**: Kopioitiin `shared_core/` `backend/`-kansioon ennen buildia.
**Tulos**: ❌ Ei toiminut - buildpack käyttää `/workspace/`-kansiota, ei `/app/`.

### 2️⃣ Toinen Yritys: Dockerfile backend-kansiossa
**Ongelma**: Dockerfile oli `backend/Dockerfile`, mutta build context oli `backend/`, joten `shared_core/` puuttui.

**Ratkaisu**: Yritettiin käyttää `docker_build_context = ".."` ja `dockerfile = "../Dockerfile"`.
**Tulos**: ❌ Fly.io etsi Dockerfilea väärästä paikasta (`backend/backend/Dockerfile`).

### 3️⃣ Kolmas Yritys: Dockerfile projektin juuressa
**Ongelma**: `fly.toml` oli `backend/`-kansiossa, joten build context oli `backend/`.

**Ratkaisu**: Siirrettiin `fly.toml` projektin juureen ja Dockerfile projektin juureen.
**Tulos**: ✅ Build onnistui, mutta ❌ entry point oli väärä (`main:app` vs `backend.main:app`).

### 4️⃣ Neljäs Yritys: Korjattiin entry point
**Ongelma**: `fly.toml` käytti `uvicorn main:app`, mutta Dockerfile käytti `backend.main:app`.

**Ratkaisu**: Korjattiin `fly.toml` käyttämään `backend.main:app`.
**Tulos**: ❌ Sovellus kaatuu edelleen - moduulit eivät löydy.

## 🎯 Missä Kompastuin Jatkuvasti

### 1. **Build Context vs Dockerfile Sijainti**
- Fly.io käyttää `fly.toml`-tiedoston sijaintia build-kontekstina
- Jos `fly.toml` on `backend/`-kansiossa, build context on `backend/`
- Dockerfile polut ovat suhteessa build-kontekstiin, ei `fly.toml`-tiedostoon

**Oppiminen**: Build context määräytyy `fly.toml`-tiedoston sijainnista, ei `docker_build_context`-asetuksesta.

### 2. **Monorepo-rakenne Fly.io:ssa**
- Fly.io buildpack olettaa yksinkertaisen projektirakenteen
- Monorepo vaatii Dockerfilea, joka kopioi useita kansioita
- `shared_core/` täytyy olla saatavilla build-kontekstissa

**Oppiminen**: Monorepo-rakenteessa täytyy käyttää Dockerfilea, ei buildpackia.

### 3. **Entry Point vs PYTHONPATH**
- `main.py` käyttää `from backend.xxx`, joten PYTHONPATH pitää olla `/app`
- Entry point täytyy olla `backend.main:app`, ei `main:app`
- Working directory voi olla `/app` tai `/app/backend`, riippuen entry pointista

**Oppiminen**: Entry point ja PYTHONPATH täytyy olla yhdenmukaiset.

### 4. **Fly.io Process Command vs Dockerfile CMD**
- `fly.toml` `[processes]` yliajaa Dockerfile `CMD`
- Jos `fly.toml` määrittelee `web = "uvicorn main:app"`, se yliajaa Dockerfile `CMD`
- Molempien täytyy olla yhdenmukaisia

**Oppiminen**: `fly.toml` `[processes]` yliajaa Dockerfile `CMD`, joten molemmat täytyy korjata.

## 📊 Nykyinen Konfiguraatio

### `fly.toml` (projektin juuressa)
```toml
[build]
  dockerfile = "Dockerfile"
  docker_build_context = "."

[processes]
  web = "uvicorn backend.main:app --host 0.0.0.0 --port 8080"
  app = "uvicorn backend.main:app --host 0.0.0.0 --port 8080"
```

### `Dockerfile` (projektin juuressa)
```dockerfile
WORKDIR /app
COPY requirements.txt /app/requirements.txt
COPY shared_core /app/shared_core
COPY backend /app/backend
ENV PYTHONPATH=/app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

## 🔍 Seuraavat Askeleet Vianmääritykseen

### 1. Tarkista Lokit Tarkemmin
```bash
fly logs --app docflow-admin-api | grep -E "(ERROR|Error|Traceback|ModuleNotFound|ImportError)" | tail -50
```

### 2. Tarkista Konteinerin Sisäinen Rakenne
```bash
fly ssh console --app docflow-admin-api -C "ls -la /app && ls -la /app/backend && ls -la /app/shared_core"
```

### 3. Testaa Python Importit
```bash
fly ssh console --app docflow-admin-api -C "cd /app && python3 -c 'import sys; print(sys.path)' && python3 -c 'from backend import main'"
```

### 4. Tarkista Working Directory
```bash
fly ssh console --app docflow-admin-api -C "pwd && echo $PYTHONPATH"
```

### 5. Testaa Entry Point Manuaalisesti
```bash
fly ssh console --app docflow-admin-api -C "cd /app && uvicorn backend.main:app --host 0.0.0.0 --port 8080"
```

## 💡 Mahdolliset Ratkaisut

### Vaihtoehto 1: Korjaa Working Directory
Jos konteinerissa working directory on väärä, korjaa Dockerfile:
```dockerfile
WORKDIR /app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### Vaihtoehto 2: Muuta Entry Point
Jos `backend.main:app` ei toimi, kokeile:
```dockerfile
WORKDIR /app/backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```
Ja päivitä `main.py` importit käyttämään suhteellisia polkuja.

### Vaihtoehto 3: Käytä Python -m
```dockerfile
WORKDIR /app
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### Vaihtoehto 4: Tarkista Importit
Jos `main.py` käyttää `from backend.xxx`, varmista että:
- PYTHONPATH on `/app`
- `/app/backend/` on olemassa
- `/app/shared_core/` on olemassa

## 🚨 Tunnistetut Ongelmat

1. **Build context**: Ratkaistu - `fly.toml` projektin juuressa
2. **Dockerfile polku**: Ratkaistu - Dockerfile projektin juuressa
3. **Entry point**: Korjattu - `backend.main:app` molemmissa
4. **Moduulien löytyminen**: ❓ Tuntematon - vaatii debuggausta

## 📝 Yhteenveto

**Ongelma**: Backend ei käynnisty Fly.io:ssa, koska moduulit eivät löydy.

**Syy**: Todennäköisesti working directory, PYTHONPATH tai import-polut eivät ole oikein konteinerissa.

**Ratkaisu**: Tarkista konteinerin sisäinen rakenne ja testaa Python-importit manuaalisesti.

**Seuraava askel**: Aja debug-komennot yllä ja analysoi tulokset.


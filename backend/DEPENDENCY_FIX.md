# Backend Dependency Fix - psycopg2

## 🐛 Ongelma

**Virhe**: `ModuleNotFoundError: No module named 'psycopg2'`

**Syy**: `psycopg2` puuttui `backend/requirements.txt`:stä, vaikka se on tarvittu PostgreSQL-yhteyteen.

## ✅ Korjaus

Lisätty `psycopg2-binary>=2.9.0` `backend/requirements.txt`:ään.

**Huom**: Käytetään `psycopg2-binary` (ei `psycopg2`), koska:
- Ei vaadi system-level PostgreSQL development libraries
- Helpompi asentaa Docker-ympäristössä
- Toimii suoraan Python-pakettina

## 📋 Tarkistettavat Riippuvuudet

### Kriittiset Riippuvuudet Backendille

```txt
# Database
psycopg[binary]>=3.1.0  # PostgreSQL adapter
# TAI
psycopg2-binary>=2.9.0  # Vanhempi versio (jos psycopg3 ei toimi)

# FastAPI & Server
fastapi>=0.115.0
uvicorn>=0.32.0

# ORM
sqlalchemy>=2.0.0

# Validation
pydantic>=2.9.0
pydantic-settings>=2.0.0

# Sentry
sentry-sdk[fastapi]>=2.15.0
```

## 🔍 Varmistus

Tarkista että kaikki kriittiset riippuvuudet ovat `backend/requirements.txt`:ssä:

```bash
# Tarkista että psycopg2 on listassa
grep psycopg backend/requirements.txt

# Tarkista että kaikki tarvittavat paketit ovat
grep -E "(fastapi|uvicorn|sqlalchemy|pydantic|sentry)" backend/requirements.txt
```

## 🚀 Deployment

Uusi deployment käynnissä korjatulla `requirements.txt`:llä.

**Odotettu tulos**:
- ✅ Build onnistuu
- ✅ Dependencies asennetaan oikein
- ✅ Backend käynnistyy ilman `ModuleNotFoundError`
- ✅ Database-yhteys toimii

## 📊 Seuranta

Kun deployment valmistuu:

1. **Tarkista lokit**:
   ```bash
   fly logs --app docflow-admin-api | grep -E "(psycopg|ModuleNotFound|ImportError)"
   ```

2. **Testaa database-yhteys**:
   ```bash
   curl https://docflow-admin-api.fly.dev/health
   ```

3. **Tarkista Sentry**:
   - Ei `ModuleNotFoundError` virheitä
   - Backend käynnistyy onnistuneesti

## 🎯 Oppiminen

### Miksi Tämä Tapahtui?

1. **Monorepo-rakenne**: `backend/requirements.txt` erillinen projektin juuren `requirements.txt`:stä
2. **Docker build**: Kopioi vain `backend/requirements.txt`, ei projektin juuren
3. **Riippuvuudet**: Jotkin riippuvuudet voivat puuttua jos ne on määritelty vain projektin juuressa

### Tulevaisuuden Varmistus

1. **Synkronoi riippuvuudet**:
   ```bash
   # Varmista että backend/requirements.txt sisältää kaikki tarvittavat
   diff requirements.txt backend/requirements.txt
   ```

2. **Testaa build paikallisesti**:
   ```bash
   docker build -f Dockerfile -t test-backend .
   docker run --rm test-backend python -c "import psycopg2; print('OK')"
   ```

3. **Lisää dependency check CI/CD:hen**:
   ```yaml
   # .github/workflows/check-deps.yml
   - name: Check dependencies
     run: |
       python -c "import psycopg2; print('psycopg2 OK')"
       python -c "import fastapi; print('fastapi OK')"
   ```


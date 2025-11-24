# Fly.io Deployment Fix - cd Command Issue

## 🐛 Ongelma

Deployment epäonnistui koska `fly.toml` `[processes]` käytti `cd /app &&` komentoa, joka ei toimi Fly.io:ssa.

## ✅ Korjaus

Poistettu `cd /app &&` prefix `fly.toml`:stä, koska:
- `Dockerfile` asettaa jo `WORKDIR /app`
- Fly.io suorittaa komennot working directoryssa
- `cd`-komento aiheuttaa virheitä Fly.io:ssa

### Ennen (väärin):
```toml
[processes]
  web = "cd /app && uvicorn backend.main:app --host 0.0.0.0 --port 8080"
  app = "cd /app && uvicorn backend.main:app --host 0.0.0.0 --port 8080"
```

### Jälkeen (oikein):
```toml
[processes]
  web = "uvicorn backend.main:app --host 0.0.0.0 --port 8080"
  app = "uvicorn backend.main:app --host 0.0.0.0 --port 8080"
```

## 📋 Konfiguraatio

### Dockerfile
```dockerfile
WORKDIR /app
ENV PYTHONPATH=/app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### fly.toml
```toml
[processes]
  web = "uvicorn backend.main:app --host 0.0.0.0 --port 8080"
  app = "uvicorn backend.main:app --host 0.0.0.0 --port 8080"
```

**Huom**: `fly.toml` `[processes]` yliajaa Dockerfile `CMD`, mutta molemmat käyttävät nyt samaa entry pointia.

## 🚀 Seuraava Deployment

Kun nykyinen deployment valmistuu (onnistuneesti tai epäonnistuneesti), aja:

```bash
fly deploy --remote-only
```

Tämä käyttää korjattua `fly.toml`:ää ja deploymentin pitäisi onnistua.

## ✅ Odotettu Tulos

Kun deployment onnistuu:
- Machines saavuttavat "started" tilan
- Health checks menevät "passing" tilaan
- Backend vastaa `/health` endpointtiin
- Admin-endpointit toimivat
- WebSocket-yhteys toimii


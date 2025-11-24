# Backend Deployment Monitoring

## 🚀 Deployment Status

**Deployment käynnissä**: Odotetaan että machines saavuttavat "started" tilan ja health checks menevät "passing" tilaan.

## ✅ Config Validation

- ✅ Config validation passed
- ✅ `cd /app &&` poistettu `fly.toml`:stä
- ✅ Entry point: `uvicorn backend.main:app --host 0.0.0.0 --port 8080`

## 📊 Seuranta

### Tarkista Deployment Status
```bash
fly status --app docflow-admin-api
```

**Odotettu tulos**:
- Machines: "started" (ei "starting" tai "stopped")
- Health checks: "passing" (ei "warning" tai "critical")
- Version: Uusin deployment-versio

### Tarkista Logit
```bash
fly logs --app docflow-admin-api | tail -50
```

**Odotettu tulos**:
- Ei virheitä startupissa
- "Application startup complete" tai vastaava
- Ei "ModuleNotFoundError" tai "ImportError"

## 🧪 Testaus Kun Deployment Valmistuu

### 1. Health Check
```bash
curl -s https://docflow-admin-api.fly.dev/health
```
**Odotettu**: `{"status":"healthy"}` tai `{"ok":true}`

### 2. Admin Analytics
```bash
curl -s "https://docflow-admin-api.fly.dev/admin/analytics/overview?range=30d"
```
**Odotettu**: Analytics-dataa JSON-muodossa, ei `{"detail":"Not Found"}`

### 3. Admin Metrics
```bash
curl -s https://docflow-admin-api.fly.dev/admin/metrics
```
**Odotettu**: Metrics-dataa JSON-muodossa

### 4. WebSocket Test
```bash
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  https://docflow-admin-api.fly.dev/ws
```
**Odotettu**: HTTP 101 Switching Protocols tai connection established

## ✅ Valmiustila

Kun kaikki testit läpäisevät:
- ✅ Backend vastaa endpointteihin
- ✅ Admin-reitit toimivat
- ✅ WebSocket-yhteys toimii
- ✅ Dashboard voi yhdistää backendiin

## 🔗 Linkit

- **Fly.io Dashboard**: https://fly.io/apps/docflow-admin-api/monitoring
- **Backend Health**: https://docflow-admin-api.fly.dev/health
- **Backend API**: https://docflow-admin-api.fly.dev


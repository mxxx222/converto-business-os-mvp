# Backend Deployment Test Checklist

## 🚀 Deployment Status

**Deployment käynnissä**: Odotetaan että kaikki machines saavuttavat hyvän tilan.

## ✅ Testauskomentoja Kun Deployment Valmistuu

### 1. Health Check
```bash
curl https://docflow-admin-api.fly.dev/health
```
**Odotettu**: `{"status":"healthy"}` tai `{"ok":true,"version":"0.1.0"}`

### 2. Admin Analytics Endpoint
```bash
curl https://docflow-admin-api.fly.dev/admin/analytics/overview?range=30d
```
**Odotettu**: Analytics-dataa JSON-muodossa, ei `{"detail":"Not Found"}`

### 3. Admin Metrics Endpoint
```bash
curl https://docflow-admin-api.fly.dev/admin/metrics
```
**Odotettu**: Metrics-dataa JSON-muodossa

### 4. WebSocket Connection Test
```bash
# Testaa WebSocket-yhteys
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  https://docflow-admin-api.fly.dev/ws
```
**Odotettu**: HTTP 101 Switching Protocols tai connection established

### 5. Fly.io Status
```bash
fly status --app docflow-admin-api
```
**Odotettu**: Kaikki machines "started" ja health checks "passing"

### 6. Fly.io Logs
```bash
fly logs --app docflow-admin-api | tail -50
```
**Odotettu**: Ei virheitä, sovellus käynnistyy onnistuneesti

## 🔍 Dashboard Testaus

### 1. WebSocket Connection
- Avaa dashboard selaimessa
- Tarkista console: pitäisi näkyä "WebSocket connected"
- ConnectionStatus-komponentti pitäisi näyttää "Connected" (vihreä)

### 2. Analytics Page
- Navigoi `/analytics`-sivulle
- Tarkista Network-tab: API-kutsut pitäisi onnistua (200 OK)
- Graafit pitäisi näyttää oikean datan, ei mock-dataa

### 3. Real-time Updates
- Tarkista että RealTimeActivity-komponentti vastaanottaa viestejä
- Toast-notifikaatiot pitäisi näkyä kun tulee uusia tapahtumia

## 🐛 Mahdolliset Ongelmat

### Ongelma 1: Backend ei käynnisty
**Syy**: `backend.main:app` importit epäonnistuvat  
**Ratkaisu**: Tarkista lokit ja korjaa importit

### Ongelma 2: WebSocket ei yhdistä
**Syy**: CORS-ongelma tai origin-check epäonnistuu  
**Ratkaisu**: Tarkista backend CORS-asetukset

### Ongelma 3: Analytics ei näytä dataa
**Syy**: Admin-endpointit palauttavat 404  
**Ratkaisu**: Varmista että `backend.main:app` sisältää admin-routerit

## 📊 Odotettu Tulos

Kun kaikki toimii:
- ✅ Backend vastaa kaikille endpointteille
- ✅ WebSocket-yhteys toimii
- ✅ Analytics näyttää oikean datan
- ✅ Real-time päivitykset toimivat
- ✅ Kaikki health checks passing

## 🔗 Linkit

- **Backend Health**: https://docflow-admin-api.fly.dev/health
- **Dashboard**: https://dashboard-*.vercel.app
- **Fly.io Dashboard**: https://fly.io/apps/docflow-admin-api/monitoring


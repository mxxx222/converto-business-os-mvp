# Dashboard Issues & Fixes

## 🔍 Löydetyt Ongelmat

### 1. ❌ WebSocket Ei Yhdistä
**Syy**: `WebSocketProvider` on poistettu `app/providers.tsx`:stä  
**Vaikutus**: Real-time päivitykset eivät toimi  
**Korjaus**: Palauta `WebSocketProvider` `providers.tsx`:ään

### 2. ⚠️ 404/401/403 Virheet
**Syy**: Backend käyttää `main_simple.py`:tä joka ei sisällä admin-endpointteja  
**Vaikutus**: Analytics API-kutsut epäonnistuvat  
**Korjaus**: Palauta täysi `backend.main:app` entry point

### 3. ✅ Analytics Näyttää Mock-Datan
**Syy**: API-kutsut epäonnistuvat, joten komponentti näyttää fallback-datan  
**Vaikutus**: Käyttäjä näkee vanhan datan  
**Korjaus**: Korjaa backend-endpointit

### 4. ⚠️ CSP Violations
**Syy**: External scripts yrittävät ladata ilman oikeita CSP-asetuksia  
**Vaikutus**: Jotkin skriptit eivät lataudu  
**Korjaus**: Päivitä CSP-headers `next.config.js`:ssä

## 🔧 Korjausehdotukset

### Fix 1: Palauta WebSocket Provider

**Tiedosto**: `apps/dashboard/app/providers.tsx`

```typescript
import { WebSocketProvider } from '@/lib/websocket'

export function Providers({ children }: { children: React.ReactNode }) {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'wss://docflow-admin-api.fly.dev/ws'
  
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider url={wsUrl}>
        {children}
      </WebSocketProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <Toaster position="bottom-right" richColors />
    </QueryClientProvider>
  )
}
```

### Fix 2: Korjaa Backend Entry Point

**Tiedosto**: `fly.toml`

```toml
[processes]
  web = "cd /app && uvicorn backend.main:app --host 0.0.0.0 --port 8080"
  app = "cd /app && uvicorn backend.main:app --host 0.0.0.0 --port 8080"
```

**Tiedosto**: `Dockerfile`

```dockerfile
WORKDIR /app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### Fix 3: Testaa Backend Endpointit

```bash
# Testaa admin analytics endpoint
curl https://docflow-admin-api.fly.dev/admin/analytics/overview?range=30d

# Testaa WebSocket
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  https://docflow-admin-api.fly.dev/ws
```

### Fix 4: Korjaa CSP Headers

**Tiedosto**: `apps/dashboard/next.config.js`

```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || 'https://docflow-admin-api.fly.dev'} ${process.env.NEXT_PUBLIC_WS_URL || 'wss://docflow-admin-api.fly.dev'} https://*.supabase.co https://*.sentry.io;`
        }
      ]
    }
  ]
}
```

## 📋 Prioriteetti

1. **Kriittinen**: Korjaa backend entry point (`backend.main:app`)
2. **Tärkeä**: Palauta WebSocket Provider
3. **Tärkeä**: Testaa ja korjaa admin endpointit
4. **Vaihtoehtoinen**: Korjaa CSP headers

## ✅ Testaus

Kun korjaukset on tehty:

1. **Testaa WebSocket**:
   - Avaa dashboard selaimessa
   - Tarkista console: pitäisi näkyä "WebSocket connected"
   - Tarkista ConnectionStatus-komponentti: pitäisi näyttää "Connected"

2. **Testaa Analytics**:
   - Avaa `/analytics`-sivu
   - Tarkista Network-tab: API-kutsut pitäisi onnistua
   - Tarkista että graafit näyttävät oikean datan

3. **Testaa Backend**:
   ```bash
   curl https://docflow-admin-api.fly.dev/admin/analytics/overview?range=30d
   ```


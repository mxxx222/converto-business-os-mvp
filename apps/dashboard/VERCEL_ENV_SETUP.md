# Vercel Environment Variables Setup via MCP

## Vercel API Token
Token on tallennettu `.env`-tiedostoon:
```
VERCEL_API_TOKEN=PYnQG74K8nb5YkZz6C1Vnl66
VERCEL_TOKEN=PYnQG74K8nb5YkZz6C1Vnl66
```

## Environment Variables to Set

Kun Vercel API token on toimiva, aseta nämä environment variables Vercel-projektiin:

### Required Variables:
1. `NEXT_PUBLIC_SUPABASE_URL=https://foejjbrcudpvuwdisnpz.supabase.co`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_r5h9a67JPdv_wGbSsYLQow_FHznio6w`
3. `SUPABASE_SERVICE_ROLE_KEY=sb_secret_FiceWb9D3W3JeIZii1Rcmw_OXKQqZrB`

### Optional Variables:
4. `NEXT_PUBLIC_SENTRY_DSN=https://05d83543fe122b7a6a232d6e8194321b@o4510201257787392.ingest.de.sentry.io/4510398360518736`
5. `NEXT_PUBLIC_ENV=production`
6. `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1`

## Setup Steps

### Option 1: Via Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable for Production, Preview, and Development

### Option 2: Via MCP (If token works)
Kun Vercel API token on toimiva, käytä MCP-työkaluja:

```bash
# List projects first to get projectId
# Then set each environment variable using:
# vercel_set_environment_variable
```

## Troubleshooting

Jos token ei toimi:
1. Tarkista token: https://vercel.com/account/tokens
2. Varmista että token on "Full Access"
3. Kokeile luoda uusi token jos vanha on vanhentunut


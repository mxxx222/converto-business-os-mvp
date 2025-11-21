# Vercel Environment Variables Setup Guide

## Dashboard Project Environment Variables

Set these in Vercel Dashboard → Your Dashboard Project → Settings → Environment Variables

### Required Variables (Production + Preview)

```
NEXT_PUBLIC_SUPABASE_URL=https://foejjbrcudpvuwdisnpz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_r5h9a67JPdv_wGbSsYLQow_FHznio6w
SUPABASE_SERVICE_ROLE_KEY=sb_secret_FiceWb9D3W3JeIZii1Rcmw_OXKQqZrB
NEXT_PUBLIC_SENTRY_DSN=https://05d83543fe122b7a6a232d6e8194321b@o4510201257787392.ingest.de.sentry.io/4510398360518736
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
```

## Marketing Project Environment Variables

Set these in Vercel Dashboard → Your Marketing Project → Settings → Environment Variables

### Required Variables (Production + Preview)

```
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM="DocFlow <noreply@docflow.fi>"
ADMIN_EMAIL=maksim@docflow.fi
NEXT_PUBLIC_SUPABASE_URL=https://foejjbrcudpvuwdisnpz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_FiceWb9D3W3JeIZii1Rcmw_OXKQqZrB
NEXT_PUBLIC_CRISP_WEBSITE_ID=your-crisp-website-id
```

### Notes

- `RESEND_API_KEY`: Get from https://resend.com/api-keys
- `NEXT_PUBLIC_CRISP_WEBSITE_ID`: Get from https://app.crisp.chat (optional but recommended)
- Set all variables for both **Production** and **Preview** environments
- After setting variables, redeploy the projects for changes to take effect


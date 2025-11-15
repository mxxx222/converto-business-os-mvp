# Supabase Auth Configuration Guide

**Purpose:** Step-by-step guide to configure Supabase Authentication for DocFlow Auth MVP.

**Time Required:** 10 minutes

---

## 📋 Prerequisites

- Supabase project created
- Admin access to Supabase Dashboard
- Database migrations applied (RLS policies)

---

## 🔧 Configuration Steps

### 1. Access Token Lifetime

**Navigate to:** Supabase Dashboard → Authentication → Settings → JWT Settings

**Set:**
```
Access Token Lifetime: 900 seconds
```

**Why:** 15 minutes provides good balance between security (short exposure window) and UX (not too frequent refreshes).

---

### 2. Refresh Token Lifetime

**Navigate to:** Same page (JWT Settings)

**Set:**
```
Refresh Token Lifetime: 1209600 seconds
```

**Why:** 14 days allows users to stay logged in for 2 weeks without re-entering credentials, while still maintaining reasonable security.

---

### 3. Enable Refresh Token Rotation

**Navigate to:** Same page (JWT Settings)

**Set:**
```
☑️ Enable Refresh Token Rotation
```

**Why:** Each refresh generates a new refresh token, invalidating the old one. This prevents token reuse attacks.

---

### 4. Refresh Token Reuse Interval

**Navigate to:** Same page (JWT Settings)

**Set:**
```
Refresh Token Reuse Interval: 10 seconds
```

**Why:** Allows brief window for retry on network failures, but short enough to prevent abuse.

---

### 5. Enable PKCE Flow

**Navigate to:** Authentication → Settings → Security

**Set:**
```
☑️ Enable PKCE (Proof Key for Code Exchange)
```

**Why:** Adds extra security layer for OAuth flows, prevents authorization code interception.

---

### 6. Configure Email Templates

**Navigate to:** Authentication → Email Templates

**Customize Magic Link Template:**

```html
<h2>Kirjaudu DocFlow-palveluun</h2>

<p>Hei!</p>

<p>Klikkaa alla olevaa linkkiä kirjautuaksesi DocFlow-tilillesi:</p>

<p><a href="{{ .ConfirmationURL }}">Kirjaudu sisään</a></p>

<p>Tai kopioi ja liitä tämä linkki selaimeesi:</p>
<p>{{ .ConfirmationURL }}</p>

<p>Linkki on voimassa 1 tunnin.</p>

<p>Jos et pyytänyt tätä kirjautumislinkkiä, voit jättää tämän viestin huomiotta.</p>

<p>Ystävällisin terveisin,<br>
DocFlow-tiimi</p>
```

**Subject:** `Kirjaudu DocFlow-palveluun`

---

### 7. Configure Redirect URLs

**Navigate to:** Authentication → URL Configuration

**Add Redirect URLs:**
```
# Development
http://localhost:3000/auth/callback

# Staging
https://staging.docflow.fi/auth/callback

# Production
https://docflow.fi/auth/callback
https://app.docflow.fi/auth/callback
```

**Site URL:**
```
https://docflow.fi
```

---

### 8. Configure Email Rate Limiting

**Navigate to:** Authentication → Rate Limits

**Set:**
```
Email sending rate limit: 4 emails per hour per email address
```

**Why:** Prevents abuse while allowing legitimate retry attempts.

---

### 9. Enable Email Confirmations (Optional)

**Navigate to:** Authentication → Email Settings

**For Production:**
```
☑️ Enable email confirmations
```

**For Development:**
```
☐ Disable email confirmations (faster testing)
```

---

### 10. Configure Session Settings

**Navigate to:** Authentication → Settings → Session Management

**Set:**
```
Inactivity Timeout: 0 (disabled)
```

**Why:** We handle session expiry via JWT expiration, not inactivity timeout.

---

## 🔐 Security Checklist

After configuration, verify:

- [ ] Access token lifetime = 900 seconds (15 min)
- [ ] Refresh token lifetime = 1209600 seconds (14 days)
- [ ] Refresh token rotation enabled
- [ ] PKCE enabled
- [ ] Redirect URLs match your domains
- [ ] Email rate limiting enabled
- [ ] Email templates customized (Finnish)
- [ ] Site URL set correctly

---

## 🧪 Testing Configuration

### 1. Test Magic Link Flow

```bash
# Send magic link
curl -X POST 'https://xxx.supabase.co/auth/v1/magiclink' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@docflow.fi"
  }'

# Check email inbox for magic link
# Click link → should redirect to /auth/callback
```

### 2. Test Token Refresh

```bash
# Get initial session
curl -X POST 'https://xxx.supabase.co/auth/v1/token?grant_type=refresh_token' \
  -H 'apikey: YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'

# Should return new access_token and new refresh_token (rotation working)
```

### 3. Test Token Expiry

```javascript
// In browser console
const session = await supabase.auth.getSession()
console.log('Expires at:', new Date(session.data.session.expires_at * 1000))

// Wait 15 minutes
// Session should auto-refresh 2 min before expiry (at 13 min mark)
```

---

## 📊 Monitoring

### Check Auth Metrics

**Navigate to:** Supabase Dashboard → Authentication → Users

**Monitor:**
- Daily Active Users (DAU)
- Sign-ups per day
- Failed login attempts
- Email bounce rate

### Check Token Usage

**SQL Query:**
```sql
-- In Supabase SQL Editor
SELECT 
  DATE_TRUNC('day', created_at) AS day,
  COUNT(*) AS tokens_issued,
  COUNT(DISTINCT user_id) AS unique_users
FROM auth.refresh_tokens
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY day
ORDER BY day DESC;
```

---

## 🔄 Rollback Plan

If issues occur after configuration:

### Revert Token Lifetimes

```
Access Token Lifetime: 3600 seconds (1 hour)
Refresh Token Lifetime: 2592000 seconds (30 days)
```

### Disable Refresh Token Rotation

```
☐ Disable Refresh Token Rotation
```

**Note:** This reduces security but may help diagnose issues.

---

## 🆘 Troubleshooting

### Issue: Magic links not arriving

**Check:**
1. Email rate limiting not exceeded
2. Email provider (Resend) is working
3. Spam folder
4. Email template is valid

**Solution:**
```bash
# Check Supabase logs
# Dashboard → Logs → Auth Logs
# Look for "email sent" events
```

### Issue: Tokens expiring too quickly

**Check:**
1. Access token lifetime setting
2. System clock sync (client vs server)
3. Timezone issues

**Solution:**
```bash
# Verify token expiry
jwt decode YOUR_ACCESS_TOKEN | jq '.exp'
date -d @EXPIRY_TIMESTAMP
```

### Issue: Refresh token rotation causing logouts

**Check:**
1. Network latency causing race conditions
2. Multiple tabs refreshing simultaneously
3. Refresh token reuse interval too short

**Solution:**
```
# Increase reuse interval temporarily
Refresh Token Reuse Interval: 30 seconds
```

---

## 📞 Support

**Supabase Support:** https://supabase.com/support  
**DocFlow Team:** team@docflow.fi  
**Documentation:** https://supabase.com/docs/guides/auth

---

**Last Updated:** 2025-01-15  
**Version:** 1.0  
**Owner:** DocFlow DevOps Team


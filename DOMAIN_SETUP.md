# 🌐 Domain Setup Guide - Converto Business OS

## A) Custom Domain Setup (Render + DNS)

### 1️⃣ Purchase Domain
- **Recommended:** `converto.fi` or `converto.io`
- **Registrars:** Namecheap, Cloudflare, Gandi, Hover

### 2️⃣ Configure DNS Records

#### Frontend (app.converto.fi)
```
Type: CNAME
Name: app
Value: converto-frontend.onrender.com
TTL: Auto/3600
```

#### Backend (api.converto.fi)
```
Type: CNAME
Name: api
Value: converto-backend.onrender.com
TTL: Auto/3600
```

#### Root Domain (converto.fi)
```
Type: A
Name: @
Value: 216.24.57.1  (Render static IP or redirect)
```

#### WWW Redirect
```
Type: CNAME
Name: www
Value: app.converto.fi
```

### 3️⃣ Add Custom Domains in Render

#### Frontend Service
1. Go to: https://dashboard.render.com
2. Select: `converto-frontend`
3. Settings → Custom Domains
4. Add: `app.converto.fi`
5. Wait for SSL ✅ (Let's Encrypt auto)

#### Backend Service
1. Select: `converto-backend`
2. Settings → Custom Domains
3. Add: `api.converto.fi`
4. Wait for SSL ✅

### 4️⃣ Update Environment Variables

#### Frontend (Render)
```bash
NEXT_PUBLIC_API_BASE=https://api.converto.fi
```

#### Backend (Render)
```bash
FRONTEND_URL=https://app.converto.fi
ALLOWED_ORIGINS=https://app.converto.fi,https://converto.fi
```

### 5️⃣ Redeploy Services
```bash
# Trigger redeploy in Render dashboard
# Or push to GitHub (auto-deploy)
git commit --allow-empty -m "chore: update domain config"
git push origin main
```

### 6️⃣ Verify Setup
```bash
# Health checks
curl https://api.converto.fi/health
curl https://app.converto.fi

# SSL check
openssl s_client -connect api.converto.fi:443 -servername api.converto.fi

# DNS propagation
dig app.converto.fi
dig api.converto.fi
```

---

## B) Email Setup (Optional)

### Google Workspace / Zoho Mail

#### MX Records
```
Priority: 1
Value: mx1.zoho.com (or aspmx.l.google.com)
```

#### SPF Record
```
Type: TXT
Name: @
Value: v=spf1 include:zoho.com ~all
```

#### DKIM Record
```
Type: TXT
Name: zoho._domainkey
Value: [provided by Zoho/Google]
```

---

## C) SSL Certificate Verification

### Let's Encrypt (Automatic)
- Render handles SSL automatically
- Certificate renews every 90 days
- No manual action required

### Verify SSL Grade
```bash
# Check SSL rating
curl https://www.ssllabs.com/ssltest/analyze.html?d=app.converto.fi
```

---

## D) Troubleshooting

### DNS Not Propagating
```bash
# Check DNS globally
https://dnschecker.org/#CNAME/app.converto.fi

# Clear local DNS cache (Mac)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### SSL Certificate Pending
- Wait 5-10 minutes after DNS propagation
- Render auto-provisions Let's Encrypt
- Check: Render Dashboard → Custom Domains → Status

### CORS Errors
- Ensure `ALLOWED_ORIGINS` includes your domain
- Update `app/main.py` CORS middleware
- Redeploy backend

---

## E) Production Checklist

- [ ] Domain purchased
- [ ] DNS records configured
- [ ] Render custom domains added
- [ ] SSL certificates active (✅ green)
- [ ] Environment variables updated
- [ ] Services redeployed
- [ ] Health endpoints responding
- [ ] Frontend loads correctly
- [ ] API calls work (check browser console)
- [ ] Email configured (optional)
- [ ] Privacy policy published at `/privacy`
- [ ] Terms of service at `/terms`

---

## F) Quick Commands

### Test Production URLs
```bash
# Backend health
curl https://api.converto.fi/health

# Frontend
open https://app.converto.fi

# API endpoints
curl https://api.converto.fi/api/v1/impact/summary?tenant=demo
curl https://api.converto.fi/api/v1/vat/rates
curl https://api.converto.fi/api/v1/legal/rules
```

### Monitor Logs
```bash
# Render dashboard
https://dashboard.render.com/web/[service-id]/logs
```

---

**🎉 Domain setup complete! Ready for production traffic.**

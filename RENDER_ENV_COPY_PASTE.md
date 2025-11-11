# 📋 RENDER ENV - KOPIOI & LIITÄ

**HUOM:** Vaihda `xxx` oikeisiin arvoihin!

---

## 🔧 **BACKEND (Web Service)**

Render Dashboard → Backend Service → Environment

```
ENV=production
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxx
JWT_SECRET=xxx
```

### **JWT_SECRET generoiminen:**
```bash
openssl rand -hex 32
```

### **PostgreSQL:**
- Dashboard → "New PostgreSQL"
- Linkitä backend-serviceen
- ✅ `DATABASE_URL` asettuu automaattisesti!

---

## 🎨 **FRONTEND (Static Site / Web Service)**

Render Dashboard → Frontend Service → Environment

```
NEXT_PUBLIC_API_BASE=https://converto-backend.onrender.com
NEXT_PUBLIC_APP_ENV=production
FEATURE_PREMIUM_HOME=1
```

**HUOM:** Päivitä `NEXT_PUBLIC_API_BASE` oikean backend-URLin mukaan!

---

## ✅ **OPTIONAL (PARANTAVAT KOKEMUSTA)**

### **Email (Magic Link):**
```
RESEND_API_KEY=re_xxx
```
Hanki: https://resend.com/api-keys

### **Virheseuranta:**
```
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```
Hanki: https://sentry.io/settings/projects/

---

## 🚀 **BUILD & START KOMENNOT**

### **Backend:**
```
Build: pip install -U pip && pip install -r requirements.txt
Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### **Frontend (Web Service):**
```
Build: cd frontend && npm ci && npm run build
Start: cd frontend && npm run start
```

### **Frontend (Static Site):**
```
Build: cd frontend && npm ci && npm run build && npm run export
Publish: frontend/out
```

---

## ✅ **TESTI DEPLOYN JÄLKEEN**

```bash
# Backend
curl https://YOUR-BACKEND.onrender.com/health

# Frontend
curl https://YOUR-FRONTEND.onrender.com

# Auth
curl -X POST https://YOUR-BACKEND.onrender.com/api/v1/auth/magic/request \
  -H "Content-Type: application/json" \
  -d '{"email":"test@converto.fi"}'
```

---

## 🎯 **MVP MINIMAALISET VAATIMUKSET:**

✅ **Backend:** ENV, AI_PROVIDER, OPENAI_API_KEY, JWT_SECRET, DATABASE_URL
✅ **Frontend:** NEXT_PUBLIC_API_BASE, NEXT_PUBLIC_APP_ENV, FEATURE_PREMIUM_HOME
✅ **Database:** PostgreSQL (Render luo automaattisesti)

**VALMIS! 🚀**

# 🚀 Sentry & Supabase Activation Guide

**Aktivointi ja maksimointi Sentry error trackingille ja Supabase-integratiolle**

---

## ✅ **Aktivoitu**

### **1. Sentry Error Tracking** ✅

**Frontend:**
- ✅ `sentry.client.config.ts` - Browser error tracking
- ✅ `sentry.server.config.ts` - Server-side error tracking
- ✅ Performance monitoring (traces, replays)
- ✅ Sensitive data filtering

**Backend:**
- ✅ `backend/main.py` - FastAPI Sentry integration
- ✅ Error tracking & logging integration
- ✅ Performance monitoring (20% traces, 10% profiles)
- ✅ Environment-aware configuration

### **2. Supabase Configuration** ✅

**Backend:**
- ✅ Service role key configuration
- ✅ Auth middleware integration
- ✅ Auto-enable when `SUPABASE_AUTH_ENABLED=true`

---

## 🔑 **Environment Variables**

### **Sentry DSN**

**⚠️ Note:** Sentry DSN key: `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`

**Backend & Frontend:**
```env
# Build full DSN from: https://sentry.io/settings/YOUR-ORG/projects/YOUR-PROJECT/keys/
# Format: https://PUBLIC_KEY@HOST/PROJECT_ID
SENTRY_DSN=https://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@o4507887226847232.ingest.sentry.io/4507887226847232
```

**Frontend (alternative):**
```env
NEXT_PUBLIC_SENTRY_DSN=https://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@o4507887226847232.ingest.sentry.io/4507887226847232
```

**To get full DSN:**
1. Go to https://sentry.io/
2. Settings → Projects → Your Project → Client Keys (DSN)
3. Copy full DSN URL

### **Supabase**

**Backend:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sbp_3239ba703a96cee5e258396939111c5db2aecd9c
SUPABASE_AUTH_ENABLED=true
```

**Frontend:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 📋 **Setup Instructions**

### **Render (Backend)**

1. Go to Render Dashboard → Service → Environment
2. Add environment variables:
   ```
   SENTRY_DSN=https://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@o4507887226847232.ingest.sentry.io/4507887226847232
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=sbp_3239ba703a96cee5e258396939111c5db2aecd9c
   SUPABASE_AUTH_ENABLED=true
   ```
3. Redeploy service

### **Vercel/Render (Frontend)**

1. Go to Project Settings → Environment Variables
2. Add:
   ```
   SENTRY_DSN=https://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@o4507887226847232.ingest.sentry.io/4507887226847232
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
3. Redeploy

---

## 🎯 **Features Activated**

### **Sentry Error Tracking**

✅ **Frontend:**
- Browser errors (JavaScript, React)
- Performance monitoring (page loads, API calls)
- Session replay (10% sessions, 100% on errors)
- Source maps for debugging

✅ **Backend:**
- FastAPI exception tracking
- Logging integration (INFO+ → Sentry)
- Performance traces (20% sampling)
- Profile sampling (10% for performance analysis)

### **Supabase Integration**

✅ **Backend:**
- JWT authentication middleware
- Service role access for admin operations
- Database operations via Supabase client

✅ **Frontend:**
- SSR authentication
- Realtime subscriptions
- Storage access

---

## 🧪 **Testing**

### **Test Sentry (Frontend)**

1. Add test error to a page:
   ```typescript
   // Test error
   throw new Error("Test Sentry error tracking");
   ```
2. Check Sentry dashboard: https://sentry.io/

### **Test Sentry (Backend)**

1. Trigger error:
   ```bash
   curl -X POST http://localhost:8000/api/v1/test-error
   ```
2. Check Sentry dashboard

### **Test Supabase**

1. Login via frontend
2. Check JWT validation in backend logs
3. Verify database operations

---

## 📊 **Monitoring**

### **Sentry Dashboard**
- https://sentry.io/
- Errors by type, frequency, user impact
- Performance metrics
- Release tracking

### **Supabase Dashboard**
- https://app.supabase.com/
- Auth users
- Database tables
- Storage buckets
- Realtime subscriptions

---

## 🔒 **Security**

✅ **Sensitive Data Filtering:**
- Passwords, API keys, tokens filtered from Sentry events
- Cookies removed from browser events
- Environment-aware configuration

✅ **Supabase:**
- Service role key: **NEVER expose to frontend**
- Anon key: Safe for browser (RLS protects data)

---

**Last Updated:** 2025-01-XX © 2025 Converto Business OS


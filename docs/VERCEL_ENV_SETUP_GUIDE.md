# 🔧 Vercel Production Environment Variables Setup Guide

**Kriittiset ympäristömuuttujat Vercel Production -käyttöönottoon**

---

## 📋 **Tehtävälista**

### 1. **Supabase Configuration** (Pakollinen)
```env
# Vercel Dashboard → Project Settings → Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. **Base URL & Domain** (Pakollinen)
```env
NEXT_PUBLIC_BASE_URL=https://converto.fi
```

### 3. **Admin & Backend Integration** (Pakollinen)
```env
ADMIN_JWT_SECRET=generate-secure-random-string-32-characters
SUPABASE_URL=https://your-project.supabase.co
```

### 4. **Chat & Analytics** (Valinnainen)
```env
NEXT_PUBLIC_CRISP_WEBSITE_ID=your-crisp-website-id
```

### 5. **Stripe (Future)** (Valinnainen)
```env
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 🔐 **Vercel Dashboard Setup Steps**

### **Step 1: Access Vercel Project**
1. Login to [vercel.com](https://vercel.com)
2. Navigate to your DocFlow project
3. Go to **Settings** → **Environment Variables**

### **Step 2: Add Variables**
For each variable above:
1. Click **"Add New"**
2. Enter **Name** and **Value**
3. Set **Environment**: `Production`, `Preview`, and `Development`
4. Click **"Save"**

### **Step 3: Generate Secrets**
```bash
# Generate secure JWT secret (32+ characters)
openssl rand -base64 32
# Example: R0FudGhDb2RlQ29uZmlybVZlcnlTZWN1cmU=
```

---

## ✅ **Verification Checklist**

After setup:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` → Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Public anon key (safe for frontend)
- [ ] `NEXT_PUBLIC_BASE_URL` → https://converto.fi
- [ ] `ADMIN_JWT_SECRET` → Generated secure string
- [ ] `SUPABASE_URL` → Supabase project URL

---

## 🔍 **Test Setup**

After deploying, verify these work:
```bash
# Test production build
npm run build

# Test environment variables are loaded
console.log(process.env.NEXT_PUBLIC_BASE_URL)
```

---

## 📞 **Troubleshooting**

### **Common Issues:**
1. **Build fails** → Check all required variables are set
2. **Environment not loading** → Restart Vercel deployment
3. **Supabase connection errors** → Verify URL and anon key

### **Support:**
- Vercel Docs: [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- Supabase Dashboard: [Project Settings → API](https://supabase.com/dashboard/project/settings/api)

---

**Status:** ✅ Configuration template ready  
**Next:** Add variables to Vercel dashboard → Deploy → Test
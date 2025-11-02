# 🚀 COMPLETE MIGRATION: Render → Cloudflare + Vercel

## 📊 CURRENT STATE
- **8 Render services** running Converto, Herbspot, and Coding Agent
- **Converto.fi** configured but not working properly
- **Cost**: ~$0-20/month on Render

## 🎯 TARGET STATE
- **Frontend**: Cloudflare Pages (FREE)
- **Backend**: Vercel Functions OR Cloudflare Workers
- **Storage**: Cloudflare R2 OR Vercel Blob
- **Cost**: $0/month (all free tiers)
- **Performance**: Better (200+ global locations)

---

## 🔑 REQUIRED API KEYS

### 1. Cloudflare API Token
Get from: https://dash.cloudflare.com/profile/api-tokens

**Required Permissions:**
- Account.Cloudflare Pages:Edit
- Account.Workers Scripts:Edit
- Zone.Zone:Read
- Zone.DNS:Edit

**Or use Global API Key:**
- https://dash.cloudflare.com/profile/api-tokens
- Click "Global API Key"

### 2. Vercel Access Token
Get from: https://vercel.com/account/tokens

**Required Scopes:**
- Deployment (read/write)
- Project (read/write)
- Team (if applicable)

---

## 📋 MIGRATION STEPS

### **STEP 1: Deploy Frontend to Cloudflare Pages**

```bash
# Install wrangler if not installed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Set environment variable
export CLOUDFLARE_API_TOKEN="your-token-here"

# Deploy to Cloudflare Pages
cd frontend
wrangler pages deploy .next --project-name=converto-frontend
```

**OR via Dashboard:**
1. Go to: https://dash.cloudflare.com/pages/create
2. Connect to Git: `mxxx222/converto-business-os-mvp`
3. Framework: Next.js
4. Build command: `cd frontend && npm install && npm run build`
5. Output directory: `frontend/.next`
6. Add environment variables
7. Deploy

### **STEP 2: Add Custom Domain (converto.fi)**

**In Cloudflare Pages:**
1. Settings → Custom domains
2. Add `converto.fi` and `www.converto.fi`
3. Cloudflare auto-configures DNS and SSL

**DNS Configuration:**
```
Type: CNAME
Name: @
Target: [your-project].pages.dev

Type: CNAME
Name: www
Target: [your-project].pages.dev
```

### **STEP 3: Deploy Backend**

**Option A: Vercel Functions (Recommended)**
```bash
# Install vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy backend
cd backend
vercel --prod
```

**Option B: Cloudflare Workers**
```bash
cd workers
wrangler deploy
```

### **STEP 4: Configure API Routes**

**If using Vercel:**
- Backend API: `https://api.converto.fi`
- Frontend API: Same domain as frontend

**If using Cloudflare Workers:**
- Workers handle `/api/*` routes automatically
- Configure in `workers/wrangler.toml`

### **STEP 5: Delete Render Services**

**After successful migration:**
```bash
# Delete converto services
curl -X DELETE https://api.render.com/v1/services/srv-d41adhf5r7bs739aqe70 \
  -H "Authorization: Bearer $RENDER_API_KEY"

curl -X DELETE https://api.render.com/v1/services/srv-d3rcdnpr0fns73bl3kg0 \
  -H "Authorization: Bearer $RENDER_API_KEY"

# Backend services
curl -X DELETE https://api.render.com/v1/services/srv-d3r10pjipnbc73asaod0 \
  -H "Authorization: Bearer $RENDER_API_KEY"
```

**⚠️ KEEP:**
- `herbspot-*` services
- `coding-agent-web` (if still in use)

---

## 🎯 FINAL ARCHITECTURE

```
converto.fi → Cloudflare Pages (Frontend)
            → Cloudflare Workers OR Vercel Functions (API)
            → Cloudflare R2 OR Vercel Blob (Storage)
            → Resend (Email)
```

---

## ✅ MIGRATION CHECKLIST

- [ ] Get Cloudflare API token
- [ ] Get Vercel access token
- [ ] Deploy frontend to Cloudflare Pages
- [ ] Configure converto.fi custom domain
- [ ] Deploy backend to Vercel or Workers
- [ ] Configure API routes
- [ ] Test all functionality
- [ ] Delete Render services
- [ ] Update DNS if needed
- [ ] Monitor for 24 hours

---

## 🎉 EXPECTED RESULTS

✅ **converto.fi** working on Cloudflare
✅ **$0 hosting cost** (vs $5-20/month)
✅ **Better performance** (200+ global locations)
✅ **Automatic SSL** certificates
✅ **Built-in analytics**
✅ **Edge computing** capabilities

---

**READY TO START MIGRATION!**

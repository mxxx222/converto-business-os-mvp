ocs/VERCEL_DEPLOYMENT_STEPS.md</path>
<content"># 🚀 VERCEL DEPLOYMENT - CONVERTO.FI
## Step-by-Step Instructions for Vercel Web Interface

---

## 📋 **VERCEL DEPLOYMENT SETUP**

### **Step 1: Import Repository**
1. **Click:** "Import Git Repository" (should be visible)
2. **Enter:** `https://github.com/mxxx222/converto-business-os-mvp.git`
3. **Click:** "Import"
4. **Click:** "Connect GitHub" (if prompted)

### **Step 2: Configure Project Settings**

#### **Project Name:**
```
converto-frontend
```

#### **Framework Preset:**
```
Next.js
```

#### **Root Directory:**
```
frontend
```

**⚠️ IMPORTANT:** The frontend is in the `/frontend` folder of the repository, so we need to specify this as the root directory.

#### **Build Command:**
```
cd frontend && npm install && npm run build
```

#### **Build Output Directory:**
```
frontend/.next
```

#### **Install Command:**
```
cd frontend && npm install
```

### **Step 3: Environment Variables**
Click "Add New" and add these environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Email Configuration (Free option)
RESEND_API_KEY=your-resend-api-key

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# App Configuration
NEXT_PUBLIC_APP_URL=https://converto.fi
NODE_ENV=production
```

### **Step 4: Deploy**
1. **Click:** "Deploy" button
2. **Wait:** Vercel will build and deploy (2-3 minutes)
3. **View:** Your site will be available at the provided URL

---

## 🌐 **CUSTOM DOMAIN CONFIGURATION**

### **After Successful Deployment:**

#### **Step 1: Add Custom Domain**
1. Go to your project dashboard in Vercel
2. Click **"Domains"** tab
3. Click **"Add Domain"**
4. Enter: `converto.fi`
5. Enter: `www.converto.fi`

#### **Step 2: DNS Configuration**
Vercel will show you DNS records to add. Typically:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

#### **Step 3: Configure DNS at Domain Provider**
1. Login to your domain registrar (hostingpalvelu.fi)
2. Go to DNS Management
3. Add the A and CNAME records shown by Vercel
4. Save changes

---

## 📧 **EMAIL SETUP (Free Solution)**

### **Option 1: Gmail SMTP (Recommended)**
```bash
# Environment Variable for Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### **Option 2: Zoho Mail (Professional)**
```bash
# Environment Variable for Email
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=hello@converto.fi
SMTP_PASS=your-zoho-password
```

### **Option 3: cPanel Email (Hostingpalvelu.fi)**
```bash
# Environment Variable for Email
SMTP_HOST=mail.hostingpalvelu.fi
SMTP_PORT=587
SMTP_USER=hello@converto.fi
SMTP_PASS=your-cpanel-password
```

---

## 🔧 **POST-DEPLOYMENT CHECKLIST**

### **✅ Verify Deployment:**
- [ ] Site loads at Vercel URL
- [ ] Contact form works
- [ ] Pilot signup form works
- [ ] All pages load correctly
- [ ] Mobile responsive design works

### **✅ Custom Domain:**
- [ ] DNS records configured
- [ ] SSL certificate issued automatically
- [ ] converto.fi redirects to site
- [ ] www.converto.fi redirects to site

### **✅ Email:**
- [ ] Contact form sends emails
- [ ] Pilot signup sends confirmations
- [ ] Emails reach destination
- [ ] No spam folder issues

### **✅ Performance:**
- [ ] Site loads in < 3 seconds
- [ ] Images optimized
- [ ] SEO meta tags present
- [ ] Analytics tracking working

---

## 🎯 **EXPECTED RESULT**

After following these steps:
- ✅ **converto.fi** → Full marketing website
- ✅ **www.converto.fi** → Same content (redirect)
- ✅ **hello@converto.fi** → Real email addresses
- ✅ **SSL Certificate** → Automatic (Let's Encrypt)
- ✅ **Performance** → Optimized (Vercel CDN)
- ✅ **Analytics** → Plausible + Google Analytics
- ✅ **Contact Forms** → Working with free email

---

## 💰 **COST BREAKDOWN**

| Service | Monthly Cost | Notes |
|---------|--------------|-------|
| **Vercel Hosting** | Free | Up to 100GB bandwidth |
| **Domain** | $0 | Already owned |
| **Email** | Free | Gmail/cPanel/Zoho options |
| **SSL Certificate** | Free | Automatic via Vercel |
| **Analytics** | Free | Plausible included |
| **Total** | **$0/month** | Completely free! |

---

## 📞 **SUPPORT**

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://vercel.com/docs/framework-guides/deploy/nextjs
- **Custom Domains:** https://vercel.com/docs/concepts/projects/domains
- **Environment Variables:** https://vercel.com/docs/concepts/projects/environment-variables

---

**🚀 RESULT: Professional marketing website live on converto.fi at $0/month cost!**
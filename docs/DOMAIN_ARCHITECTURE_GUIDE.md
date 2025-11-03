# 🌐 Converto.fi Domain Architecture & Navigation Guide

## **✅ DEPLOYMENT STATUS: RESOLVED**

**Live URL:** https://frontend-cmo2cuhon-maxs-projects-149851b4.vercel.app  
**Git Status:** ✅ All changes committed (`e6f083ed`)  
**Auto-Deploy:** ✅ GitHub Actions configured  
**Future:** Automatic deployment on every push to `main`

---

## 🎯 **DOMAIN ARCHITECTURE**

### **Multi-Domain Strategy**

```
┌─────────────────────────────────────────────────────────────┐
│  converto.fi (Root Domain)                                  │
│  ├─ Public Marketing & Services                             │
│  ├─ SEO Optimized                                           │
│  └─ Main Brand Hub                                          │
└─────────────────────────────────────────────────────────────┘
         │
         ├──────────────────────────┬──────────────────────────┐
         │                          │                          │
    ┌────▼────┐               ┌────▼────┐              ┌─────▼─────┐
    │ pilot.  │               │  app.   │              │  docs.   │
    │converto │               │converto │              │converto  │
    │   .fi   │               │   .fi   │              │   .fi    │
    ├─────────┤               ├─────────┤              ├──────────┤
    │ Landing │               │  SaaS   │              │  API     │
    │ Signup  │               │  App    │              │  Docs    │
    │ Form    │               │  Login  │              │  FAQ     │
    │         │               │  Dash   │              │  Ints    │
    │ noindex │               │         │              │          │
    │         │               │ noindex │              │ future   │
    └─────────┘               └─────────┘              └──────────┘
```

---

## 📋 **DETAILED ROUTE MAP**

### **1. converto.fi (Root - Marketing Site)**

#### **Main Pages:**
```
/                           → Hero + Services Overview
/business-os               → Product overview
/pilot                     → Pilot signup CTA (redirects to pilot.converto.fi)
/pricing                   → Pricing tiers
/contact                   → Contact form
```

#### **Service Pages (/palvelut/*):**
```
/palvelut/ocr              → OCR Receipt Scanning
/palvelut/vat              → VAT Calculator
/palvelut/chatservice      → ChatService™ AI
/palvelut/automaatio       → Automation tools
/palvelut/agentit          → AI Agents
/palvelut/verkkosivut      → NextSite™ Services
```

#### **Features:**
- ✅ Public SEO (index, follow)
- ✅ Structured data (Organization schema)
- ✅ OG metadata for social sharing
- ✅ Plausible tracking: `converto.fi`
- ✅ Smooth scroll navigation
- ✅ Mobile-responsive design

---

### **2. pilot.converto.fi (Pilot Landing)**

#### **Routes:**
```
/                          → Pilot landing page
```

#### **Features:**
- ✅ Hero section with value proposition
- ✅ Pilot signup form
- ✅ **SEO:** `noindex, nofollow` (avoids dilution)
- ✅ **Canonical:** Points to `converto.fi`
- ✅ **Schema:** SoftwareApplication
- ✅ **Tracking:** `pilot.converto.fi` (separate analytics)
- ✅ Email integration: Resend API
- ✅ Welcome email with login link

#### **Form Fields:**
```typescript
{
  name: string          // Full name
  email: string         // Email address
  company: string       // Company name
  website?: string      // Honeypot (must be empty)
}
```

#### **Post-Submit:**
1. Saves to Supabase `pilot_signups` table
2. Sends welcome email via Resend
3. Email includes: `https://app.converto.fi/login?ref=pilot`
4. Redirects to confirmation page

---

### **3. app.converto.fi (SaaS Application)**

#### **Routes:**
```
/login                    → Supabase Auth login
/dashboard                → Business OS Dashboard
/automation               → Automation hub
/analytics                → Analytics dashboard
```

#### **Features:**
- ✅ Supabase Authentication
- ✅ **SEO:** `noindex, nofollow`
- ✅ **Schema:** WebApplication
- ✅ **Tracking:** `app.converto.fi` (separate analytics)
- ✅ **Cookie scope:** `.converto.fi` (shared sessions)
- ✅ Protected routes with middleware
- ✅ Role-based access control (RBAC)
- ✅ Module registry integration

#### **Authentication Flow:**
```mermaid
User → /login → Supabase Auth → Success → /dashboard
                                           ↓
                                    Shared session
                               (.converto.fi cookie)
```

#### **Shared Session Cookie:**
- **Domain:** `.converto.fi`
- **Scope:** All subdomains
- **Benefit:** Single sign-on across pilot → app flow

---

### **4. docs.converto.fi (Future - API Documentation)**

#### **Planned Routes:**
```
/                         → API overview
/api                      → REST API docs
/integrations             → Integration guides
/faq                      → Frequently asked questions
/changelog                → Version history
```

#### **Features:**
- API documentation
- Integration examples
- SDK downloads
- Support resources

---

## 🔄 **NAVIGATION FLOWS**

### **Flow 1: Discover → Pilot → App**

```
1. User lands on converto.fi
   ↓
2. Clicks "Liity pilottiin" CTA
   ↓
3. Redirects to pilot.converto.fi
   ↓
4. Fills pilot signup form
   ↓
5. Receives welcome email with link:
   https://app.converto.fi/login?ref=pilot
   ↓
6. Clicks link → app.converto.fi/login
   ↓
7. Logs in with Supabase Auth
   ↓
8. Redirects to app.converto.fi/dashboard
   ↓
9. Can access all Business OS features
```

### **Flow 2: Direct App Access**

```
1. User goes to app.converto.fi/login
   ↓
2. Enters credentials
   ↓
3. Supabase authenticates
   ↓
4. Redirects to /dashboard (protected)
```

### **Flow 3: Public → Service Detail**

```
1. User browses converto.fi
   ↓
2. Clicks service link (e.g., "/palvelut/ocr")
   ↓
3. Views service details
   ↓
4. Scrolls to "Pilot CTA" or navbar "Aloita pilotti"
   ↓
5. Redirects to pilot.converto.fi
   ↓
6. Completes signup
```

---

## 🔗 **INTERNAL LINKING**

### **Marketing Site (converto.fi):**
```html
<!-- Hero CTA -->
<a href="/business-os">Katso palvelut</a>
<a href="https://pilot.converto.fi">Aloita pilotti</a>

<!-- Navbar -->
<a href="/">Etusivu</a>
<a href="/business-os">Business OS</a>
<a href="https://pilot.converto.fi">Pilotti</a>
<a href="/pricing">Hinnoittelu</a>
<a href="/contact">Yhteystiedot</a>
<a href="https://app.converto.fi/login">Kirjaudu</a>

<!-- Sticky CTA (every page) -->
<a href="https://pilot.converto.fi">🚀 Liity Pilottiin</a>

<!-- Service Cards -->
<a href="/palvelut/ocr">OCR + Kuitit</a>
<a href="/palvelut/vat">VAT Calculator</a>
<a href="/palvelut/chatservice">ChatService™</a>
<a href="/palvelut/automaatio">Automation</a>
```

### **Pilot Site (pilot.converto.fi):**
```html
<!-- Form Submit -->
→ API: POST /api/pilot
→ Email: Resend welcome email
→ Link in email: https://app.converto.fi/login?ref=pilot
```

### **App Site (app.converto.fi):**
```html
<!-- Login Success -->
→ Redirect: /dashboard
→ Middleware validates session
→ Cookie shared: .converto.fi
```

---

## 📊 **SEO STRATEGY**

### **converto.fi (Public):**
```yaml
index: true
follow: true
canonical: self
schema:
  - Organization
  - WebSite
  - BreadcrumbList
robots: "index, follow"
sitemap: sitemap.xml
```

### **pilot.converto.fi (Landing):**
```yaml
index: false          # Avoid duplication
follow: false
canonical: https://converto.fi  # SEO value to main
schema:
  - SoftwareApplication
robots: "noindex, nofollow"
sitemap: excluded
```

### **app.converto.fi (SaaS):**
```yaml
index: false          # Private app
follow: false
canonical: self
schema:
  - WebApplication
robots: "noindex, nofollow"
sitemap: excluded
```

### **docs.converto.fi (API):**
```yaml
index: true           # Public docs
follow: true
canonical: self
schema:
  - TechArticle
  - APIReference
robots: "index, follow"
sitemap: included
```

---

## 🎨 **COMPONENT STRUCTURE**

### **Shared Components:**
```
components/
├── Navbar.tsx           → Main navigation
├── Footer.tsx           → Footer links
├── Hero.tsx             → Hero sections
├── Problem.tsx          → Problem statements
├── CTA.tsx              → Call-to-action
├── Plan.tsx             → Step-by-step plans
├── PilotForm.tsx        → Signup form
└── StickyPilotCTA.tsx   → Floating CTA
```

### **Layout Files:**
```
frontend/app/
├── layout.tsx           → Root layout (all domains)
├── pilot/
│   └── layout.tsx       → Pilot-specific SEO
└── app/
    └── layout.tsx       → App-specific SEO
```

---

## 🔐 **AUTHENTICATION & SESSIONS**

### **Supabase Configuration:**
```typescript
// shared_core/lib/supabase/middleware.ts
{
  cookieOptions: {
    domain: '.converto.fi',  // Shared across subdomains
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7  // 7 days
  }
}
```

### **Session Flow:**
1. User logs in at `app.converto.fi/login`
2. Supabase creates session cookie
3. Cookie scoped to `.converto.fi`
4. Works across all subdomains:
   - `app.converto.fi/*`
   - `pilot.converto.fi/*` (if needed)
   - `docs.converto.fi/*` (if needed)

---

## 📧 **EMAIL AUTOMATION**

### **Pilot Welcome Email:**
```html
Subject: Tervetuloa Converto Business OS pilottiin!

Hei {name},

Kiitos ilmoittautumisesta!

<p>Pääse alkuun:</p>
<a href="https://app.converto.fi/login?ref=pilot">
  Kirjaudu Business OS:ään →
</a>

TIETOJA:
- 30 päivää maksutonta käyttöä
- Kaikki Business OS -ominaisuudet
- Henkilökohtainen on-boarding

Ystävällisin terveisin,
Converto-tiimi
```

---

## 🎯 **ANALYTICS TRACKING**

### **Plausible Setup:**
```javascript
// converto.fi
<Script data-domain="converto.fi" src="..." />

// pilot.converto.fi
<Script data-domain="pilot.converto.fi" src="..." />

// app.converto.fi
<Script data-domain="app.converto.fi" src="..." />
```

### **Tracked Goals:**
- `converto.fi`: CTA clicks, service views
- `pilot.converto.fi`: Form submissions, email opens
- `app.converto.fi`: Logins, module activations

---

## 🚀 **DEPLOYMENT STRATEGY**

### **Automatic Deployment:**
```yaml
# .github/workflows/vercel-deploy.yml
Trigger: Push to main branch
Steps:
  1. Checkout code
  2. Build Next.js app
  3. Deploy to Vercel
  4. Run health checks
  5. Notify on failure
```

### **Deployment URLs:**
- Production: `converto.fi`
- Preview: `vercel.app` preview URLs
- Development: `localhost:3000`

---

## ✅ **NEXT STEPS**

### **Immediate:**
1. ✅ Vercel deployment configured
2. ✅ Auto-deploy on push
3. ✅ Domain architecture complete

### **Future:**
1. Add `docs.converto.fi` subdomain
2. Implement API documentation
3. Add integration guides
4. Set up changelog

### **Manual Tasks:**
1. **DNS:** Add `pilot.converto.fi`, `app.converto.fi` at hostingpalvelu.fi
2. **Vercel:** Configure custom domains in dashboard
3. **Plausible:** Add new subdomains as sites

---

**📅 Updated:** 2025-11-03  
**Status:** ✅ Production Ready  
**Next:** Configure DNS records manually


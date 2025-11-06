# Domain Routing Strategy - Converto Business OS

## 📋 Tavoite

Jäsennetään domainit selkeästi:
- **Verkkosivu** (Marketing): converto.fi
- **App/Dashboard**: app.converto.fi
- **API**: api.converto.fi

## 🎯 Ehdotettu Domain-rakenne

### Vaihtoehto 1: Subdomain-rakenne (SUOSITELTU)

```
converto.fi          → Marketing (static site)
www.converto.fi      → Redirect → converto.fi
app.converto.fi      → Dashboard (SSR, Supabase auth)
api.converto.fi      → Backend API (FastAPI)
```

**Hyödyt:**
- ✅ Selkeä jäsennys
- ✅ Helppo ylläpito
- ✅ Yksi SSL-sertifikaatti (wildcard)
- ✅ Selkeät CORS-asetukset

**DNS-konfiguraatio:**
```
converto.fi          CNAME → converto-marketing.onrender.com
www.converto.fi      CNAME → converto-marketing.onrender.com
app.converto.fi      CNAME → converto-dashboard.onrender.com
api.converto.fi      CNAME → converto-business-os-quantum-mvp-1.onrender.com
```

---

### Vaihtoehto 2: Polku-pohjainen (ei suositeltu, koska SSR)

```
converto.fi          → Marketing (static)
converto.fi/app      → Dashboard (ei toimi SSR:n kanssa)
converto.fi/api      → Backend proxy (vaatii reverse proxy)
```

**Ongelmat:**
- ❌ SSR ei toimi polku-pohjaisesti eri palveluille
- ❌ Vaikea ylläpito
- ❌ API proxy vaatii lisäkomponentin

---

## 🔧 Toteutus - Render Dashboard

### 1. Marketing (converto.fi)

**Palvelu:** `converto-marketing` (srv-d41adhf5r7bs739aqe70)
**Tyyppi:** Static Site

**Render Dashboard -> Settings -> Custom Domains:**
```
converto.fi          → Lisää custom domain
www.converto.fi      → Lisää custom domain (redirect)
```

---

### 2. Dashboard (app.converto.fi)

**Palvelu:** `converto-dashboard` (srv-d3rcdnpr0fns73bl3kg0)
**Tyyppi:** Web Service (Node.js SSR)

**Render Dashboard -> Settings -> Custom Domains:**
```
app.converto.fi      → Lisää custom domain
```

**Ympäristömuuttujat:**
```bash
NEXT_PUBLIC_API_URL=https://api.converto.fi
```

---

### 3. Backend API (api.converto.fi)

**Palvelu:** `converto-business-os-quantum-mvp-1` (srv-d3r10pjipnbc73asaod0)
**Tyyppi:** Web Service (Python FastAPI)

**Render Dashboard -> Settings -> Custom Domains:**
```
api.converto.fi      → Lisää custom domain
```

**Ympäristömuuttujat (päivitä):**
```bash
ALLOWED_ORIGINS=https://app.converto.fi,https://converto.fi,https://www.converto.fi
```

---

## 📝 DNS-konfiguraatio (hostingpalvelu.fi)

### Nykyinen (korjattava)

Tarkista hostingpalvelu.fi DNS-paneelista:

```
converto.fi          CNAME → ??? (tarkista)
www.converto.fi      CNAME → ??? (tarkista)
```

### Uusi konfiguraatio

**1. Marketing:**
```
converto.fi          CNAME → converto-marketing.onrender.com
www.converto.fi      CNAME → converto-marketing.onrender.com
```

**2. Dashboard:**
```
app.converto.fi      CNAME → converto-dashboard.onrender.com
```

**3. API:**
```
api.converto.fi      CNAME → converto-business-os-quantum-mvp-1.onrender.com
```

**Vaihtoehto: Wildcard SSL (jos Render tukee):**
```
*.converto.fi        CNAME → (Render käsittelee automaattisesti)
```

---

## 🔐 SSL-sertifikaatit

Render hoitaa SSL-sertifikaatit automaattisesti jokaiselle custom domainille:
- ✅ Let's Encrypt automaattinen uusinta
- ✅ HTTPS pakollinen
- ✅ Redirect HTTP → HTTPS

**SSL-verifiointi:**
1. Render luo DNS TXT -tietueen
2. Lisää se hostingpalvelu.fi DNS-paneeliin
3. Render vahvistaa domainin
4. SSL-sertifikaatti aktivoituu automaattisesti

---

## 🌐 CORS-konfiguraatio

### Backend (FastAPI)

Päivitä `backend/main.py` tai ympäristömuuttujat:

```python
ALLOWED_ORIGINS=https://app.converto.fi,https://converto.fi,https://www.converto.fi
```

**render.yaml:**
```yaml
- key: ALLOWED_ORIGINS
  value: https://app.converto.fi,https://converto.fi,https://www.converto.fi
```

---

## 📱 Frontend API-konfiguraatio

### Dashboard (app.converto.fi)

**frontend/.env.production:**
```bash
NEXT_PUBLIC_API_URL=https://api.converto.fi
```

**Tai ympäristömuuttuja Render Dashboardissa:**
```bash
NEXT_PUBLIC_API_URL=https://api.converto.fi
```

---

## 🔄 Redirect-logiikka

### Marketing (converto.fi)

**www.converto.fi → converto.fi:**

Render Static Site tukee automaattisia redirecteja, mutta jos tarvitsee manuaalista:

**frontend/public/_redirects:**
```
www.converto.fi/*    https://converto.fi/:splat    301
```

---

## 🚀 Deploy-ohje

### Askeleet

1. **DNS-konfiguraatio (hostingpalvelu.fi)**
   ```
   converto.fi          CNAME → converto-marketing.onrender.com
   www.converto.fi      CNAME → converto-marketing.onrender.com
   app.converto.fi      CNAME → converto-dashboard.onrender.com
   api.converto.fi      CNAME → converto-business-os-quantum-mvp-1.onrender.com
   ```

2. **Render Dashboard - Custom Domains**

   **Marketing:**
   - Render Dashboard → converto-marketing → Settings → Custom Domains
   - Lisää: `converto.fi`
   - Lisää: `www.converto.fi`
   - Odota DNS-verifiointia

   **Dashboard:**
   - Render Dashboard → converto-dashboard → Settings → Custom Domains
   - Lisää: `app.converto.fi`
   - Odota DNS-verifiointia

   **API:**
   - Render Dashboard → converto-business-os-quantum-mvp-1 → Settings → Custom Domains
   - Lisää: `api.converto.fi`
   - Odota DNS-verifiointia

3. **Ympäristömuuttujat**

   **Backend:**
   ```bash
   ALLOWED_ORIGINS=https://app.converto.fi,https://converto.fi,https://www.converto.fi
   ```

   **Dashboard:**
   ```bash
   NEXT_PUBLIC_API_URL=https://api.converto.fi
   ```

4. **SSL-vahvistus**
   - Render luo TXT-tietueen jokaiselle domainille
   - Lisää TXT-tietue hostingpalvelu.fi DNS-paneeliin
   - Odota SSL-sertifikaatin aktivoitumista (5-10 min)

---

## 📊 Lopullinen Rakenne

```
┌─────────────────────────────────────────┐
│         converto.fi (Marketing)        │
│  Static Site - Landing page, Premium   │
│  Service: converto-marketing           │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│      app.converto.fi (Dashboard)        │
│  SSR Next.js - Auth, Dashboard, App    │
│  Service: converto-dashboard           │
│  → Kutsuja: api.converto.fi             │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│        api.converto.fi (Backend)         │
│  FastAPI - REST API, Business Logic    │
│  Service: converto-business-os-...      │
└─────────────────────────────────────────┘
```

---

## ✅ Checklist

- [ ] DNS CNAME-tietueet konfiguroitu (hostingpalvelu.fi)
- [ ] Custom domains lisätty Render Dashboardiin
- [ ] DNS TXT-tietueet lisätty SSL-vahvistusta varten
- [ ] SSL-sertifikaatit aktivoituvat
- [ ] Backend ALLOWED_ORIGINS päivitetty
- [ ] Frontend NEXT_PUBLIC_API_URL päivitetty
- [ ] Testattu: converto.fi
- [ ] Testattu: app.converto.fi
- [ ] Testattu: api.converto.fi
- [ ] Testattu: api.converto.fi/health

---

## 🎯 ROI-analyysi

**Hyödyt:**
- ✅ Ammattimaiset domainit (brand credibility)
- ✅ Selkeä arkkitehtuuri
- ✅ Helppo skaalautuvuus
- ✅ CORS-hallinta yksinkertaisempi

**Kustannukset:**
- ⏱️ 30-60 min konfiguraatio
- 🔄 DNS-propagointi: 1-24h
- 💰 Render: ilmainen (custom domains)

**Arvioitu aika:**
- DNS-konfiguraatio: 15 min
- Render Custom Domains: 15 min
- SSL-vahvistus: 5-10 min
- Testaus: 10 min
- **Yhteensä: ~45-60 min**

---

## 📚 Viittaukset

- [Render Custom Domains](https://render.com/docs/custom-domains)
- [DNS Configuration](https://render.com/docs/custom-domains#2-configure-dns-with-your-provider)
- [SSL Certificates](https://render.com/docs/custom-domains#ssl-certificates)



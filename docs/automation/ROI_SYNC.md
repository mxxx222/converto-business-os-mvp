# ⚙️ Converto™ ROI Sync Automation (n8n)

## 🎯 Tavoite

Automaattinen **A/B-testin ROI-päivitys** Notioniin.

Workflow hakee PostHog- ja Plausible-tapahtumat, laskee konversio- ja ROI-arvot ja päivittää ne suoraan `StoryBrand Tracking` -taulukkoon joka aamu klo 09:00.

---

## 🧩 Workflow: `Converto A/B ROI Sync`

**Tiedosto:** `converto_ab_roi_sync.json`

**Trigger:** `Cron – daily 09:00 EET`

**Tyyppi:** Scheduled automation (n8n)

**Päivitys:** `Notion Database → StoryBrand Dashboard`

---

## 🔗 Datan kulku

```
PostHog (CTA Clicked / Variant Loaded)
  ↓
Merge Variants
  ↓
Plausible (Demo Request stats)
  ↓
Conversion & ROI Calculation
  ↓
Notion (StoryBrand DB Update)
  ↓
Daily Dashboard 09:00
```

---

## 🔧 Asetukset

| Asetus | Arvo | Kuvaus |
|--------|------|--------|
| Trigger time | 09:00 | UTC+2 (EET) |
| Source 1 | PostHog API | CTA-klikkaukset varianttikohtaisesti |
| Source 2 | Plausible API | Demo-pyynnöt ja liikenne |
| Target | Notion Database | Päivittäinen seurantarivi |
| Retention | 14 vrk | Säilyttää 2 viikon A/B-tulokset |

---

## 🧠 Parametrit ja placeholderit

| Avain | Kuvaus | Arvo / Vaihda |
|-------|--------|---------------|
| YOUR_POSTHOG_KEY | PostHog Project API Key | vaihda oikeaan avaimeseen |
| YOUR_PLAUSIBLE_KEY | Plausible API Key | vaihda oikeaan avaimeseen |
| YOUR_NOTION_DB_ID | StoryBrand Notion DB ID | vaihda oikeaan ID:hen |
| YOUR_NOTION_CREDENTIAL_NAME | n8n Notion-integraation nimi | esim. Converto-Notion |

---

## 🧮 Laskentalogiikka

```
conversion = demos / clicks * 100

ROI € = (ΔConvRate * RevenuePerLead * Visitors) - DevHoursCost

ROI % = ((ΔConvRate * RevenuePerLead * Visitors) / DevHoursCost) * 100
```

**Vakiot:**

- RevenuePerLead = 150 €
- Visitors = 5000
- DevHoursCost = 350 €
- ΔConvRate (StoryBrand) = 0.75

---

## 🧾 Notion-päivitys

Seuraavat sarakkeet päivittyvät automaattisesti:

| Sarake | Esimerkki | Lähde |
|--------|-----------|-------|
| Päivä | 2025-11-04 | Workflow-päivämäärä |
| Variantti | StoryBrand / Original | PostHog |
| CTA-klikkaukset | 92 | PostHog |
| Demo-pyynnöt | 24 | Plausible |
| Konversio % | 26.1 | Laskettu |
| ROI € | 11250 | Laskettu |
| ROI % | 540 | Laskettu |

---

## 📁 Asennusvaiheet

1. **Vie JSON-tiedosto:**
   - Lataa `converto_ab_roi_sync.json`

2. **Avaa n8n → Workflows → Import from File**

3. **Korvaa placeholderit:**
   - PostHog, Plausible, Notion arvot

4. **Testaa ajaminen manuaalisesti**

5. **Aktivoi trigger:** Cron (päivittäin klo 09:00)

6. **Tarkista Notion-taulukko:** Päivityksen pitäisi näkyä automaattisesti

---

## 📊 Tarkistuslista

- [ ] PostHog API toimii (200 OK)
- [ ] Plausible API palauttaa goal-dataa
- [ ] Notion credentials oikea
- [ ] Workflow näkyy "Active"-tilassa
- [ ] Päivitys ilmestyy StoryBrand DB:hen

---

## 🩺 Vianetsintä

| Ongelma | Todennäköinen syy | Korjaus |
|---------|-------------------|---------|
| Ei uusia rivejä Notionissa | Väärä DB-ID | Tarkista ID Notion DB URL-osoitteesta |
| 401 PostHog virhe | Vanhentunut API Key | Luo uusi API Key PostHogista |
| 403 Plausible virhe | Lupa puuttuu | Lisää API-avain "Read Stats"-oikeuksilla |
| ROI näyttää 0 | ΔConvRate ei määritetty | Varmista, että StoryBrand-variantilla on ΔConvRate=0.75 |

---

## 🧩 Integraatiot

- ✅ PostHog Cloud (read-only key)
- ✅ Plausible.io (goal breakdown)
- ✅ Notion (official API integration)
- ❌ Ei Slack-ilmoituksia (versio ilman notifikaatioita)

---

## 📈 Lopputulos

Automaattinen ROI-raportointi toimii ilman manuaalista syöttöä.

Notion-taulukko päivittyy joka aamu 09:00 →

→ KPI Dashboardissa näkyy reaaliaikainen A/B-tulosten ROI ja konversiokehitys.

---

## 🔐 Tarvittavat avaimet

### PostHog API Key

1. Mene PostHog-projektiin
2. Settings → Project API Key
3. Kopioi Project API Key (ei Personal API Key)

### Plausible API Key

1. Mene Plausible → Settings → API
2. Luo uusi API Key
3. Anna "Read Stats"-oikeudet

### Notion Database ID

1. Avaa Notion-taulukko selaimessa
2. URL: `https://notion.so/workspace/DATABASE_ID?v=...`
3. Kopioi DATABASE_ID osa URL:sta

---

**Tämä dokumentti on osa Converto™ Business-OS Automation Stackia.**

Tallennuspolku: `docs/automation/ROI_SYNC.md`

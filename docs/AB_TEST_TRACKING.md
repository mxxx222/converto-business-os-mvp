# 📊 Converto™ A/B Test – Conversion Tracking Dashboard

## 🎯 Tavoite

Seurata A/B-testin vaikutusta konversioihin (CTA-klikit, demo-pyynnöt, konversioprosentti) 14 päivän jaksolta.

---

## ✅ Seurantataulukko

| Päivä | Variantti | CTA-klikkaukset | Demo-pyynnöt | Konversio % | Bounce % | Tilastollinen merkitsevyys (p) | Toimenpide / Huomiot |
|-------|------------|-----------------|---------------|--------------|-----------|---------------------------------|-----------------------|
| 1 | Original |  — |  — |  — |  — |  — | Perusmittaus alkaa |
| 1 | StoryBrand |  — |  — |  — |  — |  — | Perusmittaus alkaa |
| 2–3 | Original |  |  |  |  |  | Seuraa liikenteen tasapaino (≈ 50/50) |
| 2–3 | StoryBrand |  |  |  |  |  |  |
| 4–7 | Original |  |  |  |  |  | Analysoi CTR ja time on page |
| 4–7 | StoryBrand |  |  |  |  |  |  |
| 8–10 | Original |  |  |  |  |  | Arvioi varhainen trendi |
| 8–10 | StoryBrand |  |  |  |  |  |  |
| 11–14 | Original |  |  |  |  |  | Loppuvaiheen validointi |
| 11–14 | StoryBrand |  |  |  |  |  | Loppuvaiheen validointi |

---

## 🧠 Analyysikaava (Notion-formula)

```text
if(prop("CTA-klikkaukset") > 0, round((prop("Demo-pyynnöt") / prop("CTA-klikkaukset")) * 100, 1), 0)
```

→ laskee "Konversio %"-sarakkeen automaattisesti.

---

## 📈 Viikkoyhteenveto

| Viikko | Variantti | Keskimääräinen konversio % | Ero % vs Original | p-arvo | Päätös |
|--------|------------|---------------------------|-------------------|--------|--------|
| 1 | Original | | — | | |
| 1 | StoryBrand | | | | |
| 2 | Original | | — | | |
| 2 | StoryBrand | | | | |

---

## 🧩 Mittarit ja lähteet

| Mittari | Lähde | Kuvaus |
|----------|--------|--------|
| CTA-klikkaukset | PostHog (CTA Clicked) | Tapahtuma, joka sisältää variant-tiedon |
| Demo-pyynnöt | Resend / API log | Lomakkeen lähetys onnistunut |
| Konversio % | Laskettu arvo | Demo / CTA |
| Bounce % | Plausible | Sivulta poistumiset ennen klikkausta |
| p-arvo | PostHog analysis tool | Tilastollinen merkitsevyys |
| Revenue Impact | Notion ROI board | Arvioitu tulosparannus |

---

## 🧾 Toimintasuositukset päätöspäivälle (Day 14)

| Tilanne | Päätös |
|---------|--------|
| StoryBrand > Original (p < 0.05, Δ > +20 %) | Deploy StoryBrand variant → 100 % liikenne |
| Ero < 20 % tai ei merkitsevyyttä | Jatka testiä +7 päivää |
| Original parempi | Revert A-varianttiin |
| Data epätasapainossa | Tasapainota liikenne ja kerää uudelleen |

---

## 🧩 Integraatiomuistio

- Plausible → kokonaisliikenne, bounce rate, conversion goal = demo-request
- PostHog → tapahtumat (CTA Clicked, Variant Loaded)
- Notion → päivittäinen manuaalikirjaus tai n8n-automaatti
- ROI Board → kuukausittainen tuottovaikutus

---

## 💡 Käyttövinkki

- Tee tästä linked database TaskPulse™:n "Sprint 46 – StoryBrand Launch" näkymään.
- Lisää värikoodit:
  - 🔴 p > 0.1 = Ei merkitsevä
  - 🟠 0.05 < p ≤ 0.1 = Rajatapauksia
  - 🟢 p ≤ 0.05 = Merkittävä → voittaja

---

## 🧭 Seurannan tavoite

"Kasvata Converto™-sivun konversioprosenttia +75 % dataohjatusti ilman käyttökokemuksen heikkenemistä."

---

## 📐 ROI-kaava (Notion Formula)

### ROI € Formula

```text
(round((prop("ΔConvRate") * prop("RevenuePerLead") * prop("Visitors")) - prop("DevHoursCost"), 0))
```

### ROI % Formula

```text
if(prop("DevHoursCost") > 0, round(((prop("ΔConvRate") * prop("RevenuePerLead") * prop("Visitors")) / prop("DevHoursCost")) * 100, 1), 0)
```

### Esimerkkitulokset

| ΔConvRate | RevenuePerLead | Visitors | DevHoursCost | ROI € | ROI % |
|-----------|----------------|----------|--------------|-------|-------|
| 0.75 | 150 | 5000 | 350 | 562 150 € | 160 600 % |

---

## 🔧 Setup-ohjeet

1. **PostHog Setup:**
   - Luo PostHog-projekti
   - Hae API Key
   - Luo `.env.local` tiedosto projektin juureen:
     ```
     NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxxx
     NEXT_PUBLIC_AB_TESTING=true
     ```
   - Varmista että `.env.local` on `.gitignore`-tiedostossa

2. **Plausible Setup:**
   - Varmista että Plausible on käytössä
   - Aseta goal "demo-request" Plausible-dashboardissa

3. **Notion Setup:**
   - Kopioi tämä taulukko Notioniin
   - Muunna "Convert to database → Table view"
   - Lisää ROI-sarakkeet ja kaavat

4. **n8n Automation (valinnainen):**
   - Importoi `converto_ab_roi_sync.json`
   - Aseta PostHog, Plausible ja Notion credentials
   - Aktivoi workflow

---

## 📊 Deployment Checklist

- [ ] Lisää `.env.local` → `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_AB_TESTING=true`
- [ ] Deploy to Vercel → `converto.fi/storybrand`
- [ ] Tarkista Plausible tracking `data-domain="converto.fi"`
- [ ] Vahvista PostHog eventit (`CTA Clicked`, `Variant Loaded`)
- [ ] Käynnistä A/B-testi (control vs. SB)
- [ ] Aktivoi Notion-seuranta (linkitetty DB)

---

**Status:** ✅ Valmis käyttöön
**Seuraava:** Aktivoi A/B-testi ja aloita seuranta

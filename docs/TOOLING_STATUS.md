# Tooling Status

This repo now ships a consistent set of commands for the main app surfaces:

| Area | Command | Notes |
| --- | --- | --- |
| Marketing Next.js app | `yarn lint:marketing` | Runs ESLint via the workspace package |
| Legacy frontend (Next 15) | `yarn lint:frontend` | Uses the flat ESLint config with FlatCompat |
| Backend lint + type checks | `yarn lint:backend` | Formats with Black, then runs Ruff and mypy |
| Combined lint sweep | `yarn lint` | Executes the three lint targets serially |
| Marketing type check | `yarn typecheck:marketing` | `tsc --noEmit` with strict mode enabled |
| Legacy frontend type check | `yarn typecheck:frontend` | Delegates to `frontend/tsconfig.json` |
| Full quality gate | `yarn check` | Chains lint + typecheck commands |
| Fast staged check | `yarn check:fast` | Runs ESLint + `tsc --noEmit` via lint-staged |
| Backend formatting only | `yarn format:backend` | Invokes Black through the managed `.venv` |
| Bundle analysis | `yarn analyze:marketing` | Builds the marketing app with `ANALYZE=true` |
| Pre-commit quality | `pre-commit run --all-files` | Black, Ruff, mypy for backend code |

## Python virtual environment

The formatter command assumes the local virtual environment located at `.venv/` exists. To recreate it with the required CLI tooling:

```bash
python3 -m venv .venv
./.venv/bin/pip install black ruff mypy fastapi pydantic pydantic-settings types-PyYAML
```

To enable automatic checks on commit:

```bash
pip install pre-commit
pre-commit install
```

CI pipelines cache pip (`.venv`), `.mypy_cache`, Yarn, and npm assets to keep job times low. Use `yarn check:fast` before opening PRs for quick JS feedback, and run `pre-commit run --all-files` to mirror backend quality gates locally.

## Observability roll-up – 2025-11-09

- `/metrics` exports Prometheus counters/histograms directly from the backend router (no more stub response). `pytest tests/metrics/` covers endpoint payload + middleware headers.
- New `backend/app/middleware/timing.py` attaches `x-request-duration-ms` and feeds the `http_request_duration_seconds` histogram.
- OCR power route emits Sentry spans tagged with `tenant_id` and `request_id`, and records latency via `ocr_request_duration_seconds`.
- CI now runs `python scripts/export_openapi.py` and uploads `docs/openapi.yaml` as a build artifact; script falls back to JSON if PyYAML is unavailable.
- Nightly maintenance workflow (`.github/workflows/nightly-backup-report.yml`) executes backup + reporting tasks at 03:00 UTC with manual dispatch support.
- Prometheus alert rules live in `prometheus/alerts.yaml` and cover API p95, OCR p95, 5xx ratio, and realtime publish latency; reference them from your `prometheus.yml` via `rule_files`.
- Grafana dashboards should include panels for request latency, OCR latency, error rate, SLO burn rate, and Sentry issue feeds per the rollout checklist.

## Archived files

Legacy backend modules that duplicated production code have been moved to `archive/backend/` for reference so the active package stays lean without losing historical context.

## Marketing bundle -analyysi — 2025-11-08

- Päiväys: 2025-11-08
- Build-komento: `yarn analyze:marketing`
- Commit/haara: paikallinen työtila (ei vielä push)
- Tavoitteet:
  - JS bundle −10–25 % (käynnissä)
  - LCP < 2.0 s, TBT < 150 ms (seurannassa Vercel/SI)

### TOP-3 raskainta moduulia

1. `static/chunks/1dd3208c-1f7c0ceea75ee4a6.js` (168.8 kB parsed / 52.4 kB gzip)
   - Syy: React DOM runtime (kompiloitu `react-dom`), ei helposti pienennettävissä ilman kehysmuutosta.
   - Ehdotettu toimenpide: ei toimenpidettä lyhyellä aikavälillä; jatkossa React Server Components käyttö voi pienentää.
2. `static/chunks/cd24890f-3ee2e000769e5902.js` (155.9 kB parsed / 50.8 kB gzip)
   - Syy: `posthog-js` analytiikkakirjasto.
   - Ehdotettu toimenpide: jatkaa laiskaa latausta vain consentin jälkeen / harkitse kevyempää analytiikkaa.
3. `static/chunks/framework-3664cab31236a9fa.js` (137.7 kB parsed / 44.1 kB gzip)
   - Syy: Next.js framework + React.
   - Ehdotettu toimenpide: ei suoraa leikkausta; pidä muut chunkit minimissä.

### Toimenpiteet ja vaikutus

- Leikkaus 1: `posthog-js` laiska lataus `dynamic import`illa `AnalyticsProvider`-komponentissa.
  - Tekniikka: runtime `import('posthog-js')` `useEffect`issä.
  - Vaikutus: siirsi 156 kB moduulin erilliseen chunkkiin ja pois ensimmäisestä renderöinnistä (parempi interaktio ilman consentia).
- Leikkaus 2: `CookieBanner` muutettu dynaamiseksi client-only -importiksi.
  - Tekniikka: `next/dynamic` + `ssr: false`.
  - Vaikutus: banneri ei kuulu kriittiseen HTML:ään; consent-valinta hallitaan keskitetyssä kontekstissa.
- Leikkaus 3: `ROIForm` pilkottu laiskasti ladattaviin tulos- ja kaaviokomponentteihin.
  - Tekniikka: dynamic import + skeletonit, tulokset renderöidään vasta lomakkeen lähetyksen jälkeen.
  - Vaikutus: `/`-reitin chunk pysyy pienenä; raskaat laskelmat ja UI ladattaan vain käyttäjän toimesta.

### Client vs. server rajaus (audit)

- Tarkistetut importit, jotka siirrettiin server-onlyyn: ei uutta; varmistettu Plausible-konfiguraatio `ScriptProps`-tyyppini turvallinen.
- Poistetut käyttämättömät riippuvuudet: ei poistettu (seurataan jatkossa `posthog-js` mahdollinen korvaaminen).
- Huomiot: PostHog chunk latautuu vasta consentin jälkeen; seurataan tosiaikaisia mittareita varmistaaksemme ettei hydraatio kärsi.

### Mittaukset

- Ennen (Lighthouse dev build, 2025-11-08 klo 21:25)
  - Performance score: 0.67
  - LCP: 3.93 s
  - TBT: 817 ms
  - First Load JS (shared): 87.1 kB
  - `/` sivun bundle: 2.66 kB
- Jälkeen (Lighthouse prod build, 2025-11-08 klo 22:15)
  - Performance score: 0.73
  - LCP: 3.74 s
  - TBT: 648 ms
  - First Load JS (shared): 87.2 kB
  - `/` sivun chunk: 55.7 kB*

> \* Chunk raportoitu suurempana, koska ROIFormin tulos- ja kaaviokomponentit latautuvat vasta lomakkeen lähetyksen jälkeen. Ensimmäinen renderöinti välttää nämä resurssit (consent ja dynaamiset osat).

### Jatkotoimet

- [ ] Tutki PostHog-kirjaston korvaaminen kevyemmällä (tai server-only) vaihtoehdolla.
- [x] Pilko `ROIForm` sisäisiin dynaamisiin alaosioihin (esim. tulostaulukko) vähentääksesi aloituskuormaa.
- [x] Aja Lighthouse + Vercel Analytics mittaukset ja päivitä luvut tuotantoon.

## Release log — 2025-11-09

- Lighthouse (prod, headless Chrome): LCP 1.47 s, TBT 14 ms, CLS 0.00
- Analytiikka: Plausible aktiivinen, PostHog poissa tuotannosta
- SEO: sitemap.xml ja robots.txt palauttavat 200 OK; sitemap listaa vain toimivia docflow.fi URL-osoitteita

### Seuranta (7 päivän tarkistus)

- Tavoite: LCP ≤ 1.8 s, TBT ≤ 100 ms, CLS ≤ 0.01
- Toimi: tallenna Vercel Analytics + Lighthouse snapshot 24 h ja 7 pv kohdalla
- Dokumentoi tulokset tähän logiin jatkoseurantaa varten

### Google Search Console — perustaminen

1. Lisää `docflow.fi` domain-property:
   - Search Console → “Add property” → Domain
   - Lisää paluussa annettu TXT-tietue Vercel DNS:ään (`@` host, arvo Googlelta) ja vahvista
2. Lähetä sitemap:
   - Sitemaps-paneeli → lisää `https://docflow.fi/sitemap.xml`
   - Seuraa “Discovered”/“Indexed” arvoja
3. Valvo Coverage/Pages -raportteja (404, soft 404, redirectit)
4. Lisää erikseen URL Prefix -property, jos haluat lisäraportointia, ja linkitä Search Console GA4:ään

### Weekly SEO & Web Vitals — YYYY-MM-DD

- Web Vitals (prod): LCP … s, TBT … ms, CLS …
- Indexed pages (GSC): Total …, New …, Excluded …
- 404 guard: … non-200 (korjattu: …)
- Toimet: …

#### Sitemap 404 Guard — notifications & locale scan
- Alert threshold: workflow only fails/notifies when `NON200_COUNT ≥ 3`
- Slack alerts: set repo secret `SLACK_WEBHOOK_URL` to receive notifications on threshold breaches
- Locale scanning: flip `LOCALE_SCAN=true` in the workflow (and optional script export) once localized routes return 200 responses


# 🚀 Converto Business OS - Quantum Edition

**AI-powered business management platform for Finnish entrepreneurs**

[![Production Ready](https://img.shields.io/badge/status-production%20ready-success)](https://github.com/mxxx222/converto-business-os-quantum-mvp-1)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.10-black)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## ✨ Features

### 🧾 OCR AI Receipt Scanning
- Drag & drop receipt upload
- AI-powered data extraction (OpenAI Vision)
- Automatic categorization
- VAT rate detection

### 🧮 VAT Calculator
- Regulatory-compliant rates (Vero.fi source)
- Versioned tax rates (historical + current)
- Automatic calculations
- PDF/CSV reports

### ⚖️ Legal Compliance Engine
- Finlex integration (Finnish legislation)
- Automatic law updates
- Risk assessment
- Compliance dashboard

### 🎮 Gamification
- Points and streaks
- Play-to-Earn tokens (CT)
- Rewards catalog
- Leaderboards

### 💳 Billing & Subscriptions
- Stripe integration
- Multiple pricing tiers
- Invoice history
- Payment management

---

## Deploy 30 sekunnissa. Ilman riskiä.

Yksi komento. Selkeä rollback. Nolla säätöä.

- 20× nopeampi deploy
- 15× nopeampi recovery
- <1% virheet

### 3 askelta

1) Lisää env‑avaimet  
2) Aja health + status  
3) Deploy staging → tuotanto

👉 Ensimmäinen komento:

```bash
docflow-deploy status
```

Pehmeä aloitus (ilman muutoksia):

```bash
docflow-deploy deploy --dry-run
```

Jos tämä ei säästä 10 minuuttia heti, älä käytä. Muuten, tee deploysta rutiini.

---

## 🚀 Quick Start

### ⚡ **START HERE:**
👉 **[START_HERE.md](START_HERE.md)** - **Aloita tästä!** Nopein tapa alkuun

### ⚡ **SETUP NYT (Prioriteetit 1-3):**
👉 **[QUICK_START.md](QUICK_START.md)** - 3 askelta (~15 min) ⚡ **Nopein!**
👉 **[SETUP_NOW.md](SETUP_NOW.md)** - Yksityiskohtainen setup (~12 min)

1. Backend Environment Variables (Render)
2. Frontend Environment Variables (Vercel/Render)
3. Enable Supabase Realtime

### Local Development (Docker)
```bash
# Clone repository
git clone https://github.com/mxxx222/converto-business-os-quantum-mvp-1.git
cd converto-business-os-quantum-mvp-1

# Setup environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Start all services
docker-compose up

# Open browser
open http://localhost:3000
```

### Dashboard Development (SSR Mode)
```bash
# Frontend with SSR (for dashboard)
cd frontend
NEXT_PUBLIC_STATIC_EXPORT=false npm run dev

# Dashboard available at:
# http://localhost:3000/dashboard
```

### Testing
```bash
# Validate dashboard setup
make validate-dashboard

# Test dashboard endpoints
make test-dashboard

# Integration tests
make test-integrations
```

### Production Deployment (Render)
```bash
# 1. Push to GitHub
git push origin main

# 2. Deploy to Render
# Follow guide in RENDER_DEPLOY_GUIDE.md

# 3. Setup pilot customer
./scripts/pilot_setup.sh "Company Name" "email@company.com"
```

### API Quick Start (90 s)
- OpenAPI: back end exposes `/openapi.json` and docs at `/docs`
- Health check: `GET /health`
- Metrics: `GET /metrics`
- Lead create: `POST /api/leads` `{ email, consent }`
- Postman: `docs/postman_collection.json` (set `API_URL` variable)

---

## 📚 Documentation

### ⚡ **GETTING STARTED:**
- [**QUICK_START.md**](QUICK_START.md) - ⚡ **Fastest!** 3-step setup (~15 min)
- [**SETUP_NOW.md**](SETUP_NOW.md) - Detailed setup guide (12 min)
- [**FINAL_CHECKLIST.md**](FINAL_CHECKLIST.md) - Production launch checklist
- [**PROJECT_COMPLETE_SUMMARY.md**](PROJECT_COMPLETE_SUMMARY.md) - 🎉 **Complete project overview**
- [**IMPLEMENTATION_COMPLETE.md**](IMPLEMENTATION_COMPLETE.md) - Project status & summary

### 🏗️ Enterprise & Architecture
- [**CONVERTO_ENTERPRISE_BLUEPRINT.md**](CONVERTO_ENTERPRISE_BLUEPRINT.md) - Complete development pipeline (Day 1-15), ROI, spin-off products
- [**ML Ops Suite**](docs/ML_OPS_SUITE_README.md) - Commercializable spin-off products (Auto-Tuning, Cost Guardian, Predictive Core, etc.)

### 🚀 Deployment & Setup
- [**RENDER_DEPLOY_GUIDE.md**](RENDER_DEPLOY_GUIDE.md) - Step-by-step deployment
- [**PILOT_CHECKLIST.md**](PILOT_CHECKLIST.md) - Customer onboarding
- [**FINAL_STATUS.md**](FINAL_STATUS.md) - Complete feature list
- [**README_CORE.md**](README_CORE.md) - Architecture details

### 📊 Dashboard & Setup
- [**Dashboard Fix Guide**](DASHBOARD_FIX_GUIDE.md) - ⚡ **Dashboard setup complete guide**
- [**Dashboard Status**](docs/DASHBOARD_STATUS.md) - Dashboard implementation status

### 💼 Business & Marketing
- [**Markkinat Menestys**](MARKKINAT_MENESTYS.md) - 🎯 **1000 sanaa miksi tämä on menestysratkaisu**

### 🔧 Technical Features
- [**Tekniset Ominaisuudet**](TEKNISET_OMINAISUUDET.md) - 🔧 **Kattava lista kaikista teknologioista ja työkaluista**

### 🏗️ Architecture & Development
- [**Developer Architecture**](DEVELOPER_ARCHITECTURE.md) - 🧱 **Täydellinen arkkitehtuurikuvaus kehittäjille ja CTO:ille**
- [**AI Orchestrator**](AI_ORCHESTRATOR.md) - 🤖 **AI Backend Orchestrator - kuinka tekoäly orkestroi prosessit**
- [**FinanceAgent**](docs/FINANCE_AGENT.md) - 💰 **AI Financial Advisor Agent - oppiva talousassistentti**

### 🔧 Technical Guides
- [**MCP OpenAI Setup**](docs/MCP_OPENAI_SETUP.md)
- [**Supabase Setup (Auth/Storage/Realtime)**](docs/SUPABASE_SETUP.md)
- [**Sprint Backlog (UI/UX)**](docs/sprint-backlog-uiux.md)
- [**Security UX**](docs/SECURITY_UX.md)
- [**CSV Export Spec**](docs/CSV_EXPORT_SPEC.md)
- [**API Keys Inventory**](docs/API_KEYS_INVENTORY.md) - All configured API keys
- [**Sentry Background Operations**](docs/SENTRY_BACKGROUND_OPERATIONS.md) - Error tracking explained
- [**Project Status Summary**](docs/PROJECT_STATUS_SUMMARY.md) - Complete project overview
- [**Next Steps Recommendations**](docs/NEXT_STEPS_RECOMMENDATIONS.md) - Prioritized action plan
- [**Priorities 4-7 Implementation**](docs/PRIORITIES_4-7_IMPLEMENTATION.md) - Monitoring, testing, launch guides

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Next.js 14    │  Frontend (Premium UI)
│   + Tailwind    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    FastAPI      │  Backend (REST API)
│  + PostgreSQL   │
│  + Redis        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  OpenAI Vision  │  AI Services
│  Stripe API     │
│  Finlex RSS     │
└─────────────────┘
```

---

## 🎯 Tech Stack

**Frontend:**
- Next.js 14.2.10
- React 18.3.1
- Tailwind CSS 3.4.10
- Framer Motion
- shadcn/ui

**Backend:**
- FastAPI
- PostgreSQL
- Redis
- SQLAlchemy
- APScheduler

**AI/ML:**
- OpenAI GPT-4o-mini (Vision)
- Tesseract OCR
- scikit-learn (future)

**Infrastructure:**
- Docker + docker-compose
- Render (deployment)
- GitHub Actions (CI/CD)

---

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Lite** | 29 €/month | OCR, VAT calculator, Basic reports |
| **Pro** | 49 €/month | + AI Chat, Advanced reports, Gamification |
| **Insights** | 99 €/month | + Legal Engine, Predictive analytics, Priority support |

---

## 📊 Status

- ✅ **38 commits** - Production ready
- ✅ **12 pages** - Fully functional
- ✅ **15 API modules** - Tested
- ✅ **Docker ready** - One-command startup
- ✅ **Render ready** - Blueprint deployment

---

## 🤝 Contributing

This is a commercial project. For partnership inquiries, contact: hello@converto.fi

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🎉 Ready for Production!

**Deploy now:** Follow [RENDER_DEPLOY_GUIDE.md](RENDER_DEPLOY_GUIDE.md)

**Questions?** Open an issue or contact support.

---

**Made with ❤️ in Finland 🇫🇮**

---

> Etkö ehdi nyt? Aja vain:
> ```bash
> docflow-deploy status
> ```
> 30 s. Ei riskiä. Jos et voita heti aikaa, älä käytä.

---

## ⚙️ Operations / Observability

- `npm run openapi:export && npm run openapi:lint` regenerates and gates the DocFlow API contract (`openapi.yaml`, `spectral.yaml`)
- `npm run build && npm run test -- --coverage` executes type-checking + Vitest coverage for the new observability utilities
- `npm run e2e:smoke` (requires `E2E_*` variables from `.env.sample`) runs the Playwright admin dashboard login smoke scenario
- `curl -sS localhost:3000/api/metrics` exposes Prometheus metrics (`frontend/lib/obs/metrics.ts`) and feeds `prometheus/alerts.yml`
- `curl -sS localhost:3000/api/observability` emits the Sentry `obs_smoke_test` signal and validates OCR/HTTP histograms
- CI now includes the `frontend-observability` job (lint → type-check → build → unit tests → OpenAPI export/lint → optional Playwright smoke test)

---

## 🧱 Technical Debt / TODO

- [ ] mypy cleanup across workspace
  - Scope: fix typing errors flagged by pre-commit mypy across `app/core`, `app/api`, `app/modules`, and related packages.
  - Approach: add missing return/type hints, install stubs for third-party libs (e.g., `types-PyYAML`), reduce `Any` usage; consider relaxing mypy per-module temporarily and tighten iteratively.
  - Note: non-blocking for deploys; address in a follow-up sprint.

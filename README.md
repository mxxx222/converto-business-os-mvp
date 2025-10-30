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

## 🚀 Quick Start

### ⚡ **SETUP NYT (Prioriteetit 1-3):**
👉 **[SETUP_NOW.md](SETUP_NOW.md)** - Nopea setup-ohje (~12 min)

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
- [**SETUP_NOW.md**](SETUP_NOW.md) - ⚡ **Start here!** Quick setup guide (12 min)
- [**IMPLEMENTATION_COMPLETE.md**](IMPLEMENTATION_COMPLETE.md) - Project status & summary

### 🏗️ Enterprise & Architecture
- [**CONVERTO_ENTERPRISE_BLUEPRINT.md**](CONVERTO_ENTERPRISE_BLUEPRINT.md) - Complete development pipeline (Day 1-15), ROI, spin-off products
- [**ML Ops Suite**](docs/ML_OPS_SUITE_README.md) - Commercializable spin-off products (Auto-Tuning, Cost Guardian, Predictive Core, etc.)

### 🚀 Deployment & Setup
- [**RENDER_DEPLOY_GUIDE.md**](RENDER_DEPLOY_GUIDE.md) - Step-by-step deployment
- [**PILOT_CHECKLIST.md**](PILOT_CHECKLIST.md) - Customer onboarding
- [**FINAL_STATUS.md**](FINAL_STATUS.md) - Complete feature list
- [**README_CORE.md**](README_CORE.md) - Architecture details

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

## 🧱 Technical Debt / TODO

- [ ] mypy cleanup across workspace
  - Scope: fix typing errors flagged by pre-commit mypy across `app/core`, `app/api`, `app/modules`, and related packages.
  - Approach: add missing return/type hints, install stubs for third-party libs (e.g., `types-PyYAML`), reduce `Any` usage; consider relaxing mypy per-module temporarily and tighten iteratively.
  - Note: non-blocking for deploys; address in a follow-up sprint.

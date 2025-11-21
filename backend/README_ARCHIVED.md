# FastAPI Backend - ARCHIVED

**Status:** Archived (2025-01-15)  
**Reason:** Migrated to Vercel Pro (Next.js API Routes)  
**Maintained for:** Future scaling and rollback scenarios

## Overview

This FastAPI backend was the original server implementation for DocFlow. It has been migrated to Next.js API Routes for the Vercel Pro-only architecture, but is preserved for:

1. **Future scaling needs** (VM-level control, multi-region)
2. **Rollback scenarios** (if Vercel limitations encountered)
3. **Reference implementation** (business logic preservation)
4. **Microservices transition** (heavy processing workloads)

## Architecture

### Core Components

- **FastAPI Application:** `main.py` - Main application with middleware stack
- **Authentication:** Supabase JWT + custom middleware
- **Database:** PostgreSQL via Supabase with RLS
- **Monitoring:** Sentry integration with tenant context
- **Metrics:** Prometheus metrics collection

### Route Structure

```
/                           # Health check
/health                     # Load balancer probe
/api/leads                  # Lead management
/api/metrics                # Prometheus metrics
/api/auth/*                 # Authentication endpoints
/api/users/*                # User management
/api/v1/email/*            # Email service (Resend)
/api/v1/ocr/*              # OCR processing
/api/v1/receipts/*         # Receipt scanning
/api/v1/ai/*               # AI services
/api/v1/finance/*          # Finance agent
/api/v1/admin/*            # Admin panel
/api/v1/clients/*          # Client management
/api/v1/notion/*           # Notion integration
/api/v1/linear/*           # Linear integration
/api/v1/supabase/*         # Database utilities
/api/v1/stripe/*           # Payment processing
```

## Migration Status

### ✅ Migrated to Next.js API Routes

- Health checks (`/health` → `/api/health`)
- OCR processing (`/api/v1/ocr/*` → `/api/ocr/*`)
- Receipt scanning (`/api/v1/receipts/*` → `/api/receipts/*`)
- Lead management (`/api/leads` → `/api/leads`)
- Auth callbacks (`/api/auth/*` → `/api/auth/*`)
- CSP reporting (`/api/csp-report` → `/api/csp-report`)

### 🔄 Pending Migration

See `BACKEND_MIGRATION_AUDIT.md` for complete migration plan.

## Deployment Instructions

### Local Development

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Deployment (Fly.io)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
fly deploy --config fly.toml
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Authentication
SUPABASE_AUTH_ENABLED=true
JWT_SECRET=...

# External APIs
RESEND_API_KEY=...
OPENAI_API_KEY=...
NOTION_TOKEN=...
LINEAR_API_KEY=...
STRIPE_SECRET_KEY=...

# Monitoring
SENTRY_DSN=...
SENTRY_ENVIRONMENT=production

# CORS
CORS_ORIGINS=["https://docflow.fi"]
ALLOWED_ORIGIN_REGEX=https://.*\.docflow\.fi
```

## Key Features Preserved

### Authentication & Authorization

- **Supabase JWT verification** (`shared_core/middleware/supabase_auth.py`)
- **Row Level Security** (`shared_core/middleware/tenant_context.py`)
- **Admin RBAC** (`shared_core/middleware/admin_auth.py`)

### Business Logic

- **OCR Processing** (`shared_core/modules/ocr/`)
- **Receipt Analysis** (`shared_core/modules/receipts/`)
- **AI Integration** (`shared_core/modules/ai/`)
- **Finance Agent** (`shared_core/modules/finance_agent/`)
- **Email Workflows** (`backend/modules/email/`)

### Monitoring & Observability

- **Sentry Integration** (`backend/sentry_init.py`)
- **Prometheus Metrics** (`backend/app/core/metrics.py`)
- **Tenant Context Tracking** (all requests tagged)
- **PII Scrubbing** (GDPR compliant)

## Performance Characteristics

### Benchmarks (Last Measured)

- **Health Check:** ~5ms response time
- **OCR Processing:** ~2-5s depending on image size
- **Receipt Scanning:** ~1-3s average
- **Database Queries:** ~50-200ms with RLS
- **External API Calls:** ~500ms-2s

### Scaling Limits

- **Concurrent Requests:** ~100-200 per instance
- **Memory Usage:** ~512MB-2GB depending on workload
- **CPU Usage:** ~20-80% during OCR processing
- **Database Connections:** ~10-20 per instance

## Future Deployment Scenarios

### Scenario 1: Vercel Limitations

If Vercel Pro encounters limitations (function timeouts, memory limits, cost):

1. Deploy FastAPI to Fly.io
2. Update DNS to point to Fly.io
3. Migrate high-traffic routes back to FastAPI
4. Keep auth/simple routes on Vercel

### Scenario 2: Multi-Region Expansion

For global expansion requiring multi-region deployment:

1. Deploy FastAPI to multiple Fly.io regions
2. Use Vercel for CDN and static content
3. Route API traffic to nearest FastAPI instance
4. Implement cross-region database replication

### Scenario 3: Microservices Architecture

For scaling individual components:

1. **Vercel:** Auth, simple CRUD, static content
2. **FastAPI (Fly.io):** Heavy processing (OCR, AI)
3. **Supabase:** Database and real-time features
4. **External:** Specialized services (ML, analytics)

## Code Quality & Standards

### Type Safety
- Full type hints with `from __future__ import annotations`
- Pydantic models for request/response validation
- SQLAlchemy models with proper typing

### Error Handling
- Custom exception classes
- Proper HTTP status codes
- Sentry integration for error tracking
- User-friendly error messages

### Security
- JWT token validation
- Row Level Security enforcement
- CORS configuration
- Input sanitization
- Rate limiting (via middleware)

### Testing
- Unit tests for business logic
- Integration tests for API endpoints
- Mock external services
- Database transaction rollback in tests

## Dependencies

### Core
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `pydantic` - Data validation
- `sqlalchemy` - Database ORM
- `alembic` - Database migrations

### Authentication
- `supabase` - Auth and database client
- `python-jose` - JWT handling
- `passlib` - Password hashing

### External APIs
- `resend` - Email service
- `openai` - AI services
- `stripe` - Payment processing
- `notion-client` - Notion integration

### Monitoring
- `sentry-sdk` - Error tracking
- `prometheus-client` - Metrics collection
- `structlog` - Structured logging

## Maintenance Notes

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

### Monitoring

- **Sentry:** Error tracking and performance monitoring
- **Prometheus:** Custom business metrics
- **Logs:** Structured JSON logging with correlation IDs

### Security Updates

- Regular dependency updates via `pip-audit`
- Security scanning with `bandit`
- OWASP compliance checks

---

**Archived by:** DocFlow Engineering Team  
**Date:** 2025-01-15  
**Contact:** For questions about this archived code, see migration documentation or contact the team.

# Sentry API Optimointi & Ongelmien Helpotus - Analyysi

## 📊 Nykyinen Sentry-Integraatio

### Frontend (Dashboard)
- ✅ Client-side: `sentry.client.config.ts`
- ✅ Server-side: `sentry.server.config.ts`
- ✅ Error boundaries: `ErrorBoundary.tsx`
- ✅ API-kutsut: `lib/api.ts` käyttää `Sentry.startSpan`
- ✅ Sampling rate: 10% (0.1)

### Backend (FastAPI)
- ✅ Initialisointi: `backend/sentry_init.py`
- ✅ PII scrubbing: Konfiguroitu
- ✅ Environment: Asetettu

## 🎯 Maksimoidaan Sentry API:n Käyttö

### 1. Performance Monitoring (Tracing)

#### Nykyinen Tila
- ✅ Frontend: `tracesSampleRate: 0.1` (10%)
- ✅ Backend: Ei eksplisiittistä tracing-konfiguraatiota

#### Optimointi
```python
# backend/sentry_init.py - Lisää performance monitoring
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

sentry_sdk.init(
    dsn=settings.sentry_dsn,
    environment=settings.environment,
    traces_sample_rate=0.2,  # 20% backend traces
    integrations=[
        FastApiIntegration(),
        SqlalchemyIntegration(),
    ],
    # Performance profiling
    profiles_sample_rate=0.1,  # 10% profiled transactions
)
```

#### Frontend Optimointi
```typescript
// apps/dashboard/sentry.client.config.ts
Sentry.init({
  // Increase sampling for critical pages
  tracesSampleRate: 0.2,  // 20% (was 10%)
  
  // Add route-based sampling
  beforeSendTransaction(event) {
    // 100% sampling for critical routes
    if (event.transaction?.match(/\/admin\/|/analytics/)) {
      return event;
    }
    // 10% for others
    return Math.random() < 0.1 ? event : null;
  },
});
```

### 2. Error Context Enrichment

#### Nykyinen Tila
- ✅ Perus error tracking
- ⚠️ Rajoitettu konteksti

#### Optimointi
```python
# backend/main.py - Lisää kontekstia kaikkiin virheisiin
import sentry_sdk

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    with sentry_sdk.push_scope() as scope:
        # Lisää request-konteksti
        scope.set_context("request", {
            "method": request.method,
            "url": str(request.url),
            "headers": dict(request.headers),
        })
        
        # Lisää user-konteksti jos saatavilla
        if hasattr(request.state, "user"):
            scope.set_user({
                "id": request.state.user.id,
                "email": request.state.user.email,
            })
        
        # Lisää tenant-konteksti
        if hasattr(request.state, "tenant_id"):
            scope.set_tag("tenant_id", request.state.tenant_id)
        
        sentry_sdk.capture_exception(exc)
    
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

### 3. Custom Metrics & Events

#### Lisää Business Metrics
```python
# backend/app/core/sentry_metrics.py
import sentry_sdk

def track_deployment_issue(issue_type: str, details: dict):
    """Track deployment issues for analysis"""
    sentry_sdk.capture_message(
        f"Deployment issue: {issue_type}",
        level="warning",
        tags={
            "issue_type": issue_type,
            "deployment": "fly.io",
        },
        contexts={
            "deployment": details,
        }
    )

def track_import_error(module: str, error: str):
    """Track import errors during startup"""
    sentry_sdk.capture_exception(
        ImportError(f"Failed to import {module}: {error}"),
        tags={
            "error_type": "import_error",
            "module": module,
            "phase": "startup",
        }
    )
```

### 4. Breadcrumbs for Debugging

#### Lisää Breadcrumbs
```python
# backend/main.py - Lisää breadcrumbs startup-vaiheisiin
import sentry_sdk

@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    sentry_sdk.add_breadcrumb(
        message="Starting application",
        level="info",
        category="startup",
    )
    
    try:
        configure_logging()
        sentry_sdk.add_breadcrumb(
            message="Logging configured",
            level="info",
            category="startup",
        )
        
        logger.info("Ensuring database schema is up to date")
        Base.metadata.create_all(bind=engine)
        sentry_sdk.add_breadcrumb(
            message="Database schema ready",
            level="info",
            category="startup",
        )
        
        # ... rest of startup
    except Exception as e:
        sentry_sdk.capture_exception(e)
        raise
```

## 🔧 Ongelmien Helpotus Tulevaisuudessa

### 1. Deployment Issue Detection

#### Automaattinen Tunnistus
```python
# backend/app/middleware/deployment_monitor.py
import sentry_sdk
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

class DeploymentMonitorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            
            # Tunnista deployment-ongelmia
            if response.status_code >= 500:
                sentry_sdk.capture_message(
                    f"Server error: {response.status_code}",
                    level="error",
                    tags={
                        "status_code": response.status_code,
                        "endpoint": request.url.path,
                        "deployment": "fly.io",
                    }
                )
            
            return response
        except Exception as e:
            # Tunnista startup-virheet
            if "ModuleNotFoundError" in str(type(e)):
                sentry_sdk.capture_exception(
                    e,
                    tags={
                        "error_type": "module_not_found",
                        "phase": "runtime",
                    }
                )
            raise
```

### 2. Health Check Monitoring

#### Sentry Alerts
```python
# backend/app/routes/health.py
import sentry_sdk

@router.get("/health")
async def health():
    try:
        # Tarkista kriittiset komponentit
        checks = {
            "database": await check_database(),
            "redis": await check_redis(),
            "imports": await check_imports(),
        }
        
        if not all(checks.values()):
            # Lähetä Sentryyn jos health check epäonnistuu
            sentry_sdk.capture_message(
                "Health check failed",
                level="error",
                tags={
                    "health_check": "failed",
                    "checks": checks,
                }
            )
        
        return {"status": "healthy" if all(checks.values()) else "degraded"}
    except Exception as e:
        sentry_sdk.capture_exception(e)
        raise
```

### 3. Import Error Tracking

#### Startup Error Detection
```python
# backend/main.py - Tarkista importit startupissa
import sentry_sdk

def verify_imports():
    """Verify all critical imports work"""
    critical_imports = [
        "backend.main",
        "backend.config",
        "shared_core.middleware.auth",
        "shared_core.modules.admin",
    ]
    
    failed_imports = []
    for module in critical_imports:
        try:
            __import__(module)
            sentry_sdk.add_breadcrumb(
                message=f"Import successful: {module}",
                level="info",
                category="startup",
            )
        except ImportError as e:
            failed_imports.append(module)
            sentry_sdk.capture_exception(
                e,
                tags={
                    "error_type": "import_error",
                    "module": module,
                    "phase": "startup",
                }
            )
    
    if failed_imports:
        raise ImportError(f"Failed to import: {failed_imports}")

# Kutsuta startupissa
@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    verify_imports()  # Tarkista importit ennen muuta
    # ... rest of startup
```

### 4. Fly.io Specific Monitoring

#### Deployment State Tracking
```python
# backend/app/middleware/fly_monitor.py
import sentry_sdk
import os

def track_fly_deployment():
    """Track Fly.io deployment information"""
    fly_app = os.getenv("FLY_APP_NAME")
    fly_region = os.getenv("FLY_REGION")
    fly_allocation_id = os.getenv("FLY_ALLOC_ID")
    
    if fly_app:
        sentry_sdk.set_tag("fly_app", fly_app)
        sentry_sdk.set_tag("fly_region", fly_region)
        sentry_sdk.set_tag("fly_allocation_id", fly_allocation_id)
        
        sentry_sdk.set_context("fly_deployment", {
            "app": fly_app,
            "region": fly_region,
            "allocation_id": fly_allocation_id,
        })
```

## 📈 Sentry Dashboard Setup

### 1. Custom Dashboards

#### Deployment Issues Dashboard
- **Widget 1**: Error rate by deployment
- **Widget 2**: Import errors by module
- **Widget 3**: Health check failures
- **Widget 4**: Startup time trends

### 2. Alerts

#### Kriittiset Alertit
```yaml
# sentry_alerts.yml
alerts:
  - name: "Deployment Failure"
    conditions:
      - error_rate > 5% in 5 minutes
      - tags.deployment == "fly.io"
    actions:
      - notify: slack
      - notify: email
  
  - name: "Import Error"
    conditions:
      - tags.error_type == "import_error"
    actions:
      - notify: slack
      - create_issue: github
  
  - name: "Health Check Failure"
    conditions:
      - tags.health_check == "failed"
    actions:
      - notify: pagerduty
```

## 🎯 Suositukset

### Prioriteetti 1: Kriittinen
1. ✅ Lisää performance monitoring backendiin
2. ✅ Lisää import error tracking startupissa
3. ✅ Lisää health check monitoring

### Prioriteetti 2: Tärkeä
1. ✅ Lisää breadcrumbs startup-vaiheisiin
2. ✅ Lisää custom metrics deployment-ongelmille
3. ✅ Konfiguroi Sentry alerts

### Prioriteetti 3: Hyödyllinen
1. ✅ Lisää route-based sampling
2. ✅ Lisää user context kaikkiin virheisiin
3. ✅ Lisää tenant context

## 📊 Odotettu Hyöty

### Ennen Optimointia
- ❌ Deployment-ongelmat havaittu vasta kun käyttäjät raportoivat
- ❌ Startup-virheet jäävät huomaamatta
- ❌ Rajoitettu konteksti virheissä

### Optimoinnin Jälkeen
- ✅ Deployment-ongelmat havaittu heti Sentryyn
- ✅ Startup-virheet trackattu automaattisesti
- ✅ Rikkaampi konteksti helpottaa debuggausta
- ✅ Alerts automaattisesti kriittisistä ongelmista


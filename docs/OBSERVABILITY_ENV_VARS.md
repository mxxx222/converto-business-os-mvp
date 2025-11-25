# Observability Environment Variables

## Required Variables

### Sentry Error Tracking

```env
# Frontend Sentry DSN (public, safe to expose in browser)
NEXT_PUBLIC_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id

# Backend Sentry DSN (private, server-side only)
SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id

# Sentry Environment
ENVIRONMENT=development  # or staging/production
```

### Prometheus Metrics

```env
# Prometheus Base URL (for analytics queries)
PROMETHEUS_BASE_URL=http://localhost:9090

# Enable Prometheus analytics in frontend
ANALYTICS_PROM_ENABLED=false  # Set to true when Prometheus is available
```

## Optional Variables

```env
# Observability Debugging
OBS_DEBUG_REQUESTS=false  # Set to true for detailed request logging

# Log Level
LOG_LEVEL=INFO  # DEBUG/INFO/WARNING/ERROR

# WebSocket URL
NEXT_PUBLIC_WS_URL=wss://api.converto.fi

# Sentry Sampling Rates (0.0 - 1.0)
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1

# Sentry Release (optional)
SENTRY_RELEASE=  # git commit SHA or version tag
```

## Notes

- All observability features work without these vars (graceful degradation)
- `OBS_DEBUG_REQUESTS` should be false in production (logs sensitive data)
- `ANALYTICS_PROM_ENABLED` enables Prometheus queries in admin dashboard


# Deployment Checklist — Quick‑Runner

## 1) Environment (staging/CI)

Required (export/secrets):

- `ADMIN_JWT_SECRET`
- `BACKEND_BASE_URL` (e.g., https://backend.staging.example.com)
- `FRONTEND_BASE_URL` (e.g., https://staging.example.com)
- `PROMETHEUS_BASE_URL`
- `NO_EXTERNAL_SEND=true`

Optional:

- `PROMETHEUS_BEARER`
- `SENTRY_DSN`
- `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL` (frontend buildissa)

## 2) OpenAPI

- Export: `python scripts/export_openapi.py --out docs/openapi.yaml`
- Lint: `npm run openapi:lint --prefix frontend` (Spectral error‑taso)

## 3) Metrics smoke

`/metrics` sisältää:

- `request_duration_ms_bucket`
- `publish_latency_ms_(bucket|count)`
- `doc_ingested_total`
- `revenue_total_eur`

## 4) Admin API smoke

- `/api/admin/queue` 401 ilman tokenia
- `/api/admin/queue` POST 201 Bearer‑tokenilla (body: `{"docId":"QR1"}`)

## 5) E2E smoket (mock)

- `npm --prefix frontend run build`
- `npx --yes playwright test frontend/e2e`

## 6) GO/NO‑GO

- Kaikki PASS → GO
- FAIL → korjaa vika, toista


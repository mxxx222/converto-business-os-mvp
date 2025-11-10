# DocFlow — Docs

## Quick links

- Admin Dashboard audit (Cursor prompt): [docs/ADMIN_DASHBOARD_AUDIT.md](./ADMIN_DASHBOARD_AUDIT.md)
- Dashboard ↔ Backend integration audit (Cursor prompt): [docs/DASHBOARD_BACKEND_INTEGRATION.md](./DASHBOARD_BACKEND_INTEGRATION.md)
- Quick‑Runner (local + CI): [scripts/quick-runner.sh](../scripts/quick-runner.sh)
- Quick‑Runner usage guide: [docs/QUICK_RUNNER_README.md](./QUICK_RUNNER_README.md)

## When to use

- **ADMIN_DASHBOARD_AUDIT.md**: Kun haluat varmistaa UI/segmenttien ja toimintojen laadun (Queue, OCR, Customers, Analytics, Billing, API Monitoring).
- **DASHBOARD_BACKEND_INTEGRATION.md**: Kun haluat varmistaa FE↔BE sopimukset (OpenAPI), realtime, mittarit ja rollout‑suunnitelman.
- **quick-runner.sh**: Nopein "GO/NO‑GO" tarkistus paikallisesti tai CI:ssä ennen mergeä.

## One‑liners

- OpenAPI export + lint: `python scripts/export_openapi.py --out docs/openapi.yaml && npm run openapi:lint --prefix frontend`
- Metrics smoke: `curl -s $BACKEND_BASE_URL/metrics | grep -E 'request_duration_ms_bucket|publish_latency_ms|doc_ingested_total|revenue_total_eur'`
- E2E (mock): `npm --prefix frontend run build && npx --yes playwright test frontend/e2e`


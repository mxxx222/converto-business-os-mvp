# Observability Rollout — DocFlow

## Vaiheet

1) Backend → /metrics

- Varmista että /metrics on auki Prometheukselle (http/https, mahdollinen Bearer).
- Savu: curl -s https://backend.example.com/metrics | grep -E "doc_ingested_total|revenue_total_eur"

2) Prometheus scrape

- Lisää deploy/examples/prometheus.yml.snippet omaan Prometheus-konfigiin.
- (Suositus) Ota recording_rules.yaml käyttöön säästääksesi query-kustannuksia.

3) Grafana dashboard

- Importoi grafana/dashboards/docflow_analytics.json
- Lisää muuttuja "tenant" → Query: label_values(doc_ingested_total, tenant)

4) Frontend Analytics live

- Aseta env: ANALYTICS_PROM_ENABLED=true, PROMETHEUS_BASE_URL.
- Savu: tee 1 ingest + 1 EUR maksu → näkyy 5–10 min sisällä.

## Smoke-checklista

- Prometheus Targets: backend /metrics vihreä
- /metrics sisältää doc_ingested_total ja revenue_total_eur ingestin/maksun jälkeen
- Grafana: Docs/Revenue paneelit piirtyvät ja tenant-valitsin toimii
- Admin Analytics: kortit ja sarjat päivittyvät (PR5d)

## Hälytysplaybook (lyhyt)

- API p95 > 200 ms 10 min → Tutki viimeisimmät deployt, tarkista error rate.
- OCR p95 > 3000 ms 10 min → Tarkista provider health, job-jonot, backpressure.
- Docs_Zero_Today 2 h → Tarkista ingest-pipeline ja lähdejärjestelmät.
- Revenue_Anomaly (poikkeama 10d keskiarvoon) → Tarkista Stripe/CRM virhekuilut.

## Vinkit

- Rajaa dashboards dataan tenantilla kun mahdollista.
- Säilytä rekisteröintiväli 15s–60s; recording rules 1m riittää useimmiten.

## Detailed Deployment Steps

### 1. Backend Configuration

Ensure the backend `/metrics` endpoint is accessible to Prometheus:

```bash
# Test metrics endpoint accessibility
curl -s https://your-backend.com/metrics | head -20

# Verify new metrics are present
curl -s https://your-backend.com/metrics | grep -E "doc_ingested_total|revenue_total_eur"
```

### 2. Prometheus Setup

Add one of the scrape configurations from `deploy/examples/prometheus.yml.snippet` to your Prometheus configuration:

```yaml
# Add to your prometheus.yml
rule_files:
  - "recording_rules.yaml"

scrape_configs:
  # Add the appropriate scrape config from the snippet
```

Reload Prometheus configuration:

```bash
# Send SIGHUP to reload config
kill -HUP $(pgrep prometheus)
# OR use API endpoint
curl -X POST http://localhost:9090/-/reload
```

### 3. Grafana Dashboard Import

1. Open Grafana UI
2. Go to Dashboards → Import
3. Upload `grafana/dashboards/docflow_analytics.json`
4. Configure datasource if prompted
5. Verify tenant variable is populated

### 4. Frontend Analytics Activation

Set environment variables:

```bash
export ANALYTICS_PROM_ENABLED=true
export PROMETHEUS_BASE_URL=https://your-prometheus.com
export PROMETHEUS_BEARER=your-bearer-token  # if required
```

Restart frontend service and verify Analytics dashboard shows live data.

### 5. Verification Workflow

1. **Process Test Document**: Upload/process one document via any ingestion method
2. **Simulate Revenue Event**: Trigger a Stripe webhook with EUR payment  
3. **Wait 5-10 minutes**: Allow Prometheus to scrape and recording rules to evaluate
4. **Check Grafana**: Verify panels show updated document and revenue counts
5. **Check Admin Analytics**: Confirm frontend displays real-time series data

## Troubleshooting

### Common Issues

**Metrics not appearing:**
- Check Prometheus targets status
- Verify backend `/metrics` endpoint accessibility
- Confirm scrape interval and job name

**Dashboard panels empty:**
- Verify tenant variable has values
- Check Prometheus query syntax
- Ensure time range covers data period

**Frontend Analytics not updating:**
- Confirm `ANALYTICS_PROM_ENABLED=true`
- Verify `PROMETHEUS_BASE_URL` is correct
- Check bearer authentication if required

### Monitoring Health

**Prometheus Targets:**
```bash
# Check target health
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | select(.labels.job=="docflow-backend")'
```

**Recording Rules:**
```bash
# Verify recording rules are evaluating
curl http://localhost:9090/api/v1/rules | jq '.data.groups[] | select(.name=="docflow-recording")'
```

**Grafana Health:**
```bash
# Test dashboard API
curl -H "Authorization: Bearer $GRAFANA_TOKEN" http://localhost:3000/api/dashboards/uid/$DASHBOARD_UID
```

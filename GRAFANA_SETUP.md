# Grafana Dashboard Setup - Business OS Go-Live

## Dashboard Import

1. **Avaa Grafana** → Dashboards → New → Import
2. **Kopioi JSON** → Liitä `grafana-dashboard-business-os.json` sisältö
3. **Valitse datasource** → Prometheus + Loki
4. **Tallenna** → "Business OS — Go‑Live"

## Dashboard Features

### 📊 Key Metrics
- **Error Rate (Canary)** - Canary deployment error rate
- **Drift % (Shadow vs Prod)** - Production vs shadow latency difference
- **Latency P95** - 95th percentile latency comparison
- **Success Rate by Capability** - Per-module success rates
- **Recent Changes** - Audit trail with diffs

### 🎛️ Template Variables
- **capability** - Filter by specific capabilities
- **phase** - Filter by prod/shadow/canary

### 🚨 Alerting Rules

#### Error Rate Alert
```yaml
- alert: HighErrorRate
  expr: sum(rate(copilot_errors_total[5m])) / sum(rate(copilot_requests_total[5m])) > 0.02
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "High error rate detected"
    description: "Error rate is {{ $value | humanizePercentage }}"
```

#### Drift Alert
```yaml
- alert: HighDrift
  expr: (avg(copilot_shadow_latency_ms[5m]) - avg(copilot_prod_latency_ms[5m])) / avg(copilot_prod_latency_ms[5m]) > 0.05
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "High drift between shadow and production"
    description: "Drift is {{ $value | humanizePercentage }}"
```

## Data Sources Required

### Prometheus Metrics
```yaml
# Business OS metrics
copilot_requests_total{capability, phase}
copilot_errors_total{capability, phase}
copilot_success_total{capability, phase}
copilot_shadow_latency_ms
copilot_prod_latency_ms
http_request_duration_seconds_bucket{flow, phase}
```

### Loki Logs
```yaml
# Structured logs
{app="copilot", stream="stdout"} | json
# Fields: trace_id, capability, resource, diff, level, action
```

## Setup Commands

### 1. Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'business-os'
    static_configs:
      - targets: ['localhost:8082', 'localhost:8083']
    metrics_path: /metrics
    scrape_interval: 5s
```

### 2. Loki Configuration
```yaml
# loki-config.yml
auth_enabled: false
server:
  http_listen_port: 3100
  grpc_listen_port: 9096

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 5m
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 168h

storage_config:
  boltdb:
    directory: /tmp/loki/index
  filesystem:
    directory: /tmp/loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h
```

### 3. Docker Compose Addition
```yaml
# Add to docker-compose.business-os.yml
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
    command: -config.file=/etc/loki/local-config.yaml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana
```

## Usage

1. **Start monitoring stack:**
   ```bash
   docker compose -f docker-compose.business-os.yml up -d prometheus loki grafana
   ```

2. **Access Grafana:**
   - URL: http://localhost:3001
   - Login: admin/admin
   - Import dashboard JSON

3. **Configure datasources:**
   - Prometheus: http://prometheus:9090
   - Loki: http://loki:3100

4. **Monitor Business OS:**
   - Real-time metrics
   - Shadow mode drift
   - Error rates
   - Audit trail

## ROI

- **Visibility**: 100% observability into Business OS operations
- **Alerting**: Proactive issue detection
- **Debugging**: Trace correlation across modules
- **Compliance**: Audit trail for all changes

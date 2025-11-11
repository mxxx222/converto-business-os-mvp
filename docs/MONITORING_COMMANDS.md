# Monitoring Commands — DocFlow Admin Dashboard

**Release:** v2.1.0  
**Date:** November 10, 2025  
**Purpose:** Ready-to-use commands for metrics validation and smoke testing

## 🚀 Quick Start Commands

### Environment Setup
```bash
# Set environment variables for easy command execution
export BACKEND_URL="https://api.docflow.fi"
export FRONTEND_URL="https://docflow.fi"
export ADMIN_TOKEN="your-admin-jwt-token-here"

# For staging
export STAGING_BACKEND="https://staging-api.docflow.fi"
export STAGING_FRONTEND="https://staging.docflow.fi"
export STAGING_ADMIN_TOKEN="your-staging-admin-token"
```

---

## 📊 Metrics Validation Commands

### Core Prometheus Metrics
```bash
# Check all admin-related metrics
curl -s $BACKEND_URL/metrics | grep -E "publish_latency_ms|doc_ingested_total|revenue_total_eur|http_request_duration_seconds"

# Publish latency metrics (target: p95 < 20ms)
curl -s $BACKEND_URL/metrics | grep 'publish_latency_ms' | grep 'quantile="0.95"'

# Document ingestion metrics
curl -s $BACKEND_URL/metrics | grep 'doc_ingested_total'

# Revenue tracking metrics  
curl -s $BACKEND_URL/metrics | grep 'revenue_total_eur'

# Request duration buckets (for alerting)
curl -s $BACKEND_URL/metrics | grep 'request_duration_ms_bucket'
```

### API Performance Metrics
```bash
# API p95 latency (target: < 200ms)
curl -s $BACKEND_URL/metrics | grep 'http_request_duration_seconds.*api.*quantile="0.95"'

# OCR p95 latency (target: < 3000ms)  
curl -s $BACKEND_URL/metrics | grep 'ocr_request_duration_seconds.*quantile="0.95"'

# Error rate metrics
curl -s $BACKEND_URL/metrics | grep 'http_requests_total.*5[0-9][0-9]'

# Active connections
curl -s $BACKEND_URL/metrics | grep 'active_connections'
```

### Detailed Metrics Analysis
```bash
# Get comprehensive metrics snapshot
curl -s $BACKEND_URL/metrics > metrics_snapshot_$(date +%Y%m%d_%H%M%S).txt

# Analyze request patterns
curl -s $BACKEND_URL/metrics | grep 'http_requests_total' | sort

# Check memory and resource usage
curl -s $BACKEND_URL/metrics | grep -E "process_resident_memory_bytes|process_cpu_seconds_total"

# WebSocket connection metrics
curl -s $BACKEND_URL/metrics | grep -E "websocket|ws_connections"
```

---

## 🧪 Smoke Testing Commands

### Basic Health Checks
```bash
# Backend health check
curl -f $BACKEND_URL/health
# Expected: {"status": "healthy"}

# Frontend health check  
curl -f $FRONTEND_URL/admin/dashboard
# Expected: HTTP 200

# Admin API health
curl -H "Authorization: Bearer $ADMIN_TOKEN" $BACKEND_URL/api/admin/activities
# Expected: HTTP 200 with activities array
```

### WebSocket Connection Test
```bash
# Test WebSocket connection (requires wscat: npm install -g wscat)
echo "Testing WebSocket connection..."
timeout 10s wscat -c "$BACKEND_URL/api/admin/feed?token=$ADMIN_TOKEN" -w 5 || echo "WebSocket test completed"

# Alternative WebSocket test with curl (HTTP upgrade)
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" "$BACKEND_URL/api/admin/feed?token=$ADMIN_TOKEN"
```

### Admin Dashboard Functional Tests
```bash
# Test admin authentication
curl -X POST $BACKEND_URL/api/admin/activities \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "admin_action", "title": "Smoke test", "tenant_id": "test"}'
# Expected: 201 Created

# Test rate limiting (should get 429 after 60 requests)
for i in {1..65}; do
  curl -s -o /dev/null -w "%{http_code} " -H "Authorization: Bearer $ADMIN_TOKEN" $BACKEND_URL/api/admin/activities
  if [ $((i % 10)) -eq 0 ]; then echo ""; fi
done
echo ""
# Expected: First 60 should be 200, then 429s

# Test unauthorized access (should get 401)
curl -s -o /dev/null -w "%{http_code}" $BACKEND_URL/api/admin/activities
# Expected: 401
```

---

## 🎭 End-to-End Testing Commands

### Playwright E2E Tests
```bash
# Run all admin E2E tests
npx --yes playwright test frontend/e2e --grep "admin" --base-url $FRONTEND_URL

# Run specific admin test suites
npx --yes playwright test frontend/e2e/admin.modules.spec.ts --base-url $FRONTEND_URL
npx --yes playwright test frontend/e2e/admin.customers.spec.ts --base-url $FRONTEND_URL  
npx --yes playwright test frontend/e2e/admin.analytics_billing.spec.ts --base-url $FRONTEND_URL

# Run tests with detailed output
npx --yes playwright test frontend/e2e --grep "admin" --base-url $FRONTEND_URL --reporter=line

# Run tests in headed mode (for debugging)
npx --yes playwright test frontend/e2e/admin.modules.spec.ts --base-url $FRONTEND_URL --headed
```

### Contract Testing
```bash
# Export and validate OpenAPI spec
python scripts/export_openapi.py --out docs/openapi.yaml

# Lint OpenAPI spec with Spectral
npm run openapi:lint --prefix frontend

# Run contract tests with Prism mock and Dredd
npx -y @stoplight/prism-cli mock docs/openapi.yaml --port 4010 & 
PRISM_PID=$!
sleep 3
npx -y dredd docs/openapi.yaml http://127.0.0.1:4010 --reporter junit --level error
kill $PRISM_PID
```

---

## 📈 Performance Testing Commands

### Load Testing with Artillery
```bash
# Install Artillery (if not already installed)
npm install -g artillery

# Basic load test - 10 users, 50 requests each
artillery quick --count 10 --num 50 $FRONTEND_URL/admin/dashboard

# Advanced load test with custom scenario
cat > load_test.yml << EOF
config:
  target: '$FRONTEND_URL'
  phases:
    - duration: 60
      arrivalRate: 5
  defaults:
    headers:
      Authorization: 'Bearer $ADMIN_TOKEN'
scenarios:
  - name: "Admin Dashboard Load Test"
    requests:
      - get:
          url: "/admin/dashboard"
      - get:
          url: "/api/admin/activities"
        headers:
          Authorization: 'Bearer $ADMIN_TOKEN'
EOF

artillery run load_test.yml
```

### Stress Testing WebSocket Connections
```bash
# Test multiple concurrent WebSocket connections
for i in {1..10}; do
  (timeout 30s wscat -c "$BACKEND_URL/api/admin/feed?token=$ADMIN_TOKEN" &) 
done
wait
echo "WebSocket stress test completed"
```

---

## 🔍 Debugging Commands

### Log Analysis
```bash
# Get recent backend logs (Fly.io)
fly logs --app docflow-backend | tail -100

# Search for errors in logs
fly logs --app docflow-backend | grep -E "ERROR|FATAL|Exception" | tail -20

# Search for admin-specific logs
fly logs --app docflow-backend | grep -i admin | tail -50

# Monitor logs in real-time
fly logs --app docflow-backend --follow
```

### Network Diagnostics
```bash
# Test DNS resolution
nslookup api.docflow.fi
nslookup docflow.fi

# Test connectivity and response times
curl -w "@curl-format.txt" -o /dev/null -s $BACKEND_URL/health

# Create curl timing format file
cat > curl-format.txt << EOF
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF

# Test SSL certificate
openssl s_client -connect api.docflow.fi:443 -servername api.docflow.fi < /dev/null
```

---

## 📊 Grafana Query Examples

### Prometheus Queries for Grafana
```promql
# API latency p95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100

# Request rate
rate(http_requests_total[5m])

# Publish latency p95
histogram_quantile(0.95, rate(publish_latency_ms_bucket[5m]))

# Document ingestion rate
rate(doc_ingested_total[5m])

# Revenue growth rate
increase(revenue_total_eur[1h])

# Active WebSocket connections
active_connections

# Memory usage
process_resident_memory_bytes / 1024 / 1024
```

---

## 🚨 Alert Testing Commands

### Test Alert Conditions
```bash
# Generate high error rate (for testing alerts)
for i in {1..100}; do
  curl -s -o /dev/null $BACKEND_URL/nonexistent-endpoint &
done
wait

# Generate high latency (simulate slow requests)
curl -X POST $BACKEND_URL/api/admin/activities \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "load_test", "title": "High latency test", "metadata": {"large_payload": "'$(head -c 5000 /dev/zero | tr '\0' 'a')'"}}'

# Test rate limiting alerts
for i in {1..70}; do
  curl -s -H "Authorization: Bearer $ADMIN_TOKEN" $BACKEND_URL/api/admin/activities > /dev/null
done
```

---

## 📋 Monitoring Checklist

### Pre-Deployment Validation
```bash
# Run this checklist before any deployment
echo "=== Pre-Deployment Monitoring Checklist ==="

# 1. Health checks
echo "1. Health Checks:"
curl -f $BACKEND_URL/health && echo "✅ Backend healthy" || echo "❌ Backend unhealthy"
curl -f $FRONTEND_URL/admin/dashboard && echo "✅ Frontend healthy" || echo "❌ Frontend unhealthy"

# 2. Metrics availability
echo "2. Metrics Availability:"
curl -s $BACKEND_URL/metrics | grep -q "publish_latency_ms" && echo "✅ Publish metrics available" || echo "❌ Publish metrics missing"
curl -s $BACKEND_URL/metrics | grep -q "doc_ingested_total" && echo "✅ Document metrics available" || echo "❌ Document metrics missing"

# 3. Authentication
echo "3. Authentication:"
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" $BACKEND_URL/api/admin/activities > /dev/null && echo "✅ Admin auth working" || echo "❌ Admin auth failing"

# 4. WebSocket connectivity
echo "4. WebSocket Connectivity:"
timeout 5s wscat -c "$BACKEND_URL/api/admin/feed?token=$ADMIN_TOKEN" && echo "✅ WebSocket working" || echo "❌ WebSocket failing"

echo "=== Checklist Complete ==="
```

### Post-Deployment Validation
```bash
# Run this checklist after deployment
echo "=== Post-Deployment Monitoring Checklist ==="

# 1. Performance metrics
echo "1. Performance Metrics:"
API_P95=$(curl -s $BACKEND_URL/metrics | grep 'http_request_duration_seconds.*quantile="0.95"' | head -1 | awk '{print $2}')
echo "API p95 latency: ${API_P95}s (target: <0.2s)"

# 2. Error rates
echo "2. Error Rates:"
ERROR_COUNT=$(curl -s $BACKEND_URL/metrics | grep 'http_requests_total.*5[0-9][0-9]' | awk '{sum+=$2} END {print sum+0}')
TOTAL_COUNT=$(curl -s $BACKEND_URL/metrics | grep 'http_requests_total' | awk '{sum+=$2} END {print sum+0}')
ERROR_RATE=$(echo "scale=2; $ERROR_COUNT * 100 / $TOTAL_COUNT" | bc -l 2>/dev/null || echo "0")
echo "Error rate: ${ERROR_RATE}% (target: <1%)"

# 3. Functional tests
echo "3. Functional Tests:"
npx --yes playwright test frontend/e2e/admin.modules.spec.ts --base-url $FRONTEND_URL --reporter=line | grep -q "passed" && echo "✅ E2E tests passing" || echo "❌ E2E tests failing"

echo "=== Validation Complete ==="
```

---

## 🔧 Troubleshooting Commands

### Common Issues and Solutions
```bash
# Issue: High memory usage
echo "Memory usage analysis:"
curl -s $BACKEND_URL/metrics | grep process_resident_memory_bytes
ps aux | grep -E "(node|python)" | head -10

# Issue: WebSocket connection failures
echo "WebSocket diagnostics:"
curl -I -H "Connection: Upgrade" -H "Upgrade: websocket" $BACKEND_URL/api/admin/feed?token=$ADMIN_TOKEN

# Issue: Slow API responses
echo "API response time analysis:"
for endpoint in "/health" "/api/admin/activities" "/metrics"; do
  echo "Testing $endpoint:"
  curl -w "Time: %{time_total}s\n" -o /dev/null -s $BACKEND_URL$endpoint
done

# Issue: Database connection problems
echo "Database connectivity (if applicable):"
# Add database-specific health checks here

# Issue: External service failures
echo "External service checks:"
curl -f https://api.resend.com/health 2>/dev/null && echo "✅ Resend API accessible" || echo "❌ Resend API issues"
curl -f https://api.stripe.com/v1/account -u $STRIPE_SECRET_KEY: 2>/dev/null && echo "✅ Stripe API accessible" || echo "❌ Stripe API issues"
```

---

**Commands Version:** 1.0  
**Last Updated:** November 10, 2025  
**Compatibility:** DocFlow Admin Dashboard v2.1.0+

# Rollback Procedures — DocFlow Admin Dashboard

**Release:** v2.1.0  
**Date:** November 10, 2025  
**Emergency Contact:** engineering@docflow.fi

## 🚨 When to Execute Rollback

### Automatic Triggers
- **5xx error rate > 5%** for 5 consecutive minutes
- **API p95 latency > 1000ms** for 10 consecutive minutes  
- **WebSocket connection failure rate > 20%**
- **Admin dashboard completely inaccessible**
- **Critical security vulnerability discovered**

### Manual Decision Points
- **5xx error rate > 1%** sustained for 30 minutes
- **API p95 latency > 500ms** sustained for 30 minutes
- **OCR p95 latency > 5000ms** sustained for 30 minutes
- **Publish p95 latency > 50ms** sustained for 30 minutes
- **Critical admin functionality unavailable**
- **Data integrity issues detected**
- **Customer-impacting issues reported**

---

## ⚡ Emergency Rollback (< 5 minutes)

### Step 1: Immediate Traffic Diversion (30 seconds)

#### Vercel Frontend Rollback
```bash
# Option A: Revert to previous deployment via CLI
vercel rollback https://docflow.fi --yes

# Option B: Promote previous deployment via dashboard
# 1. Go to https://vercel.com/dashboard/deployments
# 2. Find previous stable deployment
# 3. Click "Promote to Production"
```

#### Fly.io Backend Rollback
```bash
# Get previous release
fly releases --app docflow-backend

# Rollback to previous release (replace with actual release ID)
fly deploy --image registry.fly.io/docflow-backend:deployment-01HXXX

# Alternative: Rollback to specific release
fly releases rollback v123 --app docflow-backend
```

### Step 2: Verify Rollback (2 minutes)

#### Health Checks
```bash
# Frontend health
curl -f https://docflow.fi/admin/dashboard
# Expected: HTTP 200

# Backend health  
curl -f https://api.docflow.fi/health
# Expected: {"status": "healthy"}

# Admin API health
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
     https://api.docflow.fi/api/admin/activities
# Expected: HTTP 200 with activities list
```

#### Quick Functional Test
```bash
# Test WebSocket connection
wscat -c "wss://api.docflow.fi/api/admin/feed?token=$ADMIN_TOKEN"
# Expected: Connection successful, ready message received

# Test metrics endpoint
curl -s https://api.docflow.fi/metrics | head -20
# Expected: Prometheus metrics returned
```

### Step 3: Monitor Recovery (2 minutes)

#### Check Key Metrics
```bash
# Error rate should drop immediately
curl -s https://api.docflow.fi/metrics | grep 'http_requests_total.*5[0-9][0-9]'

# Latency should improve within 1-2 minutes
curl -s https://api.docflow.fi/metrics | grep 'http_request_duration_seconds.*quantile="0.95"'
```

#### Verify Admin Dashboard
- [ ] Admin dashboard loads without errors
- [ ] All 7 segments accessible
- [ ] WebSocket real-time updates working
- [ ] No console errors in browser

---

## 🔄 Staged Rollback (10-15 minutes)

### Phase 1: Assess Impact (2 minutes)

#### Identify Affected Components
```bash
# Check which services are impacted
curl -s https://api.docflow.fi/metrics | grep -E "up|health"

# Check error distribution
curl -s https://api.docflow.fi/metrics | grep 'http_requests_total' | grep -E "4[0-9][0-9]|5[0-9][0-9]"

# Check WebSocket connection count
curl -s https://api.docflow.fi/metrics | grep 'active_connections'
```

#### Document Current State
```bash
# Capture current metrics for analysis
curl -s https://api.docflow.fi/metrics > rollback_metrics_$(date +%Y%m%d_%H%M%S).txt

# Capture current error logs (if accessible)
fly logs --app docflow-backend | tail -100 > rollback_logs_$(date +%Y%m%d_%H%M%S).txt
```

### Phase 2: Gradual Traffic Reduction (5 minutes)

#### Reduce New Deployment Traffic
```bash
# If using canary deployment, reduce to 0%
# Vercel: Use deployment-specific URLs
# Fly.io: Scale down new machines

# Scale down problematic backend instances
fly scale count 1 --app docflow-backend

# Monitor during reduction
watch -n 5 'curl -s https://api.docflow.fi/metrics | grep -E "error_rate|latency"'
```

### Phase 3: Complete Rollback (5 minutes)

#### Execute Full Rollback
```bash
# Complete frontend rollback
vercel rollback https://docflow.fi --yes

# Complete backend rollback
fly releases rollback $(fly releases --json | jq -r '.[1].version') --app docflow-backend

# Verify rollback completion
curl -f https://docflow.fi/admin/dashboard
curl -f https://api.docflow.fi/health
```

### Phase 4: Validation (3 minutes)

#### Run Smoke Tests
```bash
# Quick E2E test
npx --yes playwright test frontend/e2e/admin.modules.spec.ts --base-url https://docflow.fi

# Test critical admin functions
curl -X POST https://api.docflow.fi/api/admin/activities \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "admin_action", "title": "Rollback validation test"}'
```

---

## 🔍 Post-Rollback Analysis

### Immediate Actions (15 minutes)

#### Capture Evidence
```bash
# Save deployment artifacts
mkdir rollback_analysis_$(date +%Y%m%d_%H%M%S)
cd rollback_analysis_$(date +%Y%m%d_%H%M%S)

# Save metrics from problem period
curl -s https://api.docflow.fi/metrics > current_metrics.txt

# Save recent logs
fly logs --app docflow-backend | tail -500 > backend_logs.txt

# Save Vercel deployment info
vercel ls > vercel_deployments.txt
```

#### Notify Stakeholders
```bash
# Send notification (customize for your notification system)
curl -X POST https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK \
  -H 'Content-type: application/json' \
  -d '{
    "text": "🚨 ROLLBACK EXECUTED - DocFlow Admin Dashboard v2.1.0",
    "attachments": [{
      "color": "danger",
      "fields": [
        {"title": "Time", "value": "'$(date)'", "short": true},
        {"title": "Reason", "value": "Performance degradation", "short": true},
        {"title": "Status", "value": "Rollback completed, investigating", "short": true}
      ]
    }]
  }'
```

### Root Cause Analysis

#### Data Collection Checklist
- [ ] **Metrics Analysis:** Compare before/during/after metrics
- [ ] **Log Analysis:** Search for error patterns and anomalies
- [ ] **Performance Analysis:** Identify latency spikes and bottlenecks
- [ ] **Resource Analysis:** Check CPU, memory, and network usage
- [ ] **External Dependencies:** Verify third-party service status

#### Investigation Commands
```bash
# Analyze error patterns
grep -E "ERROR|FATAL|Exception" backend_logs.txt | sort | uniq -c

# Check for memory/resource issues
fly logs --app docflow-backend | grep -E "memory|cpu|disk"

# Analyze request patterns
curl -s https://api.docflow.fi/metrics | grep 'http_requests_total' | sort

# Check WebSocket connection issues
grep -i "websocket\|ws\|connection" backend_logs.txt
```

---

## 🛠️ Database Rollback (If Required)

### Supabase Rollback
```bash
# If database migrations were included in the deployment
# Note: Only if migrations are reversible and data loss is acceptable

# Connect to Supabase
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Check recent migrations
SELECT * FROM schema_migrations ORDER BY version DESC LIMIT 10;

# Rollback specific migration (if safe)
# This should only be done if migrations are reversible
# and no critical data will be lost
```

### Redis Cache Invalidation
```bash
# If Redis cache needs to be cleared
redis-cli -h your-redis-host.com FLUSHDB

# Or clear specific keys
redis-cli -h your-redis-host.com --scan --pattern "admin:*" | xargs redis-cli -h your-redis-host.com DEL
```

---

## 📊 Rollback Validation Checklist

### Functional Validation
- [ ] **Admin Dashboard:** All segments load without errors
- [ ] **Authentication:** Admin login and JWT validation working
- [ ] **WebSocket:** Real-time feed connecting and updating
- [ ] **API Endpoints:** All admin API routes responding correctly
- [ ] **Export Functions:** CSV and PDF downloads working
- [ ] **Rate Limiting:** 429 responses working correctly
- [ ] **Error Handling:** Error boundaries functioning properly

### Performance Validation
- [ ] **API Latency:** p95 < 200ms
- [ ] **OCR Latency:** p95 < 3000ms  
- [ ] **Publish Latency:** p95 < 20ms
- [ ] **Error Rate:** 5xx < 1%
- [ ] **WebSocket Connections:** Stable connection count
- [ ] **Memory Usage:** Within normal ranges
- [ ] **CPU Usage:** Within normal ranges

### Security Validation
- [ ] **Authentication:** Unauthorized access properly blocked (401)
- [ ] **Authorization:** Insufficient permissions blocked (403)
- [ ] **Rate Limiting:** Excessive requests blocked (429)
- [ ] **Input Validation:** Invalid inputs rejected (400)
- [ ] **HTTPS:** All connections encrypted
- [ ] **Headers:** Security headers present

---

## 📋 Rollback Communication Template

### Internal Communication
```
Subject: [URGENT] DocFlow Admin Dashboard Rollback Executed

Team,

We have executed a rollback of the DocFlow Admin Dashboard v2.1.0 deployment due to [REASON].

Timeline:
- Issue detected: [TIME]
- Rollback initiated: [TIME]
- Rollback completed: [TIME]
- Service restored: [TIME]

Current Status:
- Frontend: Rolled back to previous stable version
- Backend: Rolled back to previous stable version
- Database: [No changes / Rolled back / Under investigation]
- All services operational: [YES/NO]

Impact:
- Duration: [X] minutes
- Affected users: [Admin users only / All users / Specific segment]
- Data loss: [None / Minimal / Under investigation]

Next Steps:
1. Root cause analysis in progress
2. Fix development underway
3. Re-deployment planned for [TIME/DATE]

Contact [NAME] for questions.
```

### Customer Communication (If Required)
```
Subject: Service Update - Admin Dashboard

We experienced a brief service interruption with our admin dashboard between [TIME] and [TIME] on [DATE]. 

The issue has been resolved and all services are now operating normally. No customer data was affected.

We apologize for any inconvenience and are taking steps to prevent similar issues in the future.

For questions, contact support@docflow.fi
```

---

## 🔄 Re-deployment Preparation

### Before Next Deployment Attempt
- [ ] **Root Cause Fixed:** Issue identified and resolved
- [ ] **Additional Testing:** Enhanced test coverage for failure scenario
- [ ] **Monitoring Enhanced:** Additional metrics/alerts added
- [ ] **Rollback Tested:** Rollback procedure validated in staging
- [ ] **Team Briefed:** All team members aware of previous issue

### Enhanced Validation
- [ ] **Load Testing:** Simulate production load in staging
- [ ] **Chaos Engineering:** Test failure scenarios
- [ ] **Performance Benchmarking:** Establish baseline metrics
- [ ] **Security Testing:** Validate all security controls
- [ ] **Monitoring Validation:** Confirm all alerts working

---

**Document Version:** 1.0  
**Last Updated:** November 10, 2025  
**Next Review:** After any rollback execution

# Production Go-Live Runbook
**Supabase Infrastructure - Production Deployment**

## Overview
Controlled production deployment with canary rollout (10% → 50% → 100%) during maintenance window. Expected duration: 45-60 minutes.

## Timeline
**Maintenance Window:** Sunday 02:00-04:00 UTC  
**Total Deployment Time:** 45-60 minutes  
**Rollback Window:** <10 minutes

## 👥 Responsibilities

| Role | Person | Responsibilities |
|------|--------|------------------|
| **Lead** | Maksim | Final decisions, rollback authority, stakeholder communication |
| **SRE** | DevOps Engineer | Execution, monitoring, traffic management |
| **Observability** | Monitoring Team | Metrics, alerts, reporting |

## Pre-Deployment Checklist (T-15 min)

- [ ] Verify latest build: `DEPLOY_ID`
- [ ] Open monitoring dashboards:
  - Supabase performance metrics
  - pgBouncer connection pools
  - Read replica lag monitoring
  - WAL bytes tracking
  - Status badges update
- [ ] Confirm backup completion
- [ ] Notify stakeholders of deployment start

## Phase 1: Database Migrations (02:00-02:20 UTC)

```bash
# Execute migrations CONCURRENTLY, no transaction blocks
# Run one table at a time, monitor progress

# 1. Users table
psql $SUPABASE_PROD_URL -c "CREATE INDEX CONCURRENTLY idx_users_email_signup ON auth.users(email);"

# 2. Stripe events
psql $SUPABASE_PROD_URL -c "CREATE INDEX CONCURRENTLY idx_stripe_events_created ON stripe_events(created_at);"

# 3. Review items
psql $SUPABASE_PROD_URL -c "CREATE INDEX CONCURRENTLY idx_reviews_user_id ON review_items(user_id);"

# 4. Netvisor queue
psql $SUPABASE_PROD_URL -c "CREATE INDEX CONCURRENTLY idx_netvisor_queue_status ON netvisor_queue(status);"

# Monitor progress
psql $SUPABASE_PROD_URL -c "SELECT * FROM pg_stat_progress_create_index;"

# Post-migration optimization (if needed)
psql $SUPABASE_PROD_URL -c "VACUUM ANALYZE;"
```

**Success Criteria:**
- All indexes created successfully
- `pg_stat_progress_create_index` shows no active operations
- Database performance remains stable

## Phase 2: Post-Migration Smoke Tests (02:20-02:30 UTC)

```bash
# Health check
curl -f https://your-app.vercel.app/api/health

# API endpoint validation
python scripts/smoke_test_api.py --env production

# Database performance validation (60s load test)
python scripts/db_performance_check.py \
  --url $SUPABASE_PROD_URL \
  --service-key $SUPABASE_PROD_SERVICE_KEY \
  --duration 60
```

**Performance Thresholds:**
- `stripe_upsert`: P95 ≤ 20ms
- `netvisor_pick`: P95 ≤ 40ms  
- `review_list`: P95 ≤ 30ms
- `signup_exists`: P95 ≤ 10ms

## Phase 3: Canary → Production Rollout (02:30-03:30 UTC)

### 3.1 Get Current Deployment ID
```bash
# Get latest production deployment
DEPLOY_ID=$(vercel ls --prod --limit 1 | awk 'NR==2{print $1}')
echo "Deploying: $DEPLOY_ID"
```

### 3.2 Traffic Shifting (10% → 50% → 100%)

**Stage 1: 10% Traffic (02:30-03:00 UTC)**
```bash
# Route 10% traffic to new deployment
vercel traffic $ALIAS $DEPLOY_ID@10

# Monitor for 30 minutes
echo "🔍 Monitoring 10% traffic..."

# Watch for errors
watch -n 30 'curl -s https://your-app.vercel.app/api/health | jq .'

# Check performance metrics
python scripts/validate_production_quick.py \
  --env production \
  --duration 30 \
  --p95_threshold 400 \
  --error_rate_threshold 1.0
```

**Success Criteria for 10%:**
- Health check: 200 OK
- P95 response time: <400ms
- Error rate: <1%
- No database timeouts

**Stage 2: 50% Traffic (03:00-03:15 UTC)**
```bash
# Increase to 50% traffic
vercel traffic $ALIAS $DEPLOY_ID@50

# Monitor for 15 minutes
echo "🔍 Monitoring 50% traffic..."

# Performance validation
python scripts/validate_production_quick.py \
  --env production \
  --duration 15 \
  --p95_threshold 400 \
  --error_rate_threshold 1.5
```

**Success Criteria for 50%:**
- All 10% criteria met
- P95 response time: <400ms
- Error rate: <1.5%
- No performance degradation

**Stage 3: 100% Traffic (03:15-03:30 UTC)**
```bash
# Route 100% traffic to new deployment
vercel traffic $ALIAS $DEPLOY_ID@100

# Monitor for 15 minutes
echo "🔍 Monitoring 100% traffic..."

# Final validation
python scripts/validate_production_quick.py \
  --env production \
  --duration 15 \
  --p95_threshold 400 \
  --error_rate_threshold 1.0
```

### 3.3 Performance Validation
```bash
# Run comprehensive performance test
python mcp_supabase_infrastructure/staging_validation_suite.py \
  --url $SUPABASE_PROD_URL \
  --anon-key $SUPABASE_PROD_ANON_KEY \
  --replica-url $SUPABASE_PROD_REPLICA_URL \
  --env production \
  --json-only > prod_performance_validation.json

# Check results
if jq -e '.validation_metadata.overall_passed' prod_performance_validation.json; then
  echo "✅ Production performance validation PASSED"
else
  echo "❌ Production performance validation FAILED"
  echo "Rollback required!"
  exit 1
fi
```

## Phase 4: Production Lock-in (03:30-03:45 UTC)

```bash
# Run database performance guard
python scripts/db_performance_guard.py --env production

# Update status badges
python scripts/update_status_badges.py \
  --p95_threshold 400 \
  --uptime_target 99.9 \
  --error_rate_target 1.0

# Save deployment artifacts
cp prod_performance_validation.json artifacts/prod_validation_$(date +%Y%m%d_%H%M%S).json

# Generate deployment report
python scripts/generate_deployment_report.py \
  --deployment_id $DEPLOY_ID \
  --duration_minutes 45 \
  --status success
```

## Phase 5: Rollback Procedure (If Needed)

```bash
# Get previous deployment
PREV_DEPLOY_ID=$(vercel ls --prod --limit 2 | awk 'NR==3{print $1}')
echo "Rolling back to: $PREV_DEPLOY_ID"

# Immediate rollback
vercel traffic $ALIAS $PREV_DEPLOY_ID@100

# Quick validation
curl -f https://your-app.vercel.app/api/health
python scripts/smoke_test_api.py --env production

# Post-rollback analysis
echo "🚨 ROLLBACK COMPLETED"
echo "Investigate root cause and schedule retry"
```

## Monitoring & Alerts

### Real-time Monitoring
```bash
# Watch critical metrics
watch -n 30 '
  echo "=== PRODUCTION DEPLOYMENT MONITORING ==="
  echo "Time: $(date)"
  echo "Current traffic: $(vercel ls --prod | head -1)"
  echo "Health check: $(curl -s https://your-app.vercel.app/api/health | jq .status)"
  echo "Database lag: $(psql $SUPABASE_PROD_URL -tAc "select extract(epoch from now()-pg_last_xact_replay_timestamp());" 2>/dev/null || echo "N/A")"
'
```

### Critical Thresholds
- **P95 Response Time:** <400ms
- **Error Rate:** <1%
- **Database Connection Pool:** <80% utilization
- **Read Replica Lag:** <8 seconds
- **WAL Lag:** <100MB

## Communication Plan

### Deployment Start
```bash
# Slack notification
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-type: application/json' \
  --data '{
    "text": "🚀 Starting Supabase Production Deployment",
    "attachments": [{
      "color": "warning",
      "fields": [{
        "title": "Environment", "value": "Production", "short": true
      },{
        "title": "Deployment ID", "value": "'$DEPLOY_ID'", "short": true
      },{
        "title": "Maintenance Window", "value": "02:00-04:00 UTC", "short": true
      }]
    }]
  }'
```

### Deployment Complete
```bash
# Success notification
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-type: application/json' \
  --data '{
    "text": "✅ Supabase Production Deployment SUCCESS",
    "attachments": [{
      "color": "good",
      "fields": [{
        "title": "Status", "value": "LIVE", "short": true
      },{
        "title": "Duration", "value": "45 minutes", "short": true
      },{
        "title": "Performance", "value": "All criteria met", "short": true
      }]
    }]
  }'
```

### Rollback Alert
```bash
# Rollback notification
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-type: application/json' \
  --data '{
    "text": "🚨 Supabase Production Rollback Triggered",
    "attachments": [{
      "color": "danger",
      "fields": [{
        "title": "Action", "value": "Rollback to previous deployment", "short": true
      },{
        "title": "Reason", "value": "Performance criteria not met", "short": true
      }]
    }]
  }'
```

## Post-Deployment (Next 7 Days)

### Week 1 Monitoring
- **Daily:** Performance metrics review
- **Hourly:** Automated health checks
- **Immediate:** Alert on threshold breaches

### Weekly Report
```bash
# Generate weekly performance report
python scripts/generate_weekly_report.py \
  --start_date $(date -d "7 days ago" +%Y-%m-%d) \
  --end_date $(date +%Y-%m-%d) \
  --output weekly_performance_report_$(date +%Y%W).json
```

## Emergency Contacts

| Role | Contact | Responsibility |
|------|---------|----------------|
| **Lead Developer** | Maksim | Technical decisions, rollback authority |
| **SRE Team** | DevOps Lead | Execution, monitoring |
| **Database Admin** | DBA Team | Database issues, performance |
| **On-call Manager** | Engineering Manager | Stakeholder communication |

## Success Criteria

✅ **Deployment successful if:**
- All migration steps completed without errors
- Performance validation passed in all stages
- 0 critical alerts during deployment
- All post-deployment tests passed
- Stakeholders notified of success

❌ **Rollback required if:**
- Performance criteria not met
- Critical errors in logs
- Database performance degradation
- User-facing functionality broken

---

**Deployment Status:** 🔄 Ready for Execution  
**Last Updated:** 2025-11-10  
**Next Review:** 2025-11-17
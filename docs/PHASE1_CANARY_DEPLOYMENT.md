# Phase 1 Canary Deployment Plan

## 🎯 Deployment Strategy: 10% → 100%

### Pre-Deployment Checklist ✅
- [x] Phase 1 implementation complete
- [x] PR description prepared with technical details
- [x] Mock data and fixtures validated
- [x] Release notes updated with Phase 1 features
- [x] Integration tests documented

## 🚀 Deployment Phases

### Phase 1: Staging Validation
**Duration:** 30 minutes  
**Traffic:** Internal testing only

**Validation Steps:**
1. **Metrics Verification**
   ```bash
   curl -s $BACKEND/metrics | grep -E "publish_latency_ms|doc_ingested_total|revenue_total_eur"
   ```
   Expected: All Phase 1 metrics present and collecting data

2. **UI Functionality Test**
   - Queue Manager: AI filter dropdown works
   - Analytics: Forecast toggle shows prediction bars
   - Export: Schedule button triggers successfully

3. **API Endpoint Validation**
   ```bash
   # Test AI-filtered queue
   curl -H "Authorization: Bearer $ADMIN_TOKEN" \
        "$API_BASE/api/admin/queue?aiType=invoice"
   
   # Test export scheduling
   curl -H "Authorization: Bearer $ADMIN_TOKEN" \
        "$API_BASE/api/admin/analytics/export/schedule"
   ```

### Phase 2: Canary 10%
**Duration:** 30 minutes  
**Traffic:** 10% of production users  
**Monitoring:** Real-time dashboards + alerts

**Success Criteria:**
- API p95 latency < 200ms ✅
- Publish p95 latency < 20ms ✅  
- 5xx error rate < 1% ✅
- No JavaScript errors in Phase 1 components ✅

**Monitoring Commands:**
```bash
# API Performance
curl -s $GRAFANA_API/query?query=histogram_quantile(0.95,api_request_duration_seconds)

# Error Rate  
curl -s $GRAFANA_API/query?query=rate(http_requests_total{status=~"5.."}[5m])

# Phase 1 Specific Metrics
curl -s $GRAFANA_API/query?query=ai_classification_requests_total
curl -s $GRAFANA_API/query?query=forecast_calculations_total
curl -s $GRAFANA_API/query?query=export_schedules_total
```

**Rollback Triggers:**
- Any 5xx errors in Phase 1 endpoints
- UI crashes in Queue/Analytics components
- Performance degradation > 20% baseline

### Phase 3: Full Rollout 100%
**Duration:** Immediate after 30min green canary  
**Traffic:** All production users

**Post-Rollout Actions:**
1. **Audit Event Logging**
   ```json
   {
     "type": "phase1_rollout_complete",
     "timestamp": "2025-11-10T15:30:00Z",
     "details": {
       "canary_duration_minutes": 30,
       "success_metrics": {
         "api_p95_ms": 145,
         "publish_p95_ms": 12,
         "error_rate_percent": 0.02
       },
       "features_deployed": [
         "queue_ai_enrichment",
         "analytics_forecasting", 
         "export_scheduling"
       ]
     }
   }
   ```

2. **Metrics Baseline Update**
   - Document new baseline performance with Phase 1 features
   - Update Grafana dashboards with Phase 1 panels
   - Set up alerting for AI-specific metrics

3. **User Communication**
   - Internal announcement of Phase 1 availability
   - Documentation links shared with admin users
   - Feedback collection process initiated

## 📊 Monitoring Dashboard

### Key Metrics to Watch
```
Phase 1 Feature Adoption:
├── AI Filter Usage Rate
├── Forecast Toggle Engagement  
├── Export Schedule Frequency
└── User Satisfaction Score

Performance Impact:
├── Queue Load Time (with AI data)
├── Analytics Render Time (with forecast)
├── Export API Response Time
└── WebSocket Message Throughput

Error Tracking:
├── AI Classification Failures
├── Forecast Calculation Errors
├── Export Scheduling Failures
└── UI Component Crashes
```

### Alert Thresholds
- **Critical:** Any 5xx in Phase 1 endpoints
- **Warning:** AI confidence < 0.5 for >10% of documents
- **Info:** Forecast accuracy deviation > 20%

## 🔄 Rollback Procedures

### Immediate Rollback (< 5 minutes)
```bash
# Vercel: Revert to previous deployment
vercel --prod --force --token=$VERCEL_TOKEN rollback

# Fly.io: Deploy previous image
fly deploy --image registry.fly.io/docflow:v2.0.9

# Feature Flags: Disable Phase 1
curl -X PATCH $VERCEL_EDGE_CONFIG_API \
     -d '{"phase1_enabled": false}'
```

### Partial Rollback (Feature-specific)
```bash
# Disable only problematic features
export NEXT_PUBLIC_ENABLE_AI_QUEUE=false
export NEXT_PUBLIC_ENABLE_FORECAST=false  
export NEXT_PUBLIC_ENABLE_EXPORT_SCHEDULE=false

# Redeploy with flags
vercel --prod --env-file .env.rollback
```

## 📈 Success Metrics

### Technical KPIs
- **Deployment Success:** 100% green canary → full rollout
- **Performance:** No degradation beyond 5% baseline
- **Stability:** Zero critical errors in 24h post-deployment
- **Adoption:** >50% admin users try Phase 1 features within 48h

### Business Impact
- **Efficiency:** 15% reduction in manual document classification
- **Accuracy:** AI confidence >85% for 80% of documents  
- **Automation:** 30% of exports scheduled vs manual
- **User Satisfaction:** >4.0/5.0 rating for new features

## 🎉 Post-Deployment Actions

### 24-Hour Review
1. **Performance Report**
   - Latency percentiles comparison
   - Error rate analysis
   - Resource utilization impact

2. **Feature Usage Analytics**
   - AI filter adoption rate
   - Forecast toggle engagement
   - Export scheduling frequency

3. **User Feedback Collection**
   - Admin user survey deployment
   - Support ticket analysis
   - Feature request prioritization

### Documentation Updates
- Update production deployment guide
- Create Phase 1 user training materials
- Document lessons learned and optimizations

---

**Deployment Lead:** Development Team  
**Monitoring Lead:** SRE Team  
**Rollback Authority:** Technical Lead  
**Go-Live Decision:** Product Owner + Technical Lead

**Ready for canary deployment! 🚀**

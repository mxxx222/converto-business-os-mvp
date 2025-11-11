# Production Cutover Checklist — DocFlow Admin Dashboard

**Release:** v2.1.0  
**Date:** November 10, 2025  
**Strategy:** Canary Deployment (10% → 100%)  
**Estimated Duration:** 2-3 hours

## 📋 Pre-Cutover Validation (Staging)

### ✅ CI Pipeline Validation
- [ ] **TypeScript Check:** `npm --prefix frontend run typecheck`
  - Expected: No compilation errors
  - Timeout: 2 minutes
- [ ] **Build Validation:** `npm --prefix frontend run build`
  - Expected: Successful build with no errors
  - Timeout: 5 minutes
- [ ] **OpenAPI Contract:** `python scripts/export_openapi.py --out docs/openapi.yaml && npm run openapi:lint --prefix frontend`
  - Expected: Valid OpenAPI spec, no Spectral errors
  - Timeout: 1 minute
- [ ] **Contract Testing:** 
  ```bash
  npx -y @stoplight/prism-cli mock docs/openapi.yaml & PRISM=$! && \
  npx -y dredd docs/openapi.yaml http://127.0.0.1:4010 --level error; \
  kill $PRISM
  ```
  - Expected: All Dredd tests pass
  - Timeout: 3 minutes
- [ ] **E2E Tests:** `npx --yes playwright test frontend/e2e`
  - Expected: All admin dashboard tests pass
  - Timeout: 10 minutes

### ✅ Staging Environment Validation
- [ ] **Backend Health:** `curl -f https://staging-backend.docflow.fi/health`
  - Expected: `{"status": "healthy"}`
- [ ] **Frontend Health:** `curl -f https://staging.docflow.fi/admin/dashboard`
  - Expected: HTTP 200, admin dashboard loads
- [ ] **WebSocket Connection:** Test admin feed connection
  ```bash
  wscat -c "wss://staging-backend.docflow.fi/api/admin/feed?token=$STAGING_ADMIN_TOKEN"
  ```
  - Expected: Connection established, ready message received
- [ ] **Metrics Collection:** `curl -s https://staging-backend.docflow.fi/metrics | grep -E "publish_latency_ms|doc_ingested_total|revenue_total_eur"`
  - Expected: Metrics present and updating

### ✅ Configuration Validation
- [ ] **Environment Variables:** All required vars set in production
  ```bash
  # Verify these are set in Vercel and Fly.io
  ADMIN_JWT_SECRET=***
  NEXT_PUBLIC_API_URL=https://api.docflow.fi
  NEXT_PUBLIC_WS_URL=wss://api.docflow.fi
  ANALYTICS_PROM_ENABLED=true
  ```
- [ ] **Secrets Rotation:** Confirm all secrets are production-ready
  - [ ] `ADMIN_JWT_SECRET` - Strong, unique secret
  - [ ] `STRIPE_WEBHOOK_SECRET` - Production Stripe secret
  - [ ] `RESEND_API_KEY` - Production Resend key
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` - Production Supabase key
- [ ] **Feature Flags:** Verify production feature flag configuration
  ```bash
  NEXT_PUBLIC_ENABLE_ANALYTICS=true
  NEXT_PUBLIC_ENABLE_BILLING=true
  NEXT_PUBLIC_ENABLE_API_MON=true
  NO_EXTERNAL_SEND=false  # Must be false in production
  ```

---

## 🚀 Cutover Step 1 — Release to Production

### Deploy Backend (Fly.io)
- [ ] **Deploy Backend:**
  ```bash
  cd backend
  fly deploy --region arn  # EU region
  ```
  - Expected: Deployment successful, health checks pass
  - Timeout: 5 minutes
- [ ] **Verify Backend Health:**
  ```bash
  curl -f https://api.docflow.fi/health
  curl -f https://api.docflow.fi/metrics
  ```
  - Expected: Both endpoints return 200

### Deploy Frontend (Vercel)
- [ ] **Merge PR to Main:**
  ```bash
  git checkout main
  git pull origin main
  # Verify commit contains all changes
  ```
- [ ] **Automatic Vercel Deploy:** Monitor deployment in Vercel dashboard
  - Expected: Build successful, deployment live
  - Timeout: 8 minutes
- [ ] **Manual Deploy (if needed):**
  ```bash
  vercel --prod
  ```

### Initial Validation
- [ ] **Production Health Check:**
  ```bash
  curl -f https://docflow.fi/admin/dashboard
  curl -f https://api.docflow.fi/health
  ```
- [ ] **Admin Authentication Test:**
  ```bash
  # Test admin login flow
  curl -X POST https://api.docflow.fi/api/admin/activities \
    -H "Authorization: Bearer $PROD_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"type": "admin_action", "title": "Deployment test"}'
  ```
  - Expected: 201 Created or 200 OK

---

## 📊 Cutover Step 2 — Canary 10%

### Traffic Routing (10%)
- [ ] **Configure Traffic Split:**
  - **Vercel:** Use deployment URL for 10% traffic
  - **Fly.io:** Use machine scaling for gradual rollout
- [ ] **Monitor Initial Traffic:**
  - Start time: ___________
  - Initial error rate: ____%
  - Initial latency: ____ms

### 30-Minute Monitoring Window
Monitor these metrics for **30 continuous minutes**:

#### ✅ API Performance Metrics
- [ ] **API p95 Latency < 200ms**
  ```bash
  curl -s https://api.docflow.fi/metrics | grep 'http_request_duration_seconds' | grep 'quantile="0.95"'
  ```
  - Current: ____ms (Target: <200ms)
  - Status: ⚪ Monitoring / 🟢 Pass / 🔴 Fail

#### ✅ OCR Performance Metrics  
- [ ] **OCR p95 Latency < 3000ms**
  ```bash
  curl -s https://api.docflow.fi/metrics | grep 'ocr_request_duration_seconds' | grep 'quantile="0.95"'
  ```
  - Current: ____ms (Target: <3000ms)
  - Status: ⚪ Monitoring / 🟢 Pass / 🔴 Fail

#### ✅ Publish Performance Metrics
- [ ] **Publish p95 Latency < 20ms**
  ```bash
  curl -s https://api.docflow.fi/metrics | grep 'publish_latency_ms' | grep 'quantile="0.95"'
  ```
  - Current: ____ms (Target: <20ms)
  - Status: ⚪ Monitoring / 🟢 Pass / 🔴 Fail

#### ✅ Error Rate Monitoring
- [ ] **5xx Error Rate < 1%**
  ```bash
  curl -s https://api.docflow.fi/metrics | grep 'http_requests_total.*5[0-9][0-9]'
  ```
  - Current: ___% (Target: <1%)
  - Status: ⚪ Monitoring / 🟢 Pass / 🔴 Fail

### Functional Validation (10% Traffic)
- [ ] **Admin Dashboard Load Test:**
  ```bash
  npx --yes playwright test frontend/e2e --grep "admin" --base-url https://docflow.fi
  ```
  - Expected: All tests pass
- [ ] **WebSocket Connectivity:**
  ```bash
  wscat -c "wss://api.docflow.fi/api/admin/feed?token=$PROD_ADMIN_TOKEN"
  ```
  - Expected: Connection successful, real-time updates working
- [ ] **Export Functions:**
  - Test CSV export from Analytics segment
  - Test PDF export from Analytics segment
  - Expected: Files download successfully

### Canary Decision Point
**After 30 minutes of monitoring:**
- [ ] All metrics within thresholds ✅ → Proceed to 100%
- [ ] Any metric failing ❌ → Execute rollback

---

## 🎯 Cutover Step 3 — Scale to 100%

### Traffic Scaling
- [ ] **Route 100% Traffic:**
  - **Vercel:** Promote deployment to production domain
  - **Fly.io:** Scale to full capacity
- [ ] **Monitor Traffic Shift:**
  - Scale start time: ___________
  - Traffic transition duration: ______ minutes

### Full Load Monitoring (60 minutes)
Monitor for **60 continuous minutes** at full load:

#### Performance Validation
- [ ] **API Latency Stable:** p95 < 200ms for 60 minutes
- [ ] **OCR Latency Stable:** p95 < 3000ms for 60 minutes  
- [ ] **Publish Latency Stable:** p95 < 20ms for 60 minutes
- [ ] **Error Rate Stable:** 5xx < 1% for 60 minutes

#### Grafana Dashboard Validation (5-10 minute delay expected)
- [ ] **Request Rate:** Trending upward appropriately
- [ ] **Response Times:** Within acceptable ranges
- [ ] **Error Rates:** Minimal and stable
- [ ] **WebSocket Connections:** Stable connection count

### Production Functional Tests
- [ ] **Full E2E Suite:**
  ```bash
  npx --yes playwright test frontend/e2e --base-url https://docflow.fi
  ```
- [ ] **Admin Workflow Test:**
  - Login to admin dashboard
  - Navigate through all 7 segments
  - Test queue operations (requeue/retry)
  - Test customer contact functionality
  - Export CSV and PDF files
  - Verify real-time updates

### Load Testing (Optional)
- [ ] **Concurrent User Test:**
  ```bash
  # Simulate 10 concurrent admin users
  npx artillery quick --count 10 --num 50 https://docflow.fi/admin/dashboard
  ```
  - Expected: Response times stable, no errors

---

## ✅ Post-Cutover Validation

### Release Finalization
- [ ] **Tag Release:**
  ```bash
  git tag v2.1.0
  git push origin v2.1.0
  ```
- [ ] **Update Release Notes:** Mark deployment as completed
- [ ] **Notify Stakeholders:** Send deployment success notification

### Monitoring Setup
- [ ] **Configure Alerts:** Ensure production alerting is active
  - API latency alerts (p95 > 500ms)
  - Error rate alerts (5xx > 2%)
  - WebSocket connection alerts
- [ ] **Baseline Metrics:** Record new performance baselines
  - API p95: ____ms
  - OCR p95: ____ms
  - Publish p95: ____ms
  - Error rate: ____%

### 24-Hour Monitoring Plan
- [ ] **Schedule Follow-up:** Set reminder for 24-hour health check
- [ ] **Performance Report:** Plan performance summary report
- [ ] **Issue Tracking:** Monitor for any delayed issues

---

## 🚨 Rollback Triggers & Procedures

### Automatic Rollback Triggers
- **5xx error rate > 5%** for 5 consecutive minutes
- **API p95 latency > 1000ms** for 10 consecutive minutes
- **WebSocket connection failure rate > 20%**
- **Admin dashboard completely inaccessible**

### Manual Rollback Decision Points
- **5xx error rate > 1%** sustained for 30 minutes
- **API p95 latency > 500ms** sustained for 30 minutes
- **Critical admin functionality unavailable**
- **Customer-impacting issues reported**

### Rollback Execution
See [ROLLBACK_PROCEDURES.md](./ROLLBACK_PROCEDURES.md) for detailed rollback steps.

---

## 📞 Emergency Contacts

### Escalation Path
1. **Technical Lead:** [Contact Info]
2. **DevOps Team:** [Contact Info]  
3. **Product Owner:** [Contact Info]
4. **Engineering Manager:** [Contact Info]

### Communication Channels
- **Slack:** #deployments, #incidents
- **Email:** engineering@docflow.fi
- **Phone:** Emergency on-call rotation

---

## 📝 Deployment Log

### Timeline
- **Pre-cutover Start:** ___________
- **Cutover Step 1 Complete:** ___________
- **Canary 10% Start:** ___________
- **Canary 10% Complete:** ___________
- **Scale to 100% Start:** ___________
- **Scale to 100% Complete:** ___________
- **Post-cutover Complete:** ___________

### Issues Encountered
- Issue 1: ________________________________
- Resolution: ____________________________
- Issue 2: ________________________________
- Resolution: ____________________________

### Final Status
- [ ] **Deployment Successful** ✅
- [ ] **Rollback Executed** ❌ (Reason: _____________)

---

**Checklist Completed By:** ________________  
**Date:** November 10, 2025  
**Signature:** ________________

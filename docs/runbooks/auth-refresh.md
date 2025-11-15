# Auth Refresh Runbook

**Purpose:** Operational procedures for managing authentication and token refresh issues in DocFlow.

**Audience:** DevOps, Support Engineers, On-Call

---

## 🚨 Common Incidents

### 1. High Token Refresh Failure Rate

**Alert:** `auth_refresh_failure_rate > 5%`

**Impact:** Users unable to stay authenticated, frequent logouts

**Diagnosis:**

```bash
# Check Supabase status
curl https://status.supabase.com/api/v2/status.json

# Check backend logs for refresh errors
kubectl logs -l app=backend --tail=100 | grep "refresh failed"

# Check frontend error tracking (Sentry)
# Look for: "Session refresh failed"
```

**Resolution:**

1. **If Supabase is down:**
   - Wait for Supabase recovery
   - Communicate to users via status page
   - Consider increasing access token lifetime temporarily

2. **If backend issue:**
   ```bash
   # Check database connectivity
   kubectl exec -it backend-pod -- psql $DATABASE_URL -c "SELECT 1"
   
   # Restart backend pods
   kubectl rollout restart deployment/backend
   ```

3. **If network issue:**
   - Check firewall rules
   - Check DNS resolution
   - Check SSL certificate validity

**Prevention:**
- Monitor Supabase status proactively
- Set up redundant database connections
- Implement circuit breaker for refresh endpoint

---

### 2. Token Refresh Storm (Multi-Tab Issue)

**Alert:** `auth_refresh_requests_per_user > 10/min`

**Impact:** Increased backend load, potential rate limiting

**Diagnosis:**

```bash
# Check refresh request rate per user
# In application logs:
grep "Session refresh" logs.txt | awk '{print $3}' | sort | uniq -c | sort -rn

# Check BroadcastChannel errors in browser console
# Should see: "[Auth] Another tab started refresh"
```

**Resolution:**

1. **If BroadcastChannel not working:**
   - Check browser compatibility
   - Check for JavaScript errors in console
   - Verify BroadcastChannel initialization

2. **If timing issue:**
   ```typescript
   // Adjust refresh timing in session.ts
   const refreshIn = expiresIn - 180000  // 3 min instead of 2 min
   ```

3. **If rate limiting triggered:**
   ```bash
   # Temporarily increase rate limit
   kubectl set env deployment/backend RATE_LIMIT_REFRESH=100
   ```

**Prevention:**
- Monitor refresh request patterns
- Add client-side debouncing
- Implement server-side deduplication

---

### 3. Cross-Tenant Data Leakage

**Alert:** `rls_violation_detected`

**Impact:** 🔴 **CRITICAL** - Data breach, GDPR violation

**Diagnosis:**

```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('receipts', 'documents', 'p2e_wallet');

-- Check tenant context is set
SELECT current_setting('app.current_tenant_id', true);

-- Check for cross-tenant queries in logs
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%tenant_id%' 
ORDER BY calls DESC LIMIT 10;
```

**Resolution:**

1. **IMMEDIATE:**
   ```sql
   -- Verify RLS is enabled
   ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
   -- ... all tenant tables
   ```

2. **Investigate:**
   - Check application logs for tenant context errors
   - Review recent code changes
   - Check admin override usage

3. **Notify:**
   - Inform security team
   - Prepare incident report
   - Consider GDPR breach notification (if confirmed)

**Prevention:**
- Automated RLS verification in CI/CD
- Regular security audits
- Tenant boundary E2E tests

---

### 4. CSP Violations Breaking Functionality

**Alert:** `csp_violation_rate > 100/hour`

**Impact:** Features not working (images, scripts blocked)

**Diagnosis:**

```bash
# Check CSP violation reports
curl https://docflow.fi/api/csp-report | jq '.[] | select(.timestamp > "2025-01-15")'

# Common violations:
# - blocked-uri: "https://new-cdn.example.com"
# - violated-directive: "script-src"
```

**Resolution:**

1. **If legitimate resource blocked:**
   ```typescript
   // Add to CSP whitelist in middleware.ts
   "script-src 'self' https://new-cdn.example.com",
   ```

2. **If third-party service added:**
   - Review security of third-party
   - Add to CSP whitelist
   - Test in staging first

3. **If emergency (critical feature broken):**
   ```typescript
   // Temporarily switch to report-only
   const cspHeader = 'Content-Security-Policy-Report-Only'
   
   // Fix CSP policy
   // Re-enable enforcement
   ```

**Prevention:**
- Require CSP review for new dependencies
- Monitor CSP reports daily
- Automated CSP testing in CI/CD

---

## 🔧 Operational Procedures

### Rotate Supabase JWT Secret

**When:** Suspected key compromise, regular rotation (quarterly)

**Steps:**

1. **Generate new secret in Supabase Dashboard:**
   - Authentication → Settings → JWT Secret
   - Click "Generate New Secret"

2. **Update backend environment:**
   ```bash
   kubectl set env deployment/backend \
     SUPABASE_JWT_ISS=https://xxx.supabase.co/auth/v1
   ```

3. **Invalidate all sessions:**
   ```sql
   -- In Supabase SQL Editor
   DELETE FROM auth.refresh_tokens;
   ```

4. **Notify users:**
   - Send email: "Please log in again for security"
   - Show banner in app

5. **Monitor:**
   - Check login success rate
   - Check support tickets

**Rollback:**
- Keep old secret for 24 hours
- Revert environment variable if issues

---

### Increase Token Lifetime (Emergency)

**When:** Supabase instability, high refresh failure rate

**Steps:**

1. **Supabase Dashboard:**
   - Authentication → Settings
   - Access Token Lifetime: 3600 (1 hour)
   - Refresh Token Lifetime: 2592000 (30 days)

2. **Communicate:**
   - Inform security team
   - Document reason in incident log

3. **Monitor:**
   - Check if refresh failures decrease
   - Check for security implications

4. **Revert:**
   - After stability restored
   - Access Token Lifetime: 900 (15 min)
   - Refresh Token Lifetime: 1209600 (14 days)

---

### Disable RLS (EMERGENCY ONLY)

**When:** RLS causing critical outage, all users affected

**⚠️ WARNING:** This bypasses tenant isolation. Only use in extreme emergency.

**Steps:**

1. **Disable RLS:**
   ```sql
   ALTER TABLE receipts DISABLE ROW LEVEL SECURITY;
   ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
   ALTER TABLE ocr_results DISABLE ROW LEVEL SECURITY;
   ALTER TABLE p2e_wallet DISABLE ROW LEVEL SECURITY;
   ALTER TABLE p2e_token_ledger DISABLE ROW LEVEL SECURITY;
   ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
   ```

2. **Enable application-level checks:**
   ```python
   # Ensure tenant_id filtering in all queries
   # This is your ONLY defense now!
   ```

3. **Notify:**
   - Inform security team IMMEDIATELY
   - Create incident report
   - Assign engineer to fix RLS

4. **Re-enable ASAP:**
   ```sql
   ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
   -- ... all tables
   ```

5. **Verify:**
   - Run tenant isolation E2E tests
   - Manual verification of tenant boundaries

---

## 📊 Monitoring Queries

### Check Token Refresh Health

```sql
-- Supabase Dashboard → SQL Editor
SELECT 
  DATE_TRUNC('hour', created_at) AS hour,
  COUNT(*) AS refresh_count,
  COUNT(DISTINCT user_id) AS unique_users
FROM auth.refresh_tokens
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

### Check RLS Policy Usage

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename IN ('receipts', 'documents', 'p2e_wallet')
ORDER BY tablename, policyname;
```

### Check Tenant Context Errors

```bash
# Backend logs
kubectl logs -l app=backend --tail=1000 | grep "tenant_id" | grep -i "error"
```

---

## 📞 Escalation

### Severity Levels

**P0 - Critical (Page immediately)**
- Cross-tenant data leakage
- Complete auth system down
- Mass user lockout

**P1 - High (Page during business hours)**
- High refresh failure rate (>10%)
- RLS policy violations
- CSP blocking critical features

**P2 - Medium (Ticket)**
- Moderate refresh failures (5-10%)
- CSP violations (non-critical)
- Multi-tab sync issues

**P3 - Low (Backlog)**
- Individual user auth issues
- Minor CSP violations
- Documentation updates

### Contact Information

- **On-Call Engineer:** PagerDuty
- **Security Team:** security@docflow.fi
- **Supabase Support:** https://supabase.com/support

---

## 📝 Post-Incident

### Required Documentation

1. **Incident Timeline:**
   - When detected
   - Actions taken
   - When resolved

2. **Root Cause Analysis:**
   - What happened
   - Why it happened
   - How to prevent

3. **Action Items:**
   - Immediate fixes
   - Long-term improvements
   - Monitoring enhancements

4. **Communication:**
   - Internal stakeholders
   - External (if user-facing)
   - GDPR notification (if data breach)

---

**Last Updated:** 2025-01-15  
**Version:** 1.0  
**Owner:** DocFlow DevOps Team


# 🚀 Auth MVP Deployment Checklist

**Purpose:** Step-by-step checklist for deploying Auth MVP to staging and production.

**Estimated Time:** 2-3 hours (staging + production)

---

## 📋 Pre-Deployment

### Code Review

- [ ] All code reviewed and approved
- [ ] No hardcoded secrets or API keys
- [ ] TypeScript strict mode passes
- [ ] Python mypy type checking passes
- [ ] ESLint/Prettier formatting applied
- [ ] No console.log in production code (use proper logging)

### Testing

- [ ] Unit tests pass (backend)
- [ ] E2E tests pass (Playwright)
  ```bash
  cd frontend
  npx playwright test tests/e2e/auth-*.spec.ts
  ```
- [ ] Manual testing completed (see checklist below)
- [ ] Load testing (token refresh under load)
- [ ] Security review completed

### Documentation

- [ ] README_AUTH_MVP.md updated
- [ ] AUTH_IMPLEMENTATION.md reviewed
- [ ] Runbooks created (auth-refresh.md)
- [ ] Environment variables documented
- [ ] Migration scripts tested

---

## 🧪 Staging Deployment

### 1. Database Migration

```bash
# Backup database first
pg_dump $STAGING_DATABASE_URL > backup_pre_auth_mvp.sql

# Apply RLS migration
psql $STAGING_DATABASE_URL -f supabase/migrations/20250115_enable_rls.sql

# Verify RLS enabled
psql $STAGING_DATABASE_URL -c "
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE tablename IN ('receipts', 'documents', 'p2e_wallet', 'clients');
"

# Expected: All tables should have rowsecurity = true
```

### 2. Supabase Configuration

**Follow:** `docs/SUPABASE_AUTH_CONFIG.md`

- [ ] Access Token Lifetime: 900 seconds
- [ ] Refresh Token Lifetime: 1209600 seconds
- [ ] Refresh Token Rotation: Enabled
- [ ] PKCE: Enabled
- [ ] Redirect URLs configured (staging URLs)
- [ ] Email templates customized (Finnish)
- [ ] Rate limiting configured

### 3. Environment Variables

```bash
# Backend
kubectl set env deployment/backend-staging \
  SUPABASE_URL=https://xxx.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=xxx \
  SUPABASE_JWT_ISS=https://xxx.supabase.co/auth/v1 \
  SUPABASE_AUTH_ENABLED=true

# Frontend
kubectl set env deployment/frontend-staging \
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
  NEXT_PUBLIC_ENV=staging
```

### 4. Deploy Code

```bash
# Backend
git checkout main
git pull
kubectl apply -f k8s/backend-staging.yaml
kubectl rollout status deployment/backend-staging

# Frontend
kubectl apply -f k8s/frontend-staging.yaml
kubectl rollout status deployment/frontend-staging
```

### 5. Smoke Tests

```bash
# Health check
curl https://staging.docflow.fi/health
# Expected: {"status": "healthy"}

# Auth endpoint
curl https://staging.docflow.fi/api/auth/health
# Expected: {"status": "healthy", "features": [...]}

# Security headers
curl -I https://staging.docflow.fi
# Expected: Strict-Transport-Security, X-Content-Type-Options, etc.
```

### 6. Functional Testing

- [ ] **Magic Link Login**
  - Go to https://staging.docflow.fi/login
  - Enter test email
  - Receive magic link email
  - Click link → redirect to /dashboard
  - User logged in successfully

- [ ] **Session Persistence**
  - Reload page → still logged in
  - Close tab, reopen → still logged in
  - Wait 15 min → auto-refresh works

- [ ] **Multi-Tab Sync**
  - Open 2 tabs
  - Sign out in tab 1
  - Tab 2 also signs out

- [ ] **Tenant Isolation**
  - Login as tenant A
  - Try to access tenant B's data via API
  - Should return 403/404

- [ ] **Admin Override**
  - Login as admin
  - Access another tenant's data WITH X-Admin-Override-Reason header
  - Should succeed (200 OK)
  - Access WITHOUT header → should fail (403)

### 7. Monitor for 24 Hours

- [ ] Check error logs (no auth errors)
- [ ] Check token refresh rate (normal)
- [ ] Check CSP violation reports
- [ ] Check RLS policy performance
- [ ] No user complaints

---

## 🚀 Production Deployment

### Pre-Production Checklist

- [ ] Staging deployment successful for 24+ hours
- [ ] No critical issues in staging
- [ ] CSP violations analyzed and resolved
- [ ] Load testing completed
- [ ] Rollback plan documented
- [ ] On-call engineer available
- [ ] Communication plan ready (if user-facing changes)

### 1. Maintenance Window (Optional)

**If needed:** Schedule 30-min maintenance window for database migration

```
Subject: DocFlow Maintenance - Security Upgrade
Time: Sunday 2 AM - 2:30 AM (Europe/Helsinki)
Impact: Brief service interruption (< 5 min)
```

### 2. Database Migration

```bash
# Backup production database
pg_dump $PRODUCTION_DATABASE_URL > backup_prod_pre_auth_mvp_$(date +%Y%m%d).sql

# Upload backup to S3
aws s3 cp backup_prod_pre_auth_mvp_*.sql s3://docflow-backups/

# Apply RLS migration
psql $PRODUCTION_DATABASE_URL -f supabase/migrations/20250115_enable_rls.sql

# Verify
psql $PRODUCTION_DATABASE_URL -c "
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE tablename IN ('receipts', 'documents', 'p2e_wallet', 'clients');
"
```

### 3. Supabase Configuration

**Production Supabase Project**

- [ ] Access Token Lifetime: 900 seconds
- [ ] Refresh Token Lifetime: 1209600 seconds
- [ ] Refresh Token Rotation: Enabled
- [ ] PKCE: Enabled
- [ ] Redirect URLs configured (production URLs)
- [ ] Email templates finalized
- [ ] Rate limiting: 4 emails/hour

### 4. Environment Variables

```bash
# Backend
kubectl set env deployment/backend-prod \
  SUPABASE_URL=https://xxx.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=xxx \
  SUPABASE_JWT_ISS=https://xxx.supabase.co/auth/v1 \
  SUPABASE_AUTH_ENABLED=true

# Frontend
kubectl set env deployment/frontend-prod \
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
  NEXT_PUBLIC_ENV=production
```

### 5. Deploy Code (Blue-Green)

```bash
# Deploy to green environment
kubectl apply -f k8s/backend-prod-green.yaml
kubectl rollout status deployment/backend-prod-green

kubectl apply -f k8s/frontend-prod-green.yaml
kubectl rollout status deployment/frontend-prod-green

# Smoke test green
curl https://green.docflow.fi/health

# Switch traffic to green
kubectl patch service backend-prod -p '{"spec":{"selector":{"version":"green"}}}'
kubectl patch service frontend-prod -p '{"spec":{"selector":{"version":"green"}}}'

# Monitor for 15 minutes
# If issues: switch back to blue
# If OK: keep green, delete blue
```

### 6. Post-Deployment Verification

```bash
# Health checks
curl https://docflow.fi/health
curl https://docflow.fi/api/auth/health

# Security headers
curl -I https://docflow.fi | grep -E "(Strict-Transport|X-Content|X-Frame)"

# Test login flow
# (Manual testing with real user account)
```

### 7. Monitor for 48 Hours

**Metrics to watch:**

- [ ] **Error rate** - Should be < 0.1%
- [ ] **Token refresh success** - Should be > 99.5%
- [ ] **RLS violations** - Should be 0
- [ ] **CSP violations** - Monitor, don't enforce yet
- [ ] **User complaints** - None expected
- [ ] **Performance** - No degradation

**Dashboards:**

- Supabase Dashboard → Authentication → Users
- Grafana → DocFlow Auth Metrics
- Sentry → Error Tracking
- Logs → `kubectl logs -l app=backend | grep auth`

---

## 🔄 Rollback Plan

### If Critical Issue Detected

**Symptoms:**
- High error rate (> 5%)
- Mass user lockouts
- Cross-tenant data leakage
- Performance degradation

**Immediate Actions:**

1. **Switch back to blue (if using blue-green):**
   ```bash
   kubectl patch service backend-prod -p '{"spec":{"selector":{"version":"blue"}}}'
   kubectl patch service frontend-prod -p '{"spec":{"selector":{"version":"blue"}}}'
   ```

2. **Disable RLS (EMERGENCY ONLY):**
   ```sql
   ALTER TABLE receipts DISABLE ROW LEVEL SECURITY;
   ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
   -- ... all tables
   ```

3. **Increase token lifetime (temporary):**
   - Supabase Dashboard → Settings
   - Access Token: 3600 seconds (1 hour)

4. **Notify:**
   - On-call engineer
   - Security team
   - Users (if needed)

### Post-Rollback

- [ ] Root cause analysis
- [ ] Fix issues in staging
- [ ] Re-test thoroughly
- [ ] Schedule new deployment

---

## 📊 Success Criteria

### Technical Metrics

- [ ] Token refresh success rate > 99.5%
- [ ] API error rate < 0.1%
- [ ] Page load time < 2s (P95)
- [ ] No RLS violations detected
- [ ] No cross-tenant data leakage

### User Experience

- [ ] Users can log in successfully
- [ ] Sessions persist across reloads
- [ ] No unexpected logouts
- [ ] Multi-tab experience smooth
- [ ] No user complaints

### Security

- [ ] All security headers present
- [ ] CSP violations minimal (< 10/day)
- [ ] RLS policies enforced
- [ ] Admin overrides logged
- [ ] No security incidents

---

## 📞 Escalation

### Issue Severity

**P0 - Critical (Page immediately)**
- Cross-tenant data leakage
- Complete auth system down
- Mass user lockout

**P1 - High (Page during business hours)**
- High refresh failure rate (> 10%)
- RLS violations detected
- Performance degradation

**P2 - Medium (Ticket)**
- Moderate issues (5-10% errors)
- CSP blocking features
- Individual user issues

### Contacts

- **On-Call:** PagerDuty
- **Security:** security@docflow.fi
- **DevOps:** devops@docflow.fi
- **Supabase Support:** https://supabase.com/support

---

## 📝 Post-Deployment

### Documentation

- [ ] Update CHANGELOG.md
- [ ] Update version in package.json
- [ ] Tag release in Git
- [ ] Update status page
- [ ] Internal announcement

### Monitoring Setup

- [ ] Grafana dashboard created
- [ ] Alerts configured (PagerDuty)
- [ ] CSP report monitoring
- [ ] Weekly metrics review scheduled

### Team Communication

- [ ] Deployment summary sent
- [ ] Known issues documented
- [ ] Next steps planned
- [ ] Lessons learned session scheduled

---

## 🎯 Next Phase

After successful deployment and 2 weeks of monitoring:

- [ ] **Enable CSP Enforce Mode**
  - Analyze CSP reports
  - Fix violations
  - Switch from report-only to enforce

- [ ] **Plan TOTP 2FA**
  - Design UX
  - Implement backend
  - Beta test with admins

- [ ] **Plan WebAuthn/Passkeys**
  - Research browser support
  - Design enrollment flow
  - Implement for premium users

---

**Last Updated:** 2025-01-15  
**Version:** 1.0  
**Owner:** DocFlow DevOps Team


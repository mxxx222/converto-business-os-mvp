# ✅ Agent Orchestrator - Production Checklist

**Versio:** 2.0.0
**Päivitetty:** 2025-01-15

---

## 🎯 Pre-Deployment Checklist

### **Infrastructure**

- [ ] PostgreSQL database provisioned (Supabase)
- [ ] Database migrations applied (`alembic upgrade head`)
- [ ] Environment variables configured in Render
- [ ] API endpoints accessible
- [ ] SSL certificate configured
- [ ] DNS configured (if custom domain)

### **Dependencies**

- [ ] Python 3.11+ installed
- [ ] All requirements installed (`pip install -r requirements.txt`)
- [ ] OpenAI API key configured
- [ ] Supabase credentials configured
- [ ] All agent dependencies available

### **Configuration**

- [ ] `AGENT_ORCHESTRATOR_ENABLED=true`
- [ ] `AGENT_MAX_RETRIES=3`
- [ ] `AGENT_TIMEOUT_MS=30000`
- [ ] `AGENT_API_KEY_ENABLED=true`
- [ ] `AGENT_RBAC_ENABLED=true`
- [ ] `LOG_LEVEL=INFO` (production)

---

## 🔐 Security Checklist

### **Authentication & Authorization**

- [ ] API key authentication enabled
- [ ] RBAC roles configured (admin, user, viewer)
- [ ] API keys stored securely (environment variables)
- [ ] Audit logging enabled
- [ ] Rate limiting configured

### **Data Security**

- [ ] Database credentials secured
- [ ] Sensitive data encrypted
- [ ] API responses don't expose secrets
- [ ] Input validation enabled
- [ ] SQL injection prevention (parameterized queries)

### **Network Security**

- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] Firewall rules set
- [ ] DDoS protection (if available)

---

## 🧪 Testing Checklist

### **Functional Tests**

- [ ] All agents registered and discoverable
- [ ] Workflow templates load correctly
- [ ] Workflow execution completes successfully
- [ ] Copilot integration recognizes commands
- [ ] Metrics endpoint returns data
- [ ] Error handling works correctly

### **Integration Tests**

- [ ] OCR agent connects to OpenAI API
- [ ] Database writes succeed
- [ ] Supabase integration works
- [ ] Email notifications (if configured)
- [ ] File storage (if configured)

### **Performance Tests**

- [ ] Workflow execution < 30s (typical)
- [ ] API response time < 500ms
- [ ] Concurrent executions handled
- [ ] Memory usage stable
- [ ] No memory leaks

### **Load Tests**

- [ ] Handles 100 concurrent workflows
- [ ] Database connection pool sufficient
- [ ] API rate limits appropriate
- [ ] Error recovery works under load

---

## 📊 Monitoring Checklist

### **Logging**

- [ ] Application logs configured
- [ ] Log levels appropriate (INFO for production)
- [ ] Log rotation configured
- [ ] Error logs captured
- [ ] Audit logs recording

### **Metrics**

- [ ] Metrics endpoint accessible
- [ ] Dashboard shows data
- [ ] Success rate tracked
- [ ] Duration metrics tracked
- [ ] Error rate tracked

### **Alerting**

- [ ] Error alerts configured (Sentry)
- [ ] Critical failures alert
- [ ] Performance degradation alerts
- [ ] Monitoring dashboard accessible

---

## 🚀 Deployment Steps

### **Step 1: Prepare**

```bash
# Verify code is committed
git status

# Run tests locally
pytest tests/

# Check linting
ruff check shared_core/modules/agent_orchestrator/
```

### **Step 2: Database Migration**

```bash
# Create migration (if needed)
alembic revision --autogenerate -m "agent_orchestrator_update"

# Apply migration
alembic upgrade head

# Verify tables
psql $DATABASE_URL -c "\dt agent_*"
```

### **Step 3: Deploy**

```bash
# Push to GitHub (triggers Render deployment)
git push origin main

# Or trigger manual deployment in Render dashboard
```

### **Step 4: Verify**

```bash
# Health check
curl https://api.converto.fi/health

# Agent registry
curl https://api.converto.fi/api/v1/agent-orchestrator/agents

# Metrics
curl https://api.converto.fi/api/v1/agent-orchestrator/metrics
```

### **Step 5: Test**

```bash
# Test workflow execution
curl -X POST https://api.converto.fi/api/v1/agent-orchestrator/workflows/execute \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{
    "template_id": "receipt_processing",
    "initial_variables": {
      "receipt_file": "test.pdf"
    }
  }'

# Test Copilot
curl -X POST https://api.converto.fi/api/v1/agent-orchestrator/copilot/execute \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{
    "command": "Luo talousraportti viime kuulta",
    "context": {
      "tenant_id": "test_tenant"
    }
  }'
```

---

## 📋 Post-Deployment Checklist

### **Immediate (0-1 hours)**

- [ ] Health check returns 200
- [ ] Agent registry accessible
- [ ] Metrics endpoint working
- [ ] Test workflow execution succeeds
- [ ] No critical errors in logs
- [ ] Dashboard accessible

### **Short-term (1-24 hours)**

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify audit logs recording
- [ ] Test all workflow templates
- [ ] Verify Copilot integration
- [ ] Check Sentry for errors

### **Long-term (1-7 days)**

- [ ] Review metrics dashboard
- [ ] Analyze success rates
- [ ] Optimize slow workflows
- [ ] Review audit logs
- [ ] User feedback collected
- [ ] Performance baseline established

---

## 🐛 Rollback Plan

### **If Deployment Fails**

1. **Revert code:**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Rollback database (if needed):**
   ```bash
   alembic downgrade -1
   ```

3. **Restore environment variables** (if changed)

4. **Verify previous version works:**
   ```bash
   curl https://api.converto.fi/health
   ```

---

## 📚 Documentation

- [ ] Deployment guide updated
- [ ] API documentation published
- [ ] SDK documentation available
- [ ] Troubleshooting guide available
- [ ] Changelog updated

---

## ✅ Sign-off

**Deployed by:** _________________
**Date:** _________________
**Version:** 2.0.0
**Status:** ☐ Approved ☐ Needs Review

---

**Päivitetty:** 2025-01-15
**Ylläpitäjä:** Converto Team



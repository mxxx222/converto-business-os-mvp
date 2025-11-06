# 🚀 Agent Orchestrator - Deployment Guide

**Versio:** 2.0.0 - Production Ready
**Päivitetty:** 2025-01-15

---

## 📋 Sisällys

1. [Production Deployment](#production-deployment)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [API Endpoints](#api-endpoints)
5. [Monitoring & Metrics](#monitoring--metrics)
6. [Security Checklist](#security-checklist)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Production Deployment

### **Prerequisites**

- Python 3.11+
- PostgreSQL (Supabase)
- OpenAI API Key
- FastAPI backend running

### **Step 1: Install Dependencies**

```bash
pip install -r requirements.txt
```

**Required packages:**
- `fastapi>=0.115.0`
- `supabase>=2.0.0`
- `openai>=1.0.0`
- `aiohttp>=3.9.0`
- `apscheduler>=3.10.0`

### **Step 2: Environment Variables**

Create `.env` file or set in Render:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Agent Orchestrator
AGENT_ORCHESTRATOR_ENABLED=true
AGENT_MAX_RETRIES=3
AGENT_TIMEOUT_MS=30000
AGENT_DEFAULT_REGION=eu-west-1

# Security
AGENT_API_KEY_ENABLED=true
AGENT_RBAC_ENABLED=true
```

### **Step 3: Database Migration**

Run Alembic migrations:

```bash
# Create tables
alembic upgrade head

# Verify tables exist
psql $DATABASE_URL -c "\dt agent_*"
```

**Required tables:**
- `agent_workflows` - Saved workflows
- `agent_workflow_executions` - Execution history
- `agent_audit_logs` - Audit trail
- `agent_api_keys` - API key management

### **Step 4: Verify Deployment**

```bash
# Health check
curl https://api.converto.fi/health

# Agent registry
curl https://api.converto.fi/api/v1/agent-orchestrator/agents

# Metrics
curl https://api.converto.fi/api/v1/agent-orchestrator/metrics
```

---

## 🔐 Environment Variables

### **Required**

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ...` |

### **Optional**

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENT_ORCHESTRATOR_ENABLED` | `true` | Enable orchestrator |
| `AGENT_MAX_RETRIES` | `3` | Max retry attempts |
| `AGENT_TIMEOUT_MS` | `30000` | Timeout in milliseconds |
| `AGENT_DEFAULT_REGION` | `eu-west-1` | Default region |
| `AGENT_API_KEY_ENABLED` | `true` | Enable API key auth |
| `AGENT_RBAC_ENABLED` | `true` | Enable RBAC |

---

## 🗄️ Database Setup

### **Alembic Migration**

```bash
# Create migration
alembic revision --autogenerate -m "agent_orchestrator_tables"

# Apply migration
alembic upgrade head
```

### **Manual SQL (if needed)**

```sql
-- Workflow persistence
CREATE TABLE IF NOT EXISTS agent_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_id VARCHAR(100),
    workflow_data JSONB NOT NULL,
    tenant_id VARCHAR(255),
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Execution history
CREATE TABLE IF NOT EXISTS agent_workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES agent_workflows(id),
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    error_message TEXT,
    execution_data JSONB,
    tenant_id VARCHAR(255)
);

-- Audit logs
CREATE TABLE IF NOT EXISTS agent_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

-- API keys
CREATE TABLE IF NOT EXISTS agent_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    tenant_id VARCHAR(255),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP
);
```

---

## 🔌 API Endpoints

### **Agent Management**

```bash
# List agents
GET /api/v1/agent-orchestrator/agents

# Get agent details
GET /api/v1/agent-orchestrator/agents/{agent_id}

# Agent health check
GET /api/v1/agent-orchestrator/agents/{agent_id}/health
```

### **Workflow Execution**

```bash
# Execute workflow
POST /api/v1/agent-orchestrator/workflows/execute
{
  "template_id": "receipt_processing",
  "initial_variables": {
    "receipt_file": "/path/to/receipt.pdf"
  }
}

# Check status
GET /api/v1/agent-orchestrator/workflows/{execution_id}/status

# Get result
GET /api/v1/agent-orchestrator/workflows/{execution_id}/result
```

### **Copilot Integration**

```bash
# Natural language command
POST /api/v1/agent-orchestrator/copilot/execute
{
  "command": "Luo talousraportti viime kuulta",
  "context": {
    "tenant_id": "tenant_123",
    "user_id": "user_456"
  }
}
```

### **Metrics**

```bash
# Get metrics
GET /api/v1/agent-orchestrator/metrics?hours_back=24

# Response:
{
  "total_executions": 1523,
  "success_rate": 0.98,
  "avg_duration_ms": 1234,
  "agents": {
    "ocr_agent": {
      "executions": 523,
      "success_rate": 0.99,
      "avg_duration_ms": 890
    }
  }
}
```

---

## 📊 Monitoring & Metrics

### **Live Metrics Dashboard**

Access at: `/workflows/metrics`

**Metrics tracked:**
- Total executions
- Success rate
- Average duration
- Per-agent statistics
- Error rate

### **Logging**

```python
# Agent orchestrator logs
logger.info("Workflow execution started", extra={
    "workflow_id": workflow_id,
    "template_id": template_id
})
```

**Log levels:**
- `DEBUG` - Detailed debugging
- `INFO` - General information
- `WARNING` - Warnings
- `ERROR` - Errors

### **Sentry Integration**

Errors automatically tracked via Sentry:
- Workflow failures
- Agent errors
- API errors

---

## 🔒 Security Checklist

### **Pre-Deployment**

- [ ] API keys secured (environment variables)
- [ ] RBAC enabled
- [ ] Audit logging enabled
- [ ] Rate limiting configured
- [ ] CORS configured
- [ ] Input validation enabled

### **Post-Deployment**

- [ ] Health check returns 200
- [ ] Metrics endpoint accessible
- [ ] Agent registry working
- [ ] Workflow execution tested
- [ ] Audit logs recording
- [ ] Error tracking (Sentry) working

### **Production Hardening**

```bash
# Set production config
export AGENT_RBAC_ENABLED=true
export AGENT_API_KEY_ENABLED=true
export AGENT_AUDIT_ENABLED=true
export LOG_LEVEL=INFO
```

---

## 🐛 Troubleshooting

### **Issue: Agents not found**

```bash
# Check agent registry
curl https://api.converto.fi/api/v1/agent-orchestrator/agents

# Verify agents registered
python scripts/converto-agent-cli.py list-agents
```

### **Issue: Workflow execution fails**

```bash
# Check logs
tail -f logs/agent_orchestrator.log

# Test workflow manually
python scripts/converto-agent-cli.py execute-workflow receipt_processing
```

### **Issue: Database connection errors**

```bash
# Verify Supabase connection
python -c "from shared_core.utils.db import get_supabase_client; print(get_supabase_client())"

# Check environment variables
env | grep SUPABASE
```

### **Issue: API key authentication fails**

```bash
# Verify API key format
python scripts/converto-agent-cli.py generate-api-key test-key admin

# Test API key
curl -H "X-API-Key: YOUR_KEY" https://api.converto.fi/api/v1/agent-orchestrator/agents
```

---

## 📚 Additional Resources

- [Agent SDK Documentation](AGENT_ORCHESTRATOR_SDK.md)
- [API Reference](AGENT_ORCHESTRATOR_API.md)
- [Developer Guide](AGENT_ORCHESTRATOR_DEVELOPER.md)
- [Production Roadmap](AGENT_ORCHESTRATOR_PRODUCTION_ROADMAP.md)

---

**Päivitetty:** 2025-01-15
**Ylläpitäjä:** Converto Team



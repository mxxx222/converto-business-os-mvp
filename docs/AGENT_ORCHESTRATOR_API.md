# 📡 Agent Orchestrator - API Reference

**Versio:** 2.0.0
**Base URL:** `https://api.converto.fi/api/v1/agent-orchestrator`

---

## 🔐 Authentication

### **API Key**

```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  https://api.converto.fi/api/v1/agent-orchestrator/agents
```

### **RBAC Roles**

- `admin` - Full access
- `user` - Execute workflows, view metrics
- `viewer` - Read-only access

---

## 🤖 Agent Management

### **List Agents**

```http
GET /agents
```

**Response:**
```json
{
  "agents": [
    {
      "agent_id": "ocr_agent",
      "name": "OCR Agent",
      "agent_type": "OCR",
      "version": "1.0.0",
      "capabilities": ["ocr", "extraction", "vision"],
      "reliability": 0.98,
      "region": "eu-west-1"
    }
  ]
}
```

### **Get Agent Details**

```http
GET /agents/{agent_id}
```

**Response:**
```json
{
  "agent_id": "ocr_agent",
  "name": "OCR Agent",
  "description": "Extracts data from receipts using OCR",
  "agent_type": "OCR",
  "version": "1.0.0",
  "capabilities": ["ocr", "extraction", "vision"],
  "dependencies": [],
  "reliability": 0.98,
  "region": "eu-west-1",
  "tags": ["receipt", "ocr"],
  "fallback_agent_id": null,
  "max_retries": 3,
  "timeout_ms": 30000
}
```

### **Agent Health Check**

```http
GET /agents/{agent_id}/health
```

**Response:**
```json
{
  "status": "healthy",
  "last_check": "2025-01-15T10:30:00Z",
  "latency_ms": 45
}
```

---

## 🔄 Workflow Execution

### **Execute Workflow**

```http
POST /workflows/execute
Content-Type: application/json

{
  "template_id": "receipt_processing",
  "initial_variables": {
    " thereipt_file": "/path/to/receipt.pdf",
    "tenant_id": "tenant_123"
  },
  "context": {
    "user_id": "user_456",
    "tenant_id": "tenant_123"
  }
}
```

**Response:**
```json
{
  "execution_id": "exec_abc123",
  "status": "running",
  "workflow_id": "wf_xyz789",
  "started_at": "2025-01-15T10:30:00Z"
}
```

### **Check Workflow Status**

```http
GET /workflows/{execution_id}/status
```

**Response:**
```json
{
  "execution_id": "exec_abc123",
  "status": "completed",
  "progress": 100,
  "current_step": null,
  "started_at": "2025-01-15T10:30:00Z",
  "completed_at": "2025-01-15T10:30:15Z",
  "duration_ms": 15000
}
```

**Status values:**
- `pending` - Waiting to start
- `running` - Currently executing
- `completed` - Successfully completed
- `failed` - Execution failed
- `cancelled` - Cancelled by user

### **Get Workflow Result**

```http
GET /workflows/{execution_id}/result
```

**Response:**
```json
{
  "execution_id": "exec_abc123",
  "status": "completed",
  "result": {
    "ocr_agent": {
      "extracted_data": {
        "merchant": "Store Name",
        "amount": 25.50,
        "date": "2025-01-15"
      }
    },
    "categorization_agent": {
      "category": "Office Supplies",
      "confidence": 0.95
    },
    "vat_agent": {
      "vat_rate": 0.24,
      "vat_amount": 6.12
    }
  },
  "error": null
}
```

---

## 🗣️ Copilot Integration

### **Execute Natural Language Command**

```http
POST /copilot/execute
Content-Type: application/json

{
  "command": "Luo talousraportti viime kuulta PDF-muodossa",
  "context": {
    "tenant_id": "tenant_123",
    "user_id": "user_456"
  }
}
```

**Response:**
```json
{
  "execution_id": "exec_abc123",
  "workflow_id": "financial_reporting",
  "interpretation": {
    "command_type": "generate_report",
    "parameters": {
      "period": "last_month",
      "format": "pdf"
    }
  },
  "status": "running"
}
```

**Supported languages:**
- Finnish (suomi)
- English

**Command examples:**
- "Luo talousraportti viime kuulta"
- "Käsittele kuitti tiedostosta receipt.pdf"
- "Laske ALV viime kuun kuitista"
- "Generate financial report for last month"
- "Process receipt from file receipt.pdf"

---

## 📊 Metrics

### **Get Metrics**

```http
GET /metrics?hours_back=24
```

**Query parameters:**
- `hours_back` (optional) - Hours to look back (default: 24)

**Response:**
```json
{
  "total_executions": 1523,
  "success_rate": 0.98,
  "avg_duration_ms": 1234,
  "total_duration_ms": 1876543,
  "agents": {
    "ocr_agent": {
      "executions": 523,
      "success_rate": 0.99,
      "avg_duration_ms": 890,
      "total_duration_ms": 465470
    },
    "vat_agent": {
      "executions": 523,
      "success_rate": 0.97,
      "avg_duration_ms": 234,
      "total_duration_ms": 122382
    }
  },
  "workflows": {
    "receipt_processing": {
      "executions": 523,
      "success_rate": 0.98,
      "avg_duration_ms": 1523
    }
  },
  "errors": {
    "total": 31,
    "by_type": {
      "timeout": 15,
      "api_error": 10,
      "validation_error": 6
    }
  }
}
```

---

## 💾 Workflow Persistence

### **Save Workflow**

```http
POST /workflows/save
Content-Type: application/json

{
  "name": "My Custom Workflow",
  "description": "Custom workflow for specific needs",
  "template_id": "custom_template",
  "workflow_data": {
    "steps": [...],
    "variables": {...}
  },
  "tenant_id": "tenant_123"
}
```

**Response:**
```json
{
  "workflow_id": "wf_abc123",
  "name": "My Custom Workflow",
  "created_at": "2025-01-15T10:30:00Z"
}
```

### **List Saved Workflows**

```http
GET /workflows/saved?tenant_id=tenant_123
```

**Response:**
```json
{
  "workflows": [
    {
      "workflow_id": "wf_abc123",
      "name": "My Custom Workflow",
      "description": "Custom workflow",
      "created_at": "2025-01-15T10:30:00Z",
      "last_executed": "2025-01-15T11:00:00Z"
    }
  ]
}
```

### **Get Workflow Template**

```http
GET /workflows/templates/{template_id}
```

**Response:**
```json
{
  "template_id": "receipt_processing",
  "name": "Receipt Processing",
  "description": "Process receipt through OCR, categorization, and VAT calculation",
  "steps": [
    {
      "step_id": "ocr_extract",
      "agent_id": "ocr_agent",
      "dependencies": [],
      "input_mapping": {
        "receipt_file": "initial:receipt_file"
      },
      "output_keys": ["extracted_data"]
    }
  ],
  "tags": ["receipt", "ocr", "vat"]
}
```

---

## 🔒 Security & Audit

### **List Audit Logs**

```http
GET /audit/logs?limit=100&offset=0
```

**Query parameters:**
- `limit` (optional) - Number of logs (default: 100)
- `offset` (optional) - Pagination offset
- `user_id` (optional) - Filter by user
- `action` (optional) - Filter by action

**Response:**
```json
{
  "logs": [
    {
      "id": "log_abc123",
      "user_id": "user_456",
      "action": "workflow_execute",
      "resource_type": "workflow",
      "resource_id": "wf_xyz789",
      "details": {
        "template_id": "receipt_processing"
      },
      "ip_address": "192.168.1.1",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 1523
}
```

---

## ❌ Error Responses

### **Standard Error Format**

```json
{
  "error": {
    "code": "WORKFLOW_EXECUTION_FAILED",
    "message": "Workflow execution failed at step ocr_agent",
    "details": {
      "step_id": "ocr_agent",
      "error": "OCR API timeout"
    }
  }
}
```

### **Error Codes**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AGENT_NOT_FOUND` | 404 | Agent not registered |
| `WORKFLOW_NOT_FOUND` | 404 | Workflow template not found |
| `EXECUTION_NOT_FOUND` | 404 | Execution ID not found |
| `WORKFLOW_EXECUTION_FAILED` | 500 | Workflow execution error |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `AUTHENTICATION_ERROR` | 401 | Invalid API key |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## 📚 Additional Resources

- [Deployment Guide](AGENT_ORCHESTRATOR_DEPLOYMENT.md)
- [SDK Documentation](AGENT_ORCHESTRATOR_SDK.md)
- [Complete Documentation](AGENT_ORCHESTRATOR_COMPLETE.md)

---

**Päivitetty:** 2025-01-15
**Ylläpitäjä:** Converto Team



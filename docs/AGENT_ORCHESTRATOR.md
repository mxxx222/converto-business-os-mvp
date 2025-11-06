# 🤖 Agent Orchestrator - Multi-Agent Workflow System

**Versio:** 1.0.0
**Päivitetty:** 2025-01-15

---

## 📋 Yleiskuva

**Agent Orchestrator** mahdollistaa useiden AI-agenttien yhteistyön modulaarisissa workflowissa. Sen avulla agentit voivat:
- Työskennellä rinnakkain (parallel execution)
- Kommunikoida keskenään (inter-agent messaging)
- Jakaa dataa workflow-vaiheiden välillä
- Seurata työnkulkuja reaaliajassa

---

## 🎯 Ominaisuudet

### **1. Agent Registry**
- Dynaaminen agenttirekisteröinti
- Agent-metadata (capabilities, dependencies, schemas)
- Agent-discovery (löydä agentit capabilityn perusteella)

### **2. Workflow Engine**
- Workflow-templatit (pre-built workflows)
- Dependency management (agenttien riippuvuudet)
- Parallel execution (useita agentteja samanaikaisesti)
- Error handling & retry logic

### **3. Inter-Agent Communication**
- Request-response messaging
- Broadcast messaging
- Subscription system
- Message history

---

## 📁 Rakenne

```
shared_core/modules/agent_orchestrator/
├── __init__.py
├── orchestrator.py              # Main orchestrator
├── agent_registry.py            # Agent registry & discovery
├── workflow_engine.py           # Workflow execution engine
├── inter_agent_comm.py          # Agent-to-agent messaging
├── router.py                    # FastAPI endpoints
└── agents/
    ├── __init__.py
    └── finance_agent_adapter.py # FinanceAgent adapter
```

---

## 🚀 Käyttö

### **1. Rekisteröi Agent**

```python
from shared_core.modules.agent_orchestrator import AgentOrchestrator
from shared_core.modules.agent_orchestrator.agents import FinanceAgentAdapter

orchestrator = AgentOrchestrator()

# Rekisteröi FinanceAgent
finance_agent = FinanceAgentAdapter(tenant_id="tenant_123", user_id="user_456")
orchestrator.register_agent(finance_agent)
```

### **2. Suorita Workflow**

```python
# Suorita receipt processing workflow
execution = await orchestrator.execute_workflow(
    template_id="receipt_processing",
    initial_variables={
        "receipt_file": "/path/to/receipt.pdf"
    },
    execution_name="Process Receipt #123"
)

# Tarkista status
status = orchestrator.get_workflow_status(execution.execution_id)

# Hae tulos
if status == WorkflowStatus.COMPLETED:
    result = orchestrator.get_workflow_result(execution.execution_id)
    print(f"Insights: {result['insights']}")
```

### **3. API-Endpointit**

#### **Suorita Workflow**
```bash
POST /api/v1/agent-orchestrator/workflows/execute
Content-Type: application/json

{
  "template_id": "receipt_processing",
  "initial_variables": {
    "receipt_file": "/path/to/receipt.pdf"
  },
  "execution_name": "Process Receipt #123"
}
```

#### **Tarkista Status**
```bash
GET /api/v1/agent-orchestrator/workflows/{execution_id}/status
```

#### **Hae Tulos**
```bash
GET /api/v1/agent-orchestrator/workflows/{execution_id}/result
```

#### **Listaa Agentit**
```bash
GET /api/v1/agent-orchestrator/agents?agent_type=finance
```

#### **Listaa Workflow-Templatet**
```bash
GET /api/v1/agent-orchestrator/templates
```

---

## 📋 Workflow-Templatet

### **1. Receipt Processing Workflow**

**Template ID:** `receipt_processing`

**Vaiheet:**
1. **OCR Extract** → Tunnista kuitti (OCR Agent)
2. **Categorize** → Kategorisoi (Categorization Agent)
3. **Calculate VAT** → Laske ALV (VAT Agent) [rinnakkain vaiheen 2 kanssa]
4. **Finance Analysis** → Analysoi talous (Finance Agent)

**Käyttö:**
```python
execution = await orchestrator.execute_workflow(
    template_id="receipt_processing",
    initial_variables={
        "receipt_file": "/path/to/receipt.pdf"
    }
)
```

---

## 🔧 Agent-Adapterit

### **FinanceAgent Adapter**

FinanceAgent on integroitu orchestratoriin adapterilla:

```python
from shared_core.modules.agent_orchestrator.agents import FinanceAgentAdapter

agent = FinanceAgentAdapter(tenant_id="tenant_123", user_id="user_456")
orchestrator.register_agent(agent)
```

**Input Schema:**
- `receipt_data`: Receipt data object
- `category`: Receipt category (string)
- `vat_amount`: VAT amount (number)
- `days_back`: Days to analyze (integer)

**Output Schema:**
- `insights`: List of financial insights
- `alerts`: List of spending alerts
- `recommendations`: List of recommendations

---

## 🔄 Inter-Agent Communication

### **Request-Response Pattern**

```python
# Agent A lähettää pyyntöä Agent B:lle
response = await orchestrator.request_response(
    from_agent_id="agent_a",
    to_agent_id="agent_b",
    request_payload={"query": "Analyze this data"},
    timeout=30.0
)
```

### **Broadcast Messaging**

```python
# Lähetä broadcast-viesti kaikille agenteille
message_id = await orchestrator.send_message(
    from_agent_id="agent_a",
    to_agent_id=None,  # None = broadcast
    message_type="notification",
    payload={"event": "data_updated", "data": {...}}
)
```

---

## 📊 Workflow Execution Status

### **Workflow Statuses:**
- `pending` - Odottaa suoritusta
- `running` - Käynnissä
- `completed` - Valmis
- `failed` - Epäonnistui
- `cancelled` - Peruutettu

### **Step Statuses:**
- `pending` - Odottaa suoritusta
- `running` - Käynnissä
- `completed` - Valmis
- `failed` - Epäonnistui
- `skipped` - Ohitettu

---

## 🎯 Tulevat Ominaisuudet

- [ ] Visual workflow designer (UI)
- [ ] Conditional workflows (if/else logic)
- [ ] Loop workflows (while/for loops)
- [ ] Workflow scheduling (cron-like)
- [ ] Workflow versioning
- [ ] Workflow analytics
- [ ] Error recovery strategies
- [ ] Cost tracking per workflow

---

## 📚 Dokumentaatio

- [Agent Registry API](agent_registry.py)
- [Workflow Engine API](workflow_engine.py)
- [Inter-Agent Communication API](inter_agent_comm.py)
- [Orchestrator API](orchestrator.py)

---

**Päivitetty:** 2025-01-15
**Ylläpitäjä:** Converto Team



# 🛠️ Agent SDK - Developer Guide

**Versio:** 2.0.0
**Päivitetty:** 2025-01-15

---

## 📋 Sisällys

1. [Quick Start](#quick-start)
2. [Creating Agents](#creating-agents)
3. [Workflow Templates](#workflow-templates)
4. [CLI Usage](#cli-usage)
5. [Best Practices](#best-practices)
6. [Examples](#examples)

---

## 🚀 Quick Start

### **Installation**

```bash
# SDK is included in shared_core
from shared_core.modules.agent_orchestrator.agent_sdk import (
    register_agent,
    AgentType
)
```

### **Create Your First Agent**

```python
from shared_core.modules.agent_orchestrator.agent_sdk import (
    register_agent,
    AgentType
)

@register_agent(
    agent_id="my_custom_agent",
    agent_type=AgentType.ANALYSIS,
    name="My Custom Agent",
    description="Does amazing custom analysis",
    capabilities=["analysis", "custom_logic"],
    reliability=0.95
)
async def my_custom_agent_execute(
    input_data: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """Execute custom agent logic."""
    # Your logic here
    result = await perform_analysis(input_data)

    return {
        "status": "success",
        "result": result,
        "confidence": 0.95
    }
```

---

## 🤖 Creating Agents

### **Agent Decorator**

```python
@register_agent(
    agent_id="unique_agent_id",          # Required: Unique identifier
    agent_type=AgentType.ANALYSIS,      # Required: Agent type
    name="Display Name",                # Required: Human-readable name
    description="Agent description",     # Required: What it does
    version="1.0.0",                    # Optional: Version string
    capabilities=["cap1", "cap2"],       # Optional: List of capabilities
    dependencies=["other_agent"],         # Optional: Dependency agent IDs
    reliability=0.95,                    # Optional: Success rate (0.0-1.0)
    region="eu-west-1",                 # Optional: Region
    tags=["tag1", "tag2"],              # Optional: Tags for filtering
    fallback_agent_id="backup_agent",   # Optional: Fallback agent
    max_retries=3,                      # Optional: Max retry attempts
    timeout_ms=30000                    # Optional: Timeout in ms
)
async def agent_function(
    input_data: Dict[str, Any],
    context: Dict[str, Any]
) -> Dict[str, Any]:
    """Agent execution function."""
    pass
```

### **Agent Types**

```python
from shared_core.modules.agent_orchestrator.agent_registry import AgentType

# Available types:
AgentType.OCR           # Image/document processing
AgentType.ANALYSIS      # Data analysis
AgentType.CALCULATION   # Mathematical operations
AgentType.CATEGORIZATION # Classification/categorization
AgentType.REPORTING     # Report generation
AgentType.NOTIFICATION  # Notifications/communications
```

### **Agent Function Signature**

```python
async def agent_execute(
    input_data: Dict[str, Any],    # Input from previous step/initial
    context: Dict[str, Any]        # Execution context
) -> Dict[str, Any]:
    """
    Args:
        input_data: Data from previous workflow step or initial variables
        context: Execution context (tenant_id, user_id, etc.)

    Returns:
        Dict with output data. Keys match step output_keys.
    """
    pass
```

---

## 🔄 Workflow Templates

### **Define Workflow Template**

```python
from shared_core.modules.agent_orchestrator.workflow_engine import (
    WorkflowTemplate,
    WorkflowStep
)

template = WorkflowTemplate(
    template_id="my_workflow",
    name="My Custom Workflow",
    description="Does something amazing",
    steps=[
        WorkflowStep(
            step_id="step1",
            agent_id="my_agent",
            input_mapping={"data": "initial:input"},
            output_keys=["result"]
        ),
        WorkflowStep(
            step_id="step2",
            agent_id="another_agent",
            dependencies=["step1"],
            input_mapping={"data": "step:step1:result"},
            output_keys=["final_result"]
        )
    ],
    tags=["custom", "analysis"]
)
```

### **Input Mapping**

```python
# From initial variables
input_mapping = {
    "receipt_file": "initial:receipt_file"
}

# From previous step
input_mapping = {
    "data": "step:ocr_agent:extracted_data"
}

# Nested keys
input_mapping = {
    "amount": "step:ocr_agent:extracted_data.total_amount"
}
```

---

## 💻 CLI Usage

### **List Agents**

```bash
python scripts/converto-agent-cli.py list-agents
```

**Output:**
```
📋 Registered Agents (5):

  🤖 OCR Agent (ocr_agent)
     Type: OCR
     Version: 1.0.0
     Capabilities: ocr, extraction, vision...
     Reliability: 98.0%
```

### **List Workflows**

```bash
python scripts/converto-agent-cli.py list-workflows
```

### **Execute Workflow**

```bash
python scripts/converto-agent-cli.py execute-workflow receipt_processing \
  --var receipt_file=/path/to/receipt.pdf \
  --var tenant_id=tenant_123
```

### **Generate API Key**

```bash
python scripts/converto-agent-cli.py generate-api-key my-key admin
```

### **Run Benchmark**

```bash
python scripts/converto-agent-cli.py benchmark \
  --workflow receipt_processing \
  --iterations 100 \
  --concurrent 10
```

---

## ✅ Best Practices

### **1. Error Handling**

```python
@register_agent(...)
async def my_agent(input_data, context):
    try:
        result = await risky_operation(input_data)
        return {"status": "success", "result": result}
    except Exception as e:
        logger.error(f"Agent failed: {e}", extra={
            "agent_id": "my_agent",
            "input_data": input_data
        })
        return {
            "status": "error",
            "error": str(e)
        }
```

### **2. Input Validation**

```python
@register_agent(...)
async def my_agent(input_data, context):
    # Validate required fields
    if "required_field" not in input_data:
        return {
            "status": "error",
            "error": "Missing required_field"
        }

    # Validate data types
    if not isinstance(input_data.get("amount"), (int, float)):
        return {
            "status": "error",
            "error": "amount must be numeric"
        }

    # Process...
```

### **3. Logging**

```python
import logging

logger = logging.getLogger("converto.agent.my_agent")

@register_agent(...)
async def my_agent(input_data, context):
    logger.info("Agent execution started", extra={
        "tenant_id": context.get("tenant_id"),
        "input_keys": list(input_data.keys())
    })

    # Process...

    logger.info("Agent execution completed", extra={
        "result_status": result["status"]
    })
```

### **4. Timeout Handling**

```python
import asyncio

@register_agent(timeout_ms=5000)
async def my_agent(input_data, context):
    try:
        result = await asyncio.wait_for(
            slow_operation(input_data),
            timeout=5.0
        )
        return {"status": "success", "result": result}
    except asyncio.TimeoutError:
        return {
            "status": "error",
            "error": "Operation timed out"
        }
```

---

## 📝 Examples

### **Example 1: Simple Analysis Agent**

```python
@register_agent(
    agent_id="sentiment_analysis",
    agent_type=AgentType.ANALYSIS,
    name="Sentiment Analysis Agent",
    description="Analyzes text sentiment",
    capabilities=["nlp", "sentiment"]
)
async def sentiment_agent(input_data, context):
    text = input_data.get("text", "")

    # Use OpenAI for sentiment analysis
    from openai import AsyncOpenAI
    client = AsyncOpenAI()

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "system",
            "content": "Analyze sentiment. Return JSON: {sentiment: 'positive'|'negative'|'neutral', score: 0-1}"
        }, {
            "role": "user",
            "content": text
        }]
    )

    result = json.loads(response.choices[0].message.content)

    return {
        "sentiment": result["sentiment"],
        "score": result["score"]
    }
```

### **Example 2: Multi-Step Workflow**

```python
template = WorkflowTemplate(
    template_id="text_analysis_pipeline",
    name="Text Analysis Pipeline",
    steps=[
        WorkflowStep(
            step_id="extract",
            agent_id="text_extraction_agent",
            input_mapping={"file": "initial:file"},
            output_keys=["text"]
        ),
        WorkflowStep(
            step_id="sentiment",
            agent_id="sentiment_analysis",
            dependencies=["extract"],
            input_mapping={"text": "step:extract:text"},
            output_keys=["sentiment", "score"]
        ),
        WorkflowStep(
            step_id="report",
            agent_id="reporting_agent",
            dependencies=["sentiment"],
            input_mapping={
                "text": "step:extract:text",
                "sentiment": "step:sentiment:sentiment",
                "score": "step:sentiment:score"
            },
            output_keys=["report_url"]
        )
    ]
)
```

---

## 🔗 Related Documentation

- [Deployment Guide](AGENT_ORCHESTRATOR_DEPLOYMENT.md)
- [API Reference](AGENT_ORCHESTRATOR_API.md)
- [Complete Documentation](AGENT_ORCHESTRATOR_COMPLETE.md)

---

**Päivitetty:** 2025-01-15
**Ylläpitäjä:** Converto Team



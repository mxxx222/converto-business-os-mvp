# 🧠 Converto™ AI Adapter Guide

## Overview

Converto Business OS uses a **provider-agnostic AI layer** that supports multiple LLM backends:

- **OpenAI** (cloud, default)
- **Ollama** (local, open-source)
- **Anthropic** (Claude, future)
- **Custom models** (future)

Switch providers with a single environment variable — **no code changes required**.

---

## 🎯 Why AI Adapter?

### 1. **Independence**
- Not locked into OpenAI pricing/terms
- Can switch to local models anytime
- Future-proof architecture

### 2. **Data Sovereignty**
- Process sensitive data locally (GDPR)
- No data leaves your infrastructure
- Perfect for Finnish accounting/legal data

### 3. **Cost Optimization**
- OpenAI: ~$0.50/1M tokens (gpt-4o-mini)
- Local: **FREE** (one-time hardware cost)
- Savings: 90-100% for high-volume users

### 4. **Brand**
- Market as "Finnish AI" or "Local Intelligence"
- No dependency on US cloud providers
- Competitive advantage

---

## 🚀 Quick Start

### 1. Configuration

Add to `.env`:

```env
# AI Provider (openai | ollama | anthropic)
AI_PROVIDER=openai

# OpenAI (default)
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini

# Ollama (local)
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=mistral

# Anthropic (future)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-haiku-20240307
```

### 2. Basic Usage

```python
from app.core.ai_adapter import AIAdapter

# Uses AI_PROVIDER from env
ai = AIAdapter()

# Simple prompt
response = ai.simple("Kerro kolme myynti-ideaa PK-yritykselle")

# Chat with history
response = ai.chat([
    {"role": "system", "content": "You are a VAT expert"},
    {"role": "user", "content": "What is the VAT rate for food in Finland?"}
])

# Structured (for JSON, classification)
response = ai.structured(
    prompt="Classify this receipt: 'K-Market 24.50€'",
    system="Return JSON: {category, confidence}",
    temperature=0.1
)
```

### 3. Provider Override

```python
# Force specific provider
ai_local = AIAdapter(provider="ollama")
ai_cloud = AIAdapter(provider="openai")
```

---

## 🖥️ Local Setup (Ollama)

### Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from https://ollama.com

### Start Ollama

```bash
ollama serve
```

Runs on `http://127.0.0.1:11434`

### Pull Models

```bash
# Recommended for Converto
ollama pull mistral      # 7B, general purpose
ollama pull llama3       # 8B, Meta's latest
ollama pull phi3         # 3.8B, lightweight, Microsoft

# Specialized
ollama pull codellama    # For code generation
ollama pull gemma        # Google's model
```

### Switch to Local

```bash
export AI_PROVIDER=ollama
export OLLAMA_MODEL=mistral

# Restart backend
uvicorn app.main:app --reload
```

---

## 🧪 Testing

### Test Provider

```bash
# Check configuration
curl http://localhost:8000/api/v1/ai/whoami

# Test OpenAI
curl http://localhost:8000/api/v1/ai/test/openai

# Test Ollama (local)
curl http://localhost:8000/api/v1/ai/test/ollama
```

### Chat Test

```bash
curl -X POST http://localhost:8000/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Kerro kolme ideaa suomalaiselle PK-yritykselle",
    "temperature": 0.2
  }'

# With specific provider
curl -X POST http://localhost:8000/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Summarize Finnish VAT rules",
    "provider": "ollama"
  }'
```

---

## 📊 Model Comparison

| Model | Provider | Size | Speed | Cost | Use Case |
|-------|----------|------|-------|------|----------|
| gpt-4o-mini | OpenAI | Cloud | Fast | $0.15/1M | Production (default) |
| gpt-4o | OpenAI | Cloud | Medium | $2.50/1M | Complex reasoning |
| mistral | Ollama | 7B | Fast | FREE | General purpose |
| llama3 | Ollama | 8B | Fast | FREE | General purpose |
| phi3 | Ollama | 3.8B | Very Fast | FREE | Lightweight tasks |
| codellama | Ollama | 7B | Fast | FREE | Code generation |

---

## 🎯 Use Cases in Converto

### 1. **OCR Classification**
```python
ai = AIAdapter()
result = ai.structured(
    prompt=f"Classify receipt: {ocr_text}",
    system="Return JSON: {vendor, category, vat_rate, confidence}",
    temperature=0.1
)
```

### 2. **Legal Interpretation**
```python
ai = AIAdapter()
summary = ai.chat([
    {"role": "system", "content": "Finnish legal expert"},
    {"role": "user", "content": f"Interpret Finlex rule: {rule_text}"}
])
```

### 3. **VAT Guidance**
```python
ai = AIAdapter()
advice = ai.simple(
    "What is the VAT treatment for digital services sold to EU companies?"
)
```

### 4. **Smart Reminders**
```python
ai = AIAdapter()
message = ai.structured(
    prompt=f"Generate reminder for VAT deadline: {deadline}",
    system="Be friendly, brief, actionable in Finnish",
    temperature=0.3
)
```

---

## 🐳 Docker Setup (Ollama)

### Docker Compose

```yaml
# docker-compose.yml
services:
  ollama:
    image: ollama/ollama:latest
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - ollama_models:/root/.ollama
    environment:
      - OLLAMA_NUM_PARALLEL=2

  converto-api:
    build: .
    depends_on:
      - ollama
    environment:
      - AI_PROVIDER=ollama
      - OLLAMA_HOST=http://ollama:11434
      - OLLAMA_MODEL=mistral

volumes:
  ollama_models:
```

### Pull Model in Container

```bash
docker exec -it <ollama_container> ollama pull mistral
```

---

## 💰 Cost Analysis

### Scenario: 1000 users, 100 AI calls/user/month

**OpenAI (gpt-4o-mini):**
- 100,000 calls × 500 tokens avg = 50M tokens
- Cost: 50M × $0.15/1M = **$7.50/month**

**Ollama (local):**
- Hardware: Mac mini M2 ($600 one-time)
- Electricity: ~5W × 24h × 30d × $0.15/kWh = **$0.54/month**
- **ROI: Pays off in 6 months**

**High volume (10k users):**
- OpenAI: **$750/month**
- Ollama: **$5/month** (electricity + better server)
- **Savings: $745/month = $8,940/year**

---

## 🔒 Security

### Data Privacy

**OpenAI:**
- Data sent to US cloud
- Subject to OpenAI ToS
- Cannot guarantee no training usage

**Ollama (local):**
- Data never leaves your infrastructure
- Full GDPR compliance
- Perfect for accounting/legal data

### Best Practices

1. **Use local for sensitive data** (receipts, legal docs)
2. **Use OpenAI for public queries** (general advice)
3. **Redact PII before sending** to cloud
4. **Log all AI calls** for audit trail

---

## 🚀 Production Deployment

### Render.com (OpenAI)

```yaml
# render.yaml
services:
  - type: web
    name: converto-api
    env: python
    envVars:
      - key: AI_PROVIDER
        value: openai
      - key: OPENAI_API_KEY
        sync: false  # Secret
      - key: OPENAI_MODEL
        value: gpt-4o-mini
```

### Self-Hosted (Ollama)

**Hardware recommendations:**
- **Minimum:** Raspberry Pi 5 (8GB) + mistral/phi3
- **Recommended:** Mac mini M2 + mistral/llama3
- **Production:** GPU server (RTX 4060+) + larger models

**Setup:**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull models
ollama pull mistral

# Start as service
sudo systemctl enable ollama
sudo systemctl start ollama

# Configure Converto
export AI_PROVIDER=ollama
export OLLAMA_HOST=http://localhost:11434
```

---

## 📈 Future Roadmap

### Phase 1 (Current)
- ✅ OpenAI support
- ✅ Ollama support
- ✅ Provider switching

### Phase 2 (Q1 2026)
- 🔄 Anthropic (Claude) support
- 🔄 Response caching
- 🔄 Rate limiting per provider

### Phase 3 (Q2 2026)
- 🔄 RAG (Retrieval-Augmented Generation)
- 🔄 Fine-tuned Finnish business model
- 🔄 Vector database (Chroma/FAISS)

### Phase 4 (Q3 2026)
- 🔄 Custom Converto™ model (fine-tuned)
- 🔄 Edge deployment (Raspberry Pi)
- 🔄 Model marketplace

---

## 🧑‍💻 Developer Tips

### Switch Provider in Code

```python
# Development: Use free local model
if os.getenv("ENV") == "development":
    ai = AIAdapter(provider="ollama")
else:
    ai = AIAdapter(provider="openai")
```

### Fallback Logic

```python
try:
    ai = AIAdapter(provider="ollama")
    response = ai.simple(prompt)
except Exception:
    # Fallback to OpenAI
    ai = AIAdapter(provider="openai")
    response = ai.simple(prompt)
```

### Batch Processing

```python
ai = AIAdapter()

results = []
for receipt in receipts:
    result = ai.simple(f"Classify: {receipt.text}")
    results.append(result)
```

---

## 📞 Support

**Issues:**
- OpenAI not working: Check `OPENAI_API_KEY`
- Ollama not reachable: Run `ollama serve`
- Slow responses: Reduce `max_tokens` or use faster model

**Contact:** support@converto.fi

---

**🧠 Converto™ - Your AI, Your Way**

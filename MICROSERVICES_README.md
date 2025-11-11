# 🏗️ **CONVERTO BUSINESS OS - MODULAR AI CORE**

## 🎯 **Mikropalveluarkkitehtuuri**

Converto Business OS on nyt refaktoroitu moderniksi mikropalveluarkkitehtuuriksi, joka erottaa OCR, Vision AI, VAT, Billing ja Auth itsenäisiksi FastAPI-palveluiksi. Kaikki palvelut kommunikoivat Event Bus:n kautta ja AI Gateway orkestroi eri tekoälymallien käyttöä dynaamisesti.

---

## 🏗️ **Arkitehtuuri**

### **Core Services:**

1. **🌐 API Gateway** (Port 8000)
   - Service discovery ja load balancing
   - Authentication ja rate limiting
   - Request routing ja proxy

2. **🤖 AI Gateway** (Port 8001)
   - Orkestroi OpenAI, Anthropic, Claude, Gemini
   - Kustannus- ja nopeusperusteinen routing
   - Model selection strategies

3. **📄 OCR Service** (Port 8002 autonomous
   - Tesseract OCR + preprocessing
   - Structured data extraction
   - Multi-language support (Finnish + English)

4. **👁️ Vision Service** (Port 8003)
   - OpenAI Vision API integration
   - Image analysis ja object detection
   - Receipt, device, face analysis

5. **💳 Billing Service** (Port 8004)
   - Stripe integration
   - Subscription management
   - Usage tracking ja limits

6. **🔐 Auth Service** (Port 8005)
   - JWT authentication
   - User management
   - Role-based access control

7. **📡 Event Bus** (Port 8006)
   - Redis Streams messaging
   - Event-driven architecture
   - Service communication

---

## 🚀 **Quick Start**

### **1. Käynnistä Mikropalvelut:**

```bash
# Käynnistä kaikki palvelut
./start_microservices.sh

# Tai manuaalisesti
docker-compose -f docker-compose.microservices.yml up --build -d
```

### **2. Tarkista Palvelut:**

```bash
# API Gateway health check
curl http://localhost:8000/health

# Kaikkien palveluiden status
curl http://localhost:8000/services/health

# Gateway statistics
curl http://localhost:8000/stats
```

### **3. API Documentation:**

- **API Gateway:** http://localhost:8000/docs
- **AI Gateway:** http://localhost:8001/docs
- **OCR Service:** http://localhost:8002/docs
- **Vision Service:** http://localhost:8003/docs
- **Billing Service:** http://localhost:8004/docs
- **Auth Service:** http://localhost:8005/docs

---

## 🔧 **Configuration**

### **Environment Variables:**

```bash
# Kopioi template
cp env.example .env

# Muokkaa .env tiedostoa
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_...
JWT_SECRET_KEY=your-secret-key
REDIS_HOST=localhost
REDIS_PORT=6379
```

### **Service Configuration:**

Jokainen palvelu voi konfiguroida itsenäisesti:
- **Rate limits** per service
- **Timeout** settings
- **Health check** intervals
- **Logging** levels

---

## 📊 **Monitoring & Observability**

### **Metrics:**
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3000 (admin/admin)

### **Logging:**
- **Elasticsearch:** http://localhost:9200
- **Kibana:** http://localhost:5601
- **Logstash:** Port 5044

### **Health Checks:**
```bash
# Kaikkien palveluiden health
curl http://localhost:8000/services/health

# Yksittäinen palvelu
curl http://localhost:8001/ai/health
curl http://localhost:8002/ocr/health
curl http://localhost:8003/vision/health
```

---

## 🔄 **Event-Driven Architecture**

### **Event Types:**

```python
# OCR Events
OCR_STARTED = "ocr.started"
OCR_COMPLETED = "ocr.completed"
OCR_FAILED = "ocr.failed"

# Vision Events
VISION_ANALYSIS_STARTED = "vision.analysis.started"
VISION_ANALYSIS_COMPLETED = "vision.analysis.completed"

# Billing Events
SUBSCRIPTION_CREATED = "billing.subscription.created"
PAYMENT_SUCCEEDED = "billing.payment.succeeded"
USAGE_RECORDED = "billing.usage.recorded"

# Auth Events
USER_REGISTERED = "auth.user.registered"
USER_LOGIN = "auth.user.login"
```

### **Event Publishing:**

```python
# Publish event
POST /events/publish
{
    "event_type": "ocr.completed",
    "source_service": "ocr-service",
    "tenant_id": "tenant_demo",
    "data": {"file_id": "123", "confidence": 0.95}
}
```

### **Event Consumption:**

```python
# Subscribe to events
POST /events/subscribe
{
    "stream_names": ["stream:ocr", "stream:vision"],
    "consumer_group": "billing-processor",
    "consumer_name": "billing-consumer-1"
}
```

---

## 🤖 **AI Gateway Features**

### **Model Selection Strategies:**

1. **Cost-based:** Valitse halvin malli
2. **Speed-based:** Valitse nopein malli
3. **Quality-based:** Valitse paras malli (GPT-4, Claude)
4. **Cost-Performance:** Tasapaino kustannuksen ja nopeuden välillä

### **Supported Models:**

- **OpenAI:** GPT-4, GPT-3.5, GPT-4 Vision
- **Anthropic:** Claude-3
- **Google:** Gemini Pro, Gemini Vision

### **Usage Example:**

```python
# AI Chat with automatic model selection
POST /ai/chat
{
    "prompt": "Analyze this scan",
    "model_preference": "openai-gpt-4",  # Optional
    "max_tokens": 1000,
    "temperature": 0.7,
    "images": ["base64_image_data"]
}
```

---

## 🔐 **Authentication Flow**

### **1. Register User:**
```bash
POST /auth/register
{
    "email": "user@example.com",
    "password": "secure_password",
    "full_name": "John Doe",
    "company_name": "Example Corp"
}
```

### **2. Login:**
```bash
POST /auth/login
{
    "email": "user@example.com",
    "password": "secure_password"
}
```

### **3. Use Token:**
```bash
# All subsequent requests
Authorization: Bearer <jwt_token>
```

---

## 💳 **Billing Integration**

### **Subscription Plans:**

- **Starter:** €29/month - Basic OCR, AI Chat
- **Professional:** €99/month - Advanced features, Analytics
- **Enterprise:** €299/month - Unlimited usage, API access

### **Usage Tracking:**

```python
# Record usage
POST /billing/usage
{
    "tenant_id": "tenant_demo",
    "feature": "ocr_scans_per_month",
    "quantity": 1
}
```

---

## 🛠️ **Development**

### **Local Development:**

```bash
# Start individual service
cd ai_gateway
python main.py

# Or with Docker
docker run -p 8001:8001 ai-gateway
```

### **Service Dependencies:**

```
API Gateway -> Auth Service (token validation)
API Gateway -> All Services (proxy)
AI Gateway -> OpenAI/Anthropic/Google APIs
OCR Service -> Tesseract
Vision Service -> OpenAI Vision
Billing Service -> Stripe API
Event Bus -> Redis Streams
```

### **Database Schema:**

- **Auth Service:** Users, Roles, Sessions
- **Billing Service:** Subscriptions, Payments, Usage
- **Event Bus:** Event streams, Consumer groups

---

## 🚀 **Production Deployment**

### **Docker Compose:**

```bash
# Production deployment
docker-compose -f docker-compose.microservices.yml up -d

# Scale services
docker-compose -f docker-compose.microservices.yml up -d --scale ocr-service=3
```

### **Environment Variables:**

```bash
# Production settings
ENVIRONMENT=production
REDIS_HOST=redis-cluster
POSTGRES_HOST=postgres-cluster
STRIPE_SECRET_KEY=sk_live_...
OPENAI_API_KEY=sk-...
```

---

## 📈 **Scaling & Performance**

### **Horizontal Scaling:**

```bash
# Scale OCR service
docker-compose -f docker-compose.microservices.yml up -d --scale ocr-service=5

# Scale Vision service
docker-compose -f docker-compose.microservices.yml up -d --scale vision-service=3
```

### **Load Balancing:**

- **API Gateway** acts as load balancer
- **Redis Streams** for message distribution
- **PostgreSQL** connection pooling

### **Caching:**

- **Redis** for session storage
- **API Gateway** response caching
- **Service-level** caching strategies

---

## 🔧 **Management Commands**

```bash
# View logs
docker-compose -f docker-compose.microservices.yml logs -f

# Restart service
docker-compose -f docker-compose.microservices.yml restart ocr-service

# Scale service
docker-compose -f docker-compose.microservices.yml up -d --scale ocr-service=3

# Stop all services
docker-compose -f docker-compose.microservices.yml down

# Clean up
docker-compose -f docker-compose.microservices.yml down -v
```

---

## 🎯 **Benefits of Microservices Architecture**

### **✅ Advantages:**

1. **🔧 Independent Scaling:** Scale each service based on demand
2. **🚀 Technology Flexibility:** Use best tool for each service
3. **🛠️ Independent Deployment:** Deploy services separately
4. **🔍 Better Monitoring:** Granular metrics per service
5. **🛡️ Fault Isolation:** One service failure doesn't affect others
6. **👥 Team Autonomy:** Different teams can work on different services

### **🎯 Business Benefits:**

1. **💰 Cost Optimization:** Pay only for what you use
2. **⚡ Performance:** Faster response times with specialized services
3. **🔄 Reliability:** Better fault tolerance and recovery
4. **📈 Scalability:** Scale individual components as needed
5. **🔒 Security:** Isolated security boundaries per service

---

## 🎊 **Converto Business OS on nyt täysin modulaarinen AI Core!**

**Mikropalveluarkkitehtuuri mahdollistaa:**
- **Skalautuvat** AI-palvelut
- **Event-driven** kommunikaation
- **Dynaamisen** AI mallien orkestroinnin
- **Itsenäisen** kehityksen ja deploymentin
- **Enterprise-grade** monitoring ja logging

**🚀 Valmis tuotantoon!**

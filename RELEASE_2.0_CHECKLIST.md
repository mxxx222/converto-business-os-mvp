# 🚀 Converto 2.0 - Release Checklist

Complete pre-launch checklist for production deployment.

---

## 📋 **1. Mitä 2.0 Toi (vs. 1.0)**

### **✅ Arkkitehtuuri**
- Modulaarinen runko (Selko Core + Plug-in Packs)
- ModuleRegistry + entitlements
- Feature flags -perusta

### **✅ OCR AI 2.0**
- Vision-pohjainen extractor (OpenAI)
- Esikatselu + hotkeys
- Automaatiot

### **✅ VAT "Regulatory-Truth"**
- Versioitu VAT-rate-taulu
- 25.5% FI (Vero.fi-lähde)
- Promote-workflow

### **✅ Billing Premium**
- Stripe checkout + webhooks
- Invoice history
- Customer portal

### **✅ Gamify + P2E**
- Pisteet, streaks, achievements
- Quest-järjestelmä
- Token-talous (off-chain)

### **✅ Smart Reminders**
- Multi-channel (WhatsApp/Slack/Email)
- Notion Calendar sync
- AI-ohjattu ajoitus

### **✅ Legal Compliance**
- Legal_rules -rakenne
- Finlex/Vero sync scaffolding

### **✅ Admin/Economy**
- Weights.yaml CRUD
- Trendit + KPI:t

### **✅ Mobile**
- PWA manifest
- iOS/Android Fastlane

### **✅ DevOps**
- render.yaml blueprint
- docker-compose
- Setup-skriptit

---

## ⚠️ **2. Puutteet & Riskit**

### **🔴 P0 - KRIITTISET**

#### **A. Regulatory Sync (VAT/Legal)**
- ❌ Ei retry-logiikkaa epäonnistuessa
- ❌ Ei checksum-verifointia
- ❌ Ei diff-auditointia
- ❌ Ei signed source-URL:ia

#### **B. Idempotenssi**
- ❌ Stripe webhooks: ei correlation_id
- ❌ OCR duplicate check puuttuu
- ❌ Reminders: ei deduplication

#### **C. Security**
- ❌ Rate limiting puuttuu
- ❌ JWT scope puuttuu (read:ocr, write:billing)
- ❌ Webhook signature verification puutteellinen
- ❌ Tenant isolation ei täysi

#### **D. Observability**
- ❌ Ei SLO/alertteja
- ❌ Ei error rate -metriikkaa
- ❌ Ei OCR success % -tracking
- ❌ Ei release rollback -prosessia

#### **E. Data Management**
- ❌ Alembic migrations puuttuu
- ❌ GDPR-audit trail puutteellinen
- ❌ PII-maskaus logeihin puuttuu
- ❌ Data retention policy puuttuu

#### **F. Testing**
- ❌ E2E-testit puuttuvat
- ❌ Load testing puuttuu
- ❌ Security audit puuttuu

---

### **🟡 P1 - VAHVA SUOSITUS**

- ⚠️ Admin kill-switch (hätäpysäytys)
- ⚠️ A11y pass (kontrastit, keyboard nav)
- ⚠️ Offline PWA (draft queue)
- ⚠️ Pricing in-app (entitlements UI)
- ⚠️ Store metadata (Privacy, Data Safety)

---

### **🟢 P2 - LYHYT JATKO (2-4vko)**

- 📝 Legal Dashboard (diff-view)
- 📝 Customs & Logistics (HS-classifier)
- 📝 Self-debug bot (CI commenter)

---

## 🔧 **3. Pakolliset Korjaukset (P0)**

### **A. Feature Flags**

**.env**
```bash
# Feature Flags (0=off, 1=on)
FEATURES_GAMIFY=1
FEATURES_REWARDS=0
FEATURES_P2E=0
FEATURES_LEGAL_SYNC=1
FEATURES_CUSTOMS=0
```

**app/core/features.py**
```python
import os

def is_enabled(feature: str) -> bool:
    return os.getenv(f"FEATURES_{feature.upper()}", "0") == "1"

def require_feature(feature: str):
    def decorator(func):
        def wrapper(*args, **kwargs):
            if not is_enabled(feature):
                raise HTTPException(403, f"Feature {feature} not enabled")
            return func(*args, **kwargs)
        return wrapper
    return decorator
```

---

### **B. Rate Limiting**

```bash
pip install slowapi
```

**app/main.py**
```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Per endpoint:
@router.post("/ocr/receipt")
@limiter.limit("10/minute")
async def scan_receipt(request: Request, ...):
    ...
```

---

### **C. Alembic Migrations**

```bash
pip install alembic
alembic init alembic
```

**alembic.ini** (edit)
```ini
sqlalchemy.url = postgresql://user:pass@localhost/converto
```

**alembic/env.py** (import models)
```python
from app.models import Base  # Import all models
target_metadata = Base.metadata
```

**Generate migrations**
```bash
alembic revision --autogenerate -m "2.0 schema: legal, gamify, reminders"
alembic upgrade head
```

---

### **D. Observability**

**app/api/monitoring.py**
```python
from fastapi import APIRouter
from datetime import datetime, timedelta

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

METRICS = {
    "ocr_success": 0,
    "ocr_fail": 0,
    "webhook_fail": 0,
    "reminder_sent": 0,
}

@router.get("/health")
def health():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0"
    }

@router.get("/metrics")
def metrics():
    total_ocr = METRICS["ocr_success"] + METRICS["ocr_fail"]
    success_rate = (METRICS["ocr_success"] / total_ocr * 100) if total_ocr > 0 else 0

    return {
        "ocr_success_rate": round(success_rate, 2),
        "ocr_total": total_ocr,
        "webhook_failures": METRICS["webhook_fail"],
        "reminders_sent": METRICS["reminder_sent"]
    }

def track(metric: str):
    METRICS[metric] = METRICS.get(metric, 0) + 1
```

---

### **E. GDPR Compliance**

**app/core/gdpr.py**
```python
from datetime import datetime, timedelta
import re

# Data retention periods
RETENTION = {
    "ocr_images": timedelta(days=365),      # 12 months
    "gamify_events": timedelta(days=730),   # 24 months
    "audit_logs": timedelta(days=2555),     # 7 years (legal)
}

def mask_pii(text: str) -> str:
    """Mask PII in logs"""
    # Email
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '***@***.***', text)
    # Phone
    text = re.sub(r'\+?\d{10,15}', '+***', text)
    # SSN (Finnish)
    text = re.sub(r'\d{6}[-+A]\d{3}[0-9A-Z]', '******-****', text)
    return text

async def cleanup_expired_data():
    """Cron job to delete expired data"""
    cutoff = datetime.utcnow() - RETENTION["ocr_images"]
    # Delete old OCR images
    # db.query(OCRResult).filter(OCRResult.created_at < cutoff).delete()
```

---

### **F. Idempotency**

**Stripe Webhook**
```python
@router.post("/webhook")
async def stripe_webhook(request: Request):
    event_id = event["id"]

    # Check if already processed
    if db.query(ProcessedEvent).filter_by(event_id=event_id).first():
        return {"status": "already_processed"}

    # Process event
    result = process_stripe_event(event)

    # Mark as processed
    db.add(ProcessedEvent(event_id=event_id, processed_at=datetime.utcnow()))
    db.commit()

    return {"status": "ok"}
```

---

## ✅ **4. Go/No-Go Checklist**

### **Infrastructure**
- [ ] Render production env configured
- [ ] Environment variables set (API keys, secrets)
- [ ] Database provisioned (PostgreSQL)
- [ ] Redis provisioned (optional, for caching)
- [ ] Custom domain configured (app.converto.fi, api.converto.fi)
- [ ] SSL certificates valid

### **Integrations**
- [ ] Stripe live keys configured
- [ ] Test payment successful
- [ ] Webhook endpoint verified
- [ ] Invoice webhook stores data correctly
- [ ] WhatsApp test message sent
- [ ] Slack test message sent
- [ ] Notion test event created

### **Data & Compliance**
- [ ] VAT 25.5% from regulatory source (not hardcoded)
- [ ] Fallback if Vero.fi fetch fails
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR data retention implemented
- [ ] PII masking in logs

### **Security**
- [ ] Rate limiting enabled
- [ ] JWT validation working
- [ ] Webhook signatures verified
- [ ] Tenant isolation tested
- [ ] No secrets in Git
- [ ] Security headers configured

### **Monitoring**
- [ ] /health endpoint responding
- [ ] /metrics endpoint tracking KPIs
- [ ] Error alerting configured (email/Slack)
- [ ] Uptime monitoring configured
- [ ] Log aggregation working

### **Testing**
- [ ] E2E: OCR → Preview → Save
- [ ] E2E: VAT calculation
- [ ] E2E: Stripe checkout → webhook
- [ ] E2E: Reminder → WhatsApp
- [ ] E2E: Reminder → Notion calendar
- [ ] Load test: 100 concurrent OCR requests
- [ ] Security scan passed

### **Documentation**
- [ ] README.md updated
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Deployment guide current
- [ ] Troubleshooting guide available
- [ ] Support contact published

### **User Experience**
- [ ] Feedback button visible
- [ ] Error messages in Finnish
- [ ] Loading states present
- [ ] Offline mode graceful
- [ ] Mobile responsive
- [ ] Accessibility pass (contrast, keyboard)

### **Backup & Recovery**
- [ ] Database backup configured (automated)
- [ ] Backup restoration tested
- [ ] S3/R2 for receipt images
- [ ] Rollback procedure documented

---

## 📦 **5. Pricing & Packaging**

### **Selko Core - 29€/kk**
- ✅ OCR kuittiskannaus (100/kk)
- ✅ ALV-laskenta (FI)
- ✅ Perusraportit (PDF)
- ✅ WhatsApp-muistutukset
- ✅ PWA mobile

### **Pro - 99€/kk**
- ✅ Kaikki Core
- ✅ AI-analytiikka
- ✅ Slack-integraatio
- ✅ Notion-integraatio
- ✅ Gamification
- ✅ Viikkoraportit

### **Enterprise - Räätälöity**
- ✅ Kaikki Pro
- ✅ Legal compliance (Finlex)
- ✅ Customs & Logistics
- ✅ Multi-tenant management
- ✅ SLA-takuu
- ✅ Dedicated support

---

## 🚦 **6. Launch Stages**

### **Stage 1: Internal Alpha (Week 1)**
- Deploy to staging
- Internal team testing
- Fix critical bugs
- Verify all integrations

### **Stage 2: Private Beta (Week 2-3)**
- Invite 5-10 pilot customers
- Collect feedback
- Monitor metrics closely
- Iterate quickly

### **Stage 3: Public Launch (Week 4)**
- Deploy to production
- Marketing announcement
- App Store submission
- Play Store submission
- Press release

### **Stage 4: Post-Launch (Week 5-8)**
- Monitor KPIs daily
- Respond to support tickets
- Fix bugs rapidly
- Plan 2.1 features

---

## 📊 **7. Success Metrics**

### **Technical KPIs**
- Uptime: >99.5%
- OCR success rate: >95%
- API response time: <500ms (p95)
- Error rate: <1%
- Webhook success: >99%

### **Business KPIs**
- Beta signups: 50+
- Paid conversions: 10+
- NPS score: 50+
- Customer retention (3mo): >80%
- Support tickets/user: <2

---

## 🔥 **8. Critical Actions Before Launch**

### **TODAY**
1. ✅ Implement feature flags
2. ✅ Add rate limiting
3. ✅ Setup Alembic migrations
4. ✅ Add /health and /metrics endpoints
5. ✅ Document environment variables

### **THIS WEEK**
1. ⏳ Run E2E test suite
2. ⏳ Security audit (automated scan)
3. ⏳ Load test (100 concurrent users)
4. ⏳ Implement idempotency keys
5. ⏳ GDPR compliance review

### **BEFORE LAUNCH**
1. ⏳ Regulatory sync with retry + checksum
2. ⏳ PII masking in logs
3. ⏳ Data retention automation
4. ⏳ Admin kill-switch
5. ⏳ Backup/restore tested

---

## 📞 **9. Support & Escalation**

### **Support Channels**
- Email: support@converto.fi (response: 4h)
- Chat: In-app (business hours)
- Emergency: +358 XX XXX XXXX (P0 only)

### **Escalation Levels**
- **P0 (Critical):** Service down, data loss → 15min response
- **P1 (High):** Feature broken, security issue → 2h response
- **P2 (Medium):** Minor bug, integration issue → 1 day response
- **P3 (Low):** Enhancement, question → 3 day response

---

## ✅ **10. Final Go/No-Go Decision**

**GO criteria:**
- ✅ All P0 items complete
- ✅ >90% of P1 items complete
- ✅ E2E tests passing
- ✅ Security scan passed
- ✅ 1 week of beta testing successful

**NO-GO triggers:**
- ❌ Any P0 item incomplete
- ❌ Critical security vulnerability
- ❌ Data loss risk identified
- ❌ Regulatory sync unreliable
- ❌ Major integration failing

---

## 🎉 **Bottom Line**

**Converto 2.0 on kokonaisuutena erittäin vahva.**

**Ennen julkaisua lukitse:**
1. Regulatory sync -luotettavuus
2. Feature flags
3. Idempotentit webhookit
4. Observability
5. GDPR-peruspaketti
6. E2E-testit

**Sen jälkeen go-live Renderiin on turvallinen.** 🚀

---

**Current Status: 🟡 YELLOW (Pre-launch prep needed)**
**Target Status: 🟢 GREEN (Production ready)**
**ETA: 1-2 weeks**

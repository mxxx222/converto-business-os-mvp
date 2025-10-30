# 📊 Converto™ Integration Matrix

Complete guide to subscription tiers, modules, and feature flags.

---

## 🎯 Subscription Tiers

| Tier | Price | Target Customer | Key Features |
|------|-------|-----------------|--------------|
| **Starter** | 19€/kk | Yksinyrittäjät | OCR (150/kk), AI basic, VAT, PWA |
| **Pro** | 39€/kk | Mikroyritykset | + Notion, WhatsApp, Reports, 3 users |
| **Business** | 79€/kk | PK-yritykset | + Bank sync, Logistics, Legal light, 10 users |
| **Enterprise** | 149€/kk | Tilitoimistot | + Legal ML, Audit, SSO, SLA, unlimited users |

---

## 🧩 Module Availability Matrix

| Module | Starter | Pro | Business | Enterprise | Add-on Price | Env Flags |
|--------|:-------:|:---:|:--------:|:----------:|-------------|-----------|
| **OCR Core** | ✅ | ✅ | ✅ | ✅ | Included | `OCR_ENABLED=true` |
| **AI Insights (Basic)** | ✅ | — | — | — | Included | `AI_MODE=basic` |
| **AI Insights (Pro)** | — | ✅ | ✅ | ✅ | Included | `AI_MODE=pro` |
| **VAT Calculator** | ✅ | ✅ | ✅ | ✅ | Included | `VAT_ENGINE=regulatory_truth` |
| **Gamification** | ✅ | ✅ | ✅ | ✅ | Included | `GAMIFY_ENABLED=true` |
| **PWA Offline** | ✅ | ✅ | ✅ | ✅ | Included | — |
| **Notion Sync** | — | ✅ | ✅ | ✅ | +9€/kk | `NOTION_SYNC_ENABLED=true` |
| **WhatsApp Notifications** | — | ✅ | ✅ | ✅ | +9€/kk | `WA_ENABLED=true` |
| **Reports Export** | — | ✅ | ✅ | ✅ | Included | `EXPORTS_ENABLED=true` |
| **Bank Sync (PSD2)** | — | — | ✅ | ✅ | +15€/kk | `BANK_SYNC_ENABLED=true` |
| **Logistics Tracking** | — | — | ✅ | ✅ | +19€/kk | `LOGISTICS_ENABLED=true` |
| **Stripe Billing Pro** | — | — | ✅ | ✅ | +9€/kk | `BILLING_PRO=true` |
| **Legal Compliance (Light)** | — | — | ✅ | — | +29€/kk | `LEGAL_LIGHT=true` |
| **Admin Console** | — | — | ✅ | ✅ | Included | `ADMIN_CONSOLE=true` |
| **Legal ML Engine** | — | — | — | ✅ | Included | `LEGAL_ML=true` |
| **Audit Trail** | — | — | — | ✅ | Included | `AUDIT_ENABLED=true` |
| **SSO (SAML/OIDC)** | — | — | — | ✅ | Included | `SSO_SAML=true` |
| **Priority SLA (4h)** | — | — | — | ✅ | Included | `SLA_PRIORITY=true` |

---

## 💰 Cost Structure & Margins

### Per-Tier Analysis

| Tier | Price | Infrastructure | API Costs | Total Cost | Margin | Margin % |
|------|-------|----------------|-----------|------------|--------|----------|
| **Starter** | 19€ | 5€ | 3€ | 8€ | **11€** | 58% |
| **Pro** | 39€ | 7€ | 8€ | 15€ | **24€** | 62% |
| **Business** | 79€ | 10€ | 22€ | 32€ | **47€** | 59% |
| **Enterprise** | 149€ | 15€ | 35€ | 50€ | **99€** | 66% |

### API Cost Breakdown

| Module | Monthly Cost | Notes |
|--------|--------------|-------|
| OpenAI (Basic) | 2-3€ | gpt-4o-mini, ~150 scans |
| OpenAI (Pro) | 5-8€ | gpt-4o, ~500 scans |
| Notion API | 0€ | Free (rate limits apply) |
| WhatsApp (Twilio) | 1-3€ | ~100 messages/month |
| Nordigen (PSD2) | 0-5€ | Free tier or 0.1€/request |
| EasyPost | 5-7€ | ~50 shipments/month |
| Finlex/Vero | 0€ | Free public APIs |

---

## 📦 Bundled Offers (Suites)

### Power Suite - 39€/kk
**Save 8€** (regular: 47€)

Includes:
- ✅ Notion Sync (9€)
- ✅ WhatsApp Notifications (9€)
- ✅ Reports Export (29€)

**Best for:** Entrepreneurs who want notifications + reporting

---

### Logistics Bundle - 59€/kk
**Save 10€** (regular: 69€)

Includes:
- ✅ Bank Sync (15€)
- ✅ Logistics Tracking (19€)
- ✅ Stripe Billing Pro (9€)

**Best for:** E-commerce and retail businesses

---

## 🔄 Stripe → Entitlements Flow

### 1. Customer Subscribes
```
Customer clicks "Choose Pro" → Stripe Checkout Session
```

### 2. Webhook Triggered
```
Stripe Event: checkout.session.completed
Product ID: price_pro (maps to "Pro" tier)
```

### 3. Update Entitlements
```python
# In webhook handler
tenant_id = session.metadata["tenant_id"]
tier = "pro"  # from product mapping

# Update database
update_tenant_entitlements(tenant_id, tier)

# Set environment flags
set_tenant_flags(tenant_id, {
    "NOTION_SYNC_ENABLED": "true",
    "WA_ENABLED": "true",
    "EXPORTS_ENABLED": "true",
    # ... all Pro tier flags
})
```

### 4. Frontend Refresh
```typescript
// Frontend re-fetches modules
const { data } = useSWR("/api/v1/modules?tenant=" + tenantId);

// Shows only enabled modules
{data.modules.map(module => (
  module.enabled && <ModuleCard key={module.id} {...module} />
))}
```

---

## 🎯 ROI Calculator (Customer Value)

### Notion Sync
```
Time saved: 2 hours/month
Hourly rate: 30€
Monthly value: 60€
Module cost: 9€
ROI: 600% (60€ / 9€ × 100 - 100)
```

### Bank Sync
```
Time saved: 4 hours/month
Hourly rate: 30€
Monthly value: 120€
Module cost: 15€
ROI: 700%
```

### WhatsApp Notifications
```
Retention improvement: +20%
Churn reduction value: 50€/month
Module cost: 9€
ROI: 456%
```

---

## 🛠️ Implementation Guide

### 1. Create Stripe Products

```bash
# Create products in Stripe Dashboard or via API
stripe products create --name "Converto Pro" --description "Pro tier subscription"
stripe prices create --product <PRODUCT_ID> --currency eur --unit-amount 3900 --recurring-interval month
```

### 2. Map Products to Modules

```python
# app/core/stripe_product_map.py
PRODUCT_MAP = {
    "price_starter_xxx": "starter",
    "price_pro_xxx": "pro",
    "price_business_xxx": "business",
    "price_enterprise_xxx": "enterprise",
    "price_notion_addon": "notion_sync",
    "price_whatsapp_addon": "whatsapp_notify",
    # ... etc
}
```

### 3. Webhook Handler

```python
@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    event = stripe.Webhook.construct_event(
        await request.body(),
        request.headers.get("stripe-signature"),
        os.getenv("STRIPE_WEBHOOK_SECRET")
    )

    if event.type == "checkout.session.completed":
        session = event.data.object
        tenant_id = session.metadata["tenant_id"]
        price_id = session.line_items.data[0].price.id

        # Map to tier/module
        tier = PRODUCT_MAP.get(price_id)

        # Activate features
        activate_tier_features(tenant_id, tier)

    return {"status": "ok"}
```

### 4. Feature Flag Check

```python
# In API endpoint
from app.core.features import require_feature

@router.post("/notion/sync")
@require_feature("notion_sync")
async def sync_to_notion(...):
    # Only accessible if NOTION_SYNC_ENABLED=true
    ...
```

---

## 📈 Upsell Strategy

### Dashboard ROI Cards

Show personalized recommendations:

```
┌─────────────────────────────────────┐
│ 💡 Unlock Notion Sync               │
│                                     │
│ Saves 2h/month on reporting         │
│ Value: 60€/mo · Cost: 9€/mo         │
│                                     │
│ ROI: 600%                           │
│                                     │
│ [ Activate for 9€/month → ]        │
└─────────────────────────────────────┘
```

### Usage-Based Triggers

```python
# If user exceeds limits
if ocr_scans_this_month > tier_limit:
    show_upgrade_suggestion("You're using OCR heavily! Upgrade to Pro for 500 scans/month")

# If user accesses disabled feature
if clicked_notion_button and not notion_enabled:
    show_modal("Unlock Notion Sync for 9€/month. Save 2h on reporting!")
```

---

## 🔒 Security & Compliance

### Entitlements Storage

```sql
CREATE TABLE tenant_entitlements (
    tenant_id UUID PRIMARY KEY,
    tier VARCHAR(50),
    enabled_modules JSONB,
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Feature Flag Validation

```python
def check_entitlement(tenant_id: str, module: str) -> bool:
    entitlements = get_tenant_entitlements(tenant_id)
    return module in entitlements.get("enabled_modules", [])
```

---

## 📊 Analytics & Metrics

### Track Per Module

- **Activation rate:** % of users who enable each module
- **Retention impact:** Churn rate with vs without module
- **Usage frequency:** API calls per module
- **ROI delivered:** Time/money saved (customer surveys)

### Example Queries

```sql
-- Most popular add-ons
SELECT module, COUNT(*) as activations
FROM tenant_entitlements
WHERE enabled_modules @> '[{"module": "notion_sync"}]'
GROUP BY module
ORDER BY activations DESC;

-- Revenue by tier
SELECT tier, COUNT(*) * tier_price as mrr
FROM tenant_entitlements
GROUP BY tier;
```

---

## 🚀 Quick Start

### 1. Load Pricing Config

```python
# app/core/pricing.py
import yaml

with open("config/pricing_tiers.yaml") as f:
    PRICING = yaml.safe_load(f)

def get_tier_price(tier_name: str) -> int:
    return PRICING["tiers"][tier_name]["price"]

def get_tier_modules(tier_name: str) -> list:
    return PRICING["tiers"][tier_name]["includes"]
```

### 2. Create Stripe Products

```bash
# Run once to sync with Stripe
python scripts/sync_stripe_products.py
```

### 3. Test Locally

```bash
# Check pricing
curl http://localhost:8000/api/v1/pricing/tiers

# Check modules for tier
curl http://localhost:8000/api/v1/pricing/modules?tier=pro
```

---

## 💡 Best Practices

1. **Start Simple:** Launch with 2-3 tiers, add modules later
2. **Bundle Smartly:** Create suites with 10-20% discount
3. **Show ROI:** Always display time/money saved
4. **Usage-Based Upsells:** Trigger at 80% of limit
5. **Annual Discounts:** Offer 2 months free for annual billing
6. **Grandfathering:** Existing customers keep prices (for loyalty)

---

## 📞 Support

**Questions about pricing or modules?**
- Email: sales@converto.fi
- Docs: https://docs.converto.fi/pricing

---

**✅ Ready to maximize revenue with smart pricing!**

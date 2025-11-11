# Play-to-Earn (P2E) — Converto Tokens (CT)

## Overview
Converto Business OS integrates a **Play-to-Earn (P2E)** economy powered by **Converto Tokens (CT)**, an off-chain token system that rewards users for real business actions.

### Key Features
- 🎮 **Earn tokens** for completing tasks: OCR uploads, timely invoice payments, VAT filings, weekly goals
- 💰 **Redeem tokens** for sponsored rewards, premium features, or gift cards
- 🛡️ **Abuse protection**: Daily mint/burn limits, idempotent webhook handling
- 🔗 **On-chain ready**: Optional blockchain integration (off-chain remains source of truth)

---

## Architecture

### Backend (FastAPI)
- **Models**: `P2EWallet`, `P2ETokenLedger`, `P2EQuest`
- **Service**: `mint()`, `burn()`, `list_quests()`, daily limits
- **API Routes**:
  - `GET /api/v1/p2e/wallet?t=<tenant>&u=<user>` → Get wallet balance
  - `POST /api/v1/p2e/mint` → Mint tokens (requires `tenant_id`, `user_id`, `amount`, `reason`, optional `ref_id`)
  - `POST /api/v1/p2e/redeem` → Burn tokens for rewards
  - `GET /api/v1/p2e/quests?tenant_id=<tenant>` → List active quests

### Frontend (Next.js)
- **WalletWidget**: Displays CT balance
- **QuestList**: Shows available quests and rewards
- **Integration**: Dashboard sidebar with Gamify and P2E widgets

---

## Token Economics

### Mint Sources (Examples)
| Event | Tokens | Reason |
|-------|--------|--------|
| OCR success | +5 CT | `ocr_success` |
| Invoice paid on time | +10 CT | `invoice_on_time` |
| VAT filed on time | +20 CT | `vat_on_time` |
| Weekly goal (5 receipts) | +25 CT | `weekly_ocr5` |
| AI recommendation accepted | +5 CT | `ai_reco_accepted` |

### Burn Sinks (Examples)
| Action | Tokens | Reason |
|--------|--------|--------|
| Redeem gift card | Variable | `redeem:<reward_id>` |
| Unlock premium feature | Variable | `feature_unlock` |
| Lottery ticket | -5 CT | `lottery_ticket` |

### Guardrails
- **Daily limits**: Max 500 CT minted/burned per user per day (configurable via `.env`)
- **Idempotency**: `ref_id` prevents duplicate mints from webhooks
- **Balance checks**: Cannot burn more than current balance

---

## Configuration

### Environment Variables
```env
P2E_ENABLED=true
P2E_ONCHAIN_ENABLED=false
P2E_DAILY_MINT_LIMIT=500
P2E_DAILY_REDEEM_LIMIT=500
```

---

## Setup

### 1. Seed Demo Quests
```bash
python scripts/seed_p2e.py
```

### 2. Test API
```bash
# Get wallet balance
curl "http://127.0.0.1:8000/api/v1/p2e/wallet?t=demo&u=user_demo"

# Mint tokens
curl -X POST http://127.0.0.1:8000/api/v1/p2e/mint \
  -H "Content-Type: application/json" \
  -d '{"tenant_id":"demo","user_id":"user_demo","amount":10,"reason":"test_mint"}'

# List quests
curl "http://127.0.0.1:8000/api/v1/p2e/quests?tenant_id=demo"
```

---

## Integration Points

### OCR Success → Mint Tokens
When an OCR upload succeeds, `+5 CT` is automatically minted:
```python
# In shared_core/modules/ocr/router.py
p2e_mint(db, tenant_id, "user_demo", 5, "ocr_success", ref_id=str(rec.id))
```

### Billing Webhook → Mint Tokens
When Stripe invoice is paid on time:
```python
# In app/api/billing/webhook.py (TODO)
if event["type"] == "invoice.paid":
    p2e_mint(db, tenant_id, user_id, 10, "invoice_on_time", ref_id=invoice_id)
```

---

## Roadmap

### MVP (Current)
- ✅ Off-chain wallet & ledger
- ✅ Mint/burn with daily limits
- ✅ Quest system
- ✅ Frontend widgets

### Future
- 🔜 Rewards catalog + redemption UI
- 🔜 Stripe webhook integration
- 🔜 Admin economy tuning panel
- 🔜 On-chain bridge (optional, opt-in)
- 🔜 Sponsor partnerships (gift cards, premium unlocks)

---

## Security & Best Practices
- **Off-chain first**: All token operations happen in the database (fast, secure, auditable)
- **Idempotent webhooks**: Use `ref_id` to prevent duplicate mints
- **Rate limiting**: Daily caps prevent abuse
- **Audit trail**: `P2ETokenLedger` records every transaction
- **On-chain optional**: Only enable blockchain bridge when needed (off-chain remains source of truth)

---

**Questions?** See `shared_core/modules/p2e/` for implementation details.

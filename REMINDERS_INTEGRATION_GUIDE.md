# 🔔 Smart Reminders Integration Guide

Complete guide for setting up Notion Calendar and WhatsApp notifications.

---

## 🎯 Overview

Smart Reminders automatically notify you about:
- 📸 **Missing receipts** - Weekly reminder to scan pending receipts
- 🧾 **VAT filing** - Deadline reminders for Finnish VAT reporting
- 💳 **Invoice due dates** - Upcoming payment reminders

Notifications can be sent via:
- 💬 **WhatsApp** (Meta or Twilio)
- 📧 **Email** (SendGrid/SES)
- 💬 **Slack** (Webhook)
- 📱 **Signal** (signal-cli)

Events are automatically added to:
- 📅 **Notion Calendar** (if configured)
- 📆 **Google Calendar** (coming soon)

---

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
pip install notion-client requests python-dotenv
```

### 2. Configure Environment Variables

Add to `.env`:

```bash
# Notion Calendar
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_CALENDAR_DB_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# WhatsApp - Choose ONE provider:

# Option A: Meta WhatsApp Cloud API (Recommended)
WA_PROVIDER=meta
WA_META_TOKEN=EAAG...
WA_META_PHONE_ID=123456789012345
WA_TO_PHONE=+358XXXXXXXXX

# Option B: Twilio WhatsApp
# WA_PROVIDER=twilio
# TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# TWILIO_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# WA_TWILIO_FROM=whatsapp:+14155238886
# WA_TO_PHONE=whatsapp:+358XXXXXXXXX

# Slack (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

---

## 📅 Notion Calendar Setup

### Step 1: Create Database

1. Open Notion
2. Create new database: `/database`
3. Choose "Calendar" view
4. Name it: "Converto Reminders"

### Step 2: Add Required Properties

Your database must have these properties:

| Property | Type | Required |
|----------|------|----------|
| **Name** | Title | ✅ Yes |
| **Date** | Date | ✅ Yes |
| **Status** | Select | ✅ Yes |
| **Notes** | Rich text | ⚪ Optional |

**Status options:**
- Open
- Done
- Cancelled

### Step 3: Create Integration

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name: `Converto Business OS`
4. Select workspace
5. Capabilities: Read content, Insert content, Update content
6. Copy **Internal Integration Token** (starts with `secret_`)

### Step 4: Share Database

1. Open your "Converto Reminders" database
2. Click "..." menu → "Add connections"
3. Select "Converto Business OS" integration
4. Click "Confirm"

### Step 5: Get Database ID

1. Open database in Notion
2. Copy URL: `https://notion.so/workspace/{DATABASE_ID}?v=...`
3. Extract `DATABASE_ID` (32-character hex string)
4. Add to `.env` as `NOTION_CALENDAR_DB_ID`

---

## 💬 WhatsApp Setup

### Option A: Meta WhatsApp Cloud API (Recommended)

#### 1. Create Meta Developer Account

1. Go to https://developers.facebook.com
2. Sign up or log in
3. Create new app → "Business" type

#### 2. Add WhatsApp Product

1. In app dashboard, click "Add Product"
2. Select "WhatsApp"
3. Click "Set up"

#### 3. Get Credentials

1. Go to "WhatsApp" → "Getting Started"
2. Copy **Temporary Access Token** (valid 24h)
3. Copy **Phone Number ID**
4. For production: Generate permanent token in "Settings" → "System Users"

#### 4. Add Recipient

1. In "Getting Started", add your phone number
2. Verify with code sent via WhatsApp
3. Now you can receive messages

#### 5. Configure .env

```bash
WA_PROVIDER=meta
WA_META_TOKEN=EAAG... # Your access token
WA_META_PHONE_ID=123456789012345 # Your phone number ID
WA_TO_PHONE=+358XXXXXXXXX # Your phone (international format)
```

#### 6. Test

```bash
curl -X POST http://localhost:8000/api/v1/reminders/test/whatsapp
```

---

### Option B: Twilio WhatsApp

#### 1. Create Twilio Account

1. Go to https://www.twilio.com/try-twilio
2. Sign up (free trial includes $15 credit)
3. Verify your phone number

#### 2. Activate WhatsApp Sandbox

1. Go to "Messaging" → "Try it out" → "Send a WhatsApp message"
2. Follow instructions to join sandbox
3. Send code to Twilio WhatsApp number

#### 3. Get Credentials

1. Go to "Account" → "Account Info"
2. Copy **Account SID**
3. Copy **Auth Token**
4. WhatsApp sandbox number: `whatsapp:+14155238886`

#### 4. Configure .env

```bash
WA_PROVIDER=twilio
TWILIO_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WA_TWILIO_FROM=whatsapp:+14155238886
WA_TO_PHONE=whatsapp:+358XXXXXXXXX
```

#### 5. Test

```bash
curl -X POST http://localhost:8000/api/v1/reminders/test/whatsapp
```

---

## 🔧 Create Reminder Rules

### Missing Receipts (Daily @ 8 AM)

```bash
curl -X POST http://localhost:8000/api/v1/reminders/rules \
  -H "Content-Type: application/json" \
  -d '{
    "id": "r_missing_receipts",
    "tenant_id": "tenant_demo",
    "type": "missing_receipts",
    "params": {"threshold": 3},
    "channel": "whatsapp",
    "schedule": "daily@08:00",
    "active": true,
    "ai_hint": "User responds best between 8-10 AM"
  }'
```

### VAT Filing Reminder

```bash
curl -X POST http://localhost:8000/api/v1/reminders/rules \
  -H "Content-Type: application/json" \
  -d '{
    "id": "r_vat_fi",
    "tenant_id": "tenant_demo",
    "type": "vat_filing",
    "params": {"country": "FI"},
    "channel": "slack",
    "schedule": "daily@08:00",
    "active": true
  }'
```

### Invoice Due Dates

```bash
curl -X POST http://localhost:8000/api/v1/reminders/rules \
  -H "Content-Type: application/json" \
  -d '{
    "id": "r_invoice_due",
    "tenant_id": "tenant_demo",
    "type": "invoice_due",
    "params": {"days_ahead": 7},
    "channel": "email",
    "schedule": "daily@08:00",
    "active": true
  }'
```

---

## 🧪 Testing

### Manual Trigger

```bash
# Run all due reminders now
curl -X POST http://localhost:8000/api/v1/reminders/run
```

### Test WhatsApp

```bash
curl -X POST http://localhost:8000/api/v1/reminders/test/whatsapp
```

**Expected:** WhatsApp message received on configured phone

### Test Notion

```bash
curl -X POST http://localhost:8000/api/v1/reminders/test/notion
```

**Expected:** New event appears in Notion calendar (5 minutes from now)

### View Logs

```bash
curl http://localhost:8000/api/v1/reminders/logs
```

---

## 📊 Monitoring

### Check Scheduled Jobs

```bash
curl http://localhost:8000/api/v1/reminders/jobs
```

**Response:**
```json
[
  {
    "rule_id": "r_missing_receipts",
    "rule_type": "missing_receipts",
    "next_due": "2025-10-13T08:00:00",
    "last_run": "2025-10-12T08:00:00",
    "run_count": 5,
    "active": true
  }
]
```

### View Execution Logs

```bash
curl http://localhost:8000/api/v1/reminders/logs?limit=10
```

---

## 🎨 Frontend Settings

Navigate to: **Settings → Notifications**

Or directly: `http://localhost:3000/settings/notifications`

Features:
- Configure Notion Calendar database ID
- Test WhatsApp integration
- Test Notion integration
- View setup instructions

---

## 🔒 Security Best Practices

### Protect API Keys

- ✅ Never commit `.env` to Git
- ✅ Use environment variables in production
- ✅ Rotate tokens regularly
- ✅ Use least-privilege access (read-only where possible)

### WhatsApp Security

- ✅ Verify sender phone number
- ✅ Use permanent tokens (not temporary)
- ✅ Enable 2FA on Meta/Twilio account
- ✅ Monitor usage for unusual activity

### Notion Security

- ✅ Only share necessary databases with integration
- ✅ Use internal integrations (not public)
- ✅ Review integration permissions regularly
- ✅ Revoke unused integrations

---

## 🐛 Troubleshooting

### WhatsApp: Message not received

**Check:**
1. Phone number format: `+358XXXXXXXXX` (international)
2. Recipient joined sandbox (Twilio) or verified (Meta)
3. Access token not expired (Meta temporary tokens expire in 24h)
4. Account has credit (Twilio)

**Solution:**
```bash
# Check logs
docker-compose logs backend | grep WhatsApp

# Verify .env variables
echo $WA_PROVIDER
echo $WA_TO_PHONE
```

### Notion: Event not created

**Check:**
1. Database ID is correct (32 chars)
2. Integration has access to database
3. Required properties exist (Name, Date, Status)
4. API key is valid

**Solution:**
```bash
# Test connection
curl -X POST http://localhost:8000/api/v1/reminders/test/notion

# Check error message
docker-compose logs backend | grep Notion
```

### Reminders: Not running

**Check:**
1. Scheduler is running (check logs on startup)
2. Rules are active
3. Schedule time has passed

**Solution:**
```bash
# Check jobs
curl http://localhost:8000/api/v1/reminders/jobs

# Manual trigger
curl -X POST http://localhost:8000/api/v1/reminders/run

# Check logs
curl http://localhost:8000/api/v1/reminders/logs
```

---

## 🚀 Advanced Features (Coming Soon)

- [ ] **Snooze via reply** - Reply "snooze 1h" to WhatsApp
- [ ] **Interactive buttons** - Slack buttons for quick actions
- [ ] **Google Calendar sync** - Two-way sync with Google Calendar
- [ ] **Smart scheduling** - AI learns best notification times
- [ ] **Batch notifications** - Combine multiple reminders
- [ ] **Custom templates** - Personalize message format
- [ ] **Multi-language** - Support for English, Swedish, etc.

---

## 📞 Support

**Questions about integrations?**
- Email: support@converto.fi
- Docs: https://docs.converto.fi/reminders

**External Resources:**
- Meta WhatsApp: https://developers.facebook.com/docs/whatsapp
- Twilio WhatsApp: https://www.twilio.com/docs/whatsapp
- Notion API: https://developers.notion.com/

---

**✅ Ready to never miss a deadline again!**

# 📓 Notion Integration Guide

Complete guide for integrating Converto Business OS with Notion for automatic receipt logging and calendar events.

---

## 🎯 Overview

The Notion integration automatically:
- **Logs receipts** to a Notion database after OCR processing
- **Creates calendar events** for VAT reminders and deadlines
- **Syncs business data** for easy team collaboration

### Benefits
- ✅ **Automatic bookkeeping** - Every scanned receipt → Notion table
- ✅ **Centralized tracking** - All expenses in one Notion view
- ✅ **Team collaboration** - Accountant can review and approve
- ✅ **No manual entry** - Save 2-3 hours per week

---

## 🚀 Quick Setup (5 minutes)

### 1. Create Notion Integration
1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name: `Converto Business OS`
4. Select workspace
5. Copy **Internal Integration Token** (starts with `secret_`)

### 2. Create Notion Databases

#### Receipts Database
Create a new database with these properties:

| Property | Type | Description |
|----------|------|-------------|
| **Vendor** | Title | Merchant name |
| **Date** | Date | Receipt date |
| **Amount** | Number | Total amount (EUR) |
| **Category** | Select | Toimisto, Matkat, Materiaalit, Muu |
| **Status** | Select | New, Reviewed, Exported |
| **Image** | Files | Receipt image |

#### Events/Calendar Database
Create a new database with these properties:

| Property | Type | Description |
|----------|------|-------------|
| **Title** | Title | Event name |
| **Start** | Date | Start date/time |
| **Status** | Select | Planned, Done, Cancelled |
| **Location** | Rich text | Event location |
| **Notes** | Rich text | Event description |

### 3. Share Databases with Integration
1. Open each database
2. Click "..." menu → "Add connections"
3. Select "Converto Business OS" integration
4. Repeat for both databases

### 4. Get Database IDs
1. Open database in Notion
2. Copy URL: `https://notion.so/workspace/{DATABASE_ID}?v=...`
3. Extract `DATABASE_ID` (32-character hex string)

### 5. Configure Environment Variables
Add to `.env`:

```bash
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_RECEIPTS_DB=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_EVENTS_DB=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

### 6. Restart Backend
```bash
# Stop backend
# Update .env
# Start backend
uvicorn app.main:app --reload
```

---

## 🧪 Test Integration

### Test Connection
```bash
curl http://127.0.0.1:8000/api/v1/notion/health
```

**Expected response:**
```json
{
  "status": "ok",
  "connected": true,
  "message": "Notion API connected"
}
```

### Test Receipt Creation
```bash
curl -X POST http://127.0.0.1:8000/api/v1/notion/receipts \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-10-12",
    "vendor": "K-Market",
    "amount": 12.34,
    "category": "Toimisto",
    "image_url": "https://example.com/receipt.jpg",
    "status": "New"
  }'
```

**Expected response:**
```json
{
  "status": "ok",
  "notion_page_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "url": "https://notion.so/...",
  "message": "Receipt added to Notion"
}
```

### Test Calendar Event
```bash
curl -X POST http://127.0.0.1:8000/api/v1/notion/calendar/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "ALV-kooste",
    "start": "2025-10-15T09:00:00+03:00",
    "end": "2025-10-15T10:00:00+03:00",
    "location": "HQ",
    "notes": "Tarkista kuukauden kuitit",
    "status": "Planned"
  }'
```

---

## 🔄 Automatic OCR → Notion Flow

### How It Works
1. User scans receipt via OCR
2. Backend processes image with OpenAI Vision
3. Extracted data is saved to database
4. **Notion hook** automatically pushes receipt to Notion
5. Receipt appears in Notion database instantly

### Enable Auto-Push (Backend)

Edit `app/modules/ocr/service.py`:

```python
from app.integrations.notion_service import push_receipt

def on_ocr_success(payload):
    """Called after successful OCR processing"""
    try:
        push_receipt({
            "date": payload["date"],
            "vendor": payload["vendor"],
            "amount": payload["total"],
            "category": payload.get("vat_class", "Muu"),
            "image_url": payload.get("image_url"),
            "status": "New"
        })
    except Exception as e:
        print(f"Failed to push to Notion: {e}")
        # Don't fail OCR if Notion push fails
```

### Frontend Toggle (Optional)

Add a checkbox to OCR form:

```tsx
// frontend/app/selko/ocr/page.tsx
const [pushToNotion, setPushToNotion] = useState(true);

<label>
  <input
    type="checkbox"
    checked={pushToNotion}
    onChange={(e) => setPushToNotion(e.target.checked)}
  />
  Lähetä myös Notioniin
</label>
```

---

## 📅 Automatic VAT Reminders

### Monthly VAT Reminder
Create a reminder on the 12th of each month:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/notion/calendar/vat-reminder \
  -H "Content-Type: application/json" \
  -d '{"year": 2025, "month": 10}'
```

### Cron Job (APScheduler)

Add to `app/jobs/scheduler.py`:

```python
from app.integrations.notion_service import create_monthly_vat_reminder
from datetime import datetime

def schedule_vat_reminders():
    """Create VAT reminders for next 3 months"""
    today = datetime.now()
    for i in range(3):
        month = (today.month + i) % 12 + 1
        year = today.year + (today.month + i) // 12
        try:
            create_monthly_vat_reminder(year, month)
        except Exception as e:
            print(f"Failed to create VAT reminder: {e}")

# Run monthly
scheduler.add_job(schedule_vat_reminders, "cron", day=1, hour=9)
```

---

## 🎨 Notion Database Views

### Receipts Database Views

#### 1. **All Receipts** (Table)
- Default view
- Shows all receipts
- Sort by Date (descending)

#### 2. **This Month** (Table)
- Filter: Date is within this month
- Group by: Category
- Sum: Amount

#### 3. **Needs Review** (Board)
- Filter: Status = "New"
- Group by: Category
- Sort by: Date

#### 4. **By Vendor** (Table)
- Group by: Vendor
- Sum: Amount
- Sort by: Amount (descending)

### Calendar Database Views

#### 1. **Calendar** (Calendar)
- Show: Start date
- Color by: Status

#### 2. **Upcoming** (Table)
- Filter: Start is after today
- Sort by: Start (ascending)

#### 3. **This Week** (Timeline)
- Filter: Start is within this week
- Group by: Status

---

## 🧩 Advanced Features

### 1. Formula: VAT Calculation
Add a formula property to Receipts database:

**Property Name:** `VAT Amount`
**Formula:**
```
prop("Amount") * 0.24 / 1.24
```

### 2. Relation: Link to Projects
1. Create a "Projects" database
2. Add "Project" relation property to Receipts
3. Tag receipts with project names
4. Create rollup to sum expenses per project

### 3. Rollup: Monthly Summary
Add a rollup property:

**Property Name:** `Monthly Total`
**Relation:** (self)
**Property:** Amount
**Calculate:** Sum
**Filter:** Date is within this month

### 4. Button: Mark as Reviewed
Add a button property:

**Property Name:** `Mark Reviewed`
**Action:** Edit property → Status → "Reviewed"

---

## 🔒 Security Best Practices

### 1. Restrict Integration Access
- Only share necessary databases with integration
- Don't share entire workspace
- Review integration permissions regularly

### 2. Secure API Key
- Never commit `NOTION_API_KEY` to Git
- Use environment variables
- Rotate key if compromised

### 3. Limit User Access
- Use Notion's permission system
- Give accountant "Can edit" access
- Give team "Can view" access

### 4. Audit Trail
- Notion tracks all changes
- Review page history for suspicious activity
- Enable 2FA on Notion account

---

## 🐛 Troubleshooting

### Error: "Notion API not configured"
**Solution:** Check `.env` file has `NOTION_API_KEY` set

### Error: "Database not found"
**Solution:**
1. Verify `NOTION_RECEIPTS_DB` is correct (32 chars)
2. Ensure database is shared with integration
3. Check integration has "Read content" and "Insert content" permissions

### Error: "Invalid date format"
**Solution:** Use ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SS+TZ`

### Receipts not appearing in Notion
**Solution:**
1. Check backend logs for errors
2. Test `/api/v1/notion/health` endpoint
3. Manually test `/api/v1/notion/receipts` with curl
4. Verify OCR hook is calling `push_receipt()`

### Calendar events not syncing
**Solution:**
1. Check `NOTION_EVENTS_DB` is correct
2. Ensure "Start" property is type "Date" (not "Created time")
3. Verify timezone in datetime strings (+03:00 for Helsinki)

---

## 📊 Usage Examples

### HerbSpot Oy Pilot Use Case

**Scenario:** HerbSpot scans 20-30 receipts per week

**Setup:**
1. Create "HerbSpot Expenses" database in Notion
2. Share with integration
3. Configure auto-push in OCR service
4. Add accountant as viewer

**Workflow:**
1. Employee scans receipt → Converto OCR
2. Receipt automatically appears in Notion
3. Accountant reviews in Notion weekly
4. Mark as "Reviewed" when verified
5. Export to accounting software monthly

**Time Saved:** 2-3 hours per week (no manual entry)

---

## 🚀 Future Enhancements

### Planned Features
- [ ] Two-way sync (edit in Notion → update Converto)
- [ ] Bulk import from Notion to Converto
- [ ] Notion AI summaries (monthly expense reports)
- [ ] Slack notifications when new receipt added
- [ ] WhatsApp integration for receipt approval
- [ ] Automatic project tagging based on vendor
- [ ] Budget tracking and alerts

---

## 📚 Resources

- **Notion API Docs:** https://developers.notion.com/
- **Notion Integration Guide:** https://www.notion.so/help/create-integrations
- **Notion Database Properties:** https://www.notion.so/help/database-properties
- **Notion Calendar:** https://www.notion.so/help/calendar-view

---

## 💬 Support

**Questions about Notion integration?**
- Email: support@converto.fi
- Notion API issues: https://developers.notion.com/support

---

**✅ Ready to automate your bookkeeping with Notion!**

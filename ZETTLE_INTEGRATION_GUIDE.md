# 💳 Zettle + iPad Integration Guide - Complete Setup

## Overview

Integrate Zettle POS with Converto™ for seamless payment processing and automatic accounting.

**Setup Time:** 1-2 hours
**Cost:** €0 (Starter) to €99/mo (Business)
**Hardware:** iPad + Zettle Reader 2

---

## 🛠️ Hardware Setup (30-45min)

### **Required Hardware:**

- ✅ iPad (Wi-Fi + Cellular recommended)
- ✅ Zettle Reader 2 (€29 + €0.95% per transaction)
- ✅ iPad stand (adjustable)
- ✅ USB-C charger (30W minimum)
- ✅ Receipt printer: Star mC-Print3 (AirPrint, €350)
- ⭕ Barcode scanner (optional, €150)

### **iPad Configuration:**

**1. Update iOS:**
```
Settings → General → Software Update
→ Install latest iOS
```

**2. Configure Guided Access (Kiosk Mode):**
```
Settings → Accessibility → Guided Access
→ Enable
→ Set Passcode
→ Auto-Lock: Never
→ Display & Brightness: Max
```

**3. Do Not Disturb:**
```
Settings → Focus → Do Not Disturb
→ Schedule: 08:00-20:00 (business hours)
→ Allow: Only Zettle app notifications
```

**4. Network:**
```
Settings → Wi-Fi → Connect to store Wi-Fi
Settings → Cellular → Enable (backup)
```

**5. Find My iPad:**
```
Settings → [Your Name] → Find My
→ Enable Find My iPad
→ Enable offline finding
```

---

## 📱 Zettle Go App Setup (15min)

### **1. Install & Sign In:**

```
App Store → Search "Zettle Go"
→ Install
→ Sign in with Zettle account
```

### **2. Pair Card Reader:**

```
Zettle Go → Settings → Card Readers
→ Add Reader
→ Turn on Zettle Reader 2
→ Wait for pairing
→ Test payment: €0.10
```

### **3. Configure Settings:**

**Prices (incl. VAT):**
```
Settings → Tax Settings
→ Default VAT: 25.5%
→ Add: 14% (Food, Restaurant)
→ Add: 10% (Books, Transport)
→ Prices include VAT: ON
```

**Tips:**
```
Settings → Tipping
→ Enable tipping: ON
→ Preset amounts: 10%, 15%, 20%
→ Custom amount: ON
```

**Receipts:**
```
Settings → Receipts
→ Default: Email/SMS
→ Add custom field: "Order Reference"
→ Print receipts: Auto (if printer connected)
```

**Users/Roles:**
```
Settings → Users
→ Add staff members
→ Permissions:
  - Cashier: Take payments only
  - Manager: Take payments + reports
  - Admin: Full access
```

**Offline Mode:**
```
Settings → Offline Payments
→ Enable: ON
→ Max amount: €100
→ Auto-sync when online
```

---

## 📦 Product Catalog Setup (20min)

### **1. Prepare CSV:**

Create `zettle_products.csv`:

```csv
SKU,Name,Category,Price,VAT,Stock
COFFEE-001,Kahvi,Juomat,3.50,14,999
LUNCH-001,Lounas,Ruoka,12.90,14,999
SNACK-001,Pulla,Leivonnaiset,2.50,14,999
MERCH-001,T-paita,Tuotteet,25.00,25.5,50
SERVICE-001,Konsultointi,Palvelut,150.00,25.5,999
```

**Field Mapping:**
- `SKU`: Unique product ID (same in Converto!)
- `Name`: Display name
- `Category`: For reporting
- `Price`: Including VAT
- `VAT`: 25.5, 14, or 10
- `Stock`: Quantity (999 = unlimited)

### **2. Import to Zettle:**

```
Zettle Go → Products → Import
→ Select CSV file
→ Map columns
→ Import
→ Verify products appear
```

### **3. Create Quick Buttons:**

```
Zettle Go → Products → Quick Buttons
→ Add 6-9 most sold items
→ Arrange by frequency
→ Add modifiers (Size: S/M/L, Extra: +€1)
```

---

## 🔗 Integration Options

### **Option A: CSV Import (Starter - €0/mo)**

**Best for:** Small businesses, <50 transactions/day

**Setup:**

1. **Export from Zettle:**
```
Zettle Web → Reports → Sales Report
→ Date: Today
→ Export: CSV
→ Download
```

2. **Import to Converto:**
```
Converto → Imports → Zettle
→ Drag & drop CSV
→ Auto-parse
→ Review & confirm
→ Save
```

**CSV Fields:**
```csv
Date,Time,Receipt,Product,SKU,Quantity,Price,VAT,Total,Tip,Payment,Refund
2025-10-13,14:30,#1234,Kahvi,COFFEE-001,2,3.50,14%,7.00,0.50,Card,0
```

**Automation:**
```
Daily reminder (20:00):
"📊 Lataa päivän Zettle-raportti"
→ WhatsApp/Email
→ Link to Zettle reports
```

**Pros:**
- ✅ Free
- ✅ Works immediately
- ✅ No API setup

**Cons:**
- ❌ Manual daily import
- ❌ Not real-time

---

### **Option B: API Sync (Pro - €49/mo)**

**Best for:** Medium businesses, 50-200 transactions/day

**Setup:**

**1. Create Zettle API App:**
```
https://developer.zettle.com
→ My Apps → Create App
→ Name: Converto Integration
→ Redirect URI: https://app.converto.fi/integrations/zettle/callback
→ Scopes:
  - READ:PURCHASE
  - READ:PRODUCT
  - READ:FINANCE
→ Save client_id and client_secret
```

**2. Configure Converto:**

```env
# .env
ZETTLE_CLIENT_ID=your_client_id
ZETTLE_CLIENT_SECRET=your_client_secret
ZETTLE_REDIRECT_URI=https://app.converto.fi/integrations/zettle/callback
```

**3. OAuth Flow:**
```
Converto → Settings → Integrations → Zettle
→ Connect
→ Authorize (redirects to Zettle)
→ Grant permissions
→ Redirects back to Converto
→ Token saved
```

**4. Automatic Sync:**
```
Every 5 minutes:
- Fetch new purchases
- Parse transactions
- Extract VAT
- Calculate fees
- Update dashboard
```

**Pros:**
- ✅ Real-time sync (5min)
- ✅ Automatic reconciliation
- ✅ Fee tracking
- ✅ Payout matching

**Cons:**
- ❌ Requires API setup
- ❌ €49/mo cost

---

### **Option C: Deep Link Integration (Business - €99/mo)**

**Best for:** Large businesses, integrated POS experience

**Setup:**

**1. Converto iPad App (PWA/Capacitor):**
```
Install from: https://app.converto.fi/mobile
→ Add to Home Screen
→ Open app
```

**2. Deep Link to Zettle:**
```tsx
// When user clicks "Take Payment"
const amount = 49.00;
const reference = order.id;

// Open Zettle Go with pre-filled amount
window.location.href = `zettle://payment?amount=${amount}&reference=${reference}`;

// Zettle processes payment
// Returns to Converto with result
```

**3. Callback Handling:**
```tsx
// Converto receives callback
// URL: converto://payment-complete?receipt=1234&status=success

// Update order status
// Generate invoice
// Send receipt
```

**Pros:**
- ✅ Seamless UX
- ✅ No app switching
- ✅ Automatic reconciliation
- ✅ Real-time updates

**Cons:**
- ❌ Requires native app
- ❌ €99/mo cost

---

## 📊 CSV Field Mapping (Option A)

### **Zettle Export Format:**

```csv
Date,Time,Receipt Number,Product Name,SKU,Quantity,Unit Price,VAT Rate,Line Total,Discount,Tip,Payment Method,Card Type,Last 4 Digits,Staff,Location,Refund Amount
```

### **Converto Import Mapping:**

```python
# app/integrations/zettle_csv.py

ZETTLE_CSV_MAPPING = {
    "Date": "transaction_date",
    "Time": "transaction_time",
    "Receipt Number": "receipt_id",
    "Product Name": "product_name",
    "SKU": "sku",
    "Quantity": "quantity",
    "Unit Price": "unit_price",
    "VAT Rate": "vat_rate",
    "Line Total": "line_total",
    "Discount": "discount",
    "Tip": "tip",
    "Payment Method": "payment_method",
    "Card Type": "card_type",
    "Last 4 Digits": "card_last4",
    "Staff": "staff_name",
    "Location": "location",
    "Refund Amount": "refund_amount"
}

def parse_zettle_csv(file_path: str) -> list:
    """
    Parse Zettle CSV export

    Returns list of transactions
    """
    import csv
    from datetime import datetime

    transactions = []

    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for row in reader:
            # Parse transaction
            transaction = {
                "date": datetime.strptime(row["Date"], "%Y-%m-%d").date(),
                "time": row["Time"],
                "receipt_id": row["Receipt Number"],
                "items": [{
                    "sku": row["SKU"],
                    "name": row["Product Name"],
                    "quantity": float(row["Quantity"]),
                    "unit_price": float(row["Unit Price"]),
                    "vat_rate": float(row["VAT Rate"].replace("%", "")),
                    "line_total": float(row["Line Total"])
                }],
                "discount": float(row["Discount"]) if row["Discount"] else 0,
                "tip": float(row["Tip"]) if row["Tip"] else 0,
                "payment_method": row["Payment Method"],
                "staff": row["Staff"],
                "refund": float(row["Refund Amount"]) if row["Refund Amount"] else 0
            }

            transactions.append(transaction)

    return transactions
```

---

## 🔌 API Integration (Option B)

### **Zettle API Endpoints:**

```python
# app/integrations/zettle_api.py

import os
import httpx
from datetime import datetime, timedelta

ZETTLE_API_BASE = "https://oauth.zettle.com"
ZETTLE_PURCHASE_API = "https://purchase.izettle.com"

class ZettleAPI:
    def __init__(self, access_token: str):
        self.token = access_token
        self.headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

    def get_purchases(self, start_date: datetime, end_date: datetime):
        """
        Fetch purchases in date range

        API: GET /purchases/v2
        """
        with httpx.Client() as client:
            r = client.get(
                f"{ZETTLE_PURCHASE_API}/purchases/v2",
                headers=self.headers,
                params={
                    "startDate": start_date.isoformat(),
                    "endDate": end_date.isoformat(),
                    "limit": 1000
                },
                timeout=30
            )
            r.raise_for_status()
            return r.json()["purchases"]

    def get_products(self):
        """
        Fetch all products

        API: GET /organizations/self/products
        """
        with httpx.Client() as client:
            r = client.get(
                f"{ZETTLE_PURCHASE_API}/organizations/self/products",
                headers=self.headers,
                timeout=30
            )
            r.raise_for_status()
            return r.json()["products"]

    def get_payouts(self, start_date: datetime):
        """
        Fetch payouts (for fee reconciliation)

        API: GET /organizations/self/accounts/balance/transactions
        """
        with httpx.Client() as client:
            r = client.get(
                f"{ZETTLE_PURCHASE_API}/organizations/self/accounts/balance/transactions",
                headers=self.headers,
                params={
                    "start": start_date.isoformat(),
                    "limit": 100
                },
                timeout=30
            )
            r.raise_for_status()
            return r.json()["data"]


def sync_purchases(db: Session, zettle: ZettleAPI):
    """
    Sync purchases from Zettle to Converto

    Runs every 5 minutes via cron
    """
    # Get purchases from last 24h (to catch any delayed syncs)
    start = datetime.now() - timedelta(days=1)
    end = datetime.now()

    purchases = zettle.get_purchases(start, end)

    synced = 0
    skipped = 0

    for purchase in purchases:
        # Check if already imported (idempotent)
        existing = db.query(Transaction).filter(
            Transaction.external_id == purchase["globalPurchaseId"]
        ).first()

        if existing:
            skipped += 1
            continue

        # Parse and save
        transaction = Transaction(
            external_id=purchase["globalPurchaseId"],
            external_source="zettle",
            date=datetime.fromisoformat(purchase["timestamp"]),
            amount=purchase["amount"] / 100,  # Convert from cents
            vat_amount=purchase["vatAmount"] / 100,
            tip=purchase.get("gratuityAmount", 0) / 100,
            payment_method=purchase["paymentType"],
            items=purchase["products"],
            raw_data=purchase
        )

        db.add(transaction)
        synced += 1

    db.commit()

    return {"synced": synced, "skipped": skipped}
```

---

## 🔐 OAuth Setup (Option B)

### **Environment Variables:**

```env
# .env
ZETTLE_CLIENT_ID=your_client_id_here
ZETTLE_CLIENT_SECRET=your_client_secret_here
ZETTLE_REDIRECT_URI=https://app.converto.fi/integrations/zettle/callback
```

### **OAuth Flow (Backend):**

```python
# app/api/integrations/zettle.py

from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter(prefix="/api/v1/integrations/zettle", tags=["zettle"])

@router.get("/oauth/init")
def init_oauth():
    """
    Initialize OAuth flow

    Redirects user to Zettle authorization page
    """
    auth_url = (
        f"https://oauth.zettle.com/authorize"
        f"?response_type=code"
        f"&client_id={os.getenv('ZETTLE_CLIENT_ID')}"
        f"&redirect_uri={os.getenv('ZETTLE_REDIRECT_URI')}"
        f"&scope=READ:PURCHASE READ:PRODUCT READ:FINANCE"
    )

    return {"auth_url": auth_url}

@router.get("/oauth/callback")
async def oauth_callback(code: str, db: Session = Depends(get_db)):
    """
    Handle OAuth callback

    Exchanges code for access token
    """
    # Exchange code for token
    with httpx.Client() as client:
        r = client.post(
            "https://oauth.zettle.com/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": os.getenv("ZETTLE_CLIENT_ID"),
                "client_secret": os.getenv("ZETTLE_CLIENT_SECRET"),
                "redirect_uri": os.getenv("ZETTLE_REDIRECT_URI")
            }
        )
        r.raise_for_status()
        token_data = r.json()

    # Save token to database
    integration = Integration(
        provider="zettle",
        access_token=token_data["access_token"],
        refresh_token=token_data.get("refresh_token"),
        expires_at=datetime.now() + timedelta(seconds=token_data["expires_in"])
    )

    db.add(integration)
    db.commit()

    return {"status": "connected", "redirect": "/settings/integrations"}

@router.post("/sync")
async def manual_sync(db: Session = Depends(get_db)):
    """
    Manually trigger sync

    Fetches latest purchases from Zettle
    """
    # Get token
    integration = db.query(Integration).filter(
        Integration.provider == "zettle"
    ).first()

    if not integration:
        raise HTTPException(404, "Zettle not connected")

    # Sync
    zettle = ZettleAPI(integration.access_token)
    result = sync_purchases(db, zettle)

    return result
```

---

## 📊 Dashboard Integration

### **Zettle Widget:**

```tsx
// frontend/components/ZettleWidget.tsx
"use client";
import { useEffect, useState } from "react";

export default function ZettleWidget() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/v1/integrations/zettle/stats")
      .then(r => r.json())
      .then(setStats);
  }, []);

  return (
    <div className="p-6 bg-white rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Zettle POS</h3>
        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
          Synced
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-gray-500">Tänään</div>
          <div className="text-2xl font-bold">
            {stats?.today_sales || 0} €
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Transaktiot</div>
          <div className="text-2xl font-bold">
            {stats?.today_count || 0}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Keskiostos</div>
          <div className="text-xl font-semibold">
            {stats?.avg_ticket || 0} €
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Tipit</div>
          <div className="text-xl font-semibold text-green-600">
            {stats?.today_tips || 0} €
          </div>
        </div>
      </div>

      <button
        onClick={() => fetch("/api/v1/integrations/zettle/sync", {method: "POST"})}
        className="mt-4 w-full py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
      >
        Synkkaa nyt
      </button>
    </div>
  );
}
```

---

## 🧾 Receipt Printer Setup

### **Star mC-Print3 (AirPrint):**

**1. Connect Printer:**
```
Printer → Power on
iPad → Settings → Wi-Fi → Connect to printer's network
Or: Ethernet cable to router
```

**2. Configure in Zettle:**
```
Zettle Go → Settings → Receipt Printer
→ Add Printer
→ Select: Star mC-Print3
→ Test print
```

**3. Auto-Print Settings:**
```
Settings → Receipts
→ Auto-print: ON
→ Print for: Card payments
→ Skip for: Cash (optional)
```

**4. Custom Receipt Template:**
```
Settings → Receipt Template
→ Add: "Powered by Converto™"
→ Add: QR code (feedback link)
→ Add: "Tip: 10% 15% 20%"
```

---

## 🎯 Go-Live Checklist

### **Hardware:**
- [ ] iPad updated to latest iOS
- [ ] Guided Access configured
- [ ] Do Not Disturb scheduled
- [ ] Auto-Lock disabled
- [ ] Find My iPad enabled
- [ ] Zettle Reader paired
- [ ] Test payment (€0.10) successful
- [ ] Receipt printer connected
- [ ] Test print successful
- [ ] Backup power bank (20,000mAh)
- [ ] Backup card reader available

### **Software:**
- [ ] Zettle Go app installed
- [ ] Products imported
- [ ] VAT rates configured (25.5%, 14%, 10%)
- [ ] Quick buttons set up
- [ ] Tips enabled
- [ ] Receipt settings configured
- [ ] Staff accounts created
- [ ] Offline mode enabled

### **Integration:**
- [ ] CSV import tested (Option A)
- [ ] OR OAuth connected (Option B)
- [ ] OR Deep link working (Option C)
- [ ] Daily sync reminder set (20:00)
- [ ] Converto dashboard shows Zettle data
- [ ] VAT calculation matches Zettle
- [ ] Reconciliation report generated

### **Training:**
- [ ] Staff trained on payment flow
- [ ] Staff trained on refund process
- [ ] Staff trained on offline mode
- [ ] Staff knows Converto login
- [ ] Manager knows daily CSV import
- [ ] Emergency contacts documented

---

## 🚨 Troubleshooting

### **Issue: Card Reader Won't Pair**

**Fix:**
1. Turn off reader (hold button 5s)
2. Turn on reader
3. Delete from Bluetooth settings
4. Re-pair in Zettle app

### **Issue: Offline Payments Not Syncing**

**Fix:**
1. Check Wi-Fi connection
2. Force sync: Zettle → Settings → Sync Now
3. Check Zettle dashboard for pending

### **Issue: Printer Not Printing**

**Fix:**
1. Check printer power
2. Check paper loaded
3. Check Wi-Fi connection
4. Test print from Settings
5. Restart printer

### **Issue: CSV Import Fails**

**Fix:**
1. Check CSV format (UTF-8)
2. Check date format (YYYY-MM-DD)
3. Check decimal separator (. not ,)
4. Check all required fields present

---

## 💰 Pricing Tiers

### **Starter (€0/mo)**
- CSV import (manual daily)
- Basic reports
- VAT calculation
- No real-time sync

### **Pro (€49/mo)**
- API sync (every 5min)
- Real-time dashboard
- Fee reconciliation
- Payout matching
- Advanced reports

### **Business (€99/mo)**
- Everything in Pro
- Deep link integration
- iPad app (PWA)
- Custom workflows
- Priority support

---

## 📞 Support

**Setup Help:**
- Email: support@converto.fi
- Video call: https://calendly.com/converto-setup
- Response: <2 hours

**Zettle Support:**
- Phone: 020 7456 000 (Finland)
- Email: support@zettle.com
- Chat: Zettle Go app

---

**💳 Ready to Accept Payments with Converto™!**

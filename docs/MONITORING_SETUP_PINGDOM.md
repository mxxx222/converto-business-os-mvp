# DocFlow.fi Monitoring Setup - Pingdom

**Date:** November 10, 2025  
**Status:** 📋 Setup Required  
**Platform:** Pingdom (or alternative monitoring service)

---

## 🎯 Monitoring Requirements

### 1. Avainsana-check (Keyword Monitoring)

**URL:** `https://docflow.fi`  
**Keyword:** `"Automatisoi dokumentit AI:lla"`  
**Check Type:** HTTP  
**Interval:** 5 minutes  
**Timeout:** 30 seconds  
**Locations:** Multiple (EU + US)

**Expected Result:** HTTP 200 + keyword found  
**Alert Conditions:**
- HTTP status != 200
- Keyword not found
- Response time > 5 seconds

### 2. Redirect-check (www → apex)

**URL:** `https://www.docflow.fi`  
**Check Type:** HTTP  
**Interval:** 15 minutes  
**Timeout:** 10 seconds  
**Follow Redirects:** No (to verify 301)

**Expected Result:** HTTP 301 with Location: https://docflow.fi/  
**Alert Conditions:**
- HTTP status != 301
- Location header missing or incorrect
- Response time > 3 seconds

### 3. Security Headers Check

**URL:** `https://docflow.fi`  
**Check Type:** HTTP  
**Interval:** 1 hour  
**Headers to Verify:**
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`

**Alert Conditions:**
- Any security header missing
- HSTS max-age < 31536000

---

## 📋 Pingdom Setup Checklist

### Step 1: Create Keyword Check
- [ ] Log into Pingdom dashboard
- [ ] Create new "Uptime Check"
- [ ] Set URL: `https://docflow.fi`
- [ ] Enable "Should contain" with keyword: `Automatisoi dokumentit AI:lla`
- [ ] Set check interval: 5 minutes
- [ ] Select monitoring locations: EU (Stockholm, London) + US (New York)
- [ ] Configure alerts: Email + SMS (if available)

### Step 2: Create Redirect Check
- [ ] Create new "HTTP Check"
- [ ] Set URL: `https://www.docflow.fi`
- [ ] Disable "Follow redirects"
- [ ] Set expected HTTP status: 301
- [ ] Add custom validation for Location header
- [ ] Set check interval: 15 minutes
- [ ] Configure alerts

### Step 3: Create Security Headers Check
- [ ] Create new "HTTP Check"
- [ ] Set URL: `https://docflow.fi`
- [ ] Add custom header validations:
  - `Strict-Transport-Security` contains `max-age=31536000`
  - `X-Frame-Options` equals `SAMEORIGIN`
  - `X-Content-Type-Options` equals `nosniff`
- [ ] Set check interval: 1 hour
- [ ] Configure alerts

---

## 🚨 Alert Configuration

### Notification Channels
- **Email:** Primary contact for all alerts
- **SMS:** Critical alerts only (downtime > 5 minutes)
- **Slack:** **REQUIRED** - Ops channel integration for team notifications

### Slack Integration Setup (Ops Channel)

**Note:** Pingdom uses Webhook integration for Slack. You need to create a Slack Incoming Webhook first.

#### Step 1: Create Slack Incoming Webhook
1. **Slack → Your Workspace → Apps → Incoming Webhooks**
2. Click **"Add to Slack"**
3. Select channel: `#ops` (or your ops channel)
4. Click **"Add Incoming Webhooks Integration"**
5. Copy the **Webhook URL** (format: `https://hooks.slack.com/services/XXXXX/YYYYY/ZZZZZ`)

#### Step 2: Create Pingdom Webhook Integration
1. **Pingdom Dashboard → Integrations → Add Integration**
2. Select **Type: Webhook**
3. **Name:** `Slack - Ops Channel`
4. **URL:** Paste your Slack webhook URL from Step 1
5. **Active:** ✅ Enabled
6. Click **"Save integration"**

#### Step 3: Configure Alert Messages

**When Check Goes DOWN:**
```
🚨 DocFlow.fi DOWN: {check_name} failed
URL: {url}
Response Time: {response_time}ms
Error: {error_message}
Status Code: {status_code}
Time: {timestamp}
```

**When Check Goes UP (Recovery):**
```
✅ DocFlow.fi RECOVERED: {check_name} is back online
Downtime Duration: {downtime_duration}
Total Outage Time: {total_outage_time}
Time: {timestamp}
```

**When Check is SLOW:**
```
⚠️ DocFlow.fi SLOW: {check_name} response time {response_time}ms
Threshold: 3000ms
URL: {url}
Time: {timestamp}
```

#### Step 4: Alert Thresholds per Check Type

**Keyword Check:**
- Alert on: 2 consecutive failures
- Slack channel: `#ops`
- Mention @channel: No (use @here for first alert)

**Redirect Check:**
- Alert on: 3 consecutive failures
- Slack channel: `#ops`
- Mention @channel: No

**HSTS Header Check:**
- Alert on: 1 failure (immediate)
- Slack channel: `#ops`
- Mention @channel: Yes (security-critical)

#### Step 5: Test Alert Configuration
1. **Pingdom Dashboard → Select a check**
2. Click **"Test Check"** or **"Simulate Failure"**
3. Verify Slack message appears in `#ops` channel
4. Check message format and variables are populated correctly
5. Test recovery alert by manually fixing the check

### Escalation Policy
1. **Immediate (0 min):** Slack notification to `#ops`
2. **5 minutes:** Email notification + SMS (if downtime continues)
3. **15 minutes:** Escalate to secondary contact + @channel mention
4. **30 minutes:** Page on-call engineer

### Alert Thresholds
- **Keyword Check:** 2 consecutive failures
- **Redirect Check:** 3 consecutive failures
- **Security Headers:** 1 failure (immediate alert)

---

## 📊 Alternative Monitoring Services

If Pingdom is not available, consider:

### 1. UptimeRobot (Free tier available)
```
Keyword Check: https://docflow.fi
Keyword: "Automatisoi dokumentit AI:lla"
Interval: 5 minutes
```

### 2. StatusCake
```
Website URL: https://docflow.fi
Test Type: HTTP
Check Rate: 5 minutes
```

### 3. Site24x7
```
Monitor Type: Website
URL: https://docflow.fi
Frequency: 5 minutes
```

---

## 🔧 Custom Monitoring Scripts

For advanced monitoring, use these curl-based scripts:

### Keyword Check Script
```bash
#!/bin/bash
# keyword-check.sh

URL="https://docflow.fi"
KEYWORD="Automatisoi dokumentit AI:lla"

response=$(curl -s "$URL")
if echo "$response" | grep -q "$KEYWORD"; then
    echo "✅ Keyword found on $URL"
    exit 0
else
    echo "❌ Keyword NOT found on $URL"
    exit 1
fi
```

### Redirect Check Script
```bash
#!/bin/bash
# redirect-check.sh

URL="https://www.docflow.fi"
EXPECTED_LOCATION="https://docflow.fi/"

response=$(curl -I -s "$URL")
status=$(echo "$response" | grep "HTTP" | awk '{print $2}')
location=$(echo "$response" | grep -i "location:" | awk '{print $2}' | tr -d '\r')

if [ "$status" = "301" ] && [ "$location" = "$EXPECTED_LOCATION" ]; then
    echo "✅ Redirect working: $URL → $location"
    exit 0
else
    echo "❌ Redirect failed: Status=$status, Location=$location"
    exit 1
fi
```

### HSTS Check Script
```bash
#!/bin/bash
# hsts-check.sh

URL="https://docflow.fi"
MIN_MAX_AGE=31536000

hsts_header=$(curl -I -s "$URL" | grep -i "strict-transport-security")
if echo "$hsts_header" | grep -q "max-age=$MIN_MAX_AGE"; then
    echo "✅ HSTS header correct: $hsts_header"
    exit 0
else
    echo "❌ HSTS header incorrect or missing: $hsts_header"
    exit 1
fi
```

---

## 📈 Monitoring Dashboard

### Key Metrics to Track
- **Uptime %:** Target 99.9%
- **Response Time:** Target < 2 seconds
- **Redirect Time:** Target < 500ms
- **SSL Certificate:** Days until expiry
- **DNS Resolution:** Time to resolve

### Weekly Reports
- [ ] Uptime summary
- [ ] Performance trends
- [ ] Alert summary
- [ ] Action items

---

## 🔗 Quick Links

**Monitoring Services:**
- [Pingdom](https://www.pingdom.com/)
- [UptimeRobot](https://uptimerobot.com/)
- [StatusCake](https://www.statuscake.com/)
- [Site24x7](https://www.site24x7.com/)

**Test URLs:**
- Primary: https://docflow.fi
- Redirect: https://www.docflow.fi
- Robots: https://docflow.fi/robots.txt
- Sitemap: https://docflow.fi/sitemap.xml

**Manual Testing:**
```bash
# Quick health check
curl -Ik https://docflow.fi
curl -Ik https://www.docflow.fi
curl -s https://docflow.fi | grep "Automatisoi dokumentit"
```

---

## ✅ Setup Completion Checklist

- [ ] Pingdom account created/accessed
- [ ] Keyword monitoring configured
- [ ] Redirect monitoring configured
- [ ] Security headers monitoring configured
- [ ] **Slack integration connected** (Pingdom → Slack workspace)
- [ ] **Ops channel configured** (`#ops` or equivalent)
- [ ] **Alert messages tested** (DOWN, UP, SLOW)
- [ ] **Test alert sent** to verify Slack notifications work
- [ ] Alert notifications tested (Email + SMS)
- [ ] Escalation policy documented
- [ ] Team members notified of monitoring setup
- [ ] First week of monitoring data collected
- [ ] False positive alerts tuned

---

**Setup By:** [Pending]  
**Reviewed By:** [Pending]  
**Next Review:** November 17, 2025

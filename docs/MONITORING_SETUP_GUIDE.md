# 📊 Monitoring & Alerting Setup Guide

**Pingdom + Slack Integration - Thursday 14.11 Sprint Tasks**

---

## 🎯 **Thursday Sprint Plan**

### **1. Pingdom Uptime Monitoring Setup (1 hour)**
- [ ] Keyword monitoring for converto.fi
- [ ] Redirect test verification
- [ ] HSTS security header check
- [ ] SSL certificate monitoring
- [ ] Response time tracking

### **2. Slack Webhook Integration (1 hour)**
- [ ] #ops channel alerts
- [ ] Incident severity levels
- [ ] Custom alert formatting
- [ ] Escalation rules

### **3. Alert Testing (30 minutes)**
- [ ] Test each alert type
- [ ] Verify Slack notifications
- [ ] Check escalation timing

---

## 📈 **Pingdom Configuration**

### **Check 1: Homepage Keyword Monitoring**
```json
{
  "name": "DocFlow Homepage - Converto.fi",
  "url": "https://converto.fi",
  "type": "http",
  "interval": 5,
  "locations": ["eu"],
  "keywords": [
    {
      "keyword": "DocFlow",
      "type": "contains",
      "location": "body"
    }
  ],
  "alert_policy": "immediate",
  "verify_ssl": true
}
```

### **Check 2: Redirect Verification**
```json
{
  "name": "www → non-www Redirect",
  "url": "https://www.converto.fi",
  "type": "http",
  "interval": 5,
  "locations": ["eu"],
  "expected_status": 301,
  "expected_location": "https://converto.fi",
  "verify_ssl": true
}
```

### **Check 3: HSTS Security Headers**
```bash
# Manual verification command
curl -I https://converto.fi | grep -i "strict-transport-security"

# Expected output:
# Strict-Transport-Security: max-age=15552000; includeSubDomains
```

### **Check 4: API Health Endpoint**
```json
{
  "name": "Backend API Health",
  "url": "https://converto-business-os-quantum-mvp-1.onrender.com/health",
  "type": "http",
  "interval": 2,
  "locations": ["eu"],
  "expected_status": 200,
  "verify_ssl": true
}
```

---

## 📱 **Slack Webhook Configuration**

### **Step 1: Create Slack App**
1. Go to https://api.slack.com/apps
2. Create new app → "From scratch"
3. Name: "DocFlow Monitoring"
4. Workspace: Your workspace

### **Step 2: Setup Incoming Webhooks**
```json
{
  "name": "DocFlow Ops Alerts",
  "channel": "#ops",
  "url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
  "icon_emoji": ":rotating_light:",
  "username": "DocFlow Monitor"
}
```

### **Step 3: Alert Message Templates**

#### **High Severity Alert:**
```json
{
  "text": "🚨 CRITICAL: DocFlow Down",
  "attachments": [
    {
      "color": "danger",
      "title": "Service Status: CRITICAL",
      "fields": [
        {
          "title": "Service",
          "value": "converto.fi",
          "short": true
        },
        {
          "title": "Response Time",
          "value": "> 10s",
          "short": true
        },
        {
          "title": "Last Check",
          "value": "2025-11-14 15:30:00",
          "short": true
        }
      ],
      "actions": [
        {
          "type": "button",
          "text": "View Status Page",
          "url": "https://status.pingdom.com",
          "style": "primary"
        }
      ]
    }
  ]
}
```

#### **Medium Severity Alert:**
```json
{
  "text": "⚠️ WARNING: Response Time Elevated",
  "attachments": [
    {
      "color": "warning",
      "title": "Performance Issue Detected",
      "fields": [
        {
          "title": "Service",
          "value": "converto.fi",
          "short": true
        },
        {
          "title": "Response Time",
          "value": "5.2s (Normal: <2s)",
          "short": true
        }
      ]
    }
  ]
}
```

---

## 🔧 **Automated Monitoring Script**

### **create_monitoring_config.py**
```python
#!/usr/bin/env python3
"""Generate monitoring configuration for DocFlow."""

import json
import os
from datetime import datetime

# Pingdom check configuration
pingdom_checks = [
    {
        "name": "DocFlow Homepage",
        "url": "https://converto.fi",
        "type": "http",
        "interval": 300,  # 5 minutes
        "locations": ["eu"],
        "tags": ["production", "homepage"],
        "alert_policy": "immediate"
    },
    {
        "name": "www Redirect Check", 
        "url": "https://www.converto.fi",
        "type": "http",
        "interval": 300,
        "locations": ["eu"],
        "expected_status": 301,
        "tags": ["production", "redirect"]
    },
    {
        "name": "Backend API Health",
        "url": "https://converto-business-os-quantum-mvp-1.onrender.com/health",
        "type": "http", 
        "interval": 120,  # 2 minutes
        "locations": ["eu"],
        "expected_status": 200,
        "tags": ["production", "api"]
    }
]

# Slack alert rules
slack_rules = {
    "high_severity": {
        "threshold": 3,  # 3 consecutive failures
        "response_time": 10000,  # 10 seconds
        "message": "🚨 CRITICAL: DocFlow service issues detected"
    },
    "medium_severity": {
        "threshold": 1,
        "response_time": 5000,  # 5 seconds
        "message": "⚠️ WARNING: DocFlow performance issues"
    }
}

def generate_config():
    """Generate monitoring configuration."""
    config = {
        "created": datetime.now().isoformat(),
        "checks": pingdom_checks,
        "slack_rules": slack_rules,
        "channels": {
            "alerts": "#ops",
            "escalation": "#oncall"
        }
    }
    
    return config

if __name__ == "__main__":
    config = generate_config()
    
    # Save configuration
    with open("monitoring_config.json", "w") as f:
        json.dump(config, f, indent=2)
    
    print("✅ Monitoring configuration generated")
    print("📁 File: monitoring_config.json")
    print("📋 Checks configured:", len(config["checks"]))
```

---

## ✅ **Testing & Verification**

### **Test 1: Pingdom API Test**
```bash
# Test Pingdom API connection
curl -u "$PINGDOM_USER:$PINGDOM_PASSWORD" \
  "https://api.pingdom.com/api/3.1/checks" \
  | jq '.checks[].name'

# Add new check
curl -X POST "https://api.pingdom.com/api/3.1/checks" \
  -u "$PINGDOM_USER:$PINGDOM_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "DocFlow Test",
    "url": "https://converto.fi", 
    "type": "http"
  }'
```

### **Test 2: Slack Webhook Test**
```bash
# Test Slack webhook
curl -X POST "$SLACK_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "🧪 Test: DocFlow monitoring is working!",
    "channel": "#ops"
  }'
```

### **Test 3: End-to-End Alert Test**
```bash
# Simulate service outage
# 1. Update converto.fi to return 500 error
# 2. Wait for Pingdom detection (2-5 min)
# 3. Verify Slack notification received
# 4. Test recovery notification
```

---

## 📈 **Expected ROI & Benefits**

### **Monitoring ROI:**
- **Uptime**: 99.9% → Immediate incident detection
- **Response Time**: Proactive performance monitoring
- **Security**: HSTS, SSL, and redirect verification
- **Cost**: 2-4 hours/month saved on incident investigation

### **Alert Benefits:**
- **Instant Detection**: < 5 minutes to incident awareness
- **Smart Escalation**: Severity-based routing
- **Context**: Service-specific error information
- **Actionable**: Direct links to troubleshooting tools

---

## 🚀 **Post-Setup Actions**

After monitoring is active:
1. **Bookmark Pingdom status page**
2. **Join #ops channel notifications** 
3. **Document escalation procedures**
4. **Schedule weekly monitoring review**
5. **Set up monthly SLA reports**

---

**Status:** 📋 Thursday monitoring setup documented  
**Next:** Execute setup → Test alerts → Verify notifications
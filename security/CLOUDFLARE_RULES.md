# Cloudflare Rules (DDoS/WAF/Rate Limit)

Suggested rules:

1. WAF Managed Rules: Enable OWASP Core Ruleset, high sensitivity.
2. Rate Limiting Rules:
   - Path: `/ai/chat`, Threshold: 60 req/min/IP, Action: Managed Challenge
   - Path: `/ocr/upload`, Threshold: 30 req/min/IP, Action: Block or Challenge
3. Bot Fight Mode: ON; Super Bot Fight for enterprise
4. Geo Restriction (optional): allow EU + needed regions for compliance
5. API Shield (mTLS) for internal admin endpoints
6. Cache Bypass for POST/PUT; Cache static GET under `/assets`, `/public`

Set origin header `CF-Connecting-IP` respected in gateway for real client IP.

# Incident Runbook: Domain/SEO - DocFlow.fi

**Last Updated:** November 10, 2025  
**Version:** 1.0  
**Scope:** Domain redirects, SEO, security headers

---

## 🚨 Common Incidents & Solutions

### 1. Site Down / Not Loading

**Symptoms:**
- `curl https://docflow.fi` returns error
- Pingdom alerts: "Site down"
- Users report "site not accessible"

**Immediate Actions:**
```bash
# 1. Check DNS resolution
nslookup docflow.fi
dig docflow.fi

# 2. Check Vercel status
curl -I https://docflow.fi
curl -I https://frontend-[deployment-id].vercel.app

# 3. Check Vercel dashboard
# Visit: https://vercel.com/maxs-projects-149851b4/frontend
```

**Root Causes & Fixes:**
- **DNS Issues:** Contact domain registrar, check NS records
- **Vercel Outage:** Check https://vercel-status.com, wait for resolution
- **SSL Certificate:** Renew certificate in Vercel dashboard
- **Deployment Failed:** Redeploy from Vercel dashboard

---

### 2. Redirects Not Working

**Symptoms:**
- `www.docflow.fi` doesn't redirect to `docflow.fi`
- `converto.fi` returns 404 or wrong destination
- Pingdom alerts: "Redirect check failed"

**Diagnostic Commands:**
```bash
# Test all redirects
curl -I https://www.docflow.fi
curl -I https://converto.fi
curl -I https://www.converto.fi

# Expected results:
# HTTP/2 301
# location: https://docflow.fi/
```

**Root Causes & Fixes:**

#### A) Middleware Not Deployed
```bash
# Check if latest deployment includes middleware
# Visit Vercel dashboard → View Source
# Verify middleware.ts contains redirect rules
```
**Fix:** Redeploy from latest Git commit

#### B) Domain Configuration Issue
```bash
# Check Vercel domain settings
# Visit: https://vercel.com/maxs-projects-149851b4/frontend/settings/domains
```
**Fix:** Ensure domains are configured as "Production" not "Redirect"

#### C) DNS Propagation
```bash
# Check DNS for all domains
dig www.docflow.fi
dig converto.fi
```
**Fix:** Wait 24-48h for DNS propagation, or contact registrar

---

### 3. HSTS Header Missing

**Symptoms:**
- Security scanners report missing HSTS
- `curl -I https://docflow.fi` doesn't show `strict-transport-security`

**Diagnostic Commands:**
```bash
# Check HSTS header
curl -I https://docflow.fi | grep -i strict-transport-security

# Expected:
# strict-transport-security: max-age=31536000; includeSubDomains; preload
```

**Root Causes & Fixes:**

#### A) Middleware Not Active
- Check `frontend/middleware.ts` exists and contains HSTS code
- Verify deployment includes middleware
- **Fix:** Redeploy with correct middleware

#### B) Caching Issue
- CDN/browser cache serving old headers
- **Fix:** Wait 5-10 minutes, or force refresh cache

---

### 4. SEO Files Not Accessible

**Symptoms:**
- `https://docflow.fi/robots.txt` returns 404
- `https://docflow.fi/sitemap.xml` returns 404
- Google Search Console reports crawl errors

**Diagnostic Commands:**
```bash
# Test SEO files
curl -s https://docflow.fi/robots.txt
curl -s https://docflow.fi/sitemap.xml
```

**Root Causes & Fixes:**

#### A) Files Not Generated
- Check `frontend/app/robots.ts` and `frontend/app/sitemap.ts` exist
- **Fix:** Ensure files are committed and deployed

#### B) Next.js Route Issue
- Files might be cached or not regenerated
- **Fix:** Clear Vercel cache and redeploy

---

### 5. SSL Certificate Issues

**Symptoms:**
- Browser shows "Not Secure" warning
- `curl https://docflow.fi` returns SSL error
- Certificate expired warnings

**Diagnostic Commands:**
```bash
# Check SSL certificate
openssl s_client -connect docflow.fi:443 -servername docflow.fi

# Check expiry
curl -vI https://docflow.fi 2>&1 | grep -i certificate
```

**Root Causes & Fixes:**

#### A) Certificate Expired
- **Fix:** Renew in Vercel dashboard → Settings → Domains

#### B) Domain Not Verified
- **Fix:** Complete domain verification in Vercel

#### C) DNS Issues
- **Fix:** Ensure DNS points to Vercel correctly

---

## 🔧 Emergency Procedures

### Immediate Response (0-5 minutes)

1. **Acknowledge Alert**
   - Confirm incident via multiple sources
   - Update status page (if available)

2. **Quick Health Check**
   ```bash
   # Run full diagnostic
   curl -I https://docflow.fi
   curl -I https://www.docflow.fi
   curl -I https://converto.fi
   curl -s https://docflow.fi | grep "Automatisoi dokumentit"
   ```

3. **Check Vercel Status**
   - Visit: https://vercel-status.com
   - Check: https://vercel.com/maxs-projects-149851b4/frontend

### Escalation (5-15 minutes)

1. **Detailed Diagnostics**
   ```bash
   # DNS check
   nslookup docflow.fi
   nslookup www.docflow.fi
   nslookup converto.fi
   
   # SSL check
   openssl s_client -connect docflow.fi:443 -servername docflow.fi
   
   # Performance check
   curl -w "@curl-format.txt" -o /dev/null -s https://docflow.fi
   ```

2. **Check Recent Changes**
   - Review recent deployments in Vercel
   - Check Git commits for breaking changes
   - Verify DNS changes at registrar

### Recovery Actions (15+ minutes)

1. **Rollback Options**
   ```bash
   # Rollback Vercel deployment
   # Via dashboard: Deployments → Previous → Promote to Production
   
   # Rollback Git changes
   git revert [commit-hash]
   git push origin feat/pr1-auth-hardening
   ```

2. **Emergency Fixes**
   ```bash
   # Quick middleware fix
   # Edit frontend/middleware.ts
   # Commit and deploy immediately
   
   # DNS emergency
   # Contact registrar support
   # Use backup DNS provider
   ```

---

## 📞 Contact Information

### Internal Team
- **Primary:** [Your contact]
- **Secondary:** [Backup contact]
- **On-call:** [Rotation schedule]

### External Vendors
- **Vercel Support:** https://vercel.com/help
- **Domain Registrar:** [Your registrar support]
- **DNS Provider:** [Your DNS provider support]

### Emergency Escalation
1. **Level 1:** Team lead (immediate)
2. **Level 2:** Technical director (15 min)
3. **Level 3:** External consultant (30 min)

---

## 📊 Monitoring & Alerting

### Key Metrics
- **Uptime:** > 99.9%
- **Response Time:** < 2 seconds
- **Redirect Time:** < 500ms
- **SSL Grade:** A+ (SSL Labs)

### Alert Thresholds
- **Critical:** Site down > 2 minutes
- **Warning:** Response time > 5 seconds
- **Info:** SSL certificate expires < 30 days

### Monitoring Tools
- **Pingdom:** Primary uptime monitoring
- **Vercel Analytics:** Performance metrics
- **Google Search Console:** SEO health
- **SSL Labs:** Security grade

---

## 📝 Post-Incident Actions

### Immediate (0-24 hours)
- [ ] Document incident timeline
- [ ] Identify root cause
- [ ] Implement immediate fix
- [ ] Update monitoring if needed

### Short-term (1-7 days)
- [ ] Conduct post-mortem meeting
- [ ] Update runbook with lessons learned
- [ ] Implement preventive measures
- [ ] Test recovery procedures

### Long-term (1-4 weeks)
- [ ] Review monitoring coverage
- [ ] Update alerting thresholds
- [ ] Train team on new procedures
- [ ] Schedule regular drills

---

## 🔗 Quick Reference Links

**Dashboards:**
- [Vercel Project](https://vercel.com/maxs-projects-149851b4/frontend)
- [Vercel Domains](https://vercel.com/maxs-projects-149851b4/frontend/settings/domains)
- [Vercel Analytics](https://vercel.com/maxs-projects-149851b4/frontend/analytics)

**Status Pages:**
- [Vercel Status](https://vercel-status.com)
- [GitHub Status](https://githubstatus.com)

**Tools:**
- [SSL Labs Test](https://www.ssllabs.com/ssltest/analyze.html?d=docflow.fi)
- [DNS Checker](https://dnschecker.org/#A/docflow.fi)
- [PageSpeed Insights](https://pagespeed.web.dev/analysis/https-docflow-fi/?)

**Documentation:**
- [Domain Deployment Guide](./DOMAIN_DEPLOYMENT_COMPLETE.md)
- [Monitoring Setup](./MONITORING_SETUP_PINGDOM.md)
- [Master Hub Checklist](./DEPLOYMENT_CHECKLIST_MASTER_HUB.md)

---

## 📋 Incident Template

```
INCIDENT: [Brief description]
START TIME: [YYYY-MM-DD HH:MM UTC]
SEVERITY: [Critical/High/Medium/Low]
STATUS: [Investigating/Identified/Monitoring/Resolved]

IMPACT:
- Users affected: [number/percentage]
- Services down: [list]
- Duration: [time]

TIMELINE:
[HH:MM] - [Action taken]
[HH:MM] - [Discovery/escalation]
[HH:MM] - [Resolution]

ROOT CAUSE:
[Detailed explanation]

RESOLUTION:
[Steps taken to fix]

PREVENTION:
[Actions to prevent recurrence]
```

---

**Runbook Owner:** [Name]  
**Last Tested:** [Date]  
**Next Review:** [Date]

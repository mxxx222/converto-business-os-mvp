# Go-Live Communication Templates
**Supabase Production Deployment - Status Updates**

## Pre-Deployment (T-15 minutes)

```markdown
[INFO] DocFlow/Converto Go-Live alkaa 15 min (02:00–04:00 UTC)

🛠️  **Muutokset:**
- DB-indeksit (CONCURRENTLY) - Ei downtimea
- Gated canary 10%→50%→100% traffic shifting
- Replica fallback system aktivointi

⚠️  **Riskit:** Matalat, rollback < 10 min
📊 **Mittarit:** P95, error-rate, replica-lag, health

**Status:** Valmiudessa
**Lead:** Maksim
**SRE:** DevOps Team
**ETA:** 45-60 min
```

## Deployment Start (T0)

```markdown
[START] Huoltoikkuna aloitettu (02:00 UTC)

🔄 **Vaihe 1: DB-migraatiot**
- Ajetaan indeksit: users_signup → stripe_events → review_items → netvisor_queue
- Ei downtimea (CONCURRENTLY)

📈 **Seuranta:** pg_stat_progress_create_index, health OK
⏱️  **ETA:** 20 min
```

## Canary 10% (T+30 min)

```markdown
[UPDATE] Canary 10% liikenne päällä

✅ **Post-smoke:** OK
✅ **P95 (netvisor_pick) ≤ 700 ms:** OK  
✅ **Error-rate ≤ 1.5%:** OK
✅ **Health check:** OK

🔄 **Seuraava vaihe:** 30 min → 50%
⏱️  **Status:** On track
```

## Canary 50% (T+60 min)

```markdown
[UPDATE] Canary 50% liikenne päällä

✅ **Health:** OK
✅ **P95 / error-rate:** OK
✅ **Replica-lag < 8 s:** OK (fallback ei aktivoitunut)
✅ **Database pool:** <80% utilization

🔄 **Seuraava vaihe:** 30 min → 100%
⏱️  **Status:** On track
```

## Full Production (T+90-120 min)

```markdown
[SUCCESS] Promoted 100% liikenne (≈03:30–04:00 UTC)

✅ **P95/err-rate:** Vihreä
✅ **Performance validation:** PASSED
✅ **Status badget:** Päivittyneet
✅ **7 vrk valvonta:** Käynnissä (bloat_guard 2×/pv D1–D2)
✅ **Replica fallback:** Aktivoitu

🎉 **Status:** LIVE
🕐 **Kesto:** 60 min
```

## Incident Template (If Issues)

```markdown
[INCIDENT] Canary gate FAIL (vaihe: 50%)

🚨 **Syy:** P95/err-rate breikki (detaljit liitteessä)
📊 **Metrics:** P95: 850ms (threshold: 700ms)
🔄 **Toimenpide:** Rollback → previous @100% (ETA: 10 min)
👥 **Team:** Maksim (Lead), DevOps (Execution)

⏰ **Seuraava päivitys:** T+10 min
```

## Rollback Success

```markdown
[ROLLBACK] Palautettu previous @100%

✅ **Health:** OK
✅ **P95/err-rate:** Normalisoitunut
✅ **Database:** Stable

🔍 **Root cause analyysi:** Käynnissä
📅 **Uusi aikataulu:** Tiedotetaan erikseen
```

## Daily Monitoring (Post Go-Live)

```markdown
[DAILY] Go-Live Day 1 Status

📊 **Metrics (24h):**
- Uptime: 99.9%
- P95: 380ms (target: <400ms)
- Error rate: 0.3% (target: <1%)
- Replica lag: 2.1s avg (target: <8s)

🔄 **Auto-fallback aktivations:** 0
🧹 **Bloat guard runs:** 2/2 completed
📈 **Index usage:** Optimal

✅ **Status:** All systems green
```

## Weekly Summary

```markdown
[WEEKLY] Supabase Infrastructure Summary

📈 **Performance:**
- Avg response time: 290ms
- Error rate: 0.2%
- Uptime: 99.95%

🛡️ **Security:**
- RLS policies: Active
- No security incidents
- All audits passed

🔄 **High Availability:**
- Auto-fallback activations: 3 (all recovered)
- Replica lag avg: 1.8s
- Zero data loss incidents

💡 **Optimizations:**
- 15% performance improvement vs previous week
- Database pool utilization: 45%
- Backup success rate: 100%

✅ **Status:** Operating optimally
```

## Customer Communication (External)

```markdown
Service Update - Infrastructure Optimization

We have successfully completed a major infrastructure upgrade to improve performance, reliability, and security of your DocFlow/Converto services.

**What was improved:**
- Enhanced database performance (20% faster queries)
- Improved system reliability with automatic failover
- Enhanced security with advanced data protection
- Better monitoring and faster issue resolution

**When:** Completed during maintenance window (02:00-04:00 UTC, Sunday)
**Impact:** No service interruption, all systems operational
**Benefits:** Faster response times, improved reliability, better security

**Need assistance?** Contact our support team or check the status dashboard.

Thank you for your continued trust in our services.
```

## Slack Channels Guide

### #status (Internal Team)
- All deployment status updates
- Technical metrics and alerts
- Rollback communications
- Performance monitoring

### #customers (External Communication)
- Customer-facing status updates
- Service impact notifications
- Resolution confirmations
- Maintenance windows

### #incidents (Incident Response)
- Detailed incident information
- Root cause analysis
- Action items and follow-up
- Post-mortem summaries

## Usage Instructions

1. **Copy and paste** the appropriate template
2. **Fill in actual metrics** when available
3. **Adjust timing** based on actual progress
4. **Add team mentions** as needed (@Maksim @DevOps)
5. **Attach logs/metrics** for detailed updates

## Emergency Contacts

| Role | Slack | Phone | Responsibility |
|------|-------|-------|----------------|
| **Lead** | @Maksim | +358-40-123-4567 | Final decisions |
| **SRE** | @devops | +358-40-987-6543 | Execution |
| **DBA** | @dba-team | +358-40-555-1234 | Database issues |
| **Support** | @support | +358-40-777-8888 | Customer comms |

---

**Last Updated:** 2025-11-10  
**Next Review:** 2025-11-17  
**Version:** 1.0
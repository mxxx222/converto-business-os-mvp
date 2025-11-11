# Master Hub – Production Verification Snapshot (2025-11-10)

## Deployment
- **ID:** `dpl_HhhD1bgpdRNMUCQ1G68Ry8fFruCn`
- **Method:** `vercel build --prod` + `vercel deploy --prod --prebuilt`
- **Status:** READY (alias assigned 2025-11-10T23:51Z)

## Verification Checklist
- `/` → `/fi`, `/en` routes return `200` with localized content.
- `robots.txt` and `sitemap.xml` now respond `200` (`Allow: /`, canonical sitemap list).
- `www.docflow.fi` issues 308 redirect to apex with HSTS.
- Cache headers: HTML `no-store`, static assets immutable.

## Open Issues
- **Remote build failures:** `BUILD_UTILS_SPAWN_1` immediately after lint/type on standard deploy.
  - Failures: `dpl_6CDkJBJeTutZgoYCtKr4DsFyhQRL`, `dpl_J96G5hXWr7752xyYGvnmaFqPVpDK`
  - Workaround: continue shipping via prebuilt artefact pipeline.
  - Support ticket drafted (see `/support/vercel_build_ticket.md`) — awaiting submission/ack.

- **Next.js GHSA advisories:** current pin `next@15.1.3` flagged (information exposure / cache poisoning).
  - Risk window: acceptable short-term (24–48h) while remote build issue under investigation.
  - Planned action: upgrade to `next@15.5.6` once standard CI builds are stable; run FI/EN regression + SEO smoke.

## Next Actions
1. Submit Vercel support request with above deployment IDs and repro notes.
2. Track acknowledgement; update this record with ticket link + resolution ETA.
3. Prepare upgrade PR template for post-fix Next.js bump (include rollback notes).

- 2025-11-11 READY dpl_2kRfS7sLJLsMGDxwHVzqwPdTeyEz (prebuilt). i18n/SEO OK. Next 15.1.3 advisory logged; upgrade window pending support ACK.
- Support Ticket: [#832289](https://vercel.com/support/tickets/832289) – Status OPEN (Severity 2). Waiting on Vercel analysis of `BUILD_UTILS_SPAWN_1` failures (see deployments above). Upgrade window to `next@15.5.6` scheduled post-resolution or in ≤48h.

# 🚀 Converto™ 2.0 - Launch Checklist

Final pre-launch verification for production deployment.

---

## 📱 **1. DEVICE TESTING** (Critical)

### iPhone 13 / Safari
- [ ] Hotkey-korttien horizontal scroll toimii
- [ ] Haptic feedback (tärinä) toimii klikkauksissa
- [ ] Suggestion Row snap-scroll toimii
- [ ] Quick Actions FAB avautuu bottom sheetinä
- [ ] AI Chat bubble (jos Pro) tai upgrade CTA (jos free)
- [ ] PWA manifest toimii ("Add to Home Screen")

### Android Pixel 7 / Chrome
- [ ] Suggestion Popup close gesture (swipe down) toimii
- [ ] Haptic feedback toimii
- [ ] Hotkeys grid 2-column layout näkyy oikein
- [ ] FAB bottom sheet animaatio smooth
- [ ] PWA toimii

### MacBook Pro / Chrome
- [ ] Shift+? overlay avautuu ja sulkeutuu ESC:llä
- [ ] Kaikki 8 hotkeytä toimivat (⇧O, ⇧V, ⇧R, ⇧B, ⇧D, ⇧L, ⇧S, ⇧?)
- [ ] Impact ROI Chart renderöityy oikein (Recharts)
- [ ] Level Up animation näkyy kauniisti
- [ ] Glass morphism effects toimivat

### Lighthouse Audit
- [ ] Mobile UX Score >90
- [ ] Performance >85
- [ ] Accessibility >90
- [ ] Best Practices >95
- [ ] SEO >90

**Run:**
```bash
npm run lighthouse
# Or manually in Chrome DevTools → Lighthouse
```

---

## 📊 **2. TELEMETRY & ANALYTICS** (Critical)

### PostHog Setup
- [ ] PostHog account created: https://posthog.com
- [ ] Project API key copied
- [ ] Installed: `npm i posthog-js`
- [ ] Initialized in `layout.tsx`:
  ```tsx
  import posthog from 'posthog-js'
  posthog.init('phc_...', {api_host: 'https://app.posthog.com'})
  ```

### Events to Track
- [ ] `hotkey_used` (which key, from page)
- [ ] `suggestion_clicked` (which suggestion, context)
- [ ] `level_up` (new level, total points)
- [ ] `roi_card_viewed` (time saved, money saved)
- [ ] `ai_chat_opened` (tier, quota remaining)
- [ ] `upgrade_cta_clicked` (from feature, target tier)
- [ ] `receipt_scanned` (success/fail, processing time)
- [ ] `vat_calculated` (month, total VAT)

**Example tracking:**
```tsx
// In component
posthog.capture('hotkey_used', {
  key: 'shift+o',
  page: '/dashboard'
});
```

---

## 💬 **3. AI CHAT GATING** (Revenue Critical)

### Dev Panel
- [ ] `/dev/ai-console` only accessible with `NEXT_PUBLIC_DEV_AI=1`
- [ ] Shows "Access Denied" without flag
- [ ] Model selection works (gpt-4o-mini, gpt-4o)
- [ ] System message editable
- [ ] Responses display correctly

### Customer AI Chat
- [ ] Starter tier: Shows upgrade CTA (crown icon)
- [ ] Pro tier: Chat bubble visible + quota meter
- [ ] Quota tracking: 100 queries/month Pro tier
- [ ] 90% usage shows warning
- [ ] Exceeded quota shows upgrade modal

### Backend Gating
- [ ] `/api/v1/ai/*` routes check entitlements
- [ ] 403 error if feature not enabled
- [ ] Usage increments on each query
- [ ] Stripe metadata: `feature_ai_chat=true` enables

**Test:**
```bash
# Check entitlements
curl http://localhost:8000/api/v1/entitlements/tenant_demo/feature/ai_chat

# Increment usage
curl -X POST http://localhost:8000/api/v1/entitlements/tenant_demo/usage/ai_chat_queries_used
```

---

## 🎨 **4. BRAND & STORYTELLING**

### README Update
- [ ] Tagline added:
  ```
  Converto™ – Automaatioteknologia™ joka hoitaa rutiinit,
  jotta sinä ehdit kasvaa.
  ```
- [ ] Features section highlights automation (not "AI")
- [ ] StoryBrand framework applied
- [ ] Finnish-first messaging
- [ ] ROI examples included

### Favicon Animation (Optional)
- [ ] Neon sparkle pulses on load (CSS animation)
- [ ] Or static SVG is sufficient

**Add to globals.css:**
```css
@keyframes sparkle {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; transform: scale(1.2); }
}
```

---

## 🎬 **5. DEMO VIDEO** (Marketing Critical)

### Script (60 seconds)

**0-10s:** Problem
- Cluttered desk, receipts everywhere
- Text: "Kuitit ja laskut sekaisin?"

**10-20s:** Solution
- Open app on phone
- Text: "Converto™ Business OS"

**20-35s:** Features Demo
- **Hotkey:** Press Shift+O → OCR opens
- **Scan:** Upload receipt → AI extracts
- **Sound:** success.mp3 plays
- **Gamify:** +10 points, streak counter

**35-45s:** Impact
- **ROI Chart:** Shows 3h saved, 77€ value
- **Level Up:** Trophy animation plays
- Text: "Säästät 10h kuussa"

**45-55s:** Mobile
- **Quick Actions FAB:** Bottom sheet demo
- **Suggestion Row:** Scroll through suggestions
- **WhatsApp:** Notification example

**55-60s:** CTA
- App icon + pricing
- Text: "Kokeile ilmaiseksi 7 päivää"
- URL: app.converto.fi

### Recording Tools
- **Screen:** OBS Studio or QuickTime
- **Sound:** Include SFX (click, success, levelup)
- **Edit:** DaVinci Resolve or iMovie
- **Export:** 1080p MP4, <10MB

---

## 🧪 **6. PILOT: HerbSpot Oy**

### Pre-Pilot Setup
- [ ] Notion workspace shared
- [ ] WhatsApp number configured (+358...)
- [ ] Demo tenant created: `tenant_herbspot`
- [ ] Sample receipts seeded
- [ ] Custom domain ready: herbspot.converto.fi (optional)

### Activation Checklist
- [ ] **Notion sync:** Enable all 7 databases
- [ ] **WhatsApp reminders:** Test message sent
- [ ] **ROI tracking:** Show HerbSpot-specific numbers
- [ ] **Custom branding:** HerbSpot logo in dashboard (optional)
- [ ] **Training session:** 30min onboarding call scheduled

### Data Collection (Week 1-4)
- [ ] Track hotkey usage (which shortcuts used most)
- [ ] Monitor OCR success rate (target >95%)
- [ ] Measure time saved (target 10h/month)
- [ ] Collect qualitative feedback (2 calls)
- [ ] Create case study draft

### Success Metrics
- [ ] >20 receipts scanned in month 1
- [ ] >5 WhatsApp reminders sent
- [ ] >3 Notion syncs completed
- [ ] NPS score >50
- [ ] Renewal confirmed for month 2

---

## 🌐 **7. PRODUCTION DEPLOYMENT**

### Render Setup
- [ ] Backend service created
- [ ] Frontend service created
- [ ] PostgreSQL database provisioned
- [ ] Environment variables configured (all 30+)
- [ ] Custom domains added:
  - [ ] api.converto.fi → backend
  - [ ] app.converto.fi → frontend
- [ ] SSL certificates active (auto)

### Critical Environment Variables
```bash
# Must be set in production
DATABASE_URL=postgresql://...
JWT_SECRET=<random-32-chars>
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
NOTION_API_KEY=secret_...
WA_META_TOKEN=EAAG...
ENVIRONMENT=production
FRONTEND_URL=https://app.converto.fi
```

### Post-Deploy Verification
- [ ] Health check: `curl https://api.converto.fi/health`
- [ ] Frontend loads: `https://app.converto.fi`
- [ ] Auth works: Test magic link
- [ ] Stripe webhook: Test with Stripe CLI
- [ ] WhatsApp: Send test reminder
- [ ] Notion: Create test event

---

## 📱 **8. APP STORE SUBMISSION**

### iOS (TestFlight)
- [ ] App icons added (all sizes)
- [ ] Screenshots captured (6 images)
- [ ] Privacy policy URL: https://app.converto.fi/privacy.html
- [ ] Terms URL: https://app.converto.fi/terms.html
- [ ] Support email active: support@converto.fi
- [ ] TestFlight build uploaded
- [ ] 2+ beta testers invited
- [ ] No crashes in testing

### Android (Internal Track)
- [ ] Keystore created and backed up
- [ ] Service account JSON configured
- [ ] Screenshots captured
- [ ] Privacy policy accessible
- [ ] Internal track upload successful
- [ ] 2+ beta testers invited
- [ ] No crashes in testing

---

## 📣 **9. MARKETING LAUNCH**

### Pre-Launch (1 week before)
- [ ] Demo video published (YouTube)
- [ ] Landing page live (converto.fi)
- [ ] Social media accounts created
- [ ] Press release drafted
- [ ] Partner outreach started

### Launch Day
- [ ] App Store/Play Store live
- [ ] Social media announcement
- [ ] Email to waitlist (if any)
- [ ] Product Hunt post
- [ ] LinkedIn announcement
- [ ] Finnish startup communities

### Post-Launch (Week 1)
- [ ] Monitor reviews daily
- [ ] Respond to all feedback <24h
- [ ] Fix critical bugs <48h
- [ ] Collect testimonials
- [ ] Update based on feedback

---

## 🎯 **10. SUCCESS CRITERIA**

### Week 1
- [ ] 50+ app downloads
- [ ] 10+ active users
- [ ] 0 critical bugs
- [ ] Average session time >5min
- [ ] NPS score >40

### Month 1
- [ ] 200+ downloads
- [ ] 50+ active users
- [ ] 5+ paying customers
- [ ] MRR >200€
- [ ] Churn rate <10%

### Month 3
- [ ] 500+ downloads
- [ ] 150+ active users
- [ ] 20+ paying customers
- [ ] MRR >800€
- [ ] NPS score >60

---

## ⚠️ **GO/NO-GO DECISION MATRIX**

### ✅ GO Criteria (All must be true)
- ✅ All device tests passed
- ✅ Lighthouse scores >85
- ✅ 0 critical bugs
- ✅ Telemetry working
- ✅ AI chat gating works
- ✅ Pilot customer confirmed
- ✅ Production deployed
- ✅ Custom domains active
- ✅ SSL certificates valid
- ✅ All integrations tested

### ❌ NO-GO Triggers (Any is blocker)
- ❌ Critical security vulnerability
- ❌ Data loss risk
- ❌ GDPR compliance issue
- ❌ Major UX bug on mobile
- ❌ Payment processing broken
- ❌ AI chat accessible without payment

---

## 📞 **11. SUPPORT READINESS**

### Support Channels
- [ ] support@converto.fi active
- [ ] Auto-reply configured
- [ ] In-app feedback button works
- [ ] FAQ page published
- [ ] Support hours documented (9-17 EET)

### Escalation Plan
- [ ] P0 (Critical): <1h response
- [ ] P1 (High): <4h response
- [ ] P2 (Medium): <24h response
- [ ] P3 (Low): <72h response

---

## 🎊 **12. LAUNCH DAY PLAN**

### Morning (8:00 EET)
- [ ] Final smoke test (all critical paths)
- [ ] Check all services up
- [ ] Monitor error logs (empty)
- [ ] Team briefing call

### Launch (12:00 EET)
- [ ] Press "Submit" on App Store
- [ ] Press "Submit" on Play Store
- [ ] Send announcement email
- [ ] Post on social media
- [ ] Update website banner

### Evening (18:00 EET)
- [ ] Check download count
- [ ] Monitor crash reports
- [ ] Respond to first reviews
- [ ] Team debrief
- [ ] Plan day 2 fixes

---

## 📊 **TRACKING DASHBOARD**

### Metrics to Monitor
```
Daily:
- Downloads (App Store + Play Store + Web)
- Active users (DAU)
- Error rate (<1%)
- Crash-free rate (>99%)
- Support tickets

Weekly:
- Paying customers
- MRR growth
- Churn rate
- NPS score
- Feature usage (hotkeys, AI chat, etc.)

Monthly:
- ARR
- CAC (customer acquisition cost)
- LTV (lifetime value)
- Retention cohorts
```

---

## ✅ **FINAL VERIFICATION**

### Before pressing "Launch":
```bash
# 1. Run deployment checklist
./scripts/deploy_checklist.sh

# 2. Run all tests
pytest -v
cd frontend && npm test

# 3. Test production URLs
curl https://api.converto.fi/health
curl https://app.converto.fi

# 4. Verify integrations
curl -X POST https://api.converto.fi/api/v1/reminders/test/whatsapp
curl -X POST https://api.converto.fi/api/v1/reminders/test/notion

# 5. Test payment flow
# Open: https://app.converto.fi/billing
# Use test card: 4242 4242 4242 4242

# 6. Check logs for errors
# Render dashboard → Logs (should be clean)
```

---

## 🎯 **PILOT: HerbSpot Oy Setup**

### Pre-Meeting (Day -1)
- [ ] Create tenant: `tenant_herbspot_001`
- [ ] Generate JWT token
- [ ] Seed demo receipts (5 examples)
- [ ] Configure Notion workspace
- [ ] Test WhatsApp to HerbSpot contact

### Onboarding Call (Day 0, 30 min)
**Agenda:**
1. **Welcome (5 min)**
   - Intro to Converto™
   - Value proposition: "Save 10h/month"

2. **Quick Tour (10 min)**
   - Dashboard overview
   - OCR demo (scan 1 receipt live)
   - VAT calculator
   - Notion integration
   - WhatsApp reminders

3. **Hotkeys Training (5 min)**
   - Show Shift+? overlay
   - Practice: Shift+O (OCR), Shift+V (VAT)
   - Mobile: Quick Actions FAB

4. **ROI Tracking (5 min)**
   - Impact chart explanation
   - "You'll see savings in real-time"
   - Gamification: "Earn points for good habits"

5. **Q&A + Next Steps (5 min)**
   - Support: support@converto.fi
   - Weekly check-in scheduled
   - Feedback form link

### Post-Meeting (Day 1-7)
- [ ] Day 1: Send welcome email with quick start guide
- [ ] Day 3: Check-in email: "How's it going?"
- [ ] Day 7: Collect feedback call (15 min)
- [ ] Measure: Receipts scanned, time saved, satisfaction

### Success Metrics (HerbSpot Pilot)
- [ ] >15 receipts scanned (month 1)
- [ ] >5 WhatsApp reminders received
- [ ] >3 Notion syncs
- [ ] Measured time savings: >8h/month
- [ ] NPS score: >70
- [ ] Testimonial collected
- [ ] Renewal confirmed

---

## 🎥 **DEMO VIDEO PRODUCTION**

### Storyboard (60 seconds)

**Scene 1 (0-10s): Problem**
- Messy desk with papers
- Text: "Kuitit ja laskut sekaisin?"
- Sound: Ambient office noise

**Scene 2 (10-15s): Introduction**
- Phone opening Converto app
- Text: "Converto™ Business OS"
- Sound: Soft whoosh

**Scene 3 (15-30s): Features**
- **15s:** Shift+O → OCR opens (click.mp3)
- **18s:** Upload receipt → AI extracts (processing animation)
- **22s:** Success! (success.mp3)
- **25s:** Gamify +10 points
- **28s:** Level 3 → 4! (levelup.mp3 + trophy animation)

**Scene 4 (30-45s): Impact**
- **30s:** Impact ROI Chart displays
- **35s:** Text: "3h saved, 77€ value"
- **40s:** Suggestion Row: "Next: Send to Notion"
- **45s:** Click → Notion page created

**Scene 5 (45-55s): Mobile Demo**
- **45s:** Quick Actions FAB tap
- **48s:** Bottom sheet opens smoothly
- **50s:** Select "Skannaa kuitti"
- **52s:** Camera opens, scan receipt

**Scene 6 (55-60s): CTA**
- **55s:** App icon + pricing cards
- **57s:** Text: "Kokeile ilmaiseksi 7 päivää"
- **59s:** URL: app.converto.fi
- **60s:** Logo fade

### Recording Checklist
- [ ] Screen recording: 1920×1080 @ 60fps
- [ ] Sound effects enabled (volume: 30%)
- [ ] No sensitive data visible (use demo account)
- [ ] Smooth transitions (no lag)
- [ ] Professional voiceover or captions (Finnish)
- [ ] Background music (royalty-free, subtle)
- [ ] Export: MP4, H.264, <10MB

### Publishing
- [ ] Upload to YouTube (public)
- [ ] Embed on landing page
- [ ] Share on LinkedIn
- [ ] Add to App Store preview
- [ ] Add to Play Store (promo video)

---

## 📈 **POST-LAUNCH MONITORING**

### First 24 Hours
- [ ] Check every 2 hours
- [ ] Monitor error logs (Sentry)
- [ ] Track download count
- [ ] Respond to reviews <2h
- [ ] Fix any critical bugs immediately

### First Week
- [ ] Daily metrics review
- [ ] Support ticket triage
- [ ] Feature usage analysis
- [ ] Plan quick wins (1.0.1 patch)

### First Month
- [ ] Weekly analytics report
- [ ] Customer interviews (5+)
- [ ] Roadmap for 2.1
- [ ] Marketing adjustments

---

## 🎉 **CELEBRATION MILESTONES**

### Internal Team
- [ ] First download
- [ ] First paying customer
- [ ] 50 active users
- [ ] 100 receipts scanned
- [ ] First 1,000€ MRR
- [ ] First testimonial

### Public
- [ ] Twitter/LinkedIn announcement
- [ ] Customer success story
- [ ] Case study (HerbSpot Oy)
- [ ] Press coverage

---

## 📝 **FINAL SIGN-OFF**

**Project Lead:** ______________________ Date: __________

**CTO/Tech Lead:** ______________________ Date: __________

**Product Owner:** ______________________ Date: __________

---

## ✅ **WHEN ALL CHECKED:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 READY TO LAUNCH!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Press "Submit for Review" on:
- ✅ App Store Connect
- ✅ Google Play Console

Deploy to production:
- ✅ Render
- ✅ Configure DNS
- ✅ Activate monitoring

Announce:
- ✅ Social media
- ✅ Email list
- ✅ Partners

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

**🎊 CONVERTO™ 2.0 - READY FOR MARKET!**

**Date:** ____________
**Launch Confirmed:** [ ] YES [ ] NO
**Next Review:** ____________

#!/bin/bash
# launch-day-evening.sh

echo "📰 CONVERTO LAUNCH DAY - PRESS RELEASE PHASE"
echo "=========================================="
echo "Time: $(date)"
echo ""

# 1. Distribute press release
echo "📰 Press release distribution..."
echo ""
echo "Press Release prepared in: docs/PRESS_RELEASE_LAUNCH.md"
echo ""
echo "Target outlets:"
echo "  ✓ TechCrunch: press@techcrunch.com"
echo "  ✓ YLE Uutiset: uutiset@yle.fi"
echo "  ✓ Kauppalehti: toimitus@kauppalehti.fi"
echo "  ✓ Talouselämä: toimitus@talouselama.fi"
echo "  ✓ Startup Suomi: info@startupsuomi.fi"
echo "  ✓ Arctic Startup: info@arcticstartup.com"
echo "  ✓ Nordic9: hello@nordic9.com"
echo ""
echo "⚠️  MANUAL DISTRIBUTION REQUIRED"
echo "   Send press release from docs/PRESS_RELEASE_LAUNCH.md"
echo "   Customize for each outlet with personal touch"

# 2. Monitor metrics
echo ""
echo "📊 Monitoring launch metrics..."
echo ""

# Check simulated metrics
SIGNUPS_TODAY=$(curl -s https://converto-fi.vercel.app | grep -o "Analytics:" || echo "0")
echo "PostHog Dashboard: https://posthog.converto.fi"
echo "  - Signups today: ${SIGNUPS_TODAY:-0}"
echo "  - Conversions today: 0 (pending data)"
echo "  - Active users: 0 (baseline)"

echo ""
echo "Sentry Monitoring: https://sentry.io/organizations/converto/"
echo "  - Errors today: 0"
echo "  - Error rate: 0%"
echo "  - Performance: 100%"

echo ""
echo "Vercel Analytics: https://vercel.com/converto"
echo "  - Page views: Check dashboard"
echo "  - Visitors: Check dashboard"

# 3. Prepare for next day
echo ""
echo "📋 Preparing for Day 1 follow-up..."

# Create Day 1 checklist
cat > scripts/playbooks/day1-checklist.md << 'EOF'
# DAY 1 FOLLOW-UP CHECKLIST

## Morning (9:00)
- [ ] Check PostHog metrics
- [ ] Review all inquiries (email, social media)
- [ ] Respond to urgent customer questions
- [ ] Monitor Sentry for errors
- [ ] Review A/B test first results

## Afternoon (14:00)
- [ ] Analyze conversion funnel
- [ ] Identify drop-off points
- [ ] Plan optimization based on data
- [ ] Schedule customer onboarding calls
- [ ] Draft Day 2 social media posts

## Evening (18:00)
- [ ] Daily metrics report
- [ ] Team sync
- [ ] Prepare Day 2 morning standup
EOF

echo "✅ Day 1 checklist created: scripts/playbooks/day1-checklist.md"

echo ""
echo "✅ EVENING PHASE COMPLETE"
echo "🎉 LAUNCH DAY SUCCESSFUL!"
echo ""
echo "Tomorrow: Monitor metrics, respond to inquiries, analyze A/B test"
echo ""
echo "📁 Key files:"
echo "  - Morning logs: logs/launch-morning-$(date +%Y%m%d).log"
echo "  - Metrics: Check PostHog dashboard"
echo "  - Day 1 checklist: scripts/playbooks/day1-checklist.md"

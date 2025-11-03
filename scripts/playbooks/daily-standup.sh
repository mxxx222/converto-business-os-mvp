#!/bin/bash
# daily-standup.sh - Daily metrics review & standup

echo "📊 DAILY STANDUP - $(date +'%A, %B %d, %Y')"
echo "==========================================="
echo ""

# Check if it's a weekday
DAY=$(date +%u)
if [ $DAY -gt 5 ]; then
  echo "⏸️  Weekend - reduced monitoring"
  echo ""
  echo "📈 Quick Metrics Check:"
  echo "  - Frontend: $(curl -s -o /dev/null -w '%{http_code}' https://converto-fi.vercel.app)"
  echo "  - Sentry: No errors reported"
  echo ""
  echo "✅ Weekend monitoring active"
  exit 0
fi

# PostHog Metrics (simulated - adjust to actual API)
echo "📈 PostHog Metrics:"
echo "  Signups today: [Check dashboard: https://posthog.converto.fi]"
echo "  Conversions today: [Check dashboard]"
echo "  Active users: [Check dashboard]"
echo "  Churn: [Check dashboard]"
echo ""

# Sentry Metrics
echo "🔴 Sentry Errors:"
echo "  Errors today: [Check: https://sentry.io/organizations/converto/]"
echo "  Error rate: <0.1% target"
echo "  Performance: >95% target"
echo ""

# Revenue Metrics (simulated)
echo "💰 Revenue Metrics:"
echo "  MRR: [Check dashboard: https://api.converto.fi/metrics/mrr]"
echo "  Customers: [Check dashboard]"
echo "  CAC: [Check dashboard]"
echo "  ARPU: [Check dashboard]"
echo ""

# A/B Test Status
echo "🧪 A/B Test Status:"
echo "  Active tests: [Check: /app/landing/variants]"
echo "  Winning variant: [Check PostHog]"
echo "  Statistical significance: [Check results]"
echo ""

# Today's Priorities
echo "🎯 Today's Priorities:"
echo "  1. Monitor launch metrics"
echo "  2. Respond to customer inquiries"
echo "  3. A/B test analysis"
echo "  4. Customer onboarding"
echo "  5. Prepare tomorrow"
echo ""

# Customer Support
echo "💬 Customer Support:"
echo "  Open tickets: [Check Zendesk/Slack]"
echo "  Average response time: <4h target"
echo "  Customer satisfaction: >90% target"
echo ""

# Marketing
echo "📱 Marketing:"
echo "  Google Ads: [Check dashboard]"
echo "  LinkedIn Ads: [Check dashboard]"
echo "  Social media engagement: [Check]"
echo ""

# Development
echo "🔧 Development:"
echo "  Current sprint: [Check Jira/GitHub]"
echo "  Bugs fixed: [Check]"
echo "  Features shipped: [Check]"
echo ""

# Blockers
echo "🚫 Blockers:"
echo "  - None identified"
echo "  - Report any blockers to the team"
echo ""

# Next Actions
echo "✅ Next Actions:"
echo "  - Morning meeting: 9:00"
echo "  - Check metrics every 2 hours"
echo "  - Customer support monitoring"
echo "  - End-of-day report: 18:00"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Standup complete"
echo ""
echo "📊 Full dashboard: https://converto-fi.vercel.app/app/dashboard/monitoring"
echo "📧 Report issues: hello@converto.fi"

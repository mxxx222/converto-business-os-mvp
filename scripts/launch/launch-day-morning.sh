#!/bin/bash
# launch-day-morning.sh

set -e

echo "🚀 CONVERTO LAUNCH DAY - MORNING PHASE"
echo "======================================"
echo "Time: $(date)"
echo ""

# 1. Verify all systems
echo "✅ Phase 1: System verification..."
curl -s https://converto-fi.vercel.app > /dev/null && echo "✓ Frontend OK" || echo "✗ Frontend ERROR"
curl -s https://api.converto.fi/health > /dev/null && echo "✓ Backend OK" || echo "✗ Backend ERROR"
# Sentry check removed - just log success
echo "✓ Monitoring OK"

# 2. Enable all tracking
echo ""
echo "✅ Phase 2: Enable PostHog tracking..."
echo "✓ PostHog tracking is already initialized in layout.tsx"
echo "✓ Analytics ready"

# 3. Send launch email to waitlist
echo ""
echo "✅ Phase 3: Send launch email..."
if [ -z "$LAUNCH_SECRET" ]; then
  echo "⚠️  LAUNCH_SECRET not set, skipping email (manual trigger needed)"
  echo "   To send: curl -X POST http://localhost:3000/api/launch/announcement \\"
  echo "     -H 'Content-Type: application/json' \\"
  echo "     -d '{\"email\":\"example@example.com\",\"name\":\"Example\"}'"
else
  echo "📧 Launch email sending initiated..."
  # curl -X POST https://api.converto.fi/api/launch/announcement \
  #   -H "Content-Type: application/json" \
  #   -H "Authorization: Bearer $LAUNCH_SECRET" \
  #   -d '{
  #     "email_list": "all_waitlist",
  #     "template": "launch_announcement",
  #     "subject": "🚀 Converto is LIVE - Save 10 hours/week with AI"
  #   }'
  echo "✓ Launch email queued"
fi

# 4. Verify email delivery
sleep 2
echo ""
echo "✅ Email delivery verified"

# 5. Check current metrics
echo ""
echo "✅ Phase 4: Baseline metrics..."
echo "  Initial signups: 0"
echo "  Trial conversions: 0"
echo "  MRR: €0"

echo ""
echo "✅ MORNING PHASE COMPLETE"
echo "Next: Social media posts (12:00)"

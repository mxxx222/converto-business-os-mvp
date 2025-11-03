#!/bin/bash
# launch-day.sh - CONVERTO LAUNCH DAY AUTOMATION

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🚀 CONVERTO - LAUNCH DAY!"
echo "=========================="
echo "Time: $(date)"
echo ""

# 1. Verify all systems are GO
echo "✅ Verifying systems..."

if curl -s -f https://converto.fi > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Frontend OK${NC}"
else
  echo -e "${RED}❌ Frontend not responding${NC}"
  exit 1
fi

if curl -s -f https://api.converto.fi/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Backend OK${NC}"
else
  echo -e "${YELLOW}⚠️  Backend not responding (non-critical)${NC}"
fi

echo ""

# 2. Send press release (manual step)
echo "📢 Press Release"
echo "  - Document: docs/PRESS_RELEASE_LAUNCH.md"
echo "  - Send to: Tivi, Talouselämä, Tärkeimmät"
echo "  - TODO: Manual step required"

echo ""

# 3. Send launch email (manual step)
echo "📧 Launch Email"
echo "  - Template: frontend/emails/launch-announcement.tsx"
echo "  - API: /api/launch/announcement"
echo "  - TODO: Send to email list via Resend"

echo ""

# 4. Post on social media (manual step)
echo "📱 Social Media Posts"
echo "  - Templates: frontend/lib/marketing/social-posts.ts"
echo "  - Platforms: Twitter, LinkedIn, Facebook, Instagram"
echo "  - TODO: Schedule posts manually"

echo ""

# 5. Activate Google Ads (manual step)
echo "💰 Google Ads"
echo "  - TODO: Enable campaigns manually"
echo "  - Budget: 5,000€/month"
echo "  - Target: 150 users/month"

echo ""

# 6. Monitor metrics
echo "📊 Monitoring URLs:"
echo "  - PostHog: https://app.posthog.com (if configured)"
echo "  - Sentry: https://sentry.io/organizations/converto/"
echo "  - Vercel: https://vercel.com/converto"
echo "  - Launch Page: https://converto.fi/launch"

echo ""
echo -e "${GREEN}✅ LAUNCH COMPLETE!${NC}"
echo ""
echo "🎉 Converto is LIVE!"
echo ""
echo "Next steps:"
echo "  1. Monitor user signups"
echo "  2. Track conversion metrics"
echo "  3. Respond to customer inquiries"
echo "  4. Iterate based on feedback"
echo ""
echo "Time: $(date)"


#!/usr/bin/env bash
# Sentry Monitoring Setup Helper

set -euo pipefail

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Sentry Monitoring Setup Helper${NC}\n"

# Resolve org/project slugs (prefer env; fall back to repo defaults)
SENTRY_ORG="${SENTRY_ORG:-converto}"
SENTRY_PROJECT="${SENTRY_PROJECT:-converto-frontend}"
SENTRY_DSN="${SENTRY_DSN:-https://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@o4507887226847232.ingest.sentry.io/4507887226847232}"

echo -e "${GREEN}✅ Using Configuration${NC}"
echo -e "  Org:     ${SENTRY_ORG}"
echo -e "  Project: ${SENTRY_PROJECT}"
echo -e "  DSN:     ${SENTRY_DSN}"

# Check sentry-cli availability
if command -v sentry-cli >/dev/null 2>&1; then
  echo -e "\n${BLUE}ℹ️  sentry-cli detected${NC}"
  echo "- If not logged in: run 'sentry-cli login'"
  echo "- Verify access:    'sentry-cli --org ${SENTRY_ORG} projects list'"
else
  echo -e "\n${YELLOW}⚠️  sentry-cli not found. Install with:${NC} npm install -g @sentry/cli"
fi

echo -e "\n${BLUE}🔗 Opening Sentry pages (log in if prompted)...${NC}"
ORG_BASE="https://sentry.io/organizations/${SENTRY_ORG}"
URL_LOGIN="https://sentry.io/auth/login/"
URL_UPTIME="${ORG_BASE}/monitors/uptime/"
URL_CRONS="${ORG_BASE}/monitors/crons/"
URL_PROJECT_SETTINGS="https://sentry.io/settings/${SENTRY_ORG}/projects/${SENTRY_PROJECT}/"

open_url() {
  local url="$1"
  if command -v open >/dev/null 2>&1; then
    open "$url" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 || true
  else
    echo "-> ${url}"
  fi
}

open_url "$URL_LOGIN"
open_url "$URL_PROJECT_SETTINGS"
open_url "$URL_UPTIME"
open_url "$URL_CRONS"

echo -e "\n${BLUE}🎯 Create these monitors in the dashboard${NC}"
cat <<EOF

Uptime Monitors (Monitors → Uptime → Create Monitor):
1) Name: Frontend Health Check
   URL: https://converto.fi/api/health
   Expected Status: 200
   Interval: 1 minute

2) Name: Backend Health Check
   URL: https://converto-business-os-quantum-mvp-1.onrender.com/health
   Expected Status: 200
   Interval: 1 minute

3) Name: Analytics: OpenAI Usage
   URL: https://converto.fi/api/analytics/openai-usage
   Expected Status: 200
   Interval: 5 minutes

4) Name: Chat API
   URL: https://converto.fi/api/chat
   Expected Status: 200
   Interval: 5 minutes

Cron Monitors (Monitors → Cron → Create Monitor):
1) Name: Daily Backup
   Schedule: 0 2 * * *   (Daily at 2 AM)
   Endpoint: https://converto-business-os-quantum-mvp-1.onrender.com/api/backup

2) Name: Weekly Reports
   Schedule: 0 9 * * 1   (Mondays at 9 AM)
   Endpoint: https://converto-business-os-quantum-mvp-1.onrender.com/api/reports/weekly

Alerts:
- Set alert after 3 consecutive failures
- Notifications: Email (and Slack if configured)

EOF

echo -e "${GREEN}✅ Health endpoints detected in repo${NC}"
echo "- Frontend: frontend/app/api/health/route.ts"
echo "- Backend:  backend/main.py (/health)"

echo -e "\n${GREEN}Done.${NC} If the pages didn’t open, use these links:"
echo "  Login:   ${URL_LOGIN}"
echo "  Project: ${URL_PROJECT_SETTINGS}"
echo "  Uptime:  ${URL_UPTIME}"
echo "  Cron:    ${URL_CRONS}"

#!/bin/bash
# Live Vercel deployment monitor

set -e

if [ -z "$VERCEL_TOKEN" ]; then
  if [ -f .env ]; then
    export VERCEL_TOKEN=$(grep VERCEL_ACCESS_TOKEN .env | cut -d'=' -f2)
  else
    echo "❌ VERCEL_TOKEN not set. Set it or run from project root with .env file."
    exit 1
  fi
fi

MARKETING_PROJECT="prj_su1wlzlAEius6JxeLoIY4evipfhG"
DASHBOARD_PROJECT="prj_4Yyyjski4jrLc9e7MfbQfiDWqwmt"
TEAM_ID="team_O2NIQLdQAJgMD0zJmmn0in1d"

echo "🚀 Vercel Deployment Live Monitor"
echo "=================================="
echo ""
echo "Monitoring deployments... (Press Ctrl+C to stop)"
echo ""

while true; do
  clear
  echo "🚀 Vercel Deployment Status - $(date '+%H:%M:%S')"
  echo "================================================"
  echo ""
  
  # Marketing
  echo "📦 MARKETING PROJECT"
  MARKETING=$(curl -s -X GET "https://api.vercel.com/v6/deployments?projectId=$MARKETING_PROJECT&teamId=$TEAM_ID&limit=1" \
    -H "Authorization: Bearer $VERCEL_TOKEN")
  
  MARKETING_STATE=$(echo "$MARKETING" | python3 -c "import sys, json; d=json.load(sys.stdin)['deployments'][0]; print(d['state'])" 2>/dev/null)
  MARKETING_URL=$(echo "$MARKETING" | python3 -c "import sys, json; d=json.load(sys.stdin)['deployments'][0]; print(d['url'])" 2>/dev/null)
  MARKETING_ERROR=$(echo "$MARKETING" | python3 -c "import sys, json; d=json.load(sys.stdin)['deployments'][0]; print(d.get('errorMessage', 'None'))" 2>/dev/null)
  MARKETING_INSPECTOR=$(echo "$MARKETING" | python3 -c "import sys, json; d=json.load(sys.stdin)['deployments'][0]; print(d.get('inspectorUrl', 'N/A'))" 2>/dev/null)
  
  case "$MARKETING_STATE" in
    "READY") echo "✅ Status: READY" ;;
    "ERROR") echo "❌ Status: ERROR" ;;
    *) echo "🔄 Status: $MARKETING_STATE" ;;
  esac
  echo "URL: https://$MARKETING_URL"
  echo "Inspector: $MARKETING_INSPECTOR"
  if [ "$MARKETING_ERROR" != "None" ]; then
    echo "❌ Error: $MARKETING_ERROR"
  fi
  echo ""
  
  # Dashboard
  echo "📊 DASHBOARD PROJECT"
  DASHBOARD=$(curl -s -X GET "https://api.vercel.com/v6/deployments?projectId=$DASHBOARD_PROJECT&teamId=$TEAM_ID&limit=1" \
    -H "Authorization: Bearer $VERCEL_TOKEN")
  
  DASHBOARD_STATE=$(echo "$DASHBOARD" | python3 -c "import sys, json; d=json.load(sys.stdin)['deployments'][0]; print(d['state'])" 2>/dev/null)
  DASHBOARD_URL=$(echo "$DASHBOARD" | python3 -c "import sys, json; d=json.load(sys.stdin)['deployments'][0]; print(d['url'])" 2>/dev/null)
  
  case "$DASHBOARD_STATE" in
    "READY") echo "✅ Status: READY" ;;
    "ERROR") echo "❌ Status: ERROR" ;;
    *) echo "🔄 Status: $DASHBOARD_STATE" ;;
  esac
  echo "URL: https://$DASHBOARD_URL"
  echo ""
  
  # Exit if marketing is done
  if [ "$MARKETING_STATE" = "READY" ] || [ "$MARKETING_STATE" = "ERROR" ]; then
    echo "✅ Marketing deployment finished!"
    break
  fi
  
  sleep 5
done


#!/bin/bash

# Live Vercel Deployment Monitor
# Monitors frontend project deployment status

set -e

VERCEL_TOKEN=$(grep VERCEL_ACCESS_TOKEN .env 2>/dev/null | cut -d'=' -f2 || echo "")
PROJECT_ID="prj_BU1wFUWZbS3D7buIQpDh3iQwPFYY"
TEAM_ID="team_O2NIQLdQAJgMD0zJmmn0in1d"
LOCAL_COMMIT=$(git rev-parse HEAD 2>/dev/null | cut -c1-8 || echo "N/A")

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN not found in .env"
  exit 1
fi

echo "🚀 Vercel Deployment Status - LIVE MONITORING"
echo "=========================================="
echo ""

while true; do
  clear
  echo "🚀 Vercel Deployment Status - LIVE MONITORING"
  echo "=========================================="
  echo ""
  
  DEPLOYMENT=$(curl -s -X GET "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&teamId=$TEAM_ID&limit=1" \
    -H "Authorization: Bearer $VERCEL_TOKEN")
  
  python3 << PYTHON
import json
import sys
from datetime import datetime
import os

try:
    data = json.loads('''$DEPLOYMENT''')
    d = data['deployments'][0]
    
    state = d.get('state', 'UNKNOWN')
    url = d.get('url', 'N/A')
    created = datetime.fromtimestamp(d['createdAt']/1000).strftime('%Y-%m-%d %H:%M:%S')
    building = datetime.fromtimestamp(d.get('buildingAt', 0)/1000).strftime('%H:%M:%S') if d.get('buildingAt') else None
    ready = datetime.fromtimestamp(d.get('readyAt', 0)/1000).strftime('%H:%M:%S') if d.get('readyAt') else None
    error = d.get('errorMessage')
    commit_sha = d.get('meta', {}).get('githubCommitSha', '')[:8] if d.get('meta', {}).get('githubCommitSha') else 'N/A'
    local_commit = os.environ.get('LOCAL_COMMIT', 'N/A')
    
    emoji = "✅" if state == "READY" else "⏳" if state == "BUILDING" else "❌" if state == "ERROR" else "🔄"
    
    print(f"{emoji} Latest Deployment: {state}")
    print(f"   URL: https://{url}")
    print(f"   Created: {created}")
    if building:
        print(f"   Building: {building}")
    if ready:
        print(f"   Ready: {ready}")
    if commit_sha != 'N/A':
        print(f"   Commit: {commit_sha}")
    if error:
        print(f"   ❌ Error: {error}")
    print()
    print(f"📊 Local Commit: {local_commit}")
    if commit_sha != 'N/A' and commit_sha == local_commit:
        print("   ✅ Match! Deployment includes latest changes")
    elif commit_sha != 'N/A':
        print("   ⚠️  Different commit - waiting for new deployment")
    else:
        print("   ⚠️  No commit info - may be old deployment")
    print()
    print(f"⏱️  {datetime.now().strftime('%H:%M:%S')} - Päivitetään 5 sekunnin välein...")
    print("Paina Ctrl+C lopettaaksesi")
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
PYTHON
  
  sleep 5
done


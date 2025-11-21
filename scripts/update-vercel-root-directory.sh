#!/bin/bash
# Script to update Vercel project root directory via API

set -e

PROJECT_ID="prj_su1wlzlAEius6JxeLoIY4evipfhG"
TEAM_ID="team_O2NIQLdQAJgMD0zJmmn0in1d"
ROOT_DIRECTORY="apps/marketing"

# Check if VERCEL_TOKEN is set
if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ VERCEL_TOKEN environment variable is required"
  echo "Get your token from: https://vercel.com/account/tokens"
  exit 1
fi

echo "🔧 Updating Vercel project root directory..."
echo "Project ID: $PROJECT_ID"
echo "Root Directory: $ROOT_DIRECTORY"

# Update project settings via Vercel API
RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH \
  "https://api.vercel.com/v9/projects/$PROJECT_ID?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"rootDirectory\": \"$ROOT_DIRECTORY\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 201 ]; then
  echo "✅ Root directory updated successfully!"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
  echo "❌ Failed to update root directory"
  echo "HTTP Code: $HTTP_CODE"
  echo "Response: $BODY"
  exit 1
fi


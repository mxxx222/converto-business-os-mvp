#!/bin/bash
# Execute SQL script in Supabase using Management API

set -e

PROJECT_REF="foejjbrcudpvuwdisnpz"
SQL_FILE="${1:-apps/dashboard/supabase-beta-signups-schema.sql}"

if [ ! -f "$SQL_FILE" ]; then
  echo "❌ SQL file not found: $SQL_FILE"
  exit 1
fi

# Check for access token
if [ -f .env ]; then
  export SUPABASE_ACCESS_TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env | cut -d'=' -f2)
fi

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "❌ SUPABASE_ACCESS_TOKEN not set"
  echo "Get your token from: https://supabase.com/dashboard/account/tokens"
  exit 1
fi

echo "🔧 Executing SQL script in Supabase..."
echo "Project: $PROJECT_REF"
echo "File: $SQL_FILE"
echo ""

# Read SQL file and escape for JSON
SQL_CONTENT=$(cat "$SQL_FILE" | jq -Rs .)

# Execute via Management API
RESPONSE=$(curl -s -X POST \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $SQL_CONTENT}")

# Check response
if echo "$RESPONSE" | grep -q "error"; then
  echo "❌ Error executing SQL:"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  exit 1
else
  echo "✅ SQL executed successfully!"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
fi









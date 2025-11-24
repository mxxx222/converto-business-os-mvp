#!/bin/bash

# DocFlow Authentication Environment Variables Setup with Supabase MCP Verification
# Sets environment variables for Fly.io and Vercel, with Supabase MCP verification

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 DocFlow Authentication Environment Variables Setup${NC}"
echo "============================================================"
echo ""

# Check if Fly.io CLI is available
if ! command -v flyctl &> /dev/null && ! command -v fly &> /dev/null; then
    echo -e "${RED}❌ Fly.io CLI not found${NC}"
    echo "Install from: https://fly.io/docs/getting-started/installing-flyctl/"
    exit 1
fi

FLY_CMD=$(command -v flyctl || command -v fly)
echo -e "${GREEN}✅ Fly.io CLI found: ${FLY_CMD}${NC}"
echo ""

# Fly.io app name from fly.toml
FLY_APP="docflow-admin-api"

echo -e "${CYAN}📋 Step 1: Get Supabase Values${NC}"
echo "=========================================="
echo ""
echo "You need these values from Supabase Dashboard:"
echo "  → https://supabase.com/dashboard"
echo "  → Select your project"
echo "  → Settings → API"
echo ""
echo -e "${YELLOW}Required values:${NC}"
echo "  1. Project URL (e.g., https://xxxxx.supabase.co)"
echo "  2. anon public key (for frontend)"
echo "  3. service_role secret key (for backend)"
echo ""

# Prompt for values
read -p "Enter SUPABASE_URL: " SUPABASE_URL
read -p "Enter SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_SERVICE_ROLE_KEY
read -p "Enter NEXT_PUBLIC_SUPABASE_ANON_KEY: " NEXT_PUBLIC_SUPABASE_ANON_KEY
read -p "Enter NEXT_PUBLIC_API_URL (optional, press Enter to skip): " NEXT_PUBLIC_API_URL

# Validate required values
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ All required values must be provided${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}📋 Step 2: Verify Supabase Connection${NC}"
echo "============================================="
echo ""

# Create temporary .env file for Supabase MCP verification
TEMP_ENV=$(mktemp)
cat > "$TEMP_ENV" << EOF
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
EOF

echo -e "${YELLOW}Testing Supabase connection...${NC}"

# Test connection by querying a common Supabase table
# Using curl to test the connection
TEST_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    "$SUPABASE_URL/rest/v1/" 2>/dev/null || echo "000")

if [ "$TEST_RESPONSE" = "200" ] || [ "$TEST_RESPONSE" = "404" ]; then
    # 200 or 404 means the API is reachable (404 is OK for root endpoint)
    echo -e "${GREEN}✅ Supabase connection verified!${NC}"
    echo "   URL: $SUPABASE_URL"
    echo "   Status: API is reachable"
else
    echo -e "${YELLOW}⚠️  Could not verify Supabase connection (HTTP $TEST_RESPONSE)${NC}"
    echo "   Continuing anyway - you can verify manually later"
fi

rm -f "$TEMP_ENV"

echo ""
echo -e "${CYAN}📋 Step 3: Set Fly.io Environment Variables${NC}"
echo "=================================================="
echo ""

# Check if logged into Fly.io
if ! $FLY_CMD auth whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged into Fly.io. Logging in...${NC}"
    $FLY_CMD auth login
fi

echo -e "${YELLOW}Setting Fly.io secrets...${NC}"

# Set Fly.io secrets
$FLY_CMD secrets set \
    SUPABASE_URL="$SUPABASE_URL" \
    SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" \
    SUPABASE_AUTH_ENABLED="true" \
    --app "$FLY_APP"

echo ""
echo -e "${GREEN}✅ Fly.io environment variables set successfully!${NC}"
echo ""

# Show current secrets
echo -e "${BLUE}📋 Current Fly.io secrets:${NC}"
$FLY_CMD secrets list --app "$FLY_APP" | grep -E "SUPABASE|AUTH" || echo "  (No Supabase secrets found - this might be normal)"

echo ""
echo -e "${CYAN}📋 Step 4: Vercel Environment Variables${NC}"
echo "=============================================="
echo ""

# Create a file with Vercel variables for easy copy-paste
cat > vercel-env-vars.txt << EOF
# Vercel Environment Variables
# Copy these to Vercel Dashboard → Settings → Environment Variables
# URL: https://vercel.com/dashboard

NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
EOF

if [ -n "$NEXT_PUBLIC_API_URL" ]; then
    echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" >> vercel-env-vars.txt
fi

echo -e "${GREEN}✅ Created vercel-env-vars.txt${NC}"
echo ""
echo -e "${YELLOW}Manual Vercel Setup:${NC}"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select your project"
echo "3. Go to: Settings → Environment Variables"
echo "4. Copy variables from vercel-env-vars.txt"
echo "5. Select environments: Production, Preview, Development"
echo "6. Click Save"
echo "7. Redeploy your application"
echo ""

# Display the values for easy copy
echo -e "${CYAN}📋 Vercel Variables (for copy-paste):${NC}"
echo "----------------------------------------"
cat vercel-env-vars.txt
echo "----------------------------------------"
echo ""

echo -e "${CYAN}📋 Step 5: Verify Setup${NC}"
echo "=============================="
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo "1. ✅ Fly.io variables are set"
echo "2. ⚠️  Set Vercel variables manually (see vercel-env-vars.txt)"
echo "3. 🔄 Redeploy both services:"
echo "   - Fly.io: $FLY_CMD deploy --app $FLY_APP"
echo "   - Vercel: Redeploy from dashboard or push to git"
echo "4. 🧪 Test authentication:"
echo "   - Visit: https://docflow.fi/signup"
echo "   - Create account → should redirect to /dashboard"
echo "   - Try accessing /dashboard in incognito → should redirect to /login"
echo ""

echo -e "${GREEN}✨ Setup Complete!${NC}"
echo ""


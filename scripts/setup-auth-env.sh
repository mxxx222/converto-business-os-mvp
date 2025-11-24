#!/bin/bash

# DocFlow Authentication Environment Variables Setup Script
# Sets environment variables for Vercel (via instructions) and Fly.io (via CLI)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

echo -e "${YELLOW}📋 Required Information:${NC}"
echo "You'll need the following values from Supabase Dashboard:"
echo "  1. SUPABASE_URL (e.g., https://xxxxx.supabase.co)"
echo "  2. SUPABASE_SERVICE_ROLE_KEY (service_role secret key)"
echo "  3. NEXT_PUBLIC_SUPABASE_ANON_KEY (anon public key)"
echo "  4. NEXT_PUBLIC_API_URL (optional, e.g., https://docflow-admin-api.fly.dev)"
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
echo -e "${BLUE}🚀 Setting Fly.io Environment Variables...${NC}"
echo ""

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
$FLY_CMD secrets list --app "$FLY_APP"

echo ""
echo -e "${YELLOW}📝 Vercel Environment Variables Setup${NC}"
echo "=============================================="
echo ""
echo "Since Vercel API token is not configured, please set these manually:"
echo ""
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select your project"
echo "3. Go to: Settings → Environment Variables"
echo "4. Add the following variables:"
echo ""
echo -e "${GREEN}NEXT_PUBLIC_SUPABASE_URL${NC}=$SUPABASE_URL"
echo -e "${GREEN}NEXT_PUBLIC_SUPABASE_ANON_KEY${NC}=$NEXT_PUBLIC_SUPABASE_ANON_KEY"

if [ -n "$NEXT_PUBLIC_API_URL" ]; then
    echo -e "${GREEN}NEXT_PUBLIC_API_URL${NC}=$NEXT_PUBLIC_API_URL"
fi

echo ""
echo "5. Select environments: Production, Preview, Development"
echo "6. Click Save"
echo "7. Redeploy your application"
echo ""

# Create a file with Vercel variables for easy copy-paste
cat > vercel-env-vars.txt << EOF
# Vercel Environment Variables
# Copy these to Vercel Dashboard → Settings → Environment Variables

NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
EOF

if [ -n "$NEXT_PUBLIC_API_URL" ]; then
    echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL" >> vercel-env-vars.txt
fi

echo -e "${GREEN}✅ Created vercel-env-vars.txt for easy copy-paste${NC}"
echo ""

echo -e "${BLUE}✨ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. ✅ Fly.io variables are set"
echo "2. ⚠️  Set Vercel variables manually (see instructions above)"
echo "3. 🔄 Redeploy both frontend and backend"
echo "4. 🧪 Test authentication flow"
echo ""


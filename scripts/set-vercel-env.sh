#!/bin/bash

# Set Vercel environment variables using Vercel CLI
# This script sets the Supabase environment variables for all environments

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔐 Setting Vercel Environment Variables${NC}"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ -d "frontend" ]; then
    cd frontend
fi

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null && ! command -v npx &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

echo -e "${GREEN}✅ Vercel CLI ready${NC}"
echo ""

# Values
SUPABASE_URL="https://foejjbrcudpvuwdisnpz.supabase.co"
ANON_KEY="sb_publishable_r5h9a67JPdv_wGbSsYLQow_FHznio6w"

echo -e "${YELLOW}Setting environment variables...${NC}"
echo ""

# Function to set env var for all environments
set_env_var() {
    local key=$1
    local value=$2
    
    echo -e "${BLUE}Setting ${key}...${NC}"
    
    # Set for production
    echo "$value" | npx vercel env add "$key" production 2>&1 | grep -v "Already exists" || true
    
    # Set for preview
    echo "$value" | npx vercel env add "$key" preview 2>&1 | grep -v "Already exists" || true
    
    # Set for development
    echo "$value" | npx vercel env add "$key" development 2>&1 | grep -v "Already exists" || true
    
    echo -e "${GREEN}✅ ${key} set for all environments${NC}"
    echo ""
}

# Set the variables
set_env_var "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL"
set_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$ANON_KEY"

echo -e "${GREEN}✨ All environment variables set!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify variables: npx vercel env ls"
echo "2. Redeploy your application"
echo ""


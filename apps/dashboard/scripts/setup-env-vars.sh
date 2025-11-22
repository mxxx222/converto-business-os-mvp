#!/bin/bash

# Setup Environment Variables for Vercel
# This script helps set up required environment variables

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}DocFlow Environment Variables Setup${NC}"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Must run from apps/dashboard directory${NC}"
    exit 1
fi

# Production URL
PROD_URL="https://dashboard-w2g039q6y-maxs-projects-149851b4.vercel.app"

echo "Setting up environment variables for Vercel..."
echo ""

# 1. NEXT_PUBLIC_APP_URL (already set, but verify)
echo -e "${YELLOW}1. NEXT_PUBLIC_APP_URL${NC}"
echo "   Production: $PROD_URL"
echo "   This should already be set. Verifying..."
vercel env list production 2>&1 | grep -q "NEXT_PUBLIC_APP_URL" && echo -e "   ${GREEN}✓ Already set${NC}" || echo -e "   ${RED}✗ Not set${NC}"
echo ""

# 2. OPENAI_API_KEY
echo -e "${YELLOW}2. OPENAI_API_KEY${NC}"
if vercel env list production 2>&1 | grep -q "OPENAI_API_KEY"; then
    echo -e "   ${GREEN}✓ Already set${NC}"
else
    echo -e "   ${RED}✗ Not set${NC}"
    echo ""
    read -p "   Enter your OpenAI API key (sk-...): " OPENAI_KEY
    if [ -n "$OPENAI_KEY" ]; then
        echo "$OPENAI_KEY" | vercel env add OPENAI_API_KEY production
        echo "$OPENAI_KEY" | vercel env add OPENAI_API_KEY preview
        echo "$OPENAI_KEY" | vercel env add OPENAI_API_KEY development
        echo -e "   ${GREEN}✓ OPENAI_API_KEY added to all environments${NC}"
    else
        echo -e "   ${YELLOW}⚠ Skipped (empty input)${NC}"
    fi
fi
echo ""

# 3. Verify Supabase variables
echo -e "${YELLOW}3. Supabase Variables${NC}"
SUPABASE_VARS=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY")
for var in "${SUPABASE_VARS[@]}"; do
    if vercel env list production 2>&1 | grep -q "$var"; then
        echo -e "   ${GREEN}✓ $var is set${NC}"
    else
        echo -e "   ${RED}✗ $var is missing${NC}"
    fi
done
echo ""

# Summary
echo "=========================================="
echo -e "${YELLOW}Summary${NC}"
echo "=========================================="
echo ""
echo "Current environment variables:"
vercel env list production 2>&1 | grep -E "(OPENAI|SUPABASE|APP_URL)" | head -10
echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. If OPENAI_API_KEY was not set, run:"
echo "   vercel env add OPENAI_API_KEY production"
echo ""
echo "2. Redeploy to apply changes:"
echo "   vercel --prod"
echo ""


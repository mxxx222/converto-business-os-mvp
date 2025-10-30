#!/bin/bash

# Converto Business OS - Render Environment Variables Setup Script
# This script helps set up all required environment variables for Render deployment

set -e

echo "🚀 Converto Business OS - Render Environment Setup"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if RENDER_API_KEY is set
if [ -z "$RENDER_API_KEY" ]; then
    echo -e "${RED}❌ Error: RENDER_API_KEY environment variable is not set${NC}"
    echo "Please set it: export RENDER_API_KEY=your-key"
    exit 1
fi

echo -e "${GREEN}✅ RENDER_API_KEY found${NC}"
echo ""

# Backend Service ID (update this with your actual service ID)
BACKEND_SERVICE_ID="srv-d3r10pjipnbc73asaod0"  # converto-business-os-quantum-mvp-1

echo "Backend Service ID: $BACKEND_SERVICE_ID"
echo ""

# Environment variables to set
declare -A ENV_VARS=(
    ["SENTRY_DSN"]="https://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@o4507887226847232.ingest.sentry.io/4507887226847232"
    ["SUPABASE_URL"]="https://your-project.supabase.co"
    ["SUPABASE_SERVICE_ROLE_KEY"]="sbp_3239ba703a96cee5e258396939111c5db2aecd9c"
    ["SUPABASE_AUTH_ENABLED"]="true"
    ["ENVIRONMENT"]="production"
    ["LOG_LEVEL"]="info"
)

echo "📋 Environment variables to set:"
for key in "${!ENV_VARS[@]}"; do
    echo "  - $key=${ENV_VARS[$key]:0:50}..."
done
echo ""

read -p "Do you want to set these environment variables? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🔧 Setting environment variables..."
echo ""

# Note: This requires Render API or manual setup via dashboard
# For now, we'll create a file with the variables to copy-paste

cat > render-env-vars.txt << EOF
# Backend Environment Variables for Render
# Copy these to: Render Dashboard → Service → Environment → Add Environment Variable

SENTRY_DSN=https://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@o4507887226847232.ingest.sentry.io/4507887226847232

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sbp_3239ba703a96cee5e258396939111c5db2aecd9c
SUPABASE_AUTH_ENABLED=true

DATABASE_URL=postgresql://user:password@host:5432/database

OPENAI_API_KEY=sk-proj-xxxx

RESEND_API_KEY=re_xxxx

ENVIRONMENT=production
LOG_LEVEL=info

CORS_ORIGINS_STR=https://converto.fi,https://www.converto.fi
EOF

echo -e "${GREEN}✅ Created render-env-vars.txt${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Open Render Dashboard: https://dashboard.render.com"
echo "2. Go to Service: $BACKEND_SERVICE_ID"
echo "3. Environment → Add Environment Variable"
echo "4. Copy variables from render-env-vars.txt"
echo ""
echo "Or use Render CLI:"
echo "  render env:set SENTRY_DSN=\"...\" --service $BACKEND_SERVICE_ID"
echo ""

# Frontend environment variables
cat > render-frontend-env-vars.txt << EOF
# Frontend Environment Variables for Render/Vercel
# Copy these to: Project Settings → Environment Variables

NEXT_PUBLIC_SENTRY_DSN=https://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@o4507887226847232.ingest.sentry.io/4507887226847232

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EOF

echo -e "${GREEN}✅ Created render-frontend-env-vars.txt${NC}"
echo ""
echo "📋 Frontend setup:"
echo "1. Open Vercel/Render Dashboard"
echo "2. Project Settings → Environment Variables"
echo "3. Copy variables from render-frontend-env-vars.txt"
echo ""

echo -e "${GREEN}✅ Setup files created!${NC}"
echo ""
echo "Remember to:"
echo "1. Update SUPABASE_URL with your actual Supabase project URL"
echo "2. Get NEXT_PUBLIC_SUPABASE_ANON_KEY from Supabase Dashboard"
echo "3. Update DATABASE_URL, OPENAI_API_KEY, RESEND_API_KEY with actual values"
echo ""


#!/bin/bash

# Converto Business OS - Setup Validation Script
# Tarkistaa että kaikki environment variables on asetettu oikein

set -e

echo "🔍 Converto Business OS - Setup Validation"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ERRORS=0

# Check Backend Environment Variables
echo "📋 Backend Environment Variables:"
echo ""

check_var() {
    local name=$1
    local value=$2
    local required=${3:-false}
    
    if [ -z "$value" ]; then
        if [ "$required" = true ]; then
            echo -e "${RED}❌ $name: MISSING (required)${NC}"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${YELLOW}⚠️  $name: Not set (optional)${NC}"
        fi
    else
        # Mask sensitive values
        if [[ "$name" == *"KEY"* ]] || [[ "$name" == *"SECRET"* ]] || [[ "$name" == *"TOKEN"* ]] || [[ "$name" == *"PASSWORD"* ]]; then
            masked="${value:0:10}...${value: -4}"
            echo -e "${GREEN}✅ $name: Set ($masked)${NC}"
        else
            echo -e "${GREEN}✅ $name: Set${NC}"
        fi
    fi
}

# Backend checks (from Render or .env)
echo "Backend:"
check_var "SENTRY_DSN" "${SENTRY_DSN:-}" true
check_var "SUPABASE_URL" "${SUPABASE_URL:-}" true
check_var "SUPABASE_SERVICE_ROLE_KEY" "${SUPABASE_SERVICE_ROLE_KEY:-}" true
check_var "SUPABASE_AUTH_ENABLED" "${SUPABASE_AUTH_ENABLED:-}" false
check_var "DATABASE_URL" "${DATABASE_URL:-}" true
check_var "OPENAI_API_KEY" "${OPENAI_API_KEY:-}" true
check_var "RESEND_API_KEY" "${RESEND_API_KEY:-}" true
check_var "ENVIRONMENT" "${ENVIRONMENT:-development}" false

echo ""
echo "Frontend:"
check_var "NEXT_PUBLIC_SENTRY_DSN" "${NEXT_PUBLIC_SENTRY_DSN:-${SENTRY_DSN:-}}" false
check_var "NEXT_PUBLIC_SUPABASE_URL" "${NEXT_PUBLIC_SUPABASE_URL:-${SUPABASE_URL:-}}" false
check_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" false

echo ""
echo "🔍 Validation Results:"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All required variables are set!${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS required variable(s) missing${NC}"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set missing variables in Render Dashboard (Backend)"
    echo "2. Set missing variables in Vercel/Render (Frontend)"
    echo "3. See SETUP_NOW.md for detailed instructions"
    exit 1
fi


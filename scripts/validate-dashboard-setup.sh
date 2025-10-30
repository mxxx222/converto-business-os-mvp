#!/bin/bash

# Converto Business OS - Dashboard Setup Validation
# Tarkistaa että dashboard setup on oikein

set -e

echo "🔍 Converto Business OS - Dashboard Setup Validation"
echo "====================================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

check_file() {
    local file=$1
    local name=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $name: Found${NC}"
        return 0
    else
        echo -e "${RED}❌ $name: Missing ($file)${NC}"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

check_env_var() {
    local name=$1
    local value=$2
    local required=${3:-false}
    
    if [ -z "$value" ]; then
        if [ "$required" = true ]; then
            echo -e "${RED}❌ $name: MISSING (required)${NC}"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${YELLOW}⚠️  $name: Not set (optional)${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        if [[ "$name" == *"KEY"* ]] || [[ "$name" == *"SECRET"* ]]; then
            masked="${value:0:10}...${value: -4}"
            echo -e "${GREEN}✅ $name: Set ($masked)${NC}"
        else
            echo -e "${GREEN}✅ $name: Set${NC}"
        fi
    fi
}

echo "📁 File Checks:"
echo ""

check_file "frontend/app/dashboard/page.tsx" "Dashboard Page"
check_file "frontend/lib/supabase/client.ts" "Supabase Client"
check_file "frontend/lib/supabase/middleware.ts" "Supabase Middleware"
check_file "frontend/middleware.ts" "Next.js Middleware"
check_file "frontend/types/receipt.ts" "Receipt Types"
check_file "frontend/next.config.js" "Next.js Config"
check_file "render.yaml" "Render Config"

echo ""
echo "🔧 Configuration Checks:"
echo ""

# Check next.config.js for conditional export
if grep -q "NEXT_PUBLIC_STATIC_EXPORT" frontend/next.config.js; then
    echo -e "${GREEN}✅ Conditional static export configured${NC}"
else
    echo -e "${RED}❌ Conditional static export not found in next.config.js${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check render.yaml for dashboard service
if grep -q "converto-dashboard" render.yaml; then
    echo -e "${GREEN}✅ Dashboard service configured in render.yaml${NC}"
else
    echo -e "${RED}❌ Dashboard service not found in render.yaml${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "🌐 Environment Variables (for dashboard service):"
echo ""

check_env_var "NEXT_PUBLIC_STATIC_EXPORT" "${NEXT_PUBLIC_STATIC_EXPORT:-}" false
check_env_var "NEXT_PUBLIC_SUPABASE_URL" "${NEXT_PUBLIC_SUPABASE_URL:-}" true
check_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" true
check_env_var "NEXT_PUBLIC_SENTRY_DSN" "${NEXT_PUBLIC_SENTRY_DSN:-}" false

echo ""
echo "📊 Validation Results:"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) - setup may still work${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s)${NC}"
    fi
    echo ""
    echo "📋 Next steps:"
    echo "1. Fix missing files or configuration"
    echo "2. Set required environment variables in Render Dashboard"
    echo "3. See DASHBOARD_FIX_GUIDE.md for detailed instructions"
    exit 1
fi


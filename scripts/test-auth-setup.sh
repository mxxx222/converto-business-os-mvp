#!/bin/bash

# DocFlow Authentication Setup Test Script
# Tests all components of the authentication system

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🧪 DocFlow Authentication Setup Test${NC}"
echo "=========================================="
echo ""

PASSED=0
FAILED=0

# Test function
test_check() {
    local name=$1
    local command=$2
    
    echo -e "${CYAN}Testing: ${name}${NC}"
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS: ${name}${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL: ${name}${NC}"
        ((FAILED++))
        return 1
    fi
}

# Test 1: Supabase Connection
echo -e "${YELLOW}📋 Test 1: Supabase Connection${NC}"
echo "----------------------------------------"

SUPABASE_URL="https://foejjbrcudpvuwdisnpz.supabase.co"
SUPABASE_KEY="sb_secret_FiceWb9D3W3JeIZii1Rcmw_OXKQqZrB"

test_check "Supabase API is reachable" \
    "curl -s -o /dev/null -w '%{http_code}' -H 'apikey: ${SUPABASE_KEY}' -H 'Authorization: Bearer ${SUPABASE_KEY}' '${SUPABASE_URL}/rest/v1/' | grep -q '200\|404'"

echo ""

# Test 2: Fly.io Environment Variables
echo -e "${YELLOW}📋 Test 2: Fly.io Environment Variables${NC}"
echo "----------------------------------------"

if command -v flyctl &> /dev/null || command -v fly &> /dev/null; then
    FLY_CMD=$(command -v flyctl || command -v fly)
    
    test_check "Fly.io CLI is available" "true"
    
    test_check "Fly.io app is accessible" \
        "${FLY_CMD} apps list | grep -q 'docflow-admin-api'"
    
    test_check "SUPABASE_URL is set in Fly.io" \
        "${FLY_CMD} secrets list --app docflow-admin-api | grep -q 'SUPABASE_URL'"
    
    test_check "SUPABASE_SERVICE_ROLE_KEY is set in Fly.io" \
        "${FLY_CMD} secrets list --app docflow-admin-api | grep -q 'SUPABASE_SERVICE_ROLE_KEY'"
    
    test_check "SUPABASE_AUTH_ENABLED is set in Fly.io" \
        "${FLY_CMD} secrets list --app docflow-admin-api | grep -q 'SUPABASE_AUTH_ENABLED'"
else
    echo -e "${YELLOW}⚠️  Fly.io CLI not found - skipping Fly.io tests${NC}"
fi

echo ""

# Test 3: Vercel Environment Variables
echo -e "${YELLOW}📋 Test 3: Vercel Environment Variables${NC}"
echo "----------------------------------------"

if command -v vercel &> /dev/null || command -v npx &> /dev/null; then
    test_check "Vercel CLI is available" "true"
    
    test_check "NEXT_PUBLIC_SUPABASE_URL is set in Vercel" \
        "npx vercel env ls | grep -q 'NEXT_PUBLIC_SUPABASE_URL'"
    
    test_check "NEXT_PUBLIC_SUPABASE_ANON_KEY is set in Vercel" \
        "npx vercel env ls | grep -q 'NEXT_PUBLIC_SUPABASE_ANON_KEY'"
    
    # Verify values
    npx vercel env pull .env.test 2>/dev/null || true
    if [ -f .env.test ]; then
        if grep -q "NEXT_PUBLIC_SUPABASE_URL=\"https://foejjbrcudpvuwdisnpz.supabase.co\"" .env.test; then
            echo -e "${GREEN}✅ PASS: NEXT_PUBLIC_SUPABASE_URL has correct value${NC}"
            ((PASSED++))
        else
            echo -e "${RED}❌ FAIL: NEXT_PUBLIC_SUPABASE_URL value mismatch${NC}"
            ((FAILED++))
        fi
        
        if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=\"sb_publishable_r5h9a67JPdv_wGbSsYLQow_FHznio6w\"" .env.test; then
            echo -e "${GREEN}✅ PASS: NEXT_PUBLIC_SUPABASE_ANON_KEY has correct value${NC}"
            ((PASSED++))
        else
            echo -e "${RED}❌ FAIL: NEXT_PUBLIC_SUPABASE_ANON_KEY value mismatch${NC}"
            ((FAILED++))
        fi
        rm -f .env.test
    fi
else
    echo -e "${YELLOW}⚠️  Vercel CLI not found - skipping Vercel tests${NC}"
fi

echo ""

# Test 4: Backend Health Check
echo -e "${YELLOW}📋 Test 4: Backend Health Check${NC}"
echo "----------------------------------------"

BACKEND_URL="https://docflow-admin-api.fly.dev"

test_check "Backend is reachable" \
    "curl -s -o /dev/null -w '%{http_code}' '${BACKEND_URL}/health' | grep -q '200'"

# Test health endpoint response
HEALTH_RESPONSE=$(curl -s "${BACKEND_URL}/health" 2>/dev/null || echo "")
if echo "$HEALTH_RESPONSE" | grep -q "healthy\|status"; then
    echo -e "${GREEN}✅ PASS: Backend health endpoint returns valid response${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  Backend health check returned: ${HEALTH_RESPONSE}${NC}"
fi

echo ""

# Test 5: Frontend Files Check
echo -e "${YELLOW}📋 Test 5: Frontend Authentication Files${NC}"
echo "----------------------------------------"

test_check "Login page exists" \
    "test -f frontend/app/login/page.tsx"

test_check "Signup page exists" \
    "test -f frontend/app/signup/page.tsx"

test_check "Dashboard page exists" \
    "test -f frontend/app/dashboard/page.tsx"

test_check "Supabase client exists" \
    "test -f frontend/lib/supabase/client.ts"

test_check "Auth utility exists" \
    "test -f frontend/lib/auth.ts"

test_check "API client exists" \
    "test -f frontend/lib/api.ts"

test_check "Middleware exists" \
    "test -f frontend/middleware.ts"

test_check "UserMenu component exists" \
    "test -f frontend/components/dashboard/UserMenu.tsx"

echo ""

# Summary
echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "${BLUE}==========================================${NC}"
echo ""
echo -e "${GREEN}✅ Passed: ${PASSED}${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}❌ Failed: ${FAILED}${NC}"
else
    echo -e "${GREEN}❌ Failed: ${FAILED}${NC}"
fi
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✨ All tests passed! Authentication setup is complete.${NC}"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo "1. Visit https://docflow.fi/signup to test signup"
    echo "2. Visit https://docflow.fi/login to test login"
    echo "3. Try accessing https://docflow.fi/dashboard in incognito (should redirect to login)"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please review the errors above.${NC}"
    exit 1
fi


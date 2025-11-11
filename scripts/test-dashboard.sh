#!/bin/bash

# Converto Business OS - Dashboard Test Script
# Testaa että dashboard toimii oikein

set -e

echo "🧪 Converto Business OS - Dashboard Tests"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

TESTS=0
PASSED=0
FAILED=0

# Dashboard URL (update this)
DASHBOARD_URL="${DASHBOARD_URL:-http://localhost:3000/dashboard}"

test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    TESTS=$((TESTS + 1))
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response, expected $expected_status)"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

test_content() {
    local name=$1
    local url=$2
    local search_term=$3
    
    TESTS=$((TESTS + 1))
    echo -n "Testing $name contains '$search_term'... "
    
    content=$(curl -s "$url" 2>/dev/null || echo "")
    
    if echo "$content" | grep -q "$search_term"; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (content not found)"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Dashboard Tests
echo "📊 Dashboard Tests:"
echo ""

# Test dashboard page loads (should redirect if not authenticated)
test_endpoint "Dashboard Page" "$DASHBOARD_URL" 200

# Test dashboard content
if [ "$DASHBOARD_URL" != "http://localhost:3000/dashboard" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Note: Authentication tests require local setup${NC}"
else
    # Test authentication redirect (if not logged in, should redirect)
    test_content "Authentication Check" "$DASHBOARD_URL" "Authentication Required\|Dashboard"
fi

echo ""
echo "📊 Test Results:"
echo "=================="
echo "Total: $TESTS"
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED${NC}"
    echo ""
    echo "💡 Tips:"
    echo "- Check that dashboard service is running"
    echo "- Verify environment variables are set (NEXT_PUBLIC_SUPABASE_URL, etc.)"
    echo "- Check Render logs for errors"
    exit 1
else
    echo -e "${GREEN}Failed: $FAILED${NC}"
    echo ""
    echo -e "${GREEN}✅ All dashboard tests passed!${NC}"
    exit 0
fi


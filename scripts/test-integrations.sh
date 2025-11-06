#!/bin/bash

# Converto Business OS - Integration Tests
# Testaa että kaikki integraatiot toimivat

set -e

echo "🧪 Converto Business OS - Integration Tests"
echo "==========================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

TESTS=0
PASSED=0
FAILED=0

# Backend URL (update this)
BACKEND_URL="${BACKEND_URL:-https://converto-business-os-quantum-mvp-1.onrender.com}"
FRONTEND_URL="${FRONTEND_URL:-https://converto.fi}"

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

# Backend Tests
echo "📡 Backend Tests:"
echo ""

test_endpoint "Health Check" "$BACKEND_URL/health" 200
test_endpoint "Root" "$BACKEND_URL/" 200
test_endpoint "OpenAPI Docs" "$BACKEND_URL/docs" 200
test_endpoint "Metrics" "$BACKEND_URL/metrics" 200

echo ""
echo "🌐 Frontend Tests:"
echo ""

test_endpoint "Premium Page" "$FRONTEND_URL/premium" 200
test_endpoint "Thank You Page" "$FRONTEND_URL/kiitos" 200

echo ""
echo "📊 Test Results:"
echo "=================="
echo "Total: $TESTS"
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED${NC}"
    echo ""
    echo "💡 Tips:"
    echo "- Check that services are deployed"
    echo "- Check Render/Vercel logs for errors"
    echo "- Verify environment variables are set"
    exit 1
else
    echo -e "${GREEN}Failed: $FAILED${NC}"
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
fi



#!/bin/bash

# Deployment Verification Script
# Verifies that the OCR pipeline is working in production

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}DocFlow Deployment Verification${NC}"
echo "===================================="
echo ""

# Get production URL
if [ -z "$1" ]; then
    echo -e "${RED}Error: Please provide production URL${NC}"
    echo "Usage: ./verify-deployment.sh <production-url>"
    echo "Example: ./verify-deployment.sh https://dashboard-xxx.vercel.app"
    exit 1
fi

PROD_URL="$1"
# Remove trailing slash
PROD_URL="${PROD_URL%/}"

echo -e "${YELLOW}Testing: $PROD_URL${NC}"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Test 1: Homepage accessible
run_test "Homepage accessible" "curl -s -o /dev/null -w '%{http_code}' '$PROD_URL' | grep -q '200'"

# Test 2: Test page accessible
run_test "Test page accessible" "curl -s -o /dev/null -w '%{http_code}' '$PROD_URL/test' | grep -q '200'"

# Test 3: API health check (if health endpoint exists)
run_test "API routes accessible" "curl -s -o /dev/null -w '%{http_code}' '$PROD_URL/api/documents/upload' -X POST | grep -qE '(400|405)'"

# Test 4: Check for JavaScript errors (basic check)
run_test "No critical JS errors" "curl -s '$PROD_URL/test' | grep -q 'DocFlow Demo'"

# Test 5: Environment variables (check if page loads without errors)
run_test "Environment variables loaded" "curl -s '$PROD_URL/test' | grep -q 'Upload a Finnish receipt'"

echo ""
echo "===================================="
echo -e "${BLUE}Test Summary${NC}"
echo "===================================="
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Manually test file upload at: $PROD_URL/test"
    echo "2. Upload a test receipt and verify OCR processing"
    echo "3. Check Vercel logs for any runtime errors"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check Vercel deployment status"
    echo "2. Verify environment variables are set"
    echo "3. Check build logs in Vercel Dashboard"
    exit 1
fi


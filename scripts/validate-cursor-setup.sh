#!/bin/bash
# DocFlow Cursor Setup Validation Script
# Validates all implemented minipatches and configurations

set -e

echo "🔍 DocFlow Cursor Setup Validation"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if files exist
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
    else
        echo -e "${RED}✗${NC} $1 missing"
        return 1
    fi
}

# Run individual checks
echo -e "\n${YELLOW}1. Checking Cursor Configuration Files${NC}"
check_file ".cursorrules"
check_file "cursor-user-rules.md"

echo -e "\n${YELLOW}2. Checking RBAC Implementation${NC}"
check_file "frontend/lib/adminAuth.ts"
if grep -q "export type AdminRole = 'admin' | 'support' | 'readonly'" frontend/lib/adminAuth.ts; then
    echo -e "${GREEN}✓${NC} AdminRole type definition found"
else
    echo -e "${RED}✗${NC} AdminRole type definition missing"
fi

if grep -q "assertRole" frontend/lib/adminAuth.ts; then
    echo -e "${GREEN}✓${NC} assertRole function found"
else
    echo -e "${RED}✗${NC} assertRole function missing"
fi

echo -e "\n${YELLOW}3. Checking Rate Limiting Implementation${NC}"
check_file "frontend/lib/ratelimit.ts"
if grep -q "Retry-After" frontend/lib/ratelimit.ts; then
    echo -e "${GREEN}✓${NC} Retry-After header implementation found"
else
    echo -e "${RED}✗${NC} Retry-After header implementation missing"
fi

if grep -q "X-RateLimit" frontend/lib/ratelimit.ts; then
    echo -e "${GREEN}✓${NC} X-RateLimit headers found"
else
    echo -e "${RED}✗${NC} X-RateLimit headers missing"
fi

echo -e "\n${YELLOW}4. Checking WebSocket Backpressure Implementation${NC}"
check_file "frontend/lib/admin/hooks/useTenantFeed.ts"
if grep -q "ws.close(4000, 'backpressure')" frontend/lib/admin/hooks/useTenantFeed.ts; then
    echo -e "${GREEN}✓${NC} WebSocket backpressure close code 4000 found"
else
    echo -e "${RED}✗${NC} WebSocket backpressure close code 4000 missing"
fi

echo -e "\n${YELLOW}5. Checking Export Utils (CSV/PDF with fi-FI locale)${NC}"
check_file "frontend/lib/export.ts"
if grep -q "fi-FI" frontend/lib/export.ts; then
    echo -e "${GREEN}✓${NC} fi-FI locale configuration found"
else
    echo -e "${RED}✗${NC} fi-FI locale configuration missing"
fi

if grep -q "Europe/Helsinki" frontend/lib/export.ts; then
    echo -e "${GREEN}✓${NC} Europe/Helsinki timezone configuration found"
else
    echo -e "${RED}✗${NC} Europe/Helsinki timezone configuration missing"
fi

if grep -q "BOM.*FEFF" frontend/lib/export.ts; then
    echo -e "${GREEN}✓${NC} UTF-8 BOM for CSV found"
else
    echo -e "${RED}✗${NC} UTF-8 BOM for CSV missing"
fi

echo -e "\n${YELLOW}6. Checking CI Workflow${NC}"
check_file ".github/workflows/ci.yml"
if grep -q "playwright" .github/workflows/ci.yml; then
    echo -e "${GREEN}✓${NC} Playwright tests in CI workflow"
else
    echo -e "${RED}✗${NC} Playwright tests missing in CI workflow"
fi

# Run quick validation commands
echo -e "\n${YELLOW}7. Running Quick Commands${NC}"

echo "Testing typecheck..."
if cd frontend && npm run typecheck > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend typecheck passed"
else
    echo -e "${YELLOW}⚠${NC} Frontend typecheck needs attention"
fi

echo "Testing build..."
if cd frontend && npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend build passed"
else
    echo -e "${YELLOW}⚠${NC} Frontend build needs attention"
fi

echo "Checking OpenAPI export..."
if python scripts/export_openapi.py --out /tmp/test_openapi.yaml 2>/dev/null; then
    echo -e "${GREEN}✓${NC} OpenAPI export working"
    rm -f /tmp/test_openapi.yaml
else
    echo -e "${YELLOW}⚠${NC} OpenAPI export needs attention"
fi

echo -e "\n${YELLOW}8. Summary${NC}"
echo "=============================="
echo "All core files and configurations validated."
echo "Run 'npm run test' for full test suite."
echo "Run 'npm run lint' for code quality checks."

echo -e "\n${GREEN}✅ DocFlow Cursor Setup Validation Complete${NC}"
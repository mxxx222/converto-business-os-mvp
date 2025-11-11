#!/bin/bash
# Converto Business OS - Smoke Test Suite
# Tarkistaa että kaikki toimii

echo "🧪 CONVERTO SMOKE TESTS"
echo "======================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Test 1: Backend Health
echo "Test 1: Backend health..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend responds${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ Backend NOT running - start with: uvicorn app.main:app --reload${NC}"
    ((FAIL++))
fi

# Test 2: Frontend Home
echo "Test 2: Frontend home..."
if curl -s http://localhost:3001 | grep -q "Converto" 2>&1; then
    echo -e "${GREEN}✅ Frontend responds (port 3001)${NC}"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  Frontend check (may still be starting)${NC}"
    ((FAIL++))
fi

# Test 3: OCR endpoint
echo "Test 3: OCR API endpoint..."
if curl -s http://localhost:8000/api/v1/ocr/recent?tenant_id=demo > /dev/null 2>&1; then
    echo -e "${GREEN}✅ OCR API responds${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ OCR API not available${NC}"
    ((FAIL++))
fi

# Test 4: Gamify endpoint
echo "Test 4: Gamify API..."
if curl -s "http://localhost:8000/api/v1/gamify/summary?tenant_id=demo&user_id=user_demo&days=7" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Gamify API responds${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ Gamify API not available${NC}"
    ((FAIL++))
fi

# Test 5: P2E Wallet
echo "Test 5: P2E Wallet..."
if curl -s "http://localhost:8000/api/v1/p2e/wallet?t=demo&u=user_demo" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ P2E API responds${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ P2E API not available${NC}"
    ((FAIL++))
fi

# Test 6: Rewards Catalog
echo "Test 6: Rewards catalog..."
if curl -s "http://localhost:8000/api/v1/rewards/catalog?tenant_id=demo" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Rewards API responds${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ Rewards API not available${NC}"
    ((FAIL++))
fi

echo ""
echo "======================="
echo "RESULTS: ${GREEN}$PASS passed${NC} | ${RED}$FAIL failed${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo ""
    echo "✅ Backend: http://localhost:8000"
    echo "✅ Frontend: http://localhost:3001"
    echo "✅ OCR page: http://localhost:3001/selko/ocr"
    echo "✅ Dashboard: http://localhost:3001/dashboard"
    echo ""
    echo "🚀 READY TO USE!"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Käynnistä puuttuvat palvelut:"
    echo "  Backend:  uvicorn app.main:app --reload"
    echo "  Frontend: cd frontend && npm run dev"
    exit 1
fi

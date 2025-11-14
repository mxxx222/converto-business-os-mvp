#!/bin/bash

# VEROPILOT-AI Deployment Verification Script
# Verifies all critical deployment aspects

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 VEROPILOT-AI Deployment Verification${NC}"
echo "========================================"
echo ""

# Get domain from user
read -p "Enter your domain (e.g., docflow.fi): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ Domain is required${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Testing: https://$DOMAIN${NC}"
echo ""

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -Isk "$url" 2>/dev/null | head -1)
    
    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "  Expected: $expected"
        echo "  Got: $response"
        ((FAILED++))
    fi
}

# Function to test header
test_header() {
    local name=$1
    local url=$2
    local header=$3
    local expected=$4
    
    echo -n "Testing $name... "
    
    response=$(curl -Isk "$url" 2>/dev/null | grep -i "$header:" | head -1)
    
    if echo "$response" | grep -qi "$expected"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "  Expected header: $header: $expected"
        echo "  Got: $response"
        ((FAILED++))
    fi
}

# Function to test JSON response
test_json() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s "$url" 2>/dev/null)
    
    if echo "$response" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "  Expected: $expected"
        echo "  Got: $response"
        ((FAILED++))
    fi
}

echo -e "${YELLOW}1. Basic Connectivity${NC}"
echo "---------------------"
test_endpoint "HTTPS connection" "https://$DOMAIN" "200"
test_endpoint "robots.txt" "https://$DOMAIN/robots.txt" "200"
test_endpoint "sitemap.xml" "https://$DOMAIN/sitemap.xml" "200"
echo ""

echo -e "${YELLOW}2. Security Headers${NC}"
echo "-------------------"
test_header "HSTS" "https://$DOMAIN" "strict-transport-security" "max-age=31536000"
test_header "X-Content-Type-Options" "https://$DOMAIN" "x-content-type-options" "nosniff"
test_header "X-Frame-Options" "https://$DOMAIN" "x-frame-options" "DENY"
test_header "X-XSS-Protection" "https://$DOMAIN" "x-xss-protection" "1; mode=block"
echo ""

echo -e "${YELLOW}3. WWW Redirect${NC}"
echo "---------------"
test_endpoint "WWW to apex redirect" "https://www.$DOMAIN" "301"
test_header "WWW redirect location" "https://www.$DOMAIN" "location" "https://$DOMAIN"
echo ""

echo -e "${YELLOW}4. API Health Check${NC}"
echo "-------------------"
test_json "API health endpoint" "https://$DOMAIN/api/health" "healthy"
echo ""

echo -e "${YELLOW}5. Frontend Pages${NC}"
echo "-----------------"
test_endpoint "Home page" "https://$DOMAIN/" "200"
test_endpoint "Pricing page" "https://$DOMAIN/pricing" "200"
test_endpoint "Demo page" "https://$DOMAIN/demo" "200"
test_endpoint "Dashboard page" "https://$DOMAIN/dashboard" "200"
echo ""

echo -e "${YELLOW}6. SEO & Metadata${NC}"
echo "-----------------"
echo -n "Testing robots.txt content... "
robots_content=$(curl -s "https://$DOMAIN/robots.txt" 2>/dev/null)
if echo "$robots_content" | grep -q "User-agent:" && echo "$robots_content" | grep -q "Sitemap:"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  robots.txt missing required directives"
    ((FAILED++))
fi

echo -n "Testing sitemap.xml content... "
sitemap_content=$(curl -s "https://$DOMAIN/sitemap.xml" 2>/dev/null)
if echo "$sitemap_content" | grep -q "<urlset" && echo "$sitemap_content" | grep -q "<loc>"; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  sitemap.xml missing required XML structure"
    ((FAILED++))
fi
echo ""

# Summary
echo "========================================"
echo -e "${BLUE}📊 Test Summary${NC}"
echo "========================================"
echo -e "Total tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Deployment is successful!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Test sign up flow"
    echo "2. Upload a test receipt"
    echo "3. Verify OCR results"
    echo "4. Check VAT analysis"
    echo "5. Monitor logs in Vercel Dashboard"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please review and fix.${NC}"
    echo ""
    echo -e "${BLUE}Troubleshooting:${NC}"
    echo "1. Check Vercel deployment logs"
    echo "2. Verify environment variables"
    echo "3. Check DNS propagation (may take up to 48h)"
    echo "4. Review vercel.json configuration"
    exit 1
fi


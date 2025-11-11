#!/bin/bash

# DocFlow.fi Domain Testing Script
# This script tests all domain routing, redirects, and SSL certificates

set -e

echo "🧪 DocFlow.fi Domain Testing Script"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
test_url() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Testing: $description... "
    
    status=$(curl -s -o /dev/null -w "%{http_code}" -L "$url" || echo "000")
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS ($status)${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL (got $status, expected $expected_status)${NC}"
        ((TESTS_FAILED++))
    fi
}

# Test redirect function
test_redirect() {
    local url=$1
    local expected_location=$2
    local description=$3
    
    echo -n "Testing redirect: $description... "
    
    location=$(curl -s -I "$url" | grep -i "location:" | cut -d' ' -f2 | tr -d '\r\n' || echo "")
    
    if [[ "$location" == *"$expected_location"* ]]; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL (got '$location', expected '$expected_location')${NC}"
        ((TESTS_FAILED++))
    fi
}

# Test SSL certificate
test_ssl() {
    local domain=$1
    local description=$2
    
    echo -n "Testing SSL: $description... "
    
    if echo | openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null | openssl x509 -noout -dates >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
}

# Test DNS resolution
test_dns() {
    local domain=$1
    local record_type=$2
    local description=$3
    
    echo -n "Testing DNS: $description... "
    
    if dig "$domain" "$record_type" +short | grep -q .; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
    fi
}

echo -e "${BLUE}📋 Running comprehensive domain tests...${NC}"
echo ""

# DNS Tests
echo -e "${BLUE}🌐 DNS Resolution Tests${NC}"
test_dns "docflow.fi" "A" "Main domain A record"
test_dns "www.docflow.fi" "CNAME" "WWW subdomain CNAME"
test_dns "api.docflow.fi" "CNAME" "API subdomain CNAME"
test_dns "app.docflow.fi" "CNAME" "App subdomain CNAME"
echo ""

# SSL Certificate Tests
echo -e "${BLUE}🔒 SSL Certificate Tests${NC}"
test_ssl "docflow.fi" "Main domain SSL"
test_ssl "www.docflow.fi" "WWW subdomain SSL"
test_ssl "api.docflow.fi" "API subdomain SSL"
test_ssl "app.docflow.fi" "App subdomain SSL"
echo ""

# Main Domain Tests
echo -e "${BLUE}🏠 Main Domain Tests${NC}"
test_url "https://docflow.fi" "200" "Main domain loads"
test_url "https://docflow.fi/fi" "200" "Finnish homepage"
test_url "https://docflow.fi/en" "200" "English homepage"
test_url "https://docflow.fi/fi/pricing" "200" "Finnish pricing page"
test_url "https://docflow.fi/en/pricing" "200" "English pricing page"
test_url "https://docflow.fi/fi/contact" "200" "Finnish contact page"
test_url "https://docflow.fi/en/contact" "200" "English contact page"
echo ""

# Redirect Tests
echo -e "${BLUE}🔄 Redirect Tests${NC}"
test_redirect "https://www.docflow.fi" "https://docflow.fi" "WWW to main domain"
test_redirect "https://docflow.fi/signup" "/fi/contact" "Signup to contact"
test_redirect "https://docflow.fi/demo" "calendly.com" "Demo to Calendly"
echo ""

# API Tests
echo -e "${BLUE}🔌 API Tests${NC}"
test_url "https://api.docflow.fi/health" "200" "API health endpoint"
test_url "https://api.docflow.fi/" "200" "API root endpoint"
echo ""

# App Tests
echo -e "${BLUE}📱 App Tests${NC}"
test_url "https://app.docflow.fi" "200" "App domain loads"
test_url "https://app.docflow.fi/dashboard" "200" "Dashboard loads (or redirects to login)"
echo ""

# CORS Tests
echo -e "${BLUE}🌐 CORS Tests${NC}"
echo -n "Testing CORS from docflow.fi to API... "
cors_response=$(curl -s -H "Origin: https://docflow.fi" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: X-Requested-With" -X OPTIONS "https://api.docflow.fi/health" -w "%{http_code}" -o /dev/null || echo "000")

if [ "$cors_response" = "200" ] || [ "$cors_response" = "204" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL (got $cors_response)${NC}"
    ((TESTS_FAILED++))
fi
echo ""

# Security Headers Tests
echo -e "${BLUE}🛡️  Security Headers Tests${NC}"
echo -n "Testing security headers... "
headers=$(curl -s -I "https://docflow.fi" | grep -E "(Strict-Transport-Security|X-Frame-Options|X-Content-Type-Options)" | wc -l)

if [ "$headers" -ge 2 ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL (missing security headers)${NC}"
    ((TESTS_FAILED++))
fi
echo ""

# Performance Tests
echo -e "${BLUE}⚡ Performance Tests${NC}"
echo -n "Testing page load time... "
load_time=$(curl -s -w "%{time_total}" -o /dev/null "https://docflow.fi")
load_time_ms=$(echo "$load_time * 1000" | bc -l | cut -d. -f1)

if [ "$load_time_ms" -lt 2000 ]; then
    echo -e "${GREEN}✅ PASS (${load_time_ms}ms)${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  SLOW (${load_time_ms}ms)${NC}"
    ((TESTS_FAILED++))
fi
echo ""

# Summary
echo -e "${BLUE}📊 Test Summary${NC}"
echo "==============="
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! DocFlow.fi is ready for production.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please review the issues above.${NC}"
    echo ""
    echo "💡 Common issues:"
    echo "- DNS propagation not complete (wait up to 48 hours)"
    echo "- SSL certificates not yet issued (wait 10-15 minutes)"
    echo "- Render custom domains not configured"
    echo "- Environment variables not set correctly"
    exit 1
fi

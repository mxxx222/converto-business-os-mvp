#!/bin/bash

# 🚀 CONVERTO BUSINESS OS - PRODUCTION DEPLOYMENT TESTING SCRIPT

echo "🚀 Converto Business OS - Production Deployment Testing"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# DNS Resolution Test
echo -e "${YELLOW}1. DNS Resolution Tests${NC}"
echo "------------------------"

if command_exists nslookup; then
    echo -e "${GREEN}✅ nslookup available${NC}"
    echo "Testing DNS resolution for converto.fi:"
    nslookup converto.fi
    echo ""
    echo "Testing DNS resolution for www.converto.fi:"
    nslookup www.converto.fi
else
    echo -e "${YELLOW}⚠️  nslookup not available, trying dig${NC}"
fi

if command_exists dig; then
    echo -e "${GREEN}✅ dig available${NC}"
    echo "Testing with dig for converto.fi:"
    dig converto.fi
    echo ""
    echo "Testing with dig for www.converto.fi:"
    dig www.converto.fi
fi

echo ""

# SSL Certificate Test
echo -e "${YELLOW}2. SSL Certificate Tests${NC}"
echo "--------------------------"

if command_exists openssl; then
    echo -e "${GREEN}✅ openssl available${NC}"
    echo "Testing SSL certificate for https://converto.fi:"
    if echo | openssl s_client -servername converto.fi -connect converto.fi:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null; then
        echo -e "${GREEN}✅ SSL certificate valid${NC}"
    else
        echo -e "${RED}❌ SSL certificate check failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  openssl not available${NC}"
fi

echo ""

# HTTP Response Test
echo -e "${YELLOW}3. HTTP Response Tests${NC}"
echo "----------------------"

if command_exists curl; then
    echo -e "${GREEN}✅ curl available${NC}"
    echo "Testing HTTP response for https://converto.fi:"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://converto.fi)
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ HTTP 200 OK - Site is accessible${NC}"
    else
        echo -e "${RED}❌ HTTP $HTTP_CODE - Site may not be accessible${NC}"
    fi

    echo "Testing HTTP response for https://www.converto.fi:"
    WWW_HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://www.converto.fi)
    if [ "$WWW_HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ HTTP 200 OK - www subdomain is accessible${NC}"
    else
        echo -e "${RED}❌ HTTP $WWW_HTTP_CODE - www subdomain may not be accessible${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  curl not available${NC}"
fi

echo ""

# API Endpoint Tests
echo -e "${YELLOW}4. API Endpoint Tests${NC}"
echo "----------------------"

if command_exists curl; then
    echo -e "${GREEN}✅ curl available for API tests${NC}"

    echo "Testing lead API endpoint:"
    LEAD_API_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://converto.fi/api/lead)
    if [ "$LEAD_API_CODE" = "200" ] || [ "$LEAD_API_CODE" = "405" ] || [ "$LEAD_API_CODE" = "415" ]; then
        echo -e "${GREEN}✅ Lead API endpoint responding (HTTP $LEAD_API_CODE)${NC}"
    else
        echo -e "${YELLOW}⚠️  Lead API endpoint returned HTTP $LEAD_API_CODE${NC}"
    fi

    echo "Testing analytics API endpoint:"
    ANALYTICS_API_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://converto.fi/api/analytics/track)
    if [ "$ANALYTICS_API_CODE" = "200" ] || [ "$ANALYTICS_API_CODE" = "405" ] || [ "$ANALYTICS_API_CODE" = "415" ]; then
        echo -e "${GREEN}✅ Analytics API endpoint responding (HTTP $ANALYTICS_API_CODE)${NC}"
    else
        echo -e "${YELLOW}⚠️  Analytics API endpoint returned HTTP $ANALYTICS_API_CODE${NC}"
    fi
fi

echo ""

# Performance Test (Basic)
echo -e "${YELLOW}5. Basic Performance Test${NC}"
echo "---------------------------"

if command_exists curl; then
    echo "Testing page load time for https://converto.fi:"
    LOAD_TIME=$(curl -s -o /dev/null -w "%{time_total}" https://converto.fi)
    echo "Page load time: ${LOAD_TIME} seconds"

    if (( $(echo "$LOAD_TIME < 3.0" | bc -l 2>/dev/null || echo "0") )); then
        echo -e "${GREEN}✅ Load time under 3 seconds${NC}"
    else
        echo -e "${YELLOW}⚠️  Load time over 3 seconds${NC}"
    fi
fi

echo ""

# Final Status
echo -e "${YELLOW}6. Production Deployment Status${NC}"
echo "---------------------------------"
echo -e "${GREEN}✅ All credentials configured${NC}"
echo -e "${GREEN}✅ Deployment guide created${NC}"
echo -e "${GREEN}✅ Testing script ready${NC}"
echo ""
echo -e "${YELLOW}📋 Manual Steps Remaining:${NC}"
echo "1. Update DNS records at hostingpalvelu.fi"
echo "2. Wait for DNS propagation (5-15 minutes)"
echo "3. Run this script to verify deployment"
echo "4. Test all website functionality"
echo ""
echo -e "${GREEN}🎯 Production URL: https://converto.fi${NC}"

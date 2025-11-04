#!/bin/bash
# 🔍 Fetch Sentry Keys Automatically

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Fetching Sentry Keys...${NC}\n"

# Check if Sentry CLI is installed
if command -v sentry-cli &> /dev/null; then
    echo -e "${GREEN}✅ Sentry CLI found${NC}"

    # Try to get projects
    echo -e "${BLUE}Fetching projects...${NC}"
    sentry-cli projects list 2>/dev/null | head -20 || echo -e "${YELLOW}⚠️  Sentry CLI not authenticated. Run: sentry-cli login${NC}"
else
    echo -e "${YELLOW}⚠️  Sentry CLI not installed${NC}"
    echo -e "Install: ${BLUE}npm install -g @sentry/cli${NC}"
fi

# Check .sentryclirc
if [ -f "frontend/.sentryclirc" ]; then
    echo -e "\n${GREEN}✅ Found .sentryclirc${NC}"
    cat frontend/.sentryclirc
elif [ -f ".sentryclirc" ]; then
    echo -e "\n${GREEN}✅ Found .sentryclirc${NC}"
    cat .sentryclirc
fi

# Check for DSN in codebase
echo -e "\n${BLUE}📋 Found DSN in codebase:${NC}"
DSN=$(grep -r "sentry.io" docs/ scripts/ --include="*.md" --include="*.sh" 2>/dev/null | grep -oE "https://[^@]+@[^[:space:]]+\.ingest\.sentry\.io/[0-9]+" | head -1)

if [ -n "$DSN" ]; then
    echo -e "${GREEN}✅ DSN found:${NC}"
    echo "$DSN"

    # Extract project ID from DSN
    PROJECT_ID=$(echo "$DSN" | grep -oE "/[0-9]+$" | tr -d '/')
    echo -e "\n${BLUE}📊 Project ID (from DSN):${NC} $PROJECT_ID"
else
    echo -e "${RED}❌ DSN not found in codebase${NC}"
fi

echo -e "\n${YELLOW}📝 To get ORG and PROJECT:${NC}"
echo -e "1. Kirjaudu Sentry.io:hon: ${BLUE}https://sentry.io/auth/login/${NC}"
echo -e "2. Navigoi projektiin"
echo -e "3. Tarkista URL-osoite: ${BLUE}/organizations/[ORG]/projects/[PROJECT]/${NC}"
echo -e "4. Kopioi slugit"

echo -e "\n${GREEN}✅ DSN löytyi dokumentaatiosta!${NC}"
echo -e "${YELLOW}⚠️  ORG ja PROJECT pitää hakea manuaalisesti Sentry Dashboardista.${NC}"

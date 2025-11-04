#!/bin/bash
# 📊 Vercel Log Scanner - Converto Business OS
# Real-time log scanning ja monitoring

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DEPLOYMENT_URL="${1:-}"
FILTER="${2:-}"

echo -e "${BLUE}📊 Vercel Log Scanner${NC}\n"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Install with: npm install -g vercel${NC}"
    exit 1
fi

# If no deployment URL provided, get latest
if [ -z "$DEPLOYMENT_URL" ]; then
    echo -e "${YELLOW}⚠️  No deployment URL provided. Fetching latest deployment...${NC}"
    DEPLOYMENT_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "")

    if [ -z "$DEPLOYMENT_URL" ]; then
        echo -e "${RED}❌ Could not fetch deployment URL. Please provide it manually:${NC}"
        echo -e "  ${BLUE}./scripts/vercel-logs.sh [deployment-url] [filter]${NC}"
        exit 1
    fi

    echo -e "${GREEN}✅ Using latest deployment: $DEPLOYMENT_URL${NC}\n"
fi

# Show menu
echo -e "${BLUE}Available log filters:${NC}"
echo -e "  ${GREEN}all${NC}        - All logs"
echo -e "  ${GREEN}error${NC}      - Errors only"
echo -e "  ${GREEN}warning${NC}    - Warnings only"
echo -e "  ${GREEN}info${NC}       - Info logs"
echo -e "  ${GREEN}api${NC}        - API route logs"
echo -e "  ${GREEN}function${NC}   - Function execution logs"
echo -e ""

# Filter logic
if [ -z "$FILTER" ]; then
    echo -e "${YELLOW}📊 Showing all logs (Ctrl+C to exit)${NC}\n"
    vercel logs "$DEPLOYMENT_URL" --follow
else
    case "$FILTER" in
        "error")
            echo -e "${RED}📊 Showing errors only (Ctrl+C to exit)${NC}\n"
            vercel logs "$DEPLOYMENT_URL" --follow | grep -i "error\|failed\|exception"
            ;;
        "warning")
            echo -e "${YELLOW}📊 Showing warnings only (Ctrl+C to exit)${NC}\n"
            vercel logs "$DEPLOYMENT_URL" --follow | grep -i "warning\|warn"
            ;;
        "info")
            echo -e "${BLUE}📊 Showing info logs (Ctrl+C to exit)${NC}\n"
            vercel logs "$DEPLOYMENT_URL" --follow | grep -i "info"
            ;;
        "api")
            echo -e "${BLUE}📊 Showing API route logs (Ctrl+C to exit)${NC}\n"
            vercel logs "$DEPLOYMENT_URL" --follow | grep -i "api\|route"
            ;;
        "function")
            echo -e "${BLUE}📊 Showing function execution logs (Ctrl+C to exit)${NC}\n"
            vercel logs "$DEPLOYMENT_URL" --follow | grep -i "function\|invocation"
            ;;
        *)
            echo -e "${YELLOW}📊 Filtering logs: $FILTER (Ctrl+C to exit)${NC}\n"
            vercel logs "$DEPLOYMENT_URL" --follow | grep -i "$FILTER"
            ;;
    esac
fi

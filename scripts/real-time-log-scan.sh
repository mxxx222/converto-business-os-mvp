#!/bin/bash
# 🔍 Real-Time Log Scanner - Vercel Pro
# Käyttää Vercel CLI:ä real-time log scanningiin

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

DEPLOYMENT_URL="${1:-frontend-cyw43kyyu-maxs-projects-149851b4.vercel.app}"
FILTER="${2:-}"

echo -e "${BLUE}🔍 Real-Time Log Scanner - Vercel Pro${NC}\n"
echo -e "${GREEN}Deployment:${NC} $DEPLOYMENT_URL\n"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Install with: npm install -g vercel${NC}\n"
    exit 1
fi

# Show menu
echo -e "${BLUE}Available log filters:${NC}\n"
echo -e "  ${GREEN}all${NC}        - All logs (default)\n"
echo -e "  ${GREEN}error${NC}      - Errors only\n"
echo -e "  ${GREEN}warning${NC}    - Warnings only\n"
echo -e "  ${GREEN}info${NC}       - Info logs\n"
echo -e "  ${GREEN}api${NC}        - API route logs\n"
echo -e "  ${GREEN}function${NC}   - Function execution logs\n"
echo -e "\n"

# Start log scanning
if [ -z "$FILTER" ] || [ "$FILTER" = "all" ]; then
    echo -e "${YELLOW}📊 Showing all logs (Press Ctrl+C to exit)${NC}\n"
    vercel logs "$DEPLOYMENT_URL" --json 2>&1 | while IFS= read -r line; do
        if echo "$line" | grep -q '"level"'; then
            level=$(echo "$line" | jq -r '.level' 2>/dev/null || echo "info")
            message=$(echo "$line" | jq -r '.message' 2>/dev/null || echo "$line")

            case "$level" in
                "error")
                    echo -e "${RED}[ERROR]${NC} $message"
                    ;;
                "warning")
                    echo -e "${YELLOW}[WARNING]${NC} $message"
                    ;;
                "info")
                    echo -e "${BLUE}[INFO]${NC} $message"
                    ;;
                *)
                    echo -e "${GREEN}[$level]${NC} $message"
                    ;;
            esac
        else
            echo "$line"
        fi
    done
else
    case "$FILTER" in
        "error")
            echo -e "${RED}📊 Showing errors only (Press Ctrl+C to exit)${NC}\n"
            vercel logs "$DEPLOYMENT_URL" --json 2>&1 | jq 'select(.level == "error")' 2>/dev/null || vercel logs "$DEPLOYMENT_URL" 2>&1 | grep -i "error\|failed\|exception"
            ;;
        "warning")
            echo -e "${YELLOW}📊 Showing warnings only (Press Ctrl+C to exit)${NC}\n"
            vercel logs "$DEPLOYMENT_URL" --json 2>&1 | jq 'select(.level == "warning")' 2>/dev/null || vercel logs "$DEPLOYMENT_URL" 2>&1 | grep -i "warning\|warn"
            ;;
        "info")
            echo -e "${BLUE}📊 Showing info logs (Press Ctrl+C to exit)${NC}\n"
            vercel logs "$DEPLOYMENT_URL" --json 2>&1 | jq 'select(.level == "info")' 2>/dev/null || vercel logs "$DEPLOYMENT_URL" 2>&1 | grep -i "info"
            ;;
        "api")
            echo -e "${BLUE}📊 Showing API route logs (Press Ctrl+C to exit)${NC}\n"
            vercel logs "$DEPLOYMENT_URL" 2>&1 | grep -i "api\|route\|/api/"
            ;;
        "function")
            echo -e "${BLUE}📊 Showing function execution logs (Press Ctrl+C to exit)${NC}\n"
            vercel logs "$DEPLOYMENT_URL" 2>&1 | grep -i "function\|invocation\|execution"
            ;;
        *)
            echo -e "${YELLOW}📊 Filtering logs: $FILTER (Press Ctrl+C to exit)${NC}\n"
            vercel logs "$DEPLOYMENT_URL" 2>&1 | grep -i "$FILTER"
            ;;
    esac
fi

#!/bin/bash
# 📊 Vercel Log Scanner - MCP Compatible
# Real-time log scanning for MCP integration

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DEPLOYMENT_URL="${1:-}"
FILTER="${2:-all}"
OUTPUT_FORMAT="${3:-text}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Install with: npm install -g vercel${NC}" >&2
    exit 1
fi

# If no deployment URL provided, get latest
if [ -z "$DEPLOYMENT_URL" ]; then
    echo -e "${YELLOW}⚠️  No deployment URL provided. Fetching latest deployment...${NC}" >&2
    DEPLOYMENT_URL=$(vercel ls --json 2>/dev/null | jq -r '.[0].url' 2>/dev/null || echo "")

    if [ -z "$DEPLOYMENT_URL" ]; then
        echo -e "${RED}❌ Could not fetch deployment URL. Please provide it manually:${NC}" >&2
        echo -e "  ${BLUE}./scripts/vercel-logs-mcp.sh [deployment-url] [filter] [format]${NC}" >&2
        exit 1
    fi
fi

# Log filter patterns
case "$FILTER" in
    "error")
        PATTERN="error|failed|exception"
        ;;
    "warning")
        PATTERN="warning|warn"
        ;;
    "info")
        PATTERN="info"
        ;;
    "api")
        PATTERN="api|route|/api/"
        ;;
    "function")
        PATTERN="function|invocation|execution"
        ;;
    "all")
        PATTERN=""
        ;;
    *)
        PATTERN="$FILTER"
        ;;
esac

# Output format
if [ "$OUTPUT_FORMAT" = "json" ]; then
    # JSON output for MCP
    if [ -z "$PATTERN" ]; then
        vercel logs "$DEPLOYMENT_URL" --json 2>&1 | jq -c '.' || vercel logs "$DEPLOYMENT_URL" 2>&1 | jq -R -s -c 'split("\n") | map(select(. != ""))'
    else
        vercel logs "$DEPLOYMENT_URL" --json 2>&1 | jq -c "select(.message | ascii_downcase | test(\"$PATTERN\"; \"i\"))" || vercel logs "$DEPLOYMENT_URL" 2>&1 | grep -iE "$PATTERN" | jq -R -s -c 'split("\n") | map(select(. != ""))'
    fi
else
    # Text output
    if [ -z "$PATTERN" ]; then
        vercel logs "$DEPLOYMENT_URL" 2>&1
    else
        vercel logs "$DEPLOYMENT_URL" 2>&1 | grep -iE "$PATTERN"
    fi
fi

#!/bin/bash

# Live Vercel Deployment Monitor
# Monitors deployment status in real-time

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}🔴 LIVE DEPLOYMENT MONITORING${NC}"
echo "============================="
echo ""
echo -e "${CYAN}Monitoring Vercel deployment status...${NC}"
echo "Press Ctrl+C to stop"
echo ""

PREVIOUS_DEPLOYMENT=""

while true; do
    TIMESTAMP=$(date +"%H:%M:%S")
    
    # Check frontend status
    FRONTEND_STATUS=$(curl -s "https://docflow.fi" -o /dev/null -w "%{http_code}" 2>/dev/null)
    FRONTEND_TIME=$(curl -s "https://docflow.fi" -o /dev/null -w "%{time_total}" 2>/dev/null)
    
    # Get latest deployment
    LATEST_DEPLOYMENT=$(npx vercel ls 2>/dev/null | grep -E "Ready|Building|Error|Queued" | head -1)
    
    # Check if new deployment appeared
    if [ "$LATEST_DEPLOYMENT" != "$PREVIOUS_DEPLOYMENT" ] && [ -n "$LATEST_DEPLOYMENT" ]; then
        echo -e "${GREEN}🆕 NEW DEPLOYMENT DETECTED!${NC}"
        PREVIOUS_DEPLOYMENT="$LATEST_DEPLOYMENT"
    fi
    
    # Display status
    echo -e "[${CYAN}$TIMESTAMP${NC}] Frontend: HTTP ${GREEN}$FRONTEND_STATUS${NC} | Response: ${FRONTEND_TIME}s"
    
    if [ -n "$LATEST_DEPLOYMENT" ]; then
        if echo "$LATEST_DEPLOYMENT" | grep -q "Ready"; then
            echo -e "   ${GREEN}✅ Latest: $LATEST_DEPLOYMENT${NC}"
        elif echo "$LATEST_DEPLOYMENT" | grep -q "Building"; then
            echo -e "   ${YELLOW}🔨 Building: $LATEST_DEPLOYMENT${NC}"
        elif echo "$LATEST_DEPLOYMENT" | grep -q "Error"; then
            echo -e "   ${RED}❌ Error: $LATEST_DEPLOYMENT${NC}"
        else
            echo -e "   ${BLUE}📦 $LATEST_DEPLOYMENT${NC}"
        fi
    fi
    
    echo ""
    sleep 10
done

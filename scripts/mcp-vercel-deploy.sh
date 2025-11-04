#!/bin/bash
# 🚀 MCP Vercel Pro Deployment Pipeline
# Full deployment pipeline with MCP integration

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
FRONTEND_DIR="${FRONTEND_DIR:-frontend}"
PROJECT_NAME="${PROJECT_NAME:-converto-business-os}"
VERCEL_TOKEN="${VERCEL_TOKEN:-}"

echo -e "${BLUE}🚀 Starting MCP Vercel Pro Deployment Pipeline...${NC}\n"

# Step 1: Build Verification
echo -e "${BLUE}📦 Step 1: Build Verification${NC}"
cd "$FRONTEND_DIR"

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found in $FRONTEND_DIR${NC}"
    exit 1
fi

echo -e "${BLUE}Installing dependencies...${NC}"
npm ci

echo -e "${BLUE}Building project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}\n"

# Step 2: Deploy to Vercel Pro
echo -e "${BLUE}🚀 Step 2: Deploy to Vercel Pro${NC}"
cd ..

if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  VERCEL_TOKEN not set. Using Vercel CLI login...${NC}"
    cd "$FRONTEND_DIR"
    vercel login
    cd ..
else
    echo -e "${GREEN}✅ VERCEL_TOKEN found${NC}"
fi

cd "$FRONTEND_DIR"
DEPLOYMENT_URL=$(vercel deploy --prod --yes --token="${VERCEL_TOKEN:-}" 2>&1 | grep -oE 'https://[^\s]+' | head -1 || echo "")

if [ -z "$DEPLOYMENT_URL" ]; then
    echo -e "${RED}❌ Deployment failed or URL not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}📍 URL: $DEPLOYMENT_URL${NC}\n"

# Step 3: Health Check
echo -e "${BLUE}🏥 Step 3: Health Check${NC}"
sleep 10

HEALTH_URL="${DEPLOYMENT_URL}/api/health"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed!${NC}\n"
else
    echo -e "${YELLOW}⚠️  Health check returned: $HEALTH_RESPONSE${NC}\n"
fi

# Step 4: Log Scanning
echo -e "${BLUE}📊 Step 4: Log Scanning${NC}"
echo -e "${YELLOW}Fetching recent logs...${NC}\n"
vercel logs "$DEPLOYMENT_URL" --limit 20 2>&1 | head -20 || echo "Logs not available yet"

# Step 5: MCP Notifications (if MCP tools available)
echo -e "\n${BLUE}📧 Step 5: MCP Notifications${NC}"
echo -e "${YELLOW}MCP notifications can be sent via:${NC}"
echo -e "  - Resend email: resend_deployment_alert"
echo -e "  - Notion log: notion_deployment_log"
echo -e "  - Error alert: resend_error_alert (if deployment failed)\n"

# Summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ MCP Deployment Pipeline Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📍 Production URL:${NC} $DEPLOYMENT_URL"
echo -e "${BLUE}📊 Logs:${NC} ./scripts/vercel-logs-mcp.sh $DEPLOYMENT_URL"
echo -e "${BLUE}📊 Real-time Logs:${NC} vercel logs $DEPLOYMENT_URL --follow"
echo -e "${BLUE}📈 Analytics:${NC} https://vercel.com/dashboard"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Export for MCP use
export DEPLOYMENT_URL
export DEPLOYMENT_STATUS="success"
export HEALTH_CHECK_STATUS="$HEALTH_RESPONSE"

echo -e "${BLUE}Environment variables exported:${NC}"
echo -e "  DEPLOYMENT_URL=$DEPLOYMENT_URL"
echo -e "  DEPLOYMENT_STATUS=success"
echo -e "  HEALTH_CHECK_STATUS=$HEALTH_RESPONSE\n"

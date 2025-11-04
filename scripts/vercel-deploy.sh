#!/bin/bash
# 🚀 Vercel Pro Deploy Script - Converto Business OS
# Mutkaton deploy ja log scanning

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_DIR="frontend"
PROJECT_NAME="converto-business-os"
VERCEL_PROD_FLAG="--prod"

echo -e "${BLUE}🚀 Starting Vercel Pro Deployment...${NC}\n"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel@latest
fi

# Check if we're in the right directory
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Error: frontend directory not found${NC}"
    exit 1
fi

cd "$FRONTEND_DIR"

# Check environment variables
echo -e "${BLUE}📋 Checking environment variables...${NC}"
if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  VERCEL_TOKEN not set. Using Vercel CLI login...${NC}"
    vercel login
else
    echo -e "${GREEN}✅ VERCEL_TOKEN found${NC}"
fi

# Install dependencies
echo -e "\n${BLUE}📦 Installing dependencies...${NC}"
npm ci

# Build project
echo -e "\n${BLUE}🔨 Building project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

# Deploy to Vercel
echo -e "\n${BLUE}🚀 Deploying to Vercel...${NC}"
if [ -n "$VERCEL_PROD_FLAG" ]; then
    DEPLOYMENT_URL=$(vercel deploy --prod --yes --token="${VERCEL_TOKEN:-}")
else
    DEPLOYMENT_URL=$(vercel deploy --yes --token="${VERCEL_TOKEN:-}")
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

echo -e "\n${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}📍 URL: $DEPLOYMENT_URL${NC}\n"

# Wait for deployment to be ready
echo -e "${BLUE}⏳ Waiting for deployment to be ready...${NC}"
sleep 5

# Health check
echo -e "\n${BLUE}🏥 Running health check...${NC}"
HEALTH_URL="${DEPLOYMENT_URL}/api/health"
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${YELLOW}⚠️  Health check returned: $HEALTH_RESPONSE${NC}"
fi

# Show logs
echo -e "\n${BLUE}📊 Fetching deployment logs...${NC}"
echo -e "${YELLOW}To view logs in real-time, run:${NC}"
echo -e "  ${BLUE}vercel logs $DEPLOYMENT_URL --follow${NC}\n"

# Show Vercel Dashboard link
echo -e "${BLUE}📊 View deployment in Vercel Dashboard:${NC}"
echo -e "  ${BLUE}https://vercel.com/dashboard${NC}\n"

# Summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📍 Production URL:${NC} $DEPLOYMENT_URL"
echo -e "${BLUE}📊 Logs:${NC} vercel logs $DEPLOYMENT_URL --follow"
echo -e "${BLUE}📈 Analytics:${NC} https://vercel.com/dashboard"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

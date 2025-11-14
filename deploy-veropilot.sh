#!/bin/bash

# VEROPILOT-AI Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 VEROPILOT-AI Deployment Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required commands exist
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is required but not installed.${NC}" >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm is required but not installed.${NC}" >&2; exit 1; }
command -v git >/dev/null 2>&1 || { echo -e "${RED}❌ git is required but not installed.${NC}" >&2; exit 1; }

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating from example...${NC}"
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env.local
        echo -e "${YELLOW}⚠️  Please edit .env.local with your actual values before deploying${NC}"
        exit 1
    else
        echo -e "${RED}❌ .env.production.example not found${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Environment file found${NC}"
echo ""

# Step 1: Commit and push changes
echo "📦 Step 1: Committing and pushing changes..."
git add .
git status

read -p "Do you want to commit these changes? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter commit message: " commit_message
    git commit -m "$commit_message" || echo "No changes to commit"
    git push origin docflow-main
    echo -e "${GREEN}✅ Changes pushed to GitHub${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping commit${NC}"
fi
echo ""

# Step 2: Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "📦 Step 2: Installing Vercel CLI..."
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI installed${NC}"
else
    echo -e "${GREEN}✅ Vercel CLI already installed${NC}"
fi
echo ""

# Step 3: Login to Vercel
echo "🔐 Step 3: Vercel login..."
vercel login
echo ""

# Step 4: Deploy frontend
echo "🚀 Step 4: Deploying frontend to Vercel..."
cd frontend

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo -e "${RED}❌ vercel.json not found in frontend directory${NC}"
    exit 1
fi

# Deploy to production
vercel --prod

echo -e "${GREEN}✅ Frontend deployed successfully!${NC}"
echo ""

# Step 5: Verify deployment
echo "🧪 Step 5: Verifying deployment..."
read -p "Enter your Vercel deployment URL (e.g., https://veropilot-ai.vercel.app): " deployment_url

echo "Testing health endpoint..."
health_response=$(curl -s "${deployment_url}/api/health" || echo "failed")

if [[ $health_response == *"healthy"* ]]; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed or endpoint not ready yet${NC}"
    echo "Response: $health_response"
fi
echo ""

# Step 6: Post-deployment checklist
echo "📋 Post-Deployment Checklist:"
echo "=============================="
echo ""
echo "1. ✅ Verify Supabase migrations are applied"
echo "   → Go to: https://app.supabase.com/project/_/editor"
echo ""
echo "2. ✅ Check environment variables in Vercel"
echo "   → Go to: https://vercel.com/dashboard → Settings → Environment Variables"
echo ""
echo "3. ✅ Test the full flow:"
echo "   → Sign up → Upload receipt → Verify OCR results"
echo ""
echo "4. ✅ Monitor logs:"
echo "   → Vercel: https://vercel.com/dashboard → Logs"
echo "   → Supabase: https://app.supabase.com/project/_/logs"
echo "   → OpenAI: https://platform.openai.com/usage"
echo ""
echo "5. ✅ Set up custom domain (optional):"
echo "   → Vercel Dashboard → Domains → Add Domain"
echo ""

echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "Your VEROPILOT-AI MVP is live at: ${deployment_url}"
echo ""
echo "For detailed documentation, see:"
echo "  - QUICK_DEPLOY.md"
echo "  - DEPLOYMENT_CHECKLIST.md"
echo "  - DEPLOYMENT_GUIDE_VEROPILOT.md"
echo ""


cripts/deploy-converto-cloudflare.sh</path>
<content">#!/bin/bash

# 🚀 CONVERTO.FI CLOUDFLARE DEPLOYMENT SCRIPT
# Deploys the marketing website to Cloudflare Pages + Workers

set -e

echo "🚀 CONVERTO.FI CLOUDFLARE DEPLOYMENT"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend directory not found!"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📥 Installing Wrangler CLI..."
    npm install -g wrangler
fi

cd frontend

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    echo "Please install npm"
    exit 1
fi

echo "📦 Step 1: Installing frontend dependencies..."
npm install

echo "🔧 Step 2: Building the Next.js application..."
npm run build

echo "🚀 Step 3: Deploying to Cloudflare Pages..."
echo "⚠️  You'll need to:"
echo "   1. Login to Cloudflare (if not already logged in)"
echo "   2. Create new Cloudflare Pages project"
echo "   3. Connect to GitHub repository"
echo "   4. Configure build settings"
echo ""

# Check if wrangler auth is set up
echo "🔍 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please authenticate with Cloudflare:"
    wrangler login
fi

echo "🌐 Cloudflare Pages Deployment Instructions:"
echo "============================================="
echo ""
echo "1. Go to: https://dash.cloudflare.com/pages/create"
echo "2. Select 'Connect to Git'"
echo "3. Choose your repository: mxxx222/converto-business-os-mvp"
echo ""
echo "4. Configure Build Settings:"
echo "   - Framework preset: Next.js"
echo "   - Build command: cd frontend && npm install && npm run build"
echo "   - Build output directory: frontend/.next"
echo "   - Root directory: /"
echo ""
echo "5. Add Environment Variables:"
echo "   NODE_ENV=production"
echo "   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
echo "   RESEND_API_KEY=your-resend-key"
echo ""
echo "6. After deploy, add custom domain: converto.fi"
echo "   - Cloudflare will show DNS configuration"
echo ""
echo "7. Configure DNS records:"
echo "   Type: CNAME"
echo "   Name: @ (for converto.fi)"
echo "   Target: [your-pages-project].pages.dev"
echo "   Name: www"
echo "   Target: [your-pages-project].pages.dev"
echo ""

echo "🤖 Workers Deployment (API Proxy):"
echo "==================================="
echo "1. Deploy Workers:"
cd ../workers
wrangler publish

echo "2. Configure Workers routes:"
echo "   - Workers automatically route to /api/* endpoints"
echo "   - Custom domains: converto.fi, www.converto.fi"
echo ""

echo "✅ CLOUDFLARE DEPLOYMENT SETUP COMPLETE!"
echo ""
echo "🎯 BENEFITS OF CLOUDFLARE OVER VERCEL:"
echo "======================================"
echo "✅ Free hosting (unlimited requests)"
echo "✅ Global CDN (200+ datacenters)"
echo "✅ Instant SSL/TLS"
echo "✅ API proxy via Workers"
echo "✅ Edge computing capabilities"
echo "✅ Cost savings: $0 vs $5-20/month"
echo ""
echo "📊 Expected Performance:"
echo "========================"
echo "⚡ Global CDN: < 100ms worldwide"
echo "🔒 SSL: Automatic certificate"
echo "📈 Analytics: Built-in dashboard"
echo "💾 Storage: R2 integration ready"
echo "🔧 API: Workers proxy configured"
echo ""
echo "🎉 CONVERTO.FI will be live via Cloudflare Pages!"
echo "Your marketing website + API proxy + global CDN"
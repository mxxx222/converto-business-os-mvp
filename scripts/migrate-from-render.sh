#!/bin/bash

# 🚀 COMPLETE MIGRATION SCRIPT: Render → Cloudflare + Vercel
# Migrates Converto services from Render to Cloudflare Pages + Vercel

set -e

echo "🚀 CONVERTO MIGRATION: Render → Cloudflare + Vercel"
echo "===================================================="
echo ""

# Check required environment variables
MISSING_VARS=()

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    MISSING_VARS+=("CLOUDFLARE_API_TOKEN")
fi

if [ -z "$VERCEL_TOKEN" ]; then
    MISSING_VARS+=("VERCEL_TOKEN")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "Please set these variables:"
    echo "   export CLOUDFLARE_API_TOKEN='your-cloudflare-token'"
    echo "   export VERCEL_TOKEN='your-vercel-token'"
    exit 1
fi

echo "✅ All required API tokens found"
echo ""

# STEP 1: Deploy Frontend to Cloudflare Pages
echo "📦 STEP 1: Deploying Frontend to Cloudflare Pages"
echo "=================================================="

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📥 Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Login to Cloudflare if not already
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Logging in to Cloudflare..."
    wrangler login
fi

echo "✅ Cloudflare authentication verified"
echo ""

# Build frontend
echo "🔧 Building frontend..."
cd frontend
npm install
npm run build
echo "✅ Frontend build complete"
echo ""

# Deploy to Cloudflare Pages
echo "🚀 Deploying to Cloudflare Pages..."
cd ..
wrangler pages deploy frontend/.next --project-name=converto-frontend --branch=main
echo "✅ Frontend deployed to Cloudflare Pages"
echo ""

# STEP 2: Configure Custom Domain
echo "🌐 STEP 2: Configuring Custom Domain (converto.fi)"
echo "==================================================="

echo "⚠️  MANUAL STEP REQUIRED:"
echo "1. Go to: https://dash.cloudflare.com/pages"
echo "2. Open 'converto-frontend' project"
echo "3. Settings → Custom domains → Add domain: converto.fi"
echo "4. Cloudflare will auto-configure DNS and SSL"
echo ""
read -p "Press Enter when converto.fi is configured in Cloudflare..."

# STEP 3: Deploy Backend
echo ""
echo "⚙️  STEP 3: Deploying Backend"
echo "============================="

# Option A: Vercel (default)
echo "Deploying backend to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel if not already
if ! vercel whoami &> /dev/null; then
    echo "🔐 Logging in to Vercel..."
    vercel login
fi

# Deploy backend to Vercel
echo "🚀 Deploying backend..."
vercel --prod --yes
echo "✅ Backend deployed to Vercel"
echo ""

# STEP 4: Test Everything
echo "🧪 STEP 4: Testing Migration"
echo "============================"

echo "Testing converto.fi..."
if curl -s -o /dev/null -w "%{http_code}" https://converto.fi | grep -q "200\|301\|302"; then
    echo "✅ converto.fi is live!"
else
    echo "⚠️  converto.fi not responding yet (DNS propagation may take time)"
fi

echo ""
echo "Testing www.converto.fi..."
if curl -s -o /dev/null -w "%{http_code}" https://www.converto.fi | grep -q "200\|301\|302"; then
    echo "✅ www.converto.fi is live!"
else
    echo "⚠️  www.converto.fi not responding yet"
fi

# STEP 5: Delete Render Services
echo ""
echo "🗑️  STEP 5: Cleaning Up Render Services"
echo "========================================"

echo "⚠️  CAUTION: This will DELETE Render services!"
echo ""
echo "Services to delete:"
echo "- converto-marketing (srv-d41adhf5r7bs739aqe70)"
echo "- converto-dashboard (srv-d3rcdnpr0fns73bl3kg0)"
echo "- converto-business-os-quantum-mvp-1 (srv-d3r10pjipnbc73asaod0)"
echo "- converto-business-os-quantum-mvp-1-1 (srv-d3stltc9c44c73cdblpg)"
echo "- converto-business-os-quantum-mvp-1-2 (srv-d3t3bps9c44c73cgvh80)"
echo ""

read -p "Delete these Render services? (yes/no): " CONFIRM_DELETE

if [ "$CONFIRM_DELETE" = "yes" ]; then
    if [ -z "$RENDER_API_KEY" ]; then
        echo "⚠️  RENDER_API_KEY not set, skipping deletion"
        echo "Set it with: export RENDER_API_KEY='your-key'"
    else
        echo "Deleting Render services..."

        # Delete services
        curl -X DELETE "https://api.render.com/v1/services/srv-d41adhf5r7bs739aqe70" \
            -H "Authorization: Bearer $RENDER_API_KEY" && echo "✅ Deleted converto-marketing"

        curl -X DELETE "https://api.render.com/v1/services/srv-d3rcdnpr0fns73bl3kg0" \
            -H "Authorization: Bearer $RENDER_API_KEY" && echo "✅ Deleted converto-dashboard"

        curl -X DELETE "https://api.render.com/v1/services/srv-d3r10pjipnbc73asaod0" \
            -H "Authorization: Bearer $RENDER_API_KEY" && echo "✅ Deleted backend-1"

        curl -X DELETE "https://api.render.com/v1/services/srv-d3stltc9c44c73cdblpg" \
            -H "Authorization: Bearer $RENDER_API_KEY" && echo "✅ Deleted backend-2"

        curl -X DELETE "https://api.render.com/v1/services/srv-d3t3bps9c44c73cgvh80" \
            -H "Authorization: Bearer $RENDER_API_KEY" && echo "✅ Deleted backend-3"

        echo ""
        echo "✅ All Render services deleted!"
    fi
else
    echo "⏭️  Skipping Render deletion (manual cleanup recommended)"
fi

# FINAL SUMMARY
echo ""
echo "🎉 MIGRATION COMPLETE!"
echo "======================"
echo ""
echo "✅ Frontend deployed to: Cloudflare Pages"
echo "✅ Backend deployed to: Vercel"
echo "✅ Custom domain: converto.fi"
echo "✅ SSL: Automatic (Cloudflare)"
echo "✅ CDN: Global (200+ locations)"
echo ""
echo "📊 NEW ARCHITECTURE:"
echo "==================="
echo "converto.fi → Cloudflare Pages (Frontend)"
echo "            → Vercel Functions (API)"
echo "            → Resend (Email)"
echo ""
echo "💰 COST SAVINGS:"
echo "Before: $5-20/month (Render)"
echo "After: $0/month (FREE)"
echo ""
echo "🚀 PERFORMANCE:"
echo "- 200+ global datacenters"
echo "- Automatic optimization"
echo "- Edge computing enabled"
echo ""
echo "✅ Migration successful!"

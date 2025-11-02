cripts/deploy-converto-fi.sh</path>
<content">#!/bin/bash

# 🚀 CONVERTO.FI AUTOMATED DEPLOYMENT SCRIPT
# Deploys the marketing website to converto.fi in under 5 minutes

set -e

echo "🚀 CONVERTO.FI AUTOMATED DEPLOYMENT"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -d "frontend" ]; then
    echo "❌ Error: frontend directory not found!"
    echo "Please run this script from the project root directory"
    exit 1
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

echo "📦 Step 1: Installing dependencies..."
npm install

echo "🔧 Step 2: Building the application..."
npm run build

echo "🌐 Step 3: Checking if Vercel CLI is installed..."
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🚀 Step 4: Deploying to Vercel..."
echo "⚠️  You'll need to:"
echo "   1. Login to Vercel (if not already logged in)"
echo "   2. Confirm deployment settings"
echo "   3. Add custom domain 'converto.fi'"
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo ""
echo "🎯 NEXT STEPS:"
echo "==============="
echo ""
echo "1. 🌐 Configure DNS for converto.fi:"
echo "   - A Record: converto.fi → 76.76.21.21"
echo "   - CNAME: www.converto.fi → cname.vercel-dns.com"
echo ""
echo "2. 📧 Setup email (optional):"
echo "   - Go to https://app.resend.com/domains"
echo "   - Add domain: converto.fi"
echo "   - Follow DNS verification steps"
echo ""
echo "3. ⏱️ Wait for DNS propagation (15-30 minutes)"
echo ""
echo "4. ✅ Test your site:"
echo "   - https://converto.fi"
echo "   - https://www.converto.fi"
echo ""
echo "📞 Support:"
echo "   - Vercel: https://vercel.com/support"
echo "   - DNS issues: Contact your domain registrar"
echo ""

# Check if domain is added
echo "🔍 Checking domain configuration..."
vercel domains ls

echo ""
echo "🎉 CONVERTO.FI DEPLOYMENT COMPLETE!"
echo "Your marketing website will be live once DNS propagates."
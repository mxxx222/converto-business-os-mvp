#!/bin/bash

# Vercel Deployment Monitor
# Seuraa deploymentin tilaa reaaliajassa

DEPLOYMENT_URL="https://frontend-ierft3ng5-maxs-projects-149851b4.vercel.app"
PRODUCTION_URL="https://docflow.fi"
CHECK_INTERVAL=10
MAX_CHECKS=60  # 10 minutes

echo "🚀 Vercel Deployment Monitor"
echo "============================"
echo ""
echo "Deployment URL: $DEPLOYMENT_URL"
echo "Production URL: $PRODUCTION_URL"
echo "Check interval: ${CHECK_INTERVAL}s"
echo ""

check_count=0

while [ $check_count -lt $MAX_CHECKS ]; do
    check_count=$((check_count + 1))
    
    echo "[$check_count] $(date '+%H:%M:%S') - Checking..."
    
    # Check deployment status via Vercel CLI
    STATUS=$(cd /Users/herbspotturku/docflow/docflow/frontend && vercel inspect "$DEPLOYMENT_URL" 2>&1 | grep -i "status" | head -1 || echo "checking...")
    
    if echo "$STATUS" | grep -qi "Ready\|ready"; then
        echo "✅ Deployment READY!"
        echo ""
        echo "🔍 Verifying..."
        
        # Check deployment URL
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" 2>/dev/null || echo "000")
        echo "   Deployment URL: $HTTP_CODE"
        
        # Check production URL
        PROD_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PRODUCTION_URL" 2>/dev/null || echo "000")
        echo "   Production URL: $PROD_CODE"
        
        # Check for LandingSnippet content
        echo ""
        echo "📄 Checking content..."
        if curl -s "$DEPLOYMENT_URL" 2>/dev/null | grep -qi "Deploy 30 sekunnissa\|LandingSnippet\|Laske oma Mari"; then
            echo "   ✅ LandingSnippet content found!"
        else
            echo "   ⚠️  LandingSnippet content not found (may be cached)"
        fi
        
        echo ""
        echo "🎉 Deployment complete!"
        echo "   View: $DEPLOYMENT_URL"
        echo "   Production: $PRODUCTION_URL"
        exit 0
        
    elif echo "$STATUS" | grep -qi "Error\|error\|Failed\|failed"; then
        echo "❌ Deployment FAILED!"
        echo ""
        echo "Check logs:"
        echo "   vercel inspect $DEPLOYMENT_URL --logs"
        exit 1
        
    elif echo "$STATUS" | grep -qi "Building\|building\|Queued\|queued"; then
        echo "⏳ Building... ($STATUS)"
    else
        echo "⏳ Status: $STATUS"
    fi
    
    sleep $CHECK_INTERVAL
done

echo ""
echo "⏰ Timeout - deployment still in progress"
echo "Check manually: https://vercel.com/dashboard"


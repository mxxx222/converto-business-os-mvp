#!/bin/bash

# DocFlow Deployment Monitor
# Seuraa Vercel deploymentin tilaa ja tarkistaa kun se on valmis

set -e

PROJECT_NAME="frontend"
CHECK_INTERVAL=30  # seconds
MAX_CHECKS=20      # max 10 minutes (20 * 30s)
DEPLOYMENT_URL="https://docflow.fi"

echo "🔍 DocFlow Deployment Monitor"
echo "=============================="
echo ""
echo "Monitoring deployment status..."
echo "Check interval: ${CHECK_INTERVAL}s"
echo "Max wait time: $((MAX_CHECKS * CHECK_INTERVAL / 60)) minutes"
echo ""

# Function to check deployment status
check_deployment() {
    cd /Users/herbspotturku/docflow/docflow/frontend
    
    # Get latest deployment
    LATEST=$(vercel ls 2>&1 | grep -E "Ready|Building|Error" | head -1)
    
    if echo "$LATEST" | grep -q "Ready"; then
        echo "✅ Deployment READY!"
        return 0
    elif echo "$LATEST" | grep -q "Building"; then
        echo "⏳ Building..."
        return 1
    elif echo "$LATEST" | grep -q "Error"; then
        echo "❌ Deployment ERROR!"
        return 2
    else
        echo "⏳ Waiting for deployment..."
        return 1
    fi
}

# Function to verify live site
verify_live() {
    echo ""
    echo "🔍 Verifying live site..."
    echo ""
    
    # Check main page
    echo "1. Checking main page..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ Main page: $HTTP_CODE OK"
    else
        echo "   ❌ Main page: $HTTP_CODE"
    fi
    
    # Check for new components
    echo "2. Checking new components..."
    if curl -s "$DEPLOYMENT_URL" | grep -qi "Laske oma Mari\|StoryBrand\|Lopeta laskujen"; then
        echo "   ✅ StoryBrand hero found"
    else
        echo "   ⚠️  StoryBrand hero not found (might be cached)"
    fi
    
    # Check beta page
    echo "3. Checking beta page..."
    BETA_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/beta" || echo "000")
    if [ "$BETA_CODE" = "200" ]; then
        echo "   ✅ Beta page: $BETA_CODE OK"
    else
        echo "   ⚠️  Beta page: $BETA_CODE"
    fi
    
    # Check robots.txt
    echo "4. Checking SEO files..."
    ROBOTS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/robots.txt" || echo "000")
    if [ "$ROBOTS_CODE" = "200" ]; then
        echo "   ✅ robots.txt: $ROBOTS_CODE OK"
    else
        echo "   ⚠️  robots.txt: $ROBOTS_CODE"
    fi
    
    # Check API health
    echo "5. Checking API health..."
    HEALTH_RESPONSE=$(curl -s "$DEPLOYMENT_URL/api/health" || echo "error")
    if echo "$HEALTH_RESPONSE" | grep -q "healthy\|success"; then
        echo "   ✅ API health: OK"
    else
        echo "   ⚠️  API health: Check failed"
    fi
    
    echo ""
}

# Main monitoring loop
CHECK_COUNT=0
while [ $CHECK_COUNT -lt $MAX_CHECKS ]; do
    CHECK_COUNT=$((CHECK_COUNT + 1))
    
    echo "[$CHECK_COUNT/$MAX_CHECKS] $(date '+%H:%M:%S') - Checking deployment status..."
    
    if check_deployment; then
        echo ""
        echo "🎉 Deployment completed!"
        echo ""
        verify_live
        echo "✅ All checks complete!"
        exit 0
    elif [ $? -eq 2 ]; then
        echo ""
        echo "❌ Deployment failed!"
        echo "Check Vercel dashboard: https://vercel.com/dashboard"
        exit 1
    fi
    
    if [ $CHECK_COUNT -lt $MAX_CHECKS ]; then
        echo "Waiting ${CHECK_INTERVAL}s before next check..."
        sleep $CHECK_INTERVAL
        echo ""
    fi
done

echo ""
echo "⏰ Timeout reached after $((MAX_CHECKS * CHECK_INTERVAL / 60)) minutes"
echo "Checking current status..."
verify_live
echo ""
echo "💡 Deployment might still be in progress."
echo "   Check manually: https://vercel.com/dashboard"
exit 0


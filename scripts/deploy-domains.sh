#!/bin/bash

# DocFlow.fi Domain Deployment Script
# This script configures custom domains for Vercel and Render services

set -e

echo "🌐 DocFlow.fi Domain Configuration Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check required environment variables
check_env_vars() {
    echo "📋 Checking environment variables..."
    
    if [ -z "$VERCEL_TOKEN" ]; then
        echo -e "${RED}❌ VERCEL_TOKEN not set${NC}"
        echo "Get your token from: https://vercel.com/account/tokens"
        exit 1
    fi
    
    if [ -z "$RENDER_API_KEY" ]; then
        echo -e "${YELLOW}⚠️  RENDER_API_KEY not set - manual configuration required${NC}"
    fi
    
    echo -e "${GREEN}✅ Environment variables checked${NC}"
}

# Configure Vercel domain
configure_vercel_domain() {
    echo "🔧 Configuring Vercel domain: docflow.fi"
    
    # Add domain to Vercel project
    vercel domains add docflow.fi --token $VERCEL_TOKEN || echo "Domain may already exist"
    
    # Add www subdomain
    vercel domains add www.docflow.fi --token $VERCEL_TOKEN || echo "WWW domain may already exist"
    
    # Deploy to production
    echo "🚀 Deploying frontend to production..."
    cd frontend
    vercel --prod --token $VERCEL_TOKEN
    cd ..
    
    echo -e "${GREEN}✅ Vercel domain configured${NC}"
}

# Configure Render domains (requires manual setup)
configure_render_domains() {
    echo "🔧 Render domain configuration (manual steps required)"
    
    echo "📝 Manual steps for Render:"
    echo "1. Go to Render Dashboard: https://dashboard.render.com"
    echo "2. Select your backend service"
    echo "3. Go to Settings → Custom Domains"
    echo "4. Add domain: api.docflow.fi"
    echo "5. Repeat for app service with: app.docflow.fi"
    echo ""
    echo "📋 DNS Records needed:"
    echo "   api.docflow.fi CNAME -> your-backend-service.onrender.com"
    echo "   app.docflow.fi CNAME -> your-app-service.onrender.com"
    
    echo -e "${YELLOW}⚠️  Manual configuration required for Render domains${NC}"
}

# Verify domain configuration
verify_domains() {
    echo "🔍 Verifying domain configuration..."
    
    # Check DNS propagation
    echo "Checking DNS records..."
    
    # Main domain
    if dig docflow.fi A +short | grep -q .; then
        echo -e "${GREEN}✅ docflow.fi A record found${NC}"
    else
        echo -e "${RED}❌ docflow.fi A record not found${NC}"
    fi
    
    # WWW subdomain
    if dig www.docflow.fi CNAME +short | grep -q .; then
        echo -e "${GREEN}✅ www.docflow.fi CNAME record found${NC}"
    else
        echo -e "${RED}❌ www.docflow.fi CNAME record not found${NC}"
    fi
    
    # API subdomain
    if dig api.docflow.fi CNAME +short | grep -q .; then
        echo -e "${GREEN}✅ api.docflow.fi CNAME record found${NC}"
    else
        echo -e "${RED}❌ api.docflow.fi CNAME record not found${NC}"
    fi
    
    # App subdomain
    if dig app.docflow.fi CNAME +short | grep -q .; then
        echo -e "${GREEN}✅ app.docflow.fi CNAME record found${NC}"
    else
        echo -e "${RED}❌ app.docflow.fi CNAME record not found${NC}"
    fi
}

# Test SSL certificates
test_ssl() {
    echo "🔒 Testing SSL certificates..."
    
    domains=("https://docflow.fi" "https://www.docflow.fi" "https://api.docflow.fi" "https://app.docflow.fi")
    
    for domain in "${domains[@]}"; do
        if curl -s -I "$domain" | grep -q "HTTP/"; then
            echo -e "${GREEN}✅ $domain SSL working${NC}"
        else
            echo -e "${RED}❌ $domain SSL not working${NC}"
        fi
    done
}

# Main execution
main() {
    echo "Starting domain configuration..."
    
    check_env_vars
    configure_vercel_domain
    configure_render_domains
    
    echo ""
    echo "⏳ Waiting for DNS propagation (this may take up to 48 hours)..."
    echo "💡 You can check propagation status at: https://dnschecker.org"
    
    echo ""
    echo "🔍 Running verification checks..."
    verify_domains
    test_ssl
    
    echo ""
    echo "🎉 Domain configuration script completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Complete manual Render domain configuration"
    echo "2. Wait for DNS propagation"
    echo "3. Verify all domains are working"
    echo "4. Run: ./scripts/test-domains.sh"
}

# Run main function
main "$@"

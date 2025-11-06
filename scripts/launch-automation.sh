#!/bin/bash
# 🚀 Converto Launch Automation Script
# Automates launch day tasks: email sending, deployment checks, status monitoring

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-https://converto-business-os-quantum-mvp-1.onrender.com}"
BACKEND_URL="${BACKEND_URL:-$API_URL}"

echo -e "${GREEN}🚀 Converto Launch Automation${NC}"
echo "=================================="
echo ""

# Check if API is accessible
echo -e "${YELLOW}1. Checking API health...${NC}"
if curl -f -s "$BACKEND_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${RED}❌ API health check failed${NC}"
    exit 1
fi

# Check if email service is ready
echo -e "${YELLOW}2. Checking email service...${NC}"
if curl -f -s "$BACKEND_URL/api/v1/email/health" > /dev/null; then
    echo -e "${GREEN}✅ Email service is ready${NC}"
else
    echo -e "${YELLOW}⚠️  Email service health check failed (may still work)${NC}"
fi

# Function to send launch announcement
send_launch_email() {
    local email=$1
    local name=${2:-"Friend"}
    
    echo -e "${YELLOW}Sending launch announcement to $email...${NC}"
    
    response=$(curl -s -X POST "$BACKEND_URL/api/v1/email/launch-announcement" \
        -H "Content-Type: application/json" \
        -d "{
            \"recipient_email\": \"$email\",
            \"recipient_name\": \"$name\"
        }")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Email sent successfully to $email${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to send email to $email${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Send launch emails (if EMAIL_LIST is set)
if [ -n "$EMAIL_LIST" ]; then
    echo -e "${YELLOW}3. Sending launch announcements...${NC}"
    IFS=',' read -ra EMAILS <<< "$EMAIL_LIST"
    for email in "${EMAILS[@]}"; do
        send_launch_email "$email" || true
        sleep 1  # Rate limiting
    done
    echo -e "${GREEN}✅ Launch emails sent${NC}"
else
    echo -e "${YELLOW}3. Skipping email sending (EMAIL_LIST not set)${NC}"
    echo "   To send emails, set: export EMAIL_LIST='email1@example.com,email2@example.com'"
fi

# Check deployment status
echo -e "${YELLOW}4. Checking deployment status...${NC}"
if command -v render &> /dev/null || [ -n "$RENDER_API_KEY" ]; then
    echo -e "${YELLOW}   (Render CLI or API key not found - skipping deployment check)${NC}"
else
    echo -e "${GREEN}✅ Deployment check skipped${NC}"
fi

# Check PostHog status
echo -e "${YELLOW}5. Checking PostHog configuration...${NC}"
if [ -n "$NEXT_PUBLIC_POSTHOG_KEY" ]; then
    echo -e "${GREEN}✅ PostHog key is set${NC}"
else
    echo -e "${RED}❌ NEXT_PUBLIC_POSTHOG_KEY not set${NC}"
    echo "   Set it in your environment variables"
fi

# Summary
echo ""
echo -e "${GREEN}=================================="
echo "✅ Launch automation complete!"
echo "==================================${NC}"
echo ""
echo "Next steps:"
echo "1. Verify launch page: https://converto.fi/launch"
echo "2. Monitor PostHog analytics"
echo "3. Check email delivery status"
echo "4. Publish social media posts"
echo ""




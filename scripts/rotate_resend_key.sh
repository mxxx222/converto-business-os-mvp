#!/bin/bash

# DocFlow Resend API Key Rotation Script
# Rotates the production API key immediately for security

echo "🔐 DocFlow Resend API Key Rotation"
echo "================================="

# Get current key from environment
CURRENT_KEY="$RESEND_API_KEY"
NEW_KEY=""

if [ -z "$CURRENT_KEY" ]; then
    echo "❌ Current RESEND_API_KEY not found in environment"
    echo "Please set: export RESEND_API_KEY='your-current-key'"
    exit 1
fi

echo "🔑 Current key: ${CURRENT_KEY:0:15}..."
echo ""

# Instructions for manual rotation
echo "📋 MANUAL ROTATION STEPS:"
echo "========================="
echo ""
echo "1. 🔐 Create new API key in Resend dashboard:"
echo "   - Go to: https://resend.com/api-keys"
echo "   - Click: 'Create API Key'"
echo "   - Name: 'Production - DocFlow (Rotated $(date +'%Y-%m-%d %H:%M'))'"
echo "   - Permissions: Send emails, View analytics"
echo "   - Copy the new key immediately"
echo ""
echo "2. 🗑️ Remove old key (in Resend dashboard):"
echo "   - Find old key: ${CURRENT_KEY:0:15}..."
echo "   - Click: 'Delete'"
echo "   - Confirm deletion"
echo ""
echo "3. 🔄 Update environment files:"
echo "   - Update .env.production with new key"
echo "   - Update secrets in your deployment platform"
echo "   - Update local .env.local if needed"
echo ""
echo "4. 🚀 Redeploy production:"
echo "   - Redeploy your application with new key"
echo "   - Verify email sending still works"
echo "   - Test webhook delivery"
echo ""

# Generate environment update commands
echo "🔄 ENVIRONMENT UPDATE COMMANDS:"
echo "==============================="
echo ""
echo "# After getting new key from Resend:"
echo "export RESEND_API_KEY='re_your_new_key_here'"
echo ""
echo "# Update .env.production:"
echo "sed -i.bak 's/^RESEND_API_KEY=.*/RESEND_API_KEY=re_your_new_key_here/' .env.production"
echo ""
echo "# Test new key:"
echo "curl -H 'Authorization: Bearer re_your_new_key_here' https://api.resend.com/domains"
echo ""

echo "✅ Rotation script ready!"
echo "⚠️ SECURITY NOTE: The old key has been exposed and should be rotated immediately!"

# Generate test commands for verification
echo ""
echo "🔍 VERIFICATION COMMANDS:"
echo "========================"
echo ""
echo "# Test new key works:"
echo "curl -H 'Authorization: Bearer re_your_new_key_here' https://api.resend.com/domains"
echo ""
echo "# Test email sending (replace email with your test email):"
echo "curl -X POST https://api.resend.com/emails \"
echo "  -H 'Authorization: Bearer re_your_new_key_here' \"
echo "  -H 'Content-Type: application/json' \"
echo "  -d '{\"from\": \"noreply@docflow.fi\", \"to\": \"test@example.com\", \"subject\": \"Key Rotation Test\", \"html\": \"<h1>Test</h1>\"}'"
echo ""
echo "# Check domain verification:"
echo "curl -H 'Authorization: Bearer re_your_new_key_here' https://api.resend.com/domains | jq '.data[0].status'"

# Create webhook test commands
echo ""
echo "🧪 WEBHOOK TEST COMMANDS:"
echo "========================="
echo ""
echo "# Test delivered webhook:"
echo "curl -X POST https://docflow.fi/api/resend/webhook \"
echo "  -H 'Content-Type: application/json' \"
echo "  -H 'resend-signature: sha256=test_signature' \"
echo "  -d '{\"type\": \"email.delivered\", \"data\": {\"id\": \"test_delivered\", \"to\": \"test@example.com\"}}'"
echo ""
echo "# Test bounced webhook:"
echo "curl -X POST https://docflow.fi/api/resend/webhook \"
echo "  -H 'Content-Type: application/json' \"
echo "  -H 'resend-signature: sha256=test_signature' \"
echo "  -d '{\"type\": \"email.bounced\", \"data\": {\"id\": \"test_bounced\", \"to\": \"bounce@example.com\", \"type\": \"hard\"}}'"
echo ""
echo "# Test complained webhook:"
echo "curl -X POST https://docflow.fi/api/resend/webhook \"
echo "  -H 'Content-Type: application/json' \"
echo "  -H 'resend-signature: sha256=test_signature' \"
echo "  -d '{\"type\": \"email.complained\", \"data\": {\"id\": \"test_complained\", \"to\": \"complaint@example.com\"}}'"
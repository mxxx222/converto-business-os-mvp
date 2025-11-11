#!/bin/bash

# DocFlow Resend Webhook Testing Commands
# cURL commands for testing all webhook events

WEBHOOK_URL="https://docflow.fi/api/resend/webhook"
WEBHOOK_SECRET="prod_webhook_secret_2025"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "🧪 DocFlow Resend Webhook Test Commands"
echo "======================================"
echo "🌐 Webhook URL: $WEBHOOK_URL"
echo "🔐 Webhook Secret: ${WEBHOOK_SECRET:0:15}..."
echo "🕒 Test Timestamp: $TIMESTAMP"
echo ""

# Function to generate signature
generate_signature() {
    local payload="$1"
    echo -n "$payload" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | sed 's/^.* //'
}

echo "📧 TEST 1: DELIVERED EVENT"
echo "========================="
DELIVERED_PAYLOAD='{
  "type": "email.delivered",
  "data": {
    "id": "delivered_001",
    "to": "test@example.com",
    "subject": "DocFlow Test Email - Delivered",
    "created_at": "'$TIMESTAMP'",
    "delivered_at": "'$TIMESTAMP'"
  },
  "created_at": "'$TIMESTAMP'"
}'

DELIVERED_SIG=$(generate_signature "$DELIVERED_PAYLOAD")
echo "curl -X POST $WEBHOOK_URL \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'resend-signature: sha256=$DELIVERED_SIG' \\"
echo "  -d '$DELIVERED_PAYLOAD'"
echo ""

echo "❌ TEST 2: BOUNCED EVENT"
echo "========================"
BOUNCED_PAYLOAD='{
  "type": "email.bounced",
  "data": {
    "id": "bounced_001",
    "to": "bounce@example.com",
    "subject": "DocFlow Test Email - Bounced",
    "type": "hard",
    "reason": "User mailbox full",
    "created_at": "'$TIMESTAMP'"
  },
  "created_at": "'$TIMESTAMP'"
}'

BOUNCED_SIG=$(generate_signature "$BOUNCED_PAYLOAD")
echo "curl -X POST $WEBHOOK_URL \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'resend-signature: sha256=$BOUNCED_SIG' \\"
echo "  -d '$BOUNCED_PAYLOAD'"
echo ""

echo "🚨 TEST 3: COMPLAINED EVENT (CRITICAL)"
echo "======================================"
COMPLAINED_PAYLOAD='{
  "type": "email.complained",
  "data": {
    "id": "complained_001",
    "to": "complaint@example.com",
    "subject": "DocFlow Test Email - Complained",
    "created_at": "'$TIMESTAMP'"
  },
  "created_at": "'$TIMESTAMP'"
}'

COMPLAINED_SIG=$(generate_signature "$COMPLAINED_PAYLOAD")
echo "curl -X POST $WEBHOOK_URL \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'resend-signature: sha256=$COMPLAINED_SIG' \\"
echo "  -d '$COMPLAINED_PAYLOAD'"
echo ""

echo "👁️ TEST 4: OPENED EVENT"
echo "========================"
OPENED_PAYLOAD='{
  "type": "email.opened",
  "data": {
    "id": "opened_001",
    "to": "open@example.com",
    "subject": "DocFlow Test Email - Opened",
    "created_at": "'$TIMESTAMP'"
  },
  "created_at": "'$TIMESTAMP'"
}'

OPENED_SIG=$(generate_signature "$OPENED_PAYLOAD")
echo "curl -X POST $WEBHOOK_URL \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'resend-signature: sha256=$OPENED_SIG' \\"
echo "  -d '$OPENED_PAYLOAD'"
echo ""

echo "🖱️ TEST 5: CLICKED EVENT"
echo "========================"
CLICKED_PAYLOAD='{
  "type": "email.clicked",
  "data": {
    "id": "clicked_001",
    "to": "click@example.com",
    "subject": "DocFlow Test Email - Clicked",
    "url": "https://docflow.fi/dashboard",
    "created_at": "'$TIMESTAMP'"
  },
  "created_at": "'$TIMESTAMP'"
}'

CLICKED_SIG=$(generate_signature "$CLICKED_PAYLOAD")
echo "curl -X POST $WEBHOOK_URL \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'resend-signature: sha256=$CLICKED_SIG' \\"
echo "  -d '$CLICKED_PAYLOAD'"
echo ""

echo "🔒 TEST 6: INVALID SIGNATURE (Security Test)"
echo "============================================="
echo "curl -X POST $WEBHOOK_URL \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'resend-signature: sha256=invalid_signature' \\"
echo "  -d '$DELIVERED_PAYLOAD'"
echo ""
echo "Expected: 401 Unauthorized (signature validation working)"
echo ""

echo "📊 BULK TEST (All Events in Sequence)"
echo "====================================="
echo "# Run all tests in sequence to test webhook processing"
echo "./scripts/test_all_webhooks.sh"
echo ""

echo "✅ Webhook test commands generated!"
echo "🎯 Next steps:"
echo "1. Copy and run individual cURL commands"
echo "2. Check webhook delivery in Resend dashboard"
echo "3. Verify suppression list updates for bounced/complained"
echo "4. Monitor webhook processing logs"

# Save commands to file for easy use
cat > webhook_test_curl_commands.txt << 'EOF'
#!/bin/bash
# Generated webhook test commands - $(date)

# Test 1: Delivered Event
curl -X POST https://docflow.fi/api/resend/webhook \
  -H 'Content-Type: application/json' \
  -H 'resend-signature: sha256=GENERATED_SIGNATURE' \
  -d '{"type": "email.delivered", "data": {"id": "delivered_001", "to": "test@example.com", "subject": "Test"}}

# Test 2: Bounced Event  
curl -X POST https://docflow.fi/api/resend/webhook \
  -H 'Content-Type: application/json' \
  -H 'resend-signature: sha256=GENERATED_SIGNATURE' \
  -d '{"type": "email.bounced", "data": {"id": "bounced_001", "to": "bounce@example.com", "type": "hard"}}

# Test 3: Complained Event
curl -X POST https://docflow.fi/api/resend/webhook \
  -H 'Content-Type: application/json' \
  -H 'resend-signature: sha256=GENERATED_SIGNATURE' \
  -d '{"type": "email.complained", "data": {"id": "complained_001", "to": "complaint@example.com"}}

# Test 4: Invalid Signature (Security Test)
curl -X POST https://docflow.fi/api/resend/webhook \
  -H 'Content-Type: application/json' \
  -H 'resend-signature: sha256=invalid_signature' \
  -d '{"type": "email.delivered", "data": {"id": "security_test"}}

EOF

echo "💾 Commands saved to: webhook_test_curl_commands.txt"
chmod +x webhook_test_curl_commands.txt
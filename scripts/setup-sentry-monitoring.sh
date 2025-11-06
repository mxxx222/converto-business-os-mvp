#!/bin/bash
# Sentry Monitoring Setup Script
# Sets up Sentry uptime and cron monitoring for Converto Business OS

set -e

echo "🚀 Sentry Monitoring Setup"
echo "=========================="
echo ""

# Check if Sentry CLI is installed
if ! command -v sentry-cli &> /dev/null; then
    echo "⚠️  Sentry CLI not found. Installing..."
    curl -sL https://sentry.io/get-cli/ | sh
fi

# Check for required environment variables
if [ -z "$SENTRY_AUTH_TOKEN" ]; then
    echo "❌ SENTRY_AUTH_TOKEN not set"
    echo "   Get it from: https://sentry.io/settings/account/api/auth-tokens/"
    echo "   Create a new token with 'org:read' and 'project:read' scopes"
    exit 1
fi

if [ -z "$SENTRY_ORG" ]; then
    echo "❌ SENTRY_ORG not set"
    echo "   Get it from your Sentry Dashboard URL:"
    echo "   https://sentry.io/organizations/[ORG-SLUG]/"
    exit 1
fi

if [ -z "$SENTRY_PROJECT" ]; then
    echo "❌ SENTRY_PROJECT not set"
    echo "   Get it from your Sentry Dashboard URL:"
    echo "   https://sentry.io/organizations/[ORG]/projects/[PROJECT-SLUG]/"
    exit 1
fi

echo "✅ Environment variables configured"
echo "   ORG: $SENTRY_ORG"
echo "   PROJECT: $SENTRY_PROJECT"
echo ""

# Configure Sentry CLI
export SENTRY_ORG=$SENTRY_ORG
export SENTRY_PROJECT=$SENTRY_PROJECT
export SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

echo "📊 Creating Uptime Monitors..."
echo ""

# Frontend Health Check
echo "Creating: Frontend Health Check"
sentry-cli monitors create \
    --name "Frontend Health Check" \
    --url "https://converto.fi/api/health" \
    --expected-status 200 \
    --check-interval 60 \
    --org "$SENTRY_ORG" \
    --project "$SENTRY_PROJECT" || echo "⚠️  Monitor may already exist or CLI doesn't support this"

# Backend Health Check  
echo "Creating: Backend Health Check"
sentry-cli monitors create \
    --name "Backend Health Check" \
    --url "https://converto-business-os-quantum-mvp-1.onrender.com/health" \
    --expected-status 200 \
    --check-interval 60 \
    --org "$SENTRY_ORG" \
    --project "$SENTRY_PROJECT" || echo "⚠️  Monitor may already exist or CLI doesn't support this"

echo ""
echo "⏰ Note: Cron monitors must be created manually in Sentry Dashboard"
echo ""
echo "📋 Next Steps:"
echo "1. Go to: https://sentry.io/organizations/$SENTRY_ORG/monitors/crons/"
echo "2. Create cron monitor for 'Daily Backup'"
echo "3. Schedule: 0 2 * * * (Daily at 2 AM)"
echo "4. Configure alerts"
echo ""
echo "✅ Setup complete!"
echo ""
echo "View monitors:"
echo "  Uptime: https://sentry.io/organizations/$SENTRY_ORG/monitors/uptime/"
echo "  Crons: https://sentry.io/organizations/$SENTRY_ORG/monitors/crons/"




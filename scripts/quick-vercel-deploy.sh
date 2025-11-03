#!/bin/bash
# Quick Vercel Deploy - Yksinkertaisin tapa deployata
# Käyttö: ./scripts/quick-vercel-deploy.sh

set -e

echo "🚀 Quick Vercel Deploy"
echo ""

cd frontend

# Jos VERCEL_TOKEN on asetettu, käytä sitä
if [ -n "$VERCEL_TOKEN" ]; then
    vercel --prod --yes --token="$VERCEL_TOKEN"
else
    vercel --prod
fi

echo ""
echo "✅ Deployment valmis!"
echo "🌐 https://converto.fi"

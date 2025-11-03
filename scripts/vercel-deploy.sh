#!/bin/bash

# Vercel Deployment CLI Script
# Usage: ./scripts/vercel-deploy.sh [project_path] [--production|--preview]

set -e

VERCEL_TOKEN="${VERCEL_TOKEN:-8S7iyD9bnRzEDpb5kMoHSFvs}"
PROJECT_PATH="${1:-./frontend}"
DEPLOY_TYPE="${2:---prod}"

echo "🚀 Vercel Deployment Script"
echo "=========================="
echo "Project: $PROJECT_PATH"
echo "Type: $DEPLOY_TYPE"
echo ""

# Check if project path exists
if [ ! -d "$PROJECT_PATH" ]; then
  echo "❌ Error: Project path does not exist: $PROJECT_PATH"
  exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null && ! command -v npx &> /dev/null; then
  echo "❌ Error: Vercel CLI not found. Install with: npm i -g vercel"
  exit 1
fi

# Set Vercel token
export VERCEL_TOKEN="$VERCEL_TOKEN"

echo "📦 Building project..."
cd "$PROJECT_PATH"

# Run build first to catch errors early
if [ -f "package.json" ]; then
  npm run build || {
    echo "❌ Build failed. Fix errors before deploying."
    exit 1
  }
fi

echo ""
echo "🚀 Deploying to Vercel..."

# Deploy
if command -v vercel &> /dev/null; then
  vercel $DEPLOY_TYPE --yes
else
  npx vercel $DEPLOY_TYPE --yes
fi

echo ""
echo "✅ Deployment complete!"

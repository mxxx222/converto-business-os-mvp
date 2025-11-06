#!/bin/bash
# Notion Workspace Sync Setup Script

set -e

echo "🚀 Notion Workspace Sync Setup"
echo "================================"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

# Check dependencies
echo "📦 Installing Python dependencies..."
pip3 install requests --quiet || pip install requests --quiet

# Check environment variables
if [ -z "$NOTION_TOKEN" ] && [ -z "$NOTION_API_KEY" ]; then
    echo "⚠️  NOTION_TOKEN or NOTION_API_KEY not set"
    echo "💡 Set it with: export NOTION_TOKEN='your-token'"
fi

if [ -z "$NOTION_WORKSPACE_PAGE_ID" ]; then
    echo "⚠️  NOTION_WORKSPACE_PAGE_ID not set"
    echo "💡 Create a page in Notion and use its ID as workspace"
    echo "   The page ID is in the URL: https://notion.so/YourPage#page_id_here"
fi

# Make script executable
chmod +x scripts/notion-workspace-sync.py

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set NOTION_TOKEN environment variable"
echo "2. Create a Notion page and set NOTION_WORKSPACE_PAGE_ID"
echo "3. Run: python3 scripts/notion-workspace-sync.py"
echo ""
echo "📚 Full guide: docs/NOTION_WORKSPACE_SYNC_GUIDE.md"



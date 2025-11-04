#!/bin/bash
# 🔧 Fix Codeium SidebarProvider - Complete Reset

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔧 Codeium SidebarProvider Fix${NC}\n"

# Step 1: Uninstall
echo -e "${BLUE}📦 Step 1: Uninstalling Codeium...${NC}"
cursor --uninstall-extension kilocode.kilo-code 2>/dev/null || echo "Not installed or already removed"
echo -e "${GREEN}✅ Uninstalled${NC}\n"

# Step 2: Clear all caches
echo -e "${BLUE}🧹 Step 2: Clearing caches...${NC}"
rm -rf ~/.cursor/codeium 2>/dev/null || true
rm -rf ~/.cursor/extensions/kilocode.kilo-code-* 2>/dev/null || true
rm -rf ~/.cursor/User/globalStorage/kilocode.kilo-code 2>/dev/null || true
rm -rf ~/.cursor/User/workspaceStorage/*/kilocode.kilo-code 2>/dev/null || true
echo -e "${GREEN}✅ Caches cleared${NC}\n"

# Step 3: Reinstall
echo -e "${BLUE}📥 Step 3: Reinstalling Codeium...${NC}"
cursor --install-extension kilocode.kilo-code
echo -e "${GREEN}✅ Reinstalled${NC}\n"

# Step 4: Update settings
echo -e "${BLUE}⚙️  Step 4: Configuring settings...${NC}"
SETTINGS_FILE="$HOME/.cursor/User/settings.json"

# Create settings if doesn't exist
if [ ! -f "$SETTINGS_FILE" ]; then
    mkdir -p "$(dirname "$SETTINGS_FILE")"
    echo "{}" > "$SETTINGS_FILE"
fi

# Update settings with jq if available
if command -v jq &> /dev/null; then
    jq '. + {
        "codeium.enableSidebar": true,
        "codeium.enableChat": true,
        "codeium.enableInlineCompletion": true,
        "codeium.enableCodebaseIndexing": true,
        "codeium.autoAccept": false,
        "codeium.autoImport": true,
        "codeium.maxSuggestions": 10
    }' "$SETTINGS_FILE" > "${SETTINGS_FILE}.tmp"
    mv "${SETTINGS_FILE}.tmp" "$SETTINGS_FILE"
    echo -e "${GREEN}✅ Settings updated${NC}\n"
else
    echo -e "${YELLOW}⚠️  jq not available. Manual update needed:${NC}"
    echo -e "Add to $SETTINGS_FILE:"
    echo -e '  "codeium.enableSidebar": true,'
    echo -e '  "codeium.enableChat": true,'
    echo -e '  "codeium.enableInlineCompletion": true'
    echo ""
fi

# Step 5: Instructions
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Fix Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "1. ${YELLOW}Restart Cursor completely${NC} (Quit: Cmd+Q, then reopen)"
echo -e "2. Open Command Palette: ${YELLOW}Cmd+Shift+P${NC}"
echo -e "3. Type: ${YELLOW}Codeium: Open Chat${NC} or ${YELLOW}Codeium: Open Sidebar${NC}"
echo -e "4. Or go to: ${YELLOW}View → Codeium Chat${NC}\n"
echo -e "${BLUE}🔑 API Key:${NC}"
echo -e "If prompted, set API key:"
echo -e "  ${YELLOW}Cmd+Shift+P${NC} → ${YELLOW}Codeium: Set API Key${NC}"
echo -e "  Or get from: https://app.kilocode.ai/settings/api-keys\n"

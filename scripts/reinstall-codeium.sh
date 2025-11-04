#!/bin/bash
# 🔧 Codeium/Kilo Code Complete Reinstall Script
# Poistaa, asentaa ja konfiguroi Codeium extension uudelleen

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔧 Codeium/Kilo Code Complete Reinstall${NC}\n"

# Detect editor
if command -v cursor &> /dev/null; then
    EDITOR="cursor"
    EDITOR_NAME="Cursor"
elif command -v code &> /dev/null; then
    EDITOR="code"
    EDITOR_NAME="VS Code"
else
    echo -e "${RED}❌ VS Code or Cursor CLI not found${NC}"
    echo -e "Please install VS Code or Cursor CLI first"
    exit 1
fi

echo -e "${GREEN}✅ Found: ${EDITOR_NAME}${NC}\n"

# Step 1: Uninstall existing Codeium extension
echo -e "${BLUE}📦 Step 1: Removing existing Codeium extension...${NC}"
# Try different possible extension IDs
$EDITOR --uninstall-extension kilocode.kilo-code 2>/dev/null || \
$EDITOR --uninstall-extension Codeium.codeium 2>/dev/null || \
$EDITOR --uninstall-extension codeium.codeium 2>/dev/null || \
echo "Extension not found with standard IDs, checking for Kilo Code..."
echo -e "${GREEN}✅ Extension removal attempted${NC}\n"

# Step 2: Clear cache
echo -e "${BLUE}🧹 Step 2: Clearing Codeium cache...${NC}"
if [ -d "$HOME/.cursor/codeium" ]; then
    rm -rf "$HOME/.cursor/codeium"
    echo -e "${GREEN}✅ Cursor Codeium cache cleared${NC}"
fi
if [ -d "$HOME/.vscode/extensions/codeium.codeium-*" ]; then
    rm -rf "$HOME/.vscode/extensions/codeium.codeium-"*
    echo -e "${GREEN}✅ VS Code Codeium cache cleared${NC}"
fi
echo ""

# Step 3: Install latest Codeium extension
echo -e "${BLUE}📥 Step 3: Installing latest Codeium extension...${NC}"
echo -e "${YELLOW}⚠️  Installing Codeium from marketplace...${NC}"
echo -e "${YELLOW}If this fails, install manually:${NC}"
echo -e "   1. Open ${EDITOR_NAME}"
echo -e "   2. Go to Extensions (Cmd+Shift+X / Ctrl+Shift+X)"
echo -e "   3. Search: 'Codeium'"
echo -e "   4. Install: 'Codeium - AI Coding Autocomplete'"
echo ""

# Try to install - if fails, provide manual instructions
if $EDITOR --install-extension kilocode.kilo-code 2>/dev/null || \
   $EDITOR --install-extension Codeium.codeium 2>/dev/null || \
   $EDITOR --install-extension codeium.codeium 2>/dev/null; then
    echo -e "${GREEN}✅ Codeium extension installed${NC}\n"
else
    echo -e "${YELLOW}⚠️  Auto-install failed. Please install manually from marketplace.${NC}\n"
    echo -e "${YELLOW}Extension ID: kilocode.kilo-code${NC}\n"
fi

# Step 4: Get API key
echo -e "${YELLOW}🔑 Step 4: API Key Configuration${NC}"
echo -e "To get your Codeium API key:"
echo -e "1. Go to: https://app.kilocode.ai/users/sign_in"
echo -e "2. Login with Google/GitHub/GitLab/LinkedIn"
echo -e "3. Navigate to: Settings → API Keys"
echo -e "4. Copy your API key"
echo ""
read -p "Paste your Codeium API key here (or press Enter to skip): " API_KEY

if [ -n "$API_KEY" ]; then
    # Update settings
    SETTINGS_FILE=""
    if [ "$EDITOR" = "cursor" ]; then
        SETTINGS_FILE="$HOME/.cursor/User/settings.json"
    else
        SETTINGS_FILE="$HOME/.config/Code/User/settings.json"
    fi

    if [ -f "$SETTINGS_FILE" ]; then
        # Backup
        cp "$SETTINGS_FILE" "${SETTINGS_FILE}.backup.$(date +%Y%m%d_%H%M%S)"

        # Update settings (using jq if available, otherwise manual)
        if command -v jq &> /dev/null; then
            jq ".codeium.apiKey = \"$API_KEY\" | .codeium.enableSidebar = true | .codeium.enableChat = true" "$SETTINGS_FILE" > "${SETTINGS_FILE}.tmp"
            mv "${SETTINGS_FILE}.tmp" "$SETTINGS_FILE"
            echo -e "${GREEN}✅ Settings updated with jq${NC}"
        else
            echo -e "${YELLOW}⚠️  jq not available. Manual update needed:${NC}"
            echo -e "Add to $SETTINGS_FILE:"
            echo -e "  \"codeium.apiKey\": \"$API_KEY\","
            echo -e "  \"codeium.enableSidebar\": true,"
            echo -e "  \"codeium.enableChat\": true"
        fi
    else
        # Create settings file
        mkdir -p "$(dirname "$SETTINGS_FILE")"
        cat > "$SETTINGS_FILE" <<EOF
{
  "codeium": {
    "apiKey": "$API_KEY",
    "enableSidebar": true,
    "enableChat": true,
    "enableInlineCompletion": true,
    "enableCodebaseIndexing": true
  }
}
EOF
        echo -e "${GREEN}✅ Settings file created${NC}"
    fi

    # Set environment variable
    export KILO_CODE_API_KEY="$API_KEY"
    echo -e "${GREEN}✅ Environment variable set${NC}"
else
    echo -e "${YELLOW}⚠️  API key skipped. You can set it later in settings.${NC}"
fi

# Step 5: Verify installation
echo -e "\n${BLUE}🔍 Step 5: Verifying installation...${NC}"
if $EDITOR --list-extensions | grep -i codeium; then
    echo -e "${GREEN}✅ Codeium extension is installed${NC}"
else
    echo -e "${RED}❌ Codeium extension not found${NC}"
fi

# Step 6: Instructions
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Reinstall Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "1. ${YELLOW}Restart ${EDITOR_NAME}${NC} (close completely and reopen)"
echo -e "2. Open Command Palette: ${YELLOW}Cmd+Shift+P${NC} (Mac) or ${YELLOW}Ctrl+Shift+P${NC} (Windows/Linux)"
echo -e "3. Type: ${YELLOW}Codeium: Open Chat${NC} or ${YELLOW}Codeium: Open Sidebar${NC}"
echo -e "4. Check View menu: ${YELLOW}View → Codeium Chat${NC}\n"

if [ -n "$API_KEY" ]; then
    echo -e "${GREEN}✅ API key configured${NC}"
else
    echo -e "${YELLOW}⚠️  Remember to set API key in settings:${NC}"
    echo -e "   ${EDITOR_NAME} → Settings → Search 'codeium' → Set API Key"
fi

echo -e "\n${BLUE}🔗 Useful Links:${NC}"
echo -e "   Dashboard: https://app.kilocode.ai"
echo -e "   API Keys: https://app.kilocode.ai/settings/api-keys"
echo -e "   Docs: https://kilocode.ai/docs\n"

#!/bin/bash

# Test MCP & CLI Deployment
# Comprehensive test suite for MCP servers and CLI tools

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

test_pass() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    ((TESTS_PASSED++))
}

test_fail() {
    echo -e "${RED}❌ FAIL:${NC} $1"
    ((TESTS_FAILED++))
}

test_skip() {
    echo -e "${YELLOW}⏭  SKIP:${NC} $1"
    ((TESTS_SKIPPED++))
}

# Test 1: Check Node.js version
test_node_version() {
    print_header "Test 1: Node.js Version"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            test_pass "Node.js version $(node -v) >= 18"
        else
            test_fail "Node.js version $(node -v) < 18"
        fi
    else
        test_fail "Node.js not found"
    fi
}

# Test 2: Check MCP server files
test_mcp_files() {
    print_header "Test 2: MCP Server Files"
    
    MCP_FILES=(
        "mcp_auto_deploy_server.js"
        "mcp_render_server.js"
        "mcp_github_server.js"
        "mcp_vercel_server.js"
        "mcp_resend_server.js"
        "mcp_notion_server.js"
        "mcp_openai_server.js"
    )
    
    for file in "${MCP_FILES[@]}"; do
        if [ -f "$PROJECT_ROOT/$file" ]; then
            test_pass "Found $file"
        else
            test_fail "Missing $file"
        fi
    done
}

# Test 3: Check environment variables
test_env_vars() {
    print_header "Test 3: Environment Variables"
    
    ENV_VARS=(
        "RENDER_API_KEY"
        "GITHUB_TOKEN"
        "VERCEL_TOKEN"
        "RESEND_API_KEY"
    )
    
    for var in "${ENV_VARS[@]}"; do
        if [ -n "${!var}" ]; then
            test_pass "$var is set"
        else
            test_skip "$var not set (optional)"
        fi
    done
}

# Test 4: MCP Health Check
test_mcp_health() {
    print_header "Test 4: MCP Health Check"
    
    if [ -f "$PROJECT_ROOT/scripts/mcp-health-check.js" ]; then
        if node "$PROJECT_ROOT/scripts/mcp-health-check.js" > /dev/null 2>&1; then
            test_pass "MCP health check passed"
        else
            test_fail "MCP health check failed"
        fi
    else
        test_fail "mcp-health-check.js not found"
    fi
}

# Test 5: CLI Installation
test_cli_install() {
    print_header "Test 5: CLI Installation"
    
    if [ -f "$PROJECT_ROOT/cli/package.json" ]; then
        test_pass "CLI package.json exists"
    else
        test_fail "CLI package.json missing"
    fi
    
    if [ -f "$PROJECT_ROOT/cli/docflow-deploy" ]; then
        test_pass "docflow-deploy script exists"
    else
        test_fail "docflow-deploy script missing"
    fi
    
    if [ -x "$PROJECT_ROOT/cli/docflow-deploy" ]; then
        test_pass "docflow-deploy is executable"
    else
        test_fail "docflow-deploy not executable"
    fi
}

# Test 6: CLI Command Availability
test_cli_command() {
    print_header "Test 6: CLI Command Availability"
    
    if command -v docflow-deploy &> /dev/null; then
        test_pass "docflow-deploy command available"
        
        # Test version
        if docflow-deploy --version &> /dev/null; then
            test_pass "docflow-deploy --version works"
        else
            test_fail "docflow-deploy --version failed"
        fi
    else
        test_skip "docflow-deploy not installed globally (run: cd cli && npm link)"
    fi
}

# Test 7: MCP Server Syntax
test_mcp_syntax() {
    print_header "Test 7: MCP Server Syntax Check"
    
    MCP_FILES=(
        "mcp_auto_deploy_server.js"
        "mcp_render_server.js"
        "mcp_github_server.js"
    )
    
    for file in "${MCP_FILES[@]}"; do
        if node --check "$PROJECT_ROOT/$file" 2>/dev/null; then
            test_pass "$file syntax valid"
        else
            test_fail "$file syntax error"
        fi
    done
}

# Test 8: Documentation
test_documentation() {
    print_header "Test 8: Documentation"
    
    DOCS=(
        "MCP_DEPLOYMENT_GUIDE.md"
        "MCP_CLI_QUICKSTART.md"
        "AUTO_DEPLOY_MCP_GUIDE.md"
    )
    
    for doc in "${DOCS[@]}"; do
        if [ -f "$PROJECT_ROOT/$doc" ]; then
            test_pass "Found $doc"
        else
            test_fail "Missing $doc"
        fi
    done
}

# Test 9: Package Dependencies
test_dependencies() {
    print_header "Test 9: Package Dependencies"
    
    if [ -f "$PROJECT_ROOT/cli/package.json" ]; then
        cd "$PROJECT_ROOT/cli"
        
        # Check if node_modules exists
        if [ -d "node_modules" ]; then
            test_pass "CLI dependencies installed"
        else
            test_skip "CLI dependencies not installed (run: npm install)"
        fi
        
        cd "$PROJECT_ROOT"
    fi
}

# Test 10: API Connectivity (optional)
test_api_connectivity() {
    print_header "Test 10: API Connectivity (Optional)"
    
    # Test Render API
    if [ -n "$RENDER_API_KEY" ]; then
        if curl -s -f -H "Authorization: Bearer $RENDER_API_KEY" \
            https://api.render.com/v1/services > /dev/null 2>&1; then
            test_pass "Render API connection successful"
        else
            test_fail "Render API connection failed"
        fi
    else
        test_skip "RENDER_API_KEY not set"
    fi
    
    # Test GitHub API
    if [ -n "$GITHUB_TOKEN" ]; then
        if curl -s -f -H "Authorization: token $GITHUB_TOKEN" \
            https://api.github.com/user > /dev/null 2>&1; then
            test_pass "GitHub API connection successful"
        else
            test_fail "GitHub API connection failed"
        fi
    else
        test_skip "GITHUB_TOKEN not set"
    fi
}

# Run all tests
main() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║         DocFlow MCP & CLI Deployment Tests              ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
    
    test_node_version
    test_mcp_files
    test_env_vars
    test_mcp_health
    test_cli_install
    test_cli_command
    test_mcp_syntax
    test_documentation
    test_dependencies
    test_api_connectivity
    
    # Summary
    print_header "Test Summary"
    
    TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))
    
    echo -e "${GREEN}✅ Passed:  $TESTS_PASSED${NC}"
    echo -e "${RED}❌ Failed:  $TESTS_FAILED${NC}"
    echo -e "${YELLOW}⏭  Skipped: $TESTS_SKIPPED${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Total:     $TOTAL_TESTS tests"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 All critical tests passed!${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Install CLI globally: cd cli && npm link"
        echo "  2. Configure Cursor MCP servers"
        echo "  3. Test deployment: docflow-deploy status"
        echo ""
        exit 0
    else
        echo -e "${RED}❌ Some tests failed. Please fix the issues above.${NC}"
        echo ""
        exit 1
    fi
}

# Run tests
main


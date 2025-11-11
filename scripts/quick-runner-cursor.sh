#!/bin/bash
# DocFlow Quick Runner Commands
# Ready-to-use commands for Cursor setup validation and minipatch testing

echo "🚀 DocFlow Quick Runner Commands"
echo "================================"

# Quick validation
echo -e "\n🔍 Running quick validation..."
./scripts/validate-cursor-setup.sh

echo -e "\n🧪 Testing individual minipatches..."

# Test 1: RBAC Validation
echo -e "\n1. Testing RBAC (admin/support/readonly + 401/403)..."
if grep -q "AdminRole = 'admin' | 'support' | 'readonly'" frontend/lib/adminAuth.ts; then
    echo "✅ RBAC roles defined correctly"
else
    echo "❌ RBAC roles need attention"
fi

# Test 2: Rate Limiting
echo -e "\n2. Testing 429 Retry-After + X-RateLimit headers..."
if grep -q "Retry-After" frontend/lib/ratelimit.ts && grep -q "X-RateLimit" frontend/lib/ratelimit.ts; then
    echo "✅ Rate limiting headers implemented"
else
    echo "❌ Rate limiting headers missing"
fi

# Test 3: WebSocket Backpressure
echo -e "\n3. Testing WS backpressure guard (4000 close code)..."
if grep -q "ws.close(4000, 'backpressure')" frontend/lib/admin/hooks/useTenantFeed.ts; then
    echo "✅ WebSocket backpressure guard active"
else
    echo "❌ WebSocket backpressure guard missing"
fi

# Test 4: Export Defaults
echo -e "\n4. Testing CSV/PDF export defaults (fi-FI + Europe/Helsinki)..."
if grep -q "fi-FI" frontend/lib/export.ts && grep -q "Europe/Helsinki" frontend/lib/export.ts; then
    echo "✅ Export locale/timezone defaults set"
else
    echo "❌ Export locale/timezone defaults missing"
fi

echo -e "\n🔧 Available Commands:"
echo "======================"
echo "• ./scripts/validate-cursor-setup.sh  # Full validation"
echo "• npm run typecheck --prefix frontend  # Type checking"
echo "• npm run build --prefix frontend      # Build test"
echo "• python scripts/export_openapi.py --out docs/openapi.yaml  # API docs"
echo "• npx playwright test --prefix frontend  # E2E tests"

echo -e "\n📋 CI Pipeline Commands:"
echo "========================"
echo "• npm ci --prefix frontend && pip install -r requirements.txt"
echo "• npm --prefix frontend run typecheck && npm --prefix frontend run build"
echo "• python scripts/export_openapi.py --out docs/openapi.yaml && npm run openapi:lint --prefix frontend"
echo "• npx -y @stoplight/prism-cli mock docs/openapi.yaml & npx -y dredd docs/openapi.yaml http://127.0.0.1:4010"
echo "• npx --yes playwright test frontend/e2e"

echo -e "\n🎯 Next Steps:"
echo "=============="
echo "1. Copy .cursorrules to your Cursor project root"
echo "2. Review cursor-user-rules.md for High-ROI settings"
echo "3. Apply the minipatches to your existing codebase"
echo "4. Run validation: ./scripts/validate-cursor-setup.sh"
echo "5. Test CI pipeline locally before pushing"

echo -e "\n✅ DocFlow Cursor Setup Ready!"
#!/bin/bash

# Validate Cursor Setup & Minipatches
# Checks that all required files and configurations are in place

set -e

echo "🔍 Validating Cursor Setup & Minipatches..."
echo ""

ERRORS=0
WARNINGS=0

# Check configuration files
echo "📋 Checking configuration files..."

if [ -f ".cursorrules" ]; then
  echo "  ✅ .cursorrules exists"
else
  echo "  ❌ .cursorrules missing"
  ERRORS=$((ERRORS + 1))
fi

if [ -f "cursor-user-rules.md" ]; then
  echo "  ✅ cursor-user-rules.md exists"
else
  echo "  ❌ cursor-user-rules.md missing"
  ERRORS=$((ERRORS + 1))
fi

if [ -f ".github/workflows/ci.yml" ]; then
  echo "  ✅ .github/workflows/ci.yml exists"
else
  echo "  ❌ .github/workflows/ci.yml missing"
  ERRORS=$((ERRORS + 1))
fi

echo ""

# Check frontend lib files
echo "📦 Checking frontend library files..."

if [ -f "frontend/lib/adminAuth.ts" ]; then
  echo "  ✅ frontend/lib/adminAuth.ts exists"
  # Check for RBAC functions
  if grep -q "requireAdminAuth" frontend/lib/adminAuth.ts; then
    echo "    ✅ RBAC functions present"
  else
    echo "    ⚠️  RBAC functions missing"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "  ❌ frontend/lib/adminAuth.ts missing"
  ERRORS=$((ERRORS + 1))
fi

if [ -f "frontend/lib/ratelimit.ts" ]; then
  echo "  ✅ frontend/lib/ratelimit.ts exists"
  # Check for rate limit functions
  if grep -q "checkRateLimit" frontend/lib/ratelimit.ts && grep -q "Retry-After" frontend/lib/ratelimit.ts; then
    echo "    ✅ Rate limiting functions present"
  else
    echo "    ⚠️  Rate limiting functions incomplete"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "  ❌ frontend/lib/ratelimit.ts missing"
  ERRORS=$((ERRORS + 1))
fi

if [ -f "frontend/lib/export.ts" ]; then
  echo "  ✅ frontend/lib/export.ts exists"
  # Check for export functions
  if grep -q "exportToCSV" frontend/lib/export.ts && grep -q "exportToPDF" frontend/lib/export.ts; then
    echo "    ✅ Export functions present"
  else
    echo "    ⚠️  Export functions incomplete"
    WARNINGS=$((WARNINGS + 1))
  fi
  # Check for Finnish locale
  if grep -q "fi-FI" frontend/lib/export.ts && grep -q "Europe/Helsinki" frontend/lib/export.ts; then
    echo "    ✅ Finnish locale configured"
  else
    echo "    ⚠️  Finnish locale not configured"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "  ❌ frontend/lib/export.ts missing"
  ERRORS=$((ERRORS + 1))
fi

echo ""

# Check dashboard files
echo "📊 Checking dashboard files..."

if [ -f "frontend/app/admin/dashboard/types.ts" ]; then
  echo "  ✅ frontend/app/admin/dashboard/types.ts exists"
else
  echo "  ❌ frontend/app/admin/dashboard/types.ts missing"
  ERRORS=$((ERRORS + 1))
fi

if [ -f "frontend/app/admin/dashboard/activityHelpers.ts" ]; then
  echo "  ✅ frontend/app/admin/dashboard/activityHelpers.ts exists"
else
  echo "  ❌ frontend/app/admin/dashboard/activityHelpers.ts missing"
  ERRORS=$((ERRORS + 1))
fi

if [ -f "frontend/app/admin/dashboard/styles.module.css" ]; then
  echo "  ✅ frontend/app/admin/dashboard/styles.module.css exists"
else
  echo "  ❌ frontend/app/admin/dashboard/styles.module.css missing"
  ERRORS=$((ERRORS + 1))
fi

echo ""

# Check backend files
echo "🔧 Checking backend files..."

if [ -f "shared_core/modules/admin/router_production.py" ]; then
  echo "  ✅ shared_core/modules/admin/router_production.py exists"
  # Check for endpoints (router has prefix="/api/admin", so endpoints are "/activities" and "/feed")
  if grep -q "@router.get.*activities" shared_core/modules/admin/router_production.py && grep -q "@router.websocket.*feed" shared_core/modules/admin/router_production.py; then
    echo "    ✅ Admin endpoints present"
  else
    echo "    ⚠️  Admin endpoints incomplete"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "  ❌ shared_core/modules/admin/router_production.py missing"
  ERRORS=$((ERRORS + 1))
fi

echo ""

# Check WebSocket resilience
echo "🔌 Checking WebSocket resilience..."

if [ -f "frontend/lib/admin/hooks/useTenantFeed.ts" ]; then
  if grep -q "bufferedAmount" frontend/lib/admin/hooks/useTenantFeed.ts && grep -q "4000" frontend/lib/admin/hooks/useTenantFeed.ts; then
    echo "  ✅ WebSocket backpressure guard present"
  else
    echo "  ⚠️  WebSocket backpressure guard missing"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "  ⚠️  useTenantFeed.ts not found (may be optional)"
  WARNINGS=$((WARNINGS + 1))
fi

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ All checks passed! Setup is complete."
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo "⚠️  Validation passed with $WARNINGS warning(s)"
  exit 0
else
  echo "❌ Validation failed with $ERRORS error(s) and $WARNINGS warning(s)"
  exit 1
fi


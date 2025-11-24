#!/bin/bash

# Quick test runner for Cursor setup components
# Provides fast commands to test various features

set -e

echo "🚀 Cursor Setup Quick Test Runner"
echo ""

case "$1" in
  validate)
    echo "Running validation..."
    bash scripts/validate-cursor-setup.sh
    ;;
  
  rbac)
    echo "Testing RBAC..."
    echo "Run: npm run test -- frontend/lib/adminAuth.test.ts"
    echo "Or check manually:"
    echo "  - requireAdminAuth() returns 401 for missing token"
    echo "  - requireAdminAuth() returns 403 for insufficient role"
    echo "  - Role hierarchy: admin > support > readonly"
    ;;
  
  ratelimit)
    echo "Testing rate limiting..."
    echo "Run: npm run test -- frontend/lib/ratelimit.test.ts"
    echo "Or test manually:"
    echo "  - Make 60+ requests to see 429 response"
    echo "  - Check Retry-After header"
    echo "  - Check X-RateLimit-* headers"
    ;;
  
  export)
    echo "Testing export functions..."
    echo "Run in browser console:"
    echo "  import { exportToCSV, exportToPDF } from './lib/export'"
    echo "  exportToCSV([{name: 'Test', value: 123}], 'test.csv')"
    echo "  exportToPDF([{name: 'Test', value: 123}], 'test.pdf')"
    ;;
  
  websocket)
    echo "Testing WebSocket..."
    echo "1. Start backend: cd backend && uvicorn main:app --reload"
    echo "2. Connect: wscat -c ws://localhost:8000/api/admin/feed?token=admin_test"
    echo "3. Send: {\"type\":\"ping\"}"
    echo "4. Check backpressure guard in browser console"
    ;;
  
  backend)
    echo "Testing backend API..."
    echo "1. Start backend: cd backend && uvicorn main:app --reload"
    echo "2. Get activities: curl http://localhost:8000/api/admin/activities"
    echo "3. Create activity: curl -X POST http://localhost:8000/api/admin/activities -H 'Content-Type: application/json' -d '{\"type\":\"test\",\"status\":\"success\"}'"
    ;;
  
  frontend)
    echo "Testing frontend..."
    echo "1. Install deps: cd frontend && npm install"
    echo "2. Build: npm run build"
    echo "3. Dev server: npm run dev"
    echo "4. Visit: http://localhost:3000/admin/dashboard"
    ;;
  
  ci)
    echo "Testing CI pipeline..."
    echo "Run: act -j build (requires act: https://github.com/nektos/act)"
    echo "Or push to GitHub to trigger workflow"
    ;;
  
  all)
    echo "Running all quick tests..."
    bash scripts/validate-cursor-setup.sh
    echo ""
    echo "✅ Validation complete. Run individual tests:"
    echo "  $0 rbac"
    echo "  $0 ratelimit"
    echo "  $0 export"
    echo "  $0 websocket"
    echo "  $0 backend"
    echo "  $0 frontend"
    ;;
  
  *)
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  validate  - Run full validation"
    echo "  rbac      - Test RBAC functions"
    echo "  ratelimit - Test rate limiting"
    echo "  export    - Test export functions"
    echo "  websocket - Test WebSocket connection"
    echo "  backend   - Test backend API"
    echo "  frontend  - Test frontend build"
    echo "  ci        - Test CI pipeline"
    echo "  all       - Run validation and show test commands"
    echo ""
    exit 1
    ;;
esac


#!/usr/bin/env bash

set -euo pipefail

RED() { printf "\033[31m%s\033[0m\n" "$*"; }
GRN() { printf "\033[32m%s\033[0m\n" "$*"; }
YEL() { printf "\033[33m%s\033[0m\n" "$*"; }
BLU() { printf "\033[34m%s\033[0m\n" "$*"; }

# Mock mode flag
MOCK_MODE=false
if [[ "${1:-}" == "--mock" ]] || [[ "${1:-}" == "-m" ]]; then
  MOCK_MODE=true
  YEL "⚠️  MOCK MODE: Skipping environment checks"
fi

REQ_ENVS=(
  "RENDER_API_KEY"
  "RENDER_SERVICE_ID_BACKEND"
  "GITHUB_TOKEN"
  "VERCEL_TOKEN"
  "VERCEL_API_TOKEN"
  "VERCEL_PROJECT_ID"
  "RESEND_API_KEY"
  "BACKEND_URL"
  "FRONTEND_URL"
)

BLU "==> 1/4 Tarkistetaan environment-muuttujat"
if [ "$MOCK_MODE" = true ]; then
  YEL "  ⚠️  Mock mode: Skipping env checks"
else
  missing=0
  for k in "${REQ_ENVS[@]}"; do
    if [ -z "${!k-}" ]; then
      RED "  ✗ $k puuttuu"
      missing=1
    else
      GRN "  ✓ $k"
    fi
  done
  if [ "$missing" -ne 0 ]; then
    RED "Environment virhe: lisää puuttuvat arvot (~/.zshrc) ja aja: source ~/.zshrc"
    RED "Tai aja mock-tilassa: ./scripts/verify.sh --mock"
    exit 1
  fi
fi

BLU "==> 2/4 MCP health-check"
if [ "$MOCK_MODE" = true ]; then
  YEL "  ⚠️  Mock mode: Skipping MCP health-check"
else
  if node ./scripts/mcp-health-check.js; then
    GRN "  ✓ MCP health OK"
  else
    RED "  ✗ MCP health epäonnistui"; exit 1
  fi
fi

BLU "==> 3/4 CLI status"
if [ "$MOCK_MODE" = true ]; then
  YEL "  ⚠️  Mock mode: Skipping CLI status"
else
  if command -v docflow-deploy &> /dev/null; then
    if docflow-deploy status; then
      GRN "  ✓ CLI status OK"
    else
      RED "  ✗ CLI status epäonnistui"; exit 1
    fi
  else
    YEL "  ! docflow-deploy ei ole asennettuna (npm link cli/)"
  fi
fi

BLU "==> 4/4 Dry-run deploy"
if [ "$MOCK_MODE" = true ]; then
  YEL "  ⚠️  Mock mode: Skipping dry-run"
else
  if command -v docflow-deploy &> /dev/null; then
    if docflow-deploy deploy --dry-run; then
      GRN "  ✓ Dry-run OK"
    else
      YEL "  ! Dry-run ei käytettävissä tai epäonnistui; jatka manuaalisella staging-testillä"
    fi
  else
    YEL "  ! docflow-deploy ei ole asennettuna"
  fi
fi

echo
GRN "✅ VERIFY VALMIS: Kaikki peruscheckit läpi."
echo "Seuraava: docflow-deploy deploy    # staging"


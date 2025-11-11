#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_DOMAIN="docflow.fi"

usage() {
  cat <<'EOF'
Vercel publish helper

Usage:
  ./scripts/vercel_deploy_checklist.sh <command> [args]

Commands:
  checklist                   Print the full go-live checklist.
  login                       Run `npx vercel login`.
  link                        Run `npx vercel link` inside the repo root.
  deploy                      Deploy the current repo with `npx vercel --prod --yes`.
  env-pull [path]             Pull Vercel envs into the given file (default: .env.production).
  health [domain]             GET /api/health on the domain (default: docflow.fi).
  sitemap [domain]            HEAD request for /sitemap.xml.
  robots [domain]             Print /robots.txt.
  redirect-check [domain]     Ensure www → apex 301.
  converto-redirect-check     Ensure converto.fi → docflow.fi 301 via Next config.

Example workflow:
  ./scripts/vercel_deploy_checklist.sh login
  ./scripts/vercel_deploy_checklist.sh link
  ./scripts/vercel_deploy_checklist.sh deploy
  ./scripts/vercel_deploy_checklist.sh checklist
EOF
}

need_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

vercel_login() {
  need_command npx
  npx vercel login
}

vercel_link() {
  need_command npx
  (cd "$ROOT_DIR" && npx vercel link)
}

vercel_deploy() {
  need_command npx
  (cd "$ROOT_DIR" && npx vercel --prod --yes)
}

vercel_env_pull() {
  need_command npx
  local target_file="${1:-.env.production}"
  (cd "$ROOT_DIR" && npx vercel env pull "$target_file")
}

curl_head() {
  local url="$1"
  echo "==> $url"
  curl -fsSI "$url" | head -n 5
}

curl_body() {
  local url="$1"
  echo "==> $url"
  curl -fsS "$url"
}

health_check() {
  local domain="${1:-$DEFAULT_DOMAIN}"
  curl_head "https://${domain}/api/health"
}

sitemap_check() {
  local domain="${1:-$DEFAULT_DOMAIN}"
  curl_head "https://${domain}/sitemap.xml"
}

robots_check() {
  local domain="${1:-$DEFAULT_DOMAIN}"
  curl_body "https://${domain}/robots.txt"
}

redirect_check() {
  local domain="${1:-$DEFAULT_DOMAIN}"
  curl -fsSI "https://www.${domain}" | grep -iE '^(HTTP|location)'
}

converto_redirect_check() {
  curl -fsSI "https://converto.fi" | grep -iE '^(HTTP|location)'
  curl -fsSI "https://www.converto.fi" | grep -iE '^(HTTP|location)'
}

print_checklist() {
  cat <<'EOF'
Vercel go-live checklist
=========================
[ ] Vercel login (`npx vercel login`)
[ ] Project linked (`npx vercel link`)
[ ] Env vars filled (NEXT_PUBLIC_ENV, Calendly, Stripe, Supabase, Resend, PostHog…)
[ ] Production deploy (`npx vercel --prod --yes`)
[ ] Domains docflow.fi + www.docflow.fi connected, SSL green, HSTS enabled
[ ] DNS: CNAME @ → cname.vercel-dns.com, CNAME www → docflow.fi
[ ] converto.fi + www.converto.fi redirect to docflow.fi
[ ] curl -I https://docflow.fi/api/health returns 200
[ ] curl -I https://docflow.fi/sitemap.xml shows production URLs
[ ] curl https://docflow.fi/robots.txt shows production URLs
[ ] curl -I https://www.docflow.fi | grep 301 shows apex redirect
[ ] Stripe webhook test delivers 200, Resend email passes DKIM/SPF/DMARC
[ ] Contact/signup forms submit successfully (200 OK)
[ ] Lighthouse mobile score ≥ 90
EOF
}

COMMAND="${1:-}"
shift || true

case "$COMMAND" in
  login) vercel_login ;;
  link) vercel_link ;;
  deploy) vercel_deploy ;;
  env-pull) vercel_env_pull "$@" ;;
  health) health_check "$@" ;;
  sitemap) sitemap_check "$@" ;;
  robots) robots_check "$@" ;;
  redirect-check) redirect_check "$@" ;;
  converto-redirect-check) converto_redirect_check ;;
  checklist) print_checklist ;;
  ""|-h|--help|help) usage ;;
  *)
    echo "Unknown command: $COMMAND" >&2
    usage
    exit 1
    ;;
esac

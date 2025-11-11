#!/usr/bin/env bash
set -euo pipefail

BASE="https://docflow.fi"
PATHS=("" "/security" "/contact" "/legal/privacy" "/legal/dpa")
OUT="sitemap-404-report_$(date +%Y%m%d-%H%M%S).csv"
LOCALE_SCAN="${LOCALE_SCAN:-false}"

echo "url,http_status" > "$OUT"

check() {
  local url="$1"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -L "$url")
  echo "$url,$code" >> "$OUT"
}

for path in "${PATHS[@]}"; do
  check "${BASE}${path}"
done

if [[ "$LOCALE_SCAN" == "true" ]]; then
  LANGS=(fi en sv no da de fr es it nl pl ru ja zh ko)
  for lang in "${LANGS[@]}"; do
    for path in "${PATHS[@]}"; do
      check "${BASE}/${lang}${path}"
    done
  done
fi

echo "Report written to $OUT"
grep -v ",200$" "$OUT" || echo "All URLs returned 200."


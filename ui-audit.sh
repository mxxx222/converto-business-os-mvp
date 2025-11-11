#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# 1) Ensure required binaries are available
if ! command -v git >/dev/null; then
  echo "git puuttuu" >&2
  exit 1
fi

GH=0
if command -v gh >/dev/null; then
  GH=1
fi

# 2) Verify we are inside a git worktree
git rev-parse --is-inside-work-tree >/dev/null

# 3) Fetch remotes and prune stale refs (continue even if some remotes fail)
if ! git fetch --all --prune; then
  echo "Varoitus: git fetch --all --prune epäonnistui" >&2
fi

# 4) Create safety branch
TS=$(date +%Y%m%d-%H%M)
BR="safe/ui-audit-$TS"
git checkout -b "$BR"

# 5) Show current git status and diff summary
echo "== GIT STATUS =="
git status -sb || true

echo "== DIFF VS origin/main =="
git diff --stat origin/main...HEAD || true

# 6) Stage all changes, forcing key PWA assets when present
ADD_FORCE=()
if [[ -f frontend/public/offline.html ]]; then
  ADD_FORCE+=(frontend/public/offline.html)
fi
if [[ -f frontend/tests/pwa-offline.spec.ts ]]; then
  ADD_FORCE+=(frontend/tests/pwa-offline.spec.ts)
fi

git add -A
if [[ ${#ADD_FORCE[@]} -gt 0 ]]; then
  git add -f "${ADD_FORCE[@]}"
fi

# 7) Commit when staged changes exist
if git diff --cached --quiet; then
  echo "Ei staged-muutoksia. Snapshot-haara luotu: $BR"
else
  git commit -m "chore(ui): snapshot massive website/UI changes (auto audit)"
fi

# 8) Push branch and optionally open PR
git push -u origin "$BR"
if [[ $GH -eq 1 ]]; then
  gh pr create --fill --base main --head "$BR" || echo "PR:n luonti gh:lla epäonnistui"
else
  echo "gh CLI ei saatavilla – tee PR GitHubissa haarasta: $BR"
fi

echo "Valmis: $BR"

#!/bin/bash
# DocFlow Git Status Audit
# Kopioi ja aja projektin juuressa

echo "🔍 DocFlow Git Status Audit — $(date)"
echo "=================================================="
echo ""

echo "📍 Current Branch:"
git branch --show-current
echo ""

echo "📊 Git Status:"
git status --short --branch
echo ""

echo "🔄 Uncommitted Changes:"
UNCOMMITTED=$(git status --porcelain | wc -l)
if [ $UNCOMMITTED -gt 0 ]; then
  echo "⚠️  Found $UNCOMMITTED uncommitted files:"
  git status --porcelain
else
  echo "✅ No uncommitted changes"
fi
echo ""

echo "📤 Unpushed Commits:"
UNPUSHED=$(git log @{u}.. --oneline 2>/dev/null | wc -l)
if [ $UNPUSHED -gt 0 ]; then
  echo "⚠️  Found $UNPUSHED unpushed commits:"
  git log @{u}.. --oneline --decorate
else
  echo "✅ No unpushed commits"
fi
echo ""

echo "🔀 Merge Conflicts:"
CONFLICTS=$(git diff --name-only --diff-filter=U | wc -l)
if [ $CONFLICTS -gt 0 ]; then
  echo "🚨 MERGE CONFLICTS detected:"
  git diff --name-only --diff-filter=U
else
  echo "✅ No merge conflicts"
fi
echo ""

echo "🌿 Remote Branches:"
git branch -r | head -n 5
echo ""

echo "📅 Last 5 Commits:"
git log --oneline --graph --decorate -5
echo ""

echo "🏷️  Last Deploy Tags:"
git tag --sort=-creatordate | head -n 3
echo ""

echo "✅ Audit Complete!"
echo "Next: Review uncommitted files and unpushed commits above."
#!/usr/bin/env sh
# Workbook git sync — stage vault + scripts + root docs, commit, pull --rebase, push.
set -eu

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "▸ current status"
git status --short

echo "▸ staging workbook paths"
git add README.md CLAUDE.md .gitignore VallartaVoxVault scripts

if git diff --cached --quiet; then
  echo "▸ nothing to commit"
else
  git commit -m "Update Vallarta Vox workbook" || true
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "▸ pulling --rebase from origin/$BRANCH"
git pull --rebase origin "$BRANCH" || true

echo "▸ pushing"
git push -u origin "$BRANCH"

echo "✓ sync complete"

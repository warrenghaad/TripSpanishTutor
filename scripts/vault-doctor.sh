#!/usr/bin/env bash
#
# vault-doctor.sh — sanity-check the VallartaVoxVault subtree.
#
# Reports:
#   1. Tracked files inside VallartaVoxVault/ that are NOT under one of the
#      twelve canonical folders (strays).
#   2. Markdown files in VallartaVoxVault/ that look spec-noncompliant
#      (missing YAML frontmatter, or missing `kind:` / `date:` fields).
#   3. Files referencing a `kind:` value not in the allowed set.
#
# Exits 0 even when problems are found — this is informational, not enforcing.
# See VallartaVoxVault/01_Constitution/SPEC.md for the full contract and
# docs/obsidian-sync.md for context.

set -u

VAULT="VallartaVoxVault"

if [ ! -d "$VAULT" ]; then
  echo "vault-doctor: $VAULT/ not found in current directory."
  echo "Run this from the repo root."
  exit 1
fi

# Canonical top-level folders inside the vault.
CANONICAL=(
  "00_Inbox"
  "01_Constitution"
  "02_DailyPrep"
  "03_DailyDebriefs"
  "04_Trails"
  "05_WordLens"
  "06_Atelier"
  "07_CreativeWriting"
  "08_ProjectPacks"
  "09_Grammar"
  "10_Flashcards"
  "11_Research"
  "12_Schemas"
)

# Allowed kinds — keep in sync with SPEC.md / .obsidian-vault.yml.
ALLOWED_KINDS_REGEX='^(airport-scenelet|atelier-entry|bridge-note|vocab-pack|grammar-note|day-pack|daily-prep|daily-debrief|wordlens-entry|flashcard|borges-line)$'

echo "vault-doctor: scanning $VAULT/"
echo

# ---- 1. Strays ----
# Use git-tracked paths so we only flag files that are actually committed,
# not local-only scratch files. Falls back to find(1) if not in a git repo.
echo "[1/3] Stray tracked files (inside $VAULT/ but outside the twelve canonical folders):"
strays=0

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  list_cmd="git ls-files -- $VAULT"
else
  echo "  (not a git repo — falling back to filesystem scan)"
  list_cmd="find $VAULT -type f"
fi

while IFS= read -r path; do
  # Strip the leading VAULT/ prefix.
  rel="${path#$VAULT/}"
  # The top-level segment under the vault.
  top="${rel%%/*}"
  # Files allowed at the vault root.
  case "$top" in
    .obsidian-vault.yml|README.md) continue ;;
  esac
  is_canonical=0
  for c in "${CANONICAL[@]}"; do
    if [ "$top" = "$c" ]; then is_canonical=1; break; fi
  done
  if [ $is_canonical -eq 0 ]; then
    echo "  - $path"
    strays=$((strays + 1))
  fi
done < <($list_cmd)
[ $strays -eq 0 ] && echo "  (none)"
echo

# ---- 2. Frontmatter sanity ----
echo "[2/3] Markdown files missing or malformed frontmatter:"
issues=0
while IFS= read -r f; do
  base=$(basename "$f")
  # Skip docs that aren't expected to have frontmatter.
  case "$base" in
    SPEC.md|VAULT.md|README.md|project-space.md|learner-profile.md|translator.md) continue ;;
  esac

  first_line=$(head -n 1 "$f" 2>/dev/null)
  if [ "$first_line" != "---" ]; then
    echo "  - $f  (no YAML frontmatter)"
    issues=$((issues + 1))
    continue
  fi

  # Pull the frontmatter block (between the first two '---' lines).
  fm=$(awk '/^---$/{c++; next} c==1' "$f")
  if ! grep -q '^kind:' <<< "$fm"; then
    echo "  - $f  (missing \`kind:\`)"
    issues=$((issues + 1))
    continue
  fi
  if ! grep -q '^date:' <<< "$fm"; then
    echo "  - $f  (missing \`date:\`)"
    issues=$((issues + 1))
    continue
  fi
done < <(find "$VAULT" -type f -name '*.md' \
           -not -path "*/12_Schemas/Templates/*" \
           -not -path "*/12_Schemas/prompts/*")
[ $issues -eq 0 ] && echo "  (none)"
echo

# ---- 3. Unknown kinds ----
echo "[3/3] Files declaring an unknown \`kind:\` value:"
bad_kinds=0
while IFS= read -r f; do
  case "$(basename "$f")" in
    SPEC.md|VAULT.md|README.md|project-space.md|learner-profile.md|translator.md) continue ;;
  esac
  kind=$(awk '/^---$/{c++; next} c==1 && /^kind:/{sub(/^kind:[[:space:]]*/, ""); print; exit}' "$f")
  [ -z "$kind" ] && continue
  if ! [[ "$kind" =~ $ALLOWED_KINDS_REGEX ]]; then
    echo "  - $f  (kind: $kind)"
    bad_kinds=$((bad_kinds + 1))
  fi
done < <(find "$VAULT" -type f -name '*.md' \
           -not -path "*/12_Schemas/Templates/*" \
           -not -path "*/12_Schemas/prompts/*")
[ $bad_kinds -eq 0 ] && echo "  (none)"
echo

total=$((strays + issues + bad_kinds))
echo "vault-doctor: done. $strays strays, $issues frontmatter issues, $bad_kinds unknown kinds."
exit 0

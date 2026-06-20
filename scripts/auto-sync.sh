#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:---pull}"

cd "$ROOT"
LOCK_DIR="$(git rev-parse --git-path agent-config-auto-sync.lock)"

if [[ "${ABID_AGENTS_SKIP_AUTO_SYNC:-}" == "1" ]]; then
  exit 0
fi

case "$MODE" in
  --pull|--after-pull) ;;
  *)
    echo "Usage: scripts/auto-sync.sh [--pull|--after-pull]" >&2
    exit 2
    ;;
esac

if [[ "$(basename "$ROOT")" != ".agents" ]]; then
  exit 0
fi

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "Another agent-config auto-sync is running; skipping."
  exit 0
fi
trap 'rmdir "$LOCK_DIR"' EXIT

if [[ "$(git branch --show-current)" != "main" ]]; then
  echo "Refusing auto-sync: current branch is not main." >&2
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Refusing auto-sync: tracked working tree or index has local changes." >&2
  exit 1
fi

git fetch origin main

if [[ "$MODE" == "--pull" ]]; then
  ABID_AGENTS_SKIP_AUTO_SYNC=1 git pull --ff-only origin main
fi

if [[ "${ABID_AGENTS_SKIP_SUBMODULE_BUMP:-}" == "1" ]]; then
  "$ROOT/scripts/update-submodules.sh" --init
  echo "Auto-sync complete."
  exit 0
fi

"$ROOT/scripts/update-submodules.sh" --remote

if git diff --quiet && git diff --cached --quiet; then
  echo "Auto-sync complete: no submodule updates."
  exit 0
fi

if command -v rg >/dev/null 2>&1; then
  home_matches="$(rg -n --hidden --glob '!.git/**' --glob '!**/.git/**' -F "$HOME" "$ROOT" || true)"
  secret_matches="$(rg -n --hidden --glob '!.git/**' --glob '!**/.git/**' '(github_pat_[A-Za-z0-9_]+|gh[pousr]_[A-Za-z0-9_]+|sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----)' "$ROOT" || true)"
  matches="${home_matches}${home_matches:+$'\n'}${secret_matches}"
  if [[ -n "$matches" ]]; then
    printf '%s\n' "$matches"
    echo "Refusing auto-sync: private path or secret-like reference found after submodule update." >&2
    exit 1
  fi
fi

git add .gitmodules vendor/skill-upstreams

if git diff --cached --quiet; then
  echo "Auto-sync complete: no staged submodule updates."
  exit 0
fi

git commit -m "Auto-update skill submodules"
git push --recurse-submodules=check origin main
echo "Auto-sync complete."

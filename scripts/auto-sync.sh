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

update_no_mistakes() {
  local binary

  if [[ "${ABID_AGENTS_SKIP_NO_MISTAKES_UPDATE:-}" == "1" ]]; then
    return 0
  fi

  binary="${ABID_AGENTS_NO_MISTAKES_BIN:-}"
  if [[ -z "$binary" ]]; then
    if command -v no-mistakes >/dev/null 2>&1; then
      binary="$(command -v no-mistakes)"
    elif [[ -x "$HOME/.no-mistakes/bin/no-mistakes" ]]; then
      binary="$HOME/.no-mistakes/bin/no-mistakes"
    elif [[ -x "$HOME/.local/bin/no-mistakes" ]]; then
      binary="$HOME/.local/bin/no-mistakes"
    else
      echo "Skipping no-mistakes update: no-mistakes not found."
      return 0
    fi
  fi

  if ! NO_MISTAKES_TELEMETRY="${NO_MISTAKES_TELEMETRY:-0}" \
    NO_MISTAKES_NO_UPDATE_CHECK=1 \
    "$binary" update --yes; then
    echo "no-mistakes update failed; continuing auto-sync." >&2
  fi
}

if [[ "$(git branch --show-current)" != "main" ]]; then
  echo "Refusing auto-sync: current branch is not main." >&2
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Refusing auto-sync: tracked working tree or index has local changes." >&2
  exit 1
fi

update_no_mistakes

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

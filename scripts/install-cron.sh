#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCHEDULE="${ABID_AGENTS_CRON_SCHEDULE:-*/15 * * * *}"
PATH_VALUE="${ABID_AGENTS_CRON_PATH:-/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin}"
LOG="$ROOT/.git/auto-sync.log"
BEGIN_MARK="# BEGIN agent-config auto-sync"
END_MARK="# END agent-config auto-sync"
LEGACY_NAME="abid""-agents"
LEGACY_BEGIN_MARK="# BEGIN ${LEGACY_NAME} auto-sync"
LEGACY_END_MARK="# END ${LEGACY_NAME} auto-sync"
JOB="$SCHEDULE cd \"$ROOT\" && PATH=\"$PATH_VALUE\" \"$ROOT/scripts/auto-sync.sh\" >> \"$LOG\" 2>&1"
TMP_CRON="$(mktemp)"
trap 'rm -f "$TMP_CRON"' EXIT

install_crontab() {
  local pid timeout_seconds elapsed
  timeout_seconds="${ABID_AGENTS_CRON_INSTALL_TIMEOUT_SECONDS:-15}"
  crontab "$TMP_CRON" &
  pid="$!"
  for ((elapsed = 0; elapsed < timeout_seconds; elapsed++)); do
    if ! kill -0 "$pid" 2>/dev/null; then
      wait "$pid"
      return "$?"
    fi
    sleep 1
  done
  kill "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true
  echo "Timed out installing agent-config auto-sync cron." >&2
  return 1
}

if ! command -v crontab >/dev/null 2>&1; then
  echo "crontab is not available on this machine." >&2
  exit 1
fi

current="$(crontab -l 2>/dev/null || true)"
if printf '%s\n' "$current" | grep -Fxq "$BEGIN_MARK" &&
  printf '%s\n' "$current" | grep -Fxq "$JOB" &&
  printf '%s\n' "$current" | grep -Fxq "$END_MARK"; then
  echo "Agent-config auto-sync cron already installed: $SCHEDULE"
  exit 0
fi

filtered="$(printf '%s\n' "$current" | awk \
  -v begin="$BEGIN_MARK" \
  -v end="$END_MARK" \
  -v legacy_begin="$LEGACY_BEGIN_MARK" \
  -v legacy_end="$LEGACY_END_MARK" '
  $0 == begin || $0 == legacy_begin { skip = 1; next }
  $0 == end || $0 == legacy_end { skip = 0; next }
  !skip { print }
')"

{
  printf '%s\n' "$filtered"
  printf '%s\n' "$BEGIN_MARK"
  printf '%s\n' "$JOB"
  printf '%s\n' "$END_MARK"
} >"$TMP_CRON"

install_crontab

echo "Installed agent-config auto-sync cron: $SCHEDULE"

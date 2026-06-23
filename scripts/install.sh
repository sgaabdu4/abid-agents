#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT/scripts/install-mcp-tools.sh"

if git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
  git -C "$ROOT" config --local pull.rebase false
  git -C "$ROOT" config --local pull.ff only
fi

if git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1 &&
  [[ -f "$ROOT/.gitmodules" ]] &&
  [[ "${ABID_AGENTS_SKIP_SUBMODULE_INIT:-}" != "1" ]]; then
  "$ROOT/scripts/update-submodules.sh" --init
fi

backup_path() {
  local target="$1"
  printf '%s.backup.%s' "$target" "$(date +%Y%m%d%H%M%S)"
}

preserve_or_link_file() {
  local source="$1"
  local target="$2"
  mkdir -p "$(dirname "$target")"
  if [[ -L "$target" ]]; then
    if [[ "$(readlink "$target")" == "$source" ]]; then
      return 0
    fi
    echo "Preserving existing symlink: $target"
    return 0
  elif [[ -e "$target" ]]; then
    echo "Preserving existing file: $target"
    return 0
  fi
  ln -s "$source" "$target"
}

install_managed_executable() {
  local source="$1"
  local target="$2"
  mkdir -p "$(dirname "$target")"
  if [[ -L "$target" ]]; then
    if [[ "$(readlink "$target")" == "$source" ]]; then
      return 0
    fi
    echo "Preserving existing symlink: $target"
    return 0
  elif [[ -e "$target" ]] && ! grep -q 'Managed by abid-agents installer' "$target" 2>/dev/null; then
    echo "Preserving existing file: $target"
    return 0
  fi
  cp "$source" "$target"
  chmod 755 "$target"
}

install_codex_watchdog() {
  local codex_bin launch_agent launch_label old_launch_label
  codex_bin="$HOME/.codex/bin"
  launch_label="dev.abid-agents.codex-watchdog"
  old_launch_label="com.abid.codex-watchdog"
  install_managed_executable "$ROOT/codex/bin/codex-watchdog" "$codex_bin/codex-watchdog"
  install_managed_executable "$ROOT/codex/bin/codex-health" "$codex_bin/codex-health"

  if [[ "$(uname -s)" != "Darwin" ]]; then
    return 0
  fi

  launch_agent="$HOME/Library/LaunchAgents/${launch_label}.plist"
  mkdir -p "$(dirname "$launch_agent")" "$HOME/.codex/logs"
  cat >"$launch_agent" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$launch_label</string>
  <key>ProgramArguments</key>
  <array>
    <string>$codex_bin/codex-watchdog</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>StartInterval</key>
  <integer>120</integer>
  <key>EnvironmentVariables</key>
  <dict>
    <key>CODEX_WATCHDOG_KILL_ORPHANS</key>
    <string>1</string>
    <key>CODEX_WATCHDOG_LOAD_WARN</key>
    <string>32</string>
    <key>CODEX_WATCHDOG_MCP_WARN</key>
    <string>12</string>
    <key>CODEX_WATCHDOG_KILL_CODEX_APP_ON_STORM</key>
    <string>1</string>
  </dict>
  <key>StandardOutPath</key>
  <string>$HOME/.codex/logs/codex-watchdog.out.log</string>
  <key>StandardErrorPath</key>
  <string>$HOME/.codex/logs/codex-watchdog.err.log</string>
</dict>
</plist>
EOF

  if command -v plutil >/dev/null 2>&1; then
    plutil -lint "$launch_agent" >/dev/null
  fi
  if command -v launchctl >/dev/null 2>&1 &&
    ! launchctl print "gui/$(id -u)/$launch_label" >/dev/null 2>&1; then
    launchctl bootstrap "gui/$(id -u)" "$launch_agent" 2>/dev/null || {
      echo "Codex watchdog installed but not loaded; run: launchctl bootstrap gui/$(id -u) $launch_agent" >&2
    }
  fi
  if command -v launchctl >/dev/null 2>&1; then
    launchctl bootout "gui/$(id -u)/$old_launch_label" >/dev/null 2>&1 || true
    launchctl disable "gui/$(id -u)/$old_launch_label" >/dev/null 2>&1 || true
  fi
}

install_managed_block() {
  local source="$1"
  local target="$2"
  local name="$3"
  local begin="<!-- BEGIN managed by abid-agents: $name -->"
  local end="<!-- END managed by abid-agents: $name -->"
  local tmp

  mkdir -p "$(dirname "$target")"

  if [[ -L "$target" ]]; then
    if [[ "$(readlink "$target")" == "$source" ]]; then
      mv "$target" "$(backup_path "$target")"
    else
      echo "Preserving existing symlink: $target"
      return 0
    fi
  fi

  tmp="$(mktemp)"

  {
    printf '%s\n' "$begin"
    cat "$source"
    printf '%s\n\n' "$end"
    if [[ -f "$target" ]]; then
      awk -v begin="$begin" -v end="$end" '
        $0 == begin { skip = 1; next }
        $0 == end { skip = 0; next }
        !skip { print }
      ' "$target"
    fi
  } >"$tmp"

  mv "$tmp" "$target"
}

install_managed_block "$ROOT/AGENTS.md" "$HOME/.codex/AGENTS.md" "AGENTS.md"
preserve_or_link_file "$ROOT/mcp-config.json" "$HOME/.codex/mcp-config.json"
preserve_or_link_file "$ROOT/codex/hooks.json" "$HOME/.codex/hooks.json"
install_codex_watchdog
install_managed_block "$ROOT/AGENTS.md" "$HOME/.claude/AGENTS.md" "AGENTS.md"
install_managed_block "$ROOT/AGENTS.md" "$HOME/.copilot/AGENTS.md" "AGENTS.md"
install_managed_block "$ROOT/AGENTS.md" "$HOME/.pi/AGENTS.md" "AGENTS.md"
preserve_or_link_file "$ROOT/AGENTS.md" "$HOME/.pi/agent/AGENTS.md"

for skill in "$ROOT"/skills/*; do
  [[ -d "$skill" ]] || continue
  if git -C "$ROOT" check-ignore -q "$skill" 2>/dev/null; then
    continue
  fi
  name="$(basename "$skill")"
  for dir in "$HOME/.codex/skills" "$HOME/.claude/skills" "$HOME/.copilot/skills" "$HOME/.pi/skills" "$HOME/.pi/agent/skills"; do
    mkdir -p "$dir"
    target="$dir/$name"
    if [[ -L "$target" ]]; then
      if [[ "$(readlink "$target")" == "$skill" ]]; then
        continue
      fi
      echo "Preserving existing skill symlink: $target"
      continue
    elif [[ -e "$target" ]]; then
      echo "Preserving existing skill folder: $target"
      continue
    fi
    ln -s "$skill" "$target"
  done
done

if git -C "$ROOT" rev-parse --git-dir >/dev/null 2>&1; then
  hooks_dir="$(git -C "$ROOT" rev-parse --git-path hooks)"
  mkdir -p "$hooks_dir"

  install_hook() {
    local hook="$hooks_dir/$1"
    local tmp
    local legacy_owner
    legacy_owner="abid""-agents"
    tmp="$(mktemp)"
    cat >"$tmp"
    if [[ -e "$hook" ]] &&
      ! grep -q 'Managed by agent-config installer' "$hook" &&
      ! grep -q "Managed by ${legacy_owner} installer" "$hook" &&
      ! grep -q 'scripts/sync-subtrees.sh' "$hook" &&
      ! grep -q 'scripts/auto-sync.sh' "$hook"; then
      mv "$hook" "$hook.backup.$(date +%Y%m%d%H%M%S)"
    fi
    mv "$tmp" "$hook"
    chmod +x "$hook"
  }

  install_hook post-merge <<'EOF'
#!/usr/bin/env bash
# Managed by agent-config installer.
set -euo pipefail

repo="$(git rev-parse --show-toplevel)"
if [[ "$(basename "$repo")" == ".agents" ]]; then
  if [[ "${ABID_AGENTS_SKIP_SUBMODULE_UPDATE:-}" == "1" ]]; then
    exit 0
  fi
  "$repo/scripts/update-submodules.sh" --init
fi
EOF

  install_hook post-rewrite <<'EOF'
#!/usr/bin/env bash
# Managed by agent-config installer.
set -euo pipefail

if [[ "${1:-}" != "rebase" ]]; then
  exit 0
fi

repo="$(git rev-parse --show-toplevel)"
if [[ "$(basename "$repo")" == ".agents" ]]; then
  if [[ "${ABID_AGENTS_SKIP_SUBMODULE_UPDATE:-}" == "1" ]]; then
    exit 0
  fi
  "$repo/scripts/update-submodules.sh" --init
fi
EOF

  install_hook pre-push <<'EOF'
#!/usr/bin/env bash
# Managed by agent-config installer.
set -euo pipefail

repo="$(git rev-parse --show-toplevel)"
if [[ "$(basename "$repo")" != ".agents" ]]; then
  exit 0
fi

scan_history_fixed() {
  local needle="$1"
  git -C "$repo" rev-list --all | while read -r rev; do
    git -C "$repo" grep -n -F "$needle" "$rev" -- . 2>/dev/null || true
  done
}

scan_history_regex() {
  local pattern="$1"
  git -C "$repo" rev-list --all | while read -r rev; do
    git -C "$repo" grep -n -i -E "$pattern" "$rev" -- . 2>/dev/null || true
  done
}

home_matches="$(scan_history_fixed "$HOME")"
secret_pattern='(github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)'
secret_matches="$(scan_history_regex "$secret_pattern")"
matches="${home_matches}${home_matches:+$'\n'}${secret_matches}"

if [[ -n "$matches" ]]; then
  printf '%s\n' "Blocked push: reachable git history contains private path or secret-like references."
  printf '%s\n' "Rewrite or edit history before pushing:"
  printf '%s\n' "$matches"
  exit 1
fi

if [[ "${ABID_AGENTS_CHECK_SUBMODULES_BEFORE_PUSH:-}" == "1" ]]; then
  "$repo/scripts/update-submodules.sh" --status
fi
EOF
fi

if [[ "${ABID_AGENTS_ENABLE_CRON:-}" == "1" && "${ABID_AGENTS_SKIP_CRON:-}" != "1" ]]; then
  "$ROOT/scripts/install-cron.sh" || {
    echo "Cron install failed; run $ROOT/scripts/install-cron.sh manually." >&2
  }
fi

echo "Installed agent links from $ROOT"

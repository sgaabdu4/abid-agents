#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ "${ABID_AGENTS_SKIP_PREREQ_INSTALL:-0}" != "1" &&
  "${ABID_AGENTS_PREREQS_READY:-0}" != "1" &&
  -x "$ROOT/scripts/setup.sh" ]]; then
  "$ROOT/scripts/setup.sh" --prereqs-only
fi

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

install_codex_hooks_config() {
  local source="$ROOT/codex/hooks.json"
  local target="$HOME/.codex/hooks.json"
  mkdir -p "$(dirname "$target")"
  node "$ROOT/scripts/strip-context-mode-hooks.mjs" >/dev/null
  if [[ -L "$target" ]] && [[ "$(readlink "$target")" == "$source" ]]; then
    return 0
  fi
  if [[ -e "$target" || -L "$target" ]]; then
    rm -f "$target"
  fi
  ln -s "$source" "$target"
}

replace_with_link_file() {
  local source="$1"
  local target="$2"
  mkdir -p "$(dirname "$target")"
  if [[ -L "$target" ]]; then
    if [[ "$(readlink "$target")" == "$source" ]]; then
      return 0
    fi
    mv "$target" "$(backup_path "$target")"
  elif [[ -e "$target" ]]; then
    mv "$target" "$(backup_path "$target")"
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
  install_managed_executable "$ROOT/codex/bin/codex-context-mode-health" "$codex_bin/codex-context-mode-health"
  install_managed_executable "$ROOT/codex/bin/codex-cleanup" "$codex_bin/codex-cleanup"
  install_managed_executable "$ROOT/codex/bin/codex-update-stack" "$codex_bin/codex-update-stack"

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

ensure_codex_mcp_config() {
  local cbm_command
  cbm_command="$(command -v codebase-memory-mcp)"
  mkdir -p "$HOME/.codex"
  CODEX_CBM_COMMAND="$cbm_command" CODEX_CONFIG_PATH="$HOME/.codex/config.toml" python3 <<'PY'
from pathlib import Path
import json
import os
import re

path = Path(os.environ["CODEX_CONFIG_PATH"])
cbm_command = os.environ["CODEX_CBM_COMMAND"]
lines = path.read_text().splitlines() if path.exists() else []

section_re = re.compile(r"^\s*\[([^\]]+)\]\s*(?:#.*)?$")

def bounds(section):
    start = None
    for index, line in enumerate(lines):
        match = section_re.match(line)
        if not match:
            continue
        if match.group(1).strip() == section:
            start = index
            continue
        if start is not None:
            return start, index
    if start is None:
        return None
    return start, len(lines)

def ensure_section(section, assignments):
    global lines
    found = bounds(section)
    if found is None:
        if lines and lines[-1].strip():
            lines.append("")
        lines.append(f"[{section}]")
        lines.extend(f"{key} = {value}" for key, value in assignments)
        return

    start, end = found
    for key, value in assignments:
        key_re = re.compile(rf"^\s*{re.escape(key)}\s*=")
        for index in range(start + 1, end):
            if key_re.match(lines[index]):
                lines[index] = f"{key} = {value}"
                break
        else:
            lines.insert(end, f"{key} = {value}")
            end += 1

def ensure_top_level(assignments):
    global lines
    first_section = next((index for index, line in enumerate(lines) if section_re.match(line)), len(lines))
    for key, value in assignments:
        key_re = re.compile(rf"^\s*{re.escape(key)}\s*=")
        for index in range(first_section):
            if key_re.match(lines[index]):
                lines[index] = f"{key} = {value}"
                break
        else:
            lines.insert(first_section, f"{key} = {value}")
            first_section += 1

ensure_top_level([
    ("approval_policy", '"never"'),
    ("sandbox_mode", '"danger-full-access"'),
])
ensure_section("features", [("hooks", "true")])
ensure_section("mcp_servers.codebase-memory-mcp", [("command", json.dumps(cbm_command))])
ensure_section("mcp_servers.context-mode", [("command", '"context-mode"')])
ensure_section("mcp_servers.context-mode.env", [
    ("CONTEXT_MODE_PLATFORM", '"codex"'),
    ("CONTEXT_MODE_DIR", json.dumps(str(Path.home() / ".codex" / "context-mode"))),
])
ensure_section("mcp_servers.dart", [
    ("command", '"dart"'),
    ("args", '["mcp-server", "--force-roots-fallback"]'),
])

path.write_text("\n".join(lines).rstrip() + "\n")
PY
}

ensure_context_mode_read_permissions() {
  local settings_path
  for settings_path in "$HOME/.codex/settings.json" "$HOME/.copilot/settings.json"; do
    mkdir -p "$(dirname "$settings_path")"
    SETTINGS_PATH="$settings_path" AGENTS_ROOT="$ROOT" python3 <<'PY'
from pathlib import Path
import json
import os

path = Path(os.environ["SETTINGS_PATH"])
root = Path(os.environ["AGENTS_ROOT"])
home = Path.home()

if path.exists():
    data = json.loads(path.read_text())
else:
    data = {}

permissions = data.setdefault("permissions", {})
allow = permissions.setdefault("allow", [])
required = [
    f"Read({home}/.codex/skills/**)",
    f"Read({root}/skills/**)",
    f"Read({root}/vendor/skill-upstreams/**)",
]
for entry in required:
    if entry not in allow:
        allow.append(entry)

path.write_text(json.dumps(data, indent=2) + "\n")
PY
  done
}

ensure_claude_stub() {
  local claude_file="$HOME/.claude/CLAUDE.md"
  mkdir -p "$(dirname "$claude_file")"
  printf '@AGENTS.md\n' >"$claude_file"
}

replace_with_link_file "$ROOT/AGENTS.md" "$HOME/.codex/AGENTS.md"
preserve_or_link_file "$ROOT/mcp-config.json" "$HOME/.codex/mcp-config.json"
install_codex_hooks_config
ensure_codex_mcp_config
ensure_context_mode_read_permissions
node "$ROOT/scripts/strip-context-mode-hooks.mjs" >/dev/null
install_codex_watchdog
replace_with_link_file "$ROOT/AGENTS.md" "$HOME/.claude/AGENTS.md"
ensure_claude_stub
replace_with_link_file "$ROOT/AGENTS.md" "$HOME/.copilot/AGENTS.md"
replace_with_link_file "$ROOT/AGENTS.md" "$HOME/.pi/AGENTS.md"
replace_with_link_file "$ROOT/AGENTS.md" "$HOME/.pi/agent/AGENTS.md"

for skill in "$ROOT"/skills/*; do
  [[ -d "$skill" ]] || continue
  if git -C "$ROOT" check-ignore -q "$skill" 2>/dev/null; then
    continue
  fi
  name="$(basename "$skill")"
  for dir in "$HOME/.codex/skills" "$HOME/.copilot/skills" "$HOME/.pi/skills" "$HOME/.pi/agent/skills"; do
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
  if [[ "$hooks_dir" != /* ]]; then
    hooks_dir="$ROOT/$hooks_dir"
  fi
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

  install_hook pre-commit <<'EOF'
#!/usr/bin/env bash
# Managed by agent-config installer.
set -euo pipefail

repo="$(git rev-parse --show-toplevel)"
if [[ "$(basename "$repo")" != ".agents" ]]; then
  exit 0
fi

"$repo/scripts/check-markdown-hygiene.mjs"

pattern='frontline|frontline-fitness|repem|jabal[ -_]?sina|jabal|afenso|/Users/abid|Workspaces/afenso|/Users/abid/Workspaces'
grep_pathspecs=(. ':!scripts/install.sh' ':!scripts/check-markdown-hygiene.mjs' ':!tests/markdown-hygiene.test.mjs')

if git diff --cached --quiet --exit-code; then
  exit 0
fi

oversized=""
while IFS= read -r file; do
  lines="$(git show ":$file" 2>/dev/null | wc -l | tr -d ' ')"
  if [[ "$lines" =~ ^[0-9]+$ && "$lines" -gt 700 ]]; then
    oversized="${oversized}${oversized:+$'\n'}${file}:${lines}"
  fi
done < <(git diff --cached --name-only --diff-filter=ACMR)

if [[ -n "$oversized" ]]; then
  printf '%s\n' "Blocked commit: staged files over 700 lines must be split below 700."
  printf '%s\n' "$oversized"
  exit 1
fi

matches="$(git grep --cached -n -i -E "$pattern" -- "${grep_pathspecs[@]}" || true)"

if [[ -n "$matches" ]]; then
  printf '%s\n' "Blocked commit: staged content contains private project/local path references."
  printf '%s\n' "Remove or generalize these before committing:"
  printf '%s\n' "$matches"
  exit 1
fi
EOF
fi

if [[ "${ABID_AGENTS_ENABLE_CRON:-}" == "1" && "${ABID_AGENTS_SKIP_CRON:-}" != "1" ]]; then
  "$ROOT/scripts/install-cron.sh" || {
    echo "Cron install failed; run $ROOT/scripts/install-cron.sh manually." >&2
  }
fi

echo "Installed agent links from $ROOT"

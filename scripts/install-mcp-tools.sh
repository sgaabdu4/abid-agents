#!/usr/bin/env bash
set -euo pipefail

if [[ "${ABID_AGENTS_SKIP_NPM_INSTALL:-}" == "1" ]]; then
  echo "Skipping MCP tool install because ABID_AGENTS_SKIP_NPM_INSTALL=1"
  exit 0
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found; cannot install MCP tools." >&2
  exit 1
fi

npm install -g context-mode@latest codebase-memory-mcp@latest @openai/codex@latest

sync_shadowed_codebase_memory() {
  local npm_root npm_bin active active_version npm_version backup
  npm_root="$(npm root -g)"
  npm_bin="$npm_root/codebase-memory-mcp/bin/codebase-memory-mcp"
  if [[ ! -x "$npm_bin" ]]; then
    return 0
  fi

  active="$(command -v codebase-memory-mcp || true)"
  if [[ -z "$active" || "$active" == "$npm_bin" || "$active" == "$HOME/.npm-global/bin/codebase-memory-mcp" ]]; then
    return 0
  fi

  active_version="$("$active" --version 2>/dev/null || true)"
  npm_version="$("$npm_bin" --version 2>/dev/null || true)"
  if [[ -z "$npm_version" || "$active_version" == "$npm_version" ]]; then
    return 0
  fi

  backup="$active.backup.$(date +%Y%m%d%H%M%S)"
  mv "$active" "$backup"
  cp "$npm_bin" "$active"
  chmod 755 "$active"
  echo "Updated shadowed codebase-memory-mcp at $active; backup: $backup"
}

sync_shadowed_codebase_memory

if command -v context-mode >/dev/null 2>&1 &&
  command -v codebase-memory-mcp >/dev/null 2>&1 &&
  command -v codex >/dev/null 2>&1; then
  echo "MCP tools installed and upgraded."
  exit 0
fi

echo "One or more MCP tools are still missing from PATH." >&2
exit 1

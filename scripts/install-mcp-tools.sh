#!/usr/bin/env bash
set -euo pipefail

if [[ "${ABID_AGENTS_SKIP_NPM_INSTALL:-}" == "1" ]]; then
  echo "Skipping MCP tool install because ABID_AGENTS_SKIP_NPM_INSTALL=1"
  exit 0
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found; cannot install context-mode or codebase-memory-mcp." >&2
  exit 1
fi

missing=()
if ! command -v context-mode >/dev/null 2>&1; then
  missing+=(context-mode@latest)
fi
if ! command -v codebase-memory-mcp >/dev/null 2>&1; then
  missing+=(codebase-memory-mcp@latest)
fi

if [[ ${#missing[@]} -eq 0 ]]; then
  echo "MCP tools already installed."
  exit 0
fi

npm install -g "${missing[@]}"

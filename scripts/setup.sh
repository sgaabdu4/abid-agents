#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${ABID_AGENTS_REPO_URL:-https://github.com/sgaabdu4/abid-agents.git}"
ROOT="${ABID_AGENTS_HOME:-$HOME/.agents}"
NO_MISTAKES_HOME="${NO_MISTAKES_HOME:-$HOME/.no-mistakes}"

require_command() {
  local command="$1"
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Missing required command: $command" >&2
    exit 1
  fi
}

is_interactive() {
  [[ -t 0 && -t 1 && "${CI:-}" != "true" ]]
}

is_enabled() {
  case "${1:-}" in
    1|true|TRUE|yes|YES|y|Y) return 0 ;;
    *) return 1 ;;
  esac
}

is_disabled() {
  case "${1:-}" in
    0|false|FALSE|no|NO|n|N) return 0 ;;
    *) return 1 ;;
  esac
}

ask_yes_no() {
  local env_name="$1"
  local prompt="$2"
  local default="$3"
  local value="${!env_name:-}"
  local answer suffix

  if [[ -n "$value" ]]; then
    is_enabled "$value"
    return "$?"
  fi

  if ! is_interactive; then
    [[ "$default" == "yes" ]]
    return "$?"
  fi

  if [[ "$default" == "yes" ]]; then
    suffix="[Y/n]"
  else
    suffix="[y/N]"
  fi

  while true; do
    read -r -p "$prompt $suffix " answer
    if [[ -z "$answer" ]]; then
      [[ "$default" == "yes" ]]
      return "$?"
    fi
    if is_enabled "$answer"; then
      return 0
    fi
    if is_disabled "$answer"; then
      return 1
    fi
    echo "Please answer yes or no." >&2
  done
}

ask_extra_repos() {
  local answer

  if [[ -n "${ABID_AGENTS_NO_MISTAKES_REPOS:-}" ||
    "${ABID_AGENTS_SKIP_NO_MISTAKES:-}" == "1" ||
    "${ABID_AGENTS_SKIP_NO_MISTAKES_INIT:-}" == "1" ]]; then
    return 0
  fi

  if ! is_interactive; then
    return 0
  fi

  read -r -p "Extra repos to initialize with no-mistakes, colon-separated, blank to skip: " answer
  if [[ -n "$answer" ]]; then
    export ABID_AGENTS_NO_MISTAKES_REPOS="$answer"
  fi
}

choose_setup_options() {
  if ask_yes_no ABID_AGENTS_SETUP_NO_MISTAKES "Install or update no-mistakes and initialize .agents?" yes; then
    unset ABID_AGENTS_SKIP_NO_MISTAKES
  else
    export ABID_AGENTS_SKIP_NO_MISTAKES=1
  fi

  if ask_yes_no ABID_AGENTS_ENABLE_CRON "Enable auto-sync cron for .agents?" no; then
    export ABID_AGENTS_ENABLE_CRON=1
  else
    unset ABID_AGENTS_ENABLE_CRON
  fi

  ask_extra_repos
}

clone_or_update_repo() {
  if [[ -d "$ROOT/.git" ]]; then
    echo "Updating existing .agents checkout: $ROOT"
    git -C "$ROOT" pull --ff-only origin main
    return 0
  fi

  if [[ -e "$ROOT" ]]; then
    echo "Refusing setup: $ROOT exists but is not a git checkout." >&2
    exit 1
  fi

  echo "Cloning .agents into $ROOT"
  git clone --recurse-submodules "$REPO_URL" "$ROOT"
}

install_or_update_no_mistakes() {
  local binary version os arch filename url download_dir install_dir link_dir link_path

  if [[ "${ABID_AGENTS_SKIP_NO_MISTAKES:-}" == "1" ]]; then
    return 0
  fi

  if command -v no-mistakes >/dev/null 2>&1; then
    NO_MISTAKES_TELEMETRY="${NO_MISTAKES_TELEMETRY:-0}" \
      NO_MISTAKES_NO_UPDATE_CHECK=1 \
      no-mistakes update --yes
    return 0
  fi

  if [[ -x "$NO_MISTAKES_HOME/bin/no-mistakes" ]]; then
    NO_MISTAKES_TELEMETRY="${NO_MISTAKES_TELEMETRY:-0}" \
      NO_MISTAKES_NO_UPDATE_CHECK=1 \
      "$NO_MISTAKES_HOME/bin/no-mistakes" update --yes
    return 0
  fi

  require_command curl
  require_command tar

  version="$(curl -fsSL "https://api.github.com/repos/kunchenguid/no-mistakes/releases/latest" |
    sed -n 's/.*"tag_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
  if [[ -z "$version" ]]; then
    echo "Could not determine latest no-mistakes release." >&2
    exit 1
  fi

  os="$(uname -s | tr '[:upper:]' '[:lower:]')"
  arch="$(uname -m)"
  case "$os" in
    darwin|linux) ;;
    *)
      echo "Unsupported no-mistakes OS: $os" >&2
      exit 1
      ;;
  esac

  case "$arch" in
    x86_64|amd64) arch="amd64" ;;
    arm64|aarch64) arch="arm64" ;;
    *)
      echo "Unsupported no-mistakes architecture: $arch" >&2
      exit 1
      ;;
  esac

  filename="no-mistakes-${version}-${os}-${arch}.tar.gz"
  url="https://github.com/kunchenguid/no-mistakes/releases/download/${version}/${filename}"
  download_dir="$NO_MISTAKES_HOME/downloads/$version"
  install_dir="$NO_MISTAKES_HOME/bin"
  link_dir="${NO_MISTAKES_LINK_DIR:-$HOME/.local/bin}"
  link_path="$link_dir/no-mistakes"

  mkdir -p "$download_dir" "$install_dir" "$link_dir"
  curl -fsSL "$url" -o "$download_dir/$filename"
  tar xzf "$download_dir/$filename" -C "$download_dir"
  cp "$download_dir/no-mistakes" "$install_dir/no-mistakes"
  chmod 755 "$install_dir/no-mistakes"

  if [[ ! -e "$link_path" ]]; then
    ln -s "$install_dir/no-mistakes" "$link_path"
  fi

  NO_MISTAKES_TELEMETRY="${NO_MISTAKES_TELEMETRY:-0}" \
    NO_MISTAKES_NO_UPDATE_CHECK=1 \
    "$install_dir/no-mistakes" daemon restart
}

no_mistakes_binary() {
  if command -v no-mistakes >/dev/null 2>&1; then
    command -v no-mistakes
  elif [[ -x "$NO_MISTAKES_HOME/bin/no-mistakes" ]]; then
    printf '%s\n' "$NO_MISTAKES_HOME/bin/no-mistakes"
  elif [[ -x "$HOME/.local/bin/no-mistakes" ]]; then
    printf '%s\n' "$HOME/.local/bin/no-mistakes"
  fi
}

init_no_mistakes_repo() {
  local repo="$1"
  local binary

  if [[ "${ABID_AGENTS_SKIP_NO_MISTAKES:-}" == "1" ||
    "${ABID_AGENTS_SKIP_NO_MISTAKES_INIT:-}" == "1" ]]; then
    return 0
  fi

  binary="$(no_mistakes_binary || true)"
  if [[ -z "$binary" ]]; then
    echo "Skipping no-mistakes init for $repo: binary not found." >&2
    return 0
  fi

  if ! git -C "$repo" rev-parse --show-toplevel >/dev/null 2>&1; then
    echo "Skipping no-mistakes init for $repo: not a git checkout." >&2
    return 0
  fi

  if [[ -z "$(git -C "$repo" remote get-url origin 2>/dev/null || true)" ]]; then
    echo "Skipping no-mistakes init for $repo: no origin remote." >&2
    return 0
  fi

  (
    cd "$repo"
    NO_MISTAKES_TELEMETRY="${NO_MISTAKES_TELEMETRY:-0}" \
      NO_MISTAKES_NO_UPDATE_CHECK=1 \
      "$binary" init
  )
}

init_extra_no_mistakes_repos() {
  local extra_repos repo

  extra_repos="${ABID_AGENTS_NO_MISTAKES_REPOS:-}"
  if [[ -z "$extra_repos" ]]; then
    return 0
  fi

  IFS=':' read -r -a repos <<<"$extra_repos"
  for repo in "${repos[@]}"; do
    [[ -n "$repo" ]] || continue
    init_no_mistakes_repo "$repo"
  done
}

require_command git
choose_setup_options
clone_or_update_repo
"$ROOT/scripts/install.sh"
install_or_update_no_mistakes
init_no_mistakes_repo "$ROOT"
init_extra_no_mistakes_repos
"$ROOT/scripts/install.sh"

echo "Abid Agents setup complete: $ROOT"

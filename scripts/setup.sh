#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${ABID_AGENTS_REPO_URL:-https://github.com/sgaabdu4/abid-agents.git}"
ROOT="${ABID_AGENTS_HOME:-$HOME/.agents}"
NO_MISTAKES_HOME="${NO_MISTAKES_HOME:-$HOME/.no-mistakes}"
TREEHOUSE_INSTALL_URL="${ABID_AGENTS_TREEHOUSE_INSTALL_URL:-https://kunchenguid.github.io/treehouse/install.sh}"

require_command() {
  local command="$1"
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Missing required command: $command" >&2
    exit 1
  fi
}

load_homebrew_shellenv() {
  local brew_bin=""

  if command -v brew >/dev/null 2>&1; then
    brew_bin="$(command -v brew)"
  elif [[ -x /opt/homebrew/bin/brew ]]; then
    brew_bin="/opt/homebrew/bin/brew"
  elif [[ -x /usr/local/bin/brew ]]; then
    brew_bin="/usr/local/bin/brew"
  fi

  if [[ -n "$brew_bin" ]]; then
    eval "$("$brew_bin" shellenv)"
  fi
}

prepend_agent_paths() {
  export PATH="$HOME/.npm-global/bin:$HOME/.local/bin:$HOME/flutter/bin:$HOME/Workspaces/flutter/bin:$HOME/.pub-cache/bin:$PATH"
  load_homebrew_shellenv
  hash -r 2>/dev/null || true
}

ensure_xcode_cli_tools() {
  if [[ "$(uname -s)" != "Darwin" ]]; then
    return 0
  fi

  if xcode-select -p >/dev/null 2>&1; then
    return 0
  fi

  if [[ "${ABID_AGENTS_SKIP_XCODE_SELECT_INSTALL:-0}" == "1" ]]; then
    echo "Xcode Command Line Tools are missing; install them with: xcode-select --install" >&2
    exit 1
  fi

  echo "Requesting Xcode Command Line Tools install..."
  xcode-select --install >/dev/null 2>&1 || true
  echo "Finish the Xcode Command Line Tools installer, then rerun setup." >&2
  exit 1
}

ensure_homebrew() {
  prepend_agent_paths
  if command -v brew >/dev/null 2>&1; then
    return 0
  fi

  if [[ "$(uname -s)" != "Darwin" ]]; then
    echo "Homebrew is missing; install it before running setup on this platform." >&2
    exit 1
  fi

  if [[ "${ABID_AGENTS_ALLOW_HOMEBREW_BOOTSTRAP:-0}" != "1" ]]; then
    echo "Homebrew is missing; install it manually or set ABID_AGENTS_ALLOW_HOMEBREW_BOOTSTRAP=1 to run the upstream bootstrap." >&2
    exit 1
  fi

  require_command curl
  echo "Installing Homebrew..."
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  prepend_agent_paths

  if ! command -v brew >/dev/null 2>&1; then
    echo "Homebrew install completed but brew is not on PATH." >&2
    exit 1
  fi
}

print_shell_path_block() {
  cat <<'EOF'
# BEGIN abid-agents bootstrap path
if [ -x /opt/homebrew/bin/brew ]; then
  eval "$(/opt/homebrew/bin/brew shellenv)"
elif [ -x /usr/local/bin/brew ]; then
  eval "$(/usr/local/bin/brew shellenv)"
fi
export PATH="$HOME/.npm-global/bin:$HOME/.local/bin:$HOME/flutter/bin:$HOME/Workspaces/flutter/bin:$HOME/.pub-cache/bin:$PATH"
# END abid-agents bootstrap path
EOF
}

install_shell_path_block() {
  if [[ "${ABID_AGENTS_SKIP_SHELL_PATH_UPDATE:-0}" == "1" ]]; then
    return 0
  fi

  local target begin end tmp
  target="${ABID_AGENTS_SHELL_ENV_FILE:-$HOME/.zshenv}"
  begin="# BEGIN abid-agents bootstrap path"
  end="# END abid-agents bootstrap path"
  mkdir -p "$(dirname "$target")"

  if [[ -f "$target" ]] && grep -q "$begin" "$target" && ! grep -q "$end" "$target"; then
    echo "Preserving malformed managed PATH block in $target; missing end marker." >&2
    return 0
  fi

  if [[ -f "$target" ]] && grep -q "$begin" "$target"; then
    tmp="${target}.abid-agents.$$"
    awk -v begin="$begin" -v end="$end" '
      function print_block() {
        print "# BEGIN abid-agents bootstrap path"
        print "if [ -x /opt/homebrew/bin/brew ]; then"
        print "  eval \"$(/opt/homebrew/bin/brew shellenv)\""
        print "elif [ -x /usr/local/bin/brew ]; then"
        print "  eval \"$(/usr/local/bin/brew shellenv)\""
        print "fi"
        print "export PATH=\"$HOME/.npm-global/bin:$HOME/.local/bin:$HOME/flutter/bin:$HOME/Workspaces/flutter/bin:$HOME/.pub-cache/bin:$PATH\""
        print "# END abid-agents bootstrap path"
      }
      $0 == begin {
        if (!done) {
          print_block()
        }
        done = 1
        skipping = 1
        next
      }
      $0 == end && skipping {
        skipping = 0
        next
      }
      !skipping {
        print
      }
      END {
        if (!done) {
          print_block()
        }
      }
    ' "$target" >"$tmp"
    mv "$tmp" "$target"
  else
    if [[ -s "$target" ]]; then
      printf '\n' >>"$target"
    fi
    print_shell_path_block >>"$target"
  fi
}

needs_brew_prerequisites() {
  ! command -v git >/dev/null 2>&1 ||
    ! command -v node >/dev/null 2>&1 ||
    ! command -v npm >/dev/null 2>&1 ||
    ! command -v dart >/dev/null 2>&1
}

install_brew_packages() {
  local packages=()

  if ! command -v git >/dev/null 2>&1; then
    packages+=("git")
  fi

  if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    packages+=("node")
  fi

  if ! command -v dart >/dev/null 2>&1; then
    brew tap dart-lang/dart
    packages+=("dart")
  fi

  if [[ "${#packages[@]}" -gt 0 ]]; then
    echo "Installing prerequisite packages: ${packages[*]}"
    brew install "${packages[@]}"
    prepend_agent_paths
  fi
}

install_flutter_if_missing() {
  prepend_agent_paths
  if command -v flutter >/dev/null 2>&1; then
    return 0
  fi

  if [[ "${ABID_AGENTS_SKIP_FLUTTER_INSTALL:-0}" == "1" ]]; then
    echo "Flutter is missing; skipped because ABID_AGENTS_SKIP_FLUTTER_INSTALL=1."
    return 0
  fi

  require_command git
  local flutter_home="${ABID_AGENTS_FLUTTER_HOME:-$HOME/flutter}"

  if [[ -x "$flutter_home/bin/flutter" ]]; then
    export PATH="$flutter_home/bin:$PATH"
    return 0
  fi

  if [[ -e "$flutter_home" ]]; then
    echo "Flutter target exists but $flutter_home/bin/flutter is missing: $flutter_home" >&2
    echo "Set ABID_AGENTS_FLUTTER_HOME to another path or fix the existing checkout." >&2
    exit 1
  fi

  echo "Installing Flutter stable SDK at $flutter_home..."
  git clone --depth 1 -b stable https://github.com/flutter/flutter.git "$flutter_home"
  export PATH="$flutter_home/bin:$PATH"
  flutter --version >/dev/null
}

install_python_prerequisites() {
  require_command python3
  if python3 - <<'PY' >/dev/null 2>&1
import tiktoken
PY
  then
    return 0
  fi

  if [[ "${ABID_AGENTS_SKIP_PYTHON_DEPS:-0}" == "1" ]]; then
    echo "Python package tiktoken is missing; unset ABID_AGENTS_SKIP_PYTHON_DEPS to install it." >&2
    exit 1
  fi
  python3 -m pip install --user tiktoken
}

install_prerequisites() {
  if [[ "${ABID_AGENTS_SKIP_PREREQ_INSTALL:-0}" == "1" ]]; then
    prepend_agent_paths
    return 0
  fi

  prepend_agent_paths
  ensure_xcode_cli_tools
  if needs_brew_prerequisites; then
    ensure_homebrew
    install_brew_packages
  fi
  install_python_prerequisites
  install_flutter_if_missing
  install_shell_path_block
  export ABID_AGENTS_PREREQS_READY=1
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

  if ask_yes_no ABID_AGENTS_SETUP_TREEHOUSE "Install or update Treehouse?" yes; then
    unset ABID_AGENTS_SKIP_TREEHOUSE
  else
    export ABID_AGENTS_SKIP_TREEHOUSE=1
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

  version="${ABID_AGENTS_NO_MISTAKES_VERSION:-v1.30.1}"
  if [[ "$version" == "latest" ]]; then
    version="$(curl -fsSL "https://api.github.com/repos/kunchenguid/no-mistakes/releases/latest" |
      sed -n 's/.*"tag_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
  fi
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

install_or_update_treehouse() {
  if [[ "${ABID_AGENTS_SKIP_TREEHOUSE:-}" == "1" ]]; then
    return 0
  fi

  if command -v treehouse >/dev/null 2>&1; then
    if ! treehouse update; then
      echo "Treehouse update failed; continuing setup." >&2
    fi
    return 0
  fi

  require_command curl
  curl -fsSL "$TREEHOUSE_INSTALL_URL" | sh
  prepend_agent_paths

  if ! command -v treehouse >/dev/null 2>&1; then
    echo "Treehouse install completed but treehouse is not on PATH." >&2
    exit 1
  fi
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

wait_for_job() {
  local pid="$1"
  local label="$2"

  if wait "$pid"; then
    return 0
  fi

  echo "$label failed." >&2
  return 1
}

run_parallel_install() {
  local install_pid no_mistakes_pid treehouse_pid root_init_pid extra_init_pid
  local status=0

  "$ROOT/scripts/install.sh" &
  install_pid=$!

  install_or_update_no_mistakes &
  no_mistakes_pid=$!

  install_or_update_treehouse &
  treehouse_pid=$!

  wait_for_job "$install_pid" "Agent install" || status=1
  wait_for_job "$no_mistakes_pid" "no-mistakes install" || status=1
  wait_for_job "$treehouse_pid" "Treehouse install" || status=1

  if [[ "$status" != "0" ]]; then
    exit 1
  fi

  init_no_mistakes_repo "$ROOT" &
  root_init_pid=$!

  init_extra_no_mistakes_repos &
  extra_init_pid=$!

  wait_for_job "$root_init_pid" "no-mistakes root init" || status=1
  wait_for_job "$extra_init_pid" "no-mistakes extra repo init" || status=1

  if [[ "$status" != "0" ]]; then
    exit 1
  fi
}

if [[ "${1:-}" == "--prereqs-only" ]]; then
  install_prerequisites
  exit 0
fi

install_prerequisites
require_command git
choose_setup_options
clone_or_update_repo
run_parallel_install
ABID_AGENTS_SKIP_NPM_INSTALL=1 ABID_AGENTS_SKIP_SUBMODULE_INIT=1 "$ROOT/scripts/install.sh"

echo "Abid Agents setup complete: $ROOT"

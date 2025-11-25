#!/usr/bin/env sh

set -eu

# ============================================================
# Colors (POSIX-safe; disable by NO_COLOR=1)
# ============================================================
if [ "${NO_COLOR:-0}" = "1" ]; then
  COLOR_RESET=""
  COLOR_INFO=""
  COLOR_WARN=""
  COLOR_ERROR=""
  COLOR_DEBUG=""
else
  COLOR_RESET="$(printf '\033[0m')"
  COLOR_INFO="$(printf '\033[1;34m')"
  COLOR_WARN="$(printf '\033[1;33m')"
  COLOR_ERROR="$(printf '\033[1;31m')"
  COLOR_DEBUG="$(printf '\033[1;35m')"
fi

# ============================================================
# Logging (POSIX: use printf, not echo -e)
# ============================================================

_debug() {
  if [ "${DEBUG:-0}" = "1" ]; then
    printf "%s[DEBUG]%s %s\n" "$COLOR_DEBUG" "$COLOR_RESET" "$*"
  fi
}

_info() {
  printf "%s[ INFO]%s %s\n" "$COLOR_INFO" "$COLOR_RESET" "$*"
}

_warn() {
  printf "%s[ WARN]%s %s\n" "$COLOR_WARN" "$COLOR_RESET" "$*" >&2
}

_error() {
  printf "%s[ERROR]%s %s\n" "$COLOR_ERROR" "$COLOR_RESET" "$*" >&2
}

_fatal() {
  printf "%s[FATAL]%s %s\n" "$COLOR_ERROR" "$COLOR_RESET" "$*" >&2
  exit 1
}

# ============================================================
# Utils
# ============================================================

_run() {
  _debug "running command: $*"

  # POSIX cannot disable pipefail; only disable -e safely here
  set +e
  output=$("$@" 2>&1)
  status=$?
  set -e

  if [ "$status" -ne 0 ]; then
    _error "$output"
    _fatal "command failed ($status): $*"
  else
    _debug "command completed: $*"
  fi
}

_run_subshell() {
  cmd="$*"
  _run sh -c "$cmd"
}

_require() {
  cmd="$1"
  msg="${2:-}"

  if ! command -v "$cmd" >/dev/null 2>&1; then
    [ -n "$msg" ] && _fatal "$msg"
    _fatal "required command '$cmd' not found in PATH"
  else
    _debug "found required command: $cmd"
  fi
}

# ============================================================
# Header (POSIX heredoc)
# ============================================================

_printHeader() {
cat <<EOF

  ░█████████               ░█░███████
  ░██     ░██                ░██   ░██
  ░██     ░█░██░███░███████░█░██    ░██░███████ ░███████ ░███████
  ░█████████░███  ░██    ░█░█░██    ░█░██    ░█░██    ░█░██
  ░██       ░██   ░██    ░█░█░██    ░█░██    ░█░██       ░███████
  ░██       ░██   ░██    ░█░█░██   ░██░██    ░█░██    ░██      ░██
  ░██       ░██    ░███████░█░███████  ░███████ ░███████ ░███████
                           ░██
                         ░███

  ProjDocs Installer
  Copyright © Train360, Corp. 2025

EOF
}

# ============================================================
# OS-Specific Install Logic
# ============================================================

_install_alpine() {
  _info "updating base os"
  _run apk update

  _info "installing dependencies"
  _run apk add git nodejs npm

  _info "pulling source code"
  _run git clone https://github.com/train360-corp/projdocs.git /projdocs

  _info "installing dependencies for admin portal"
  _run_subshell "cd /projdocs && npm ci"

  _info "building admin portal"
  _run_subshell "cd /projdocs/apps/admin && npm run build"
}

_install() {
  _info "installing ProjDocs"

  os="$(uname -s)"

  case "$os" in
    Linux)
      _debug "os: Linux"

      if [ -f /etc/alpine-release ]; then
        ALPINE_VERSION=$(cat /etc/alpine-release 2>/dev/null || true)
        _debug "Alpine: $ALPINE_VERSION"
      else
        _debug "/etc/alpine-release not found"
        _fatal "only Alpine Linux is supported"
      fi

      _info "starting Alpine install"
      _install_alpine
      _info "Alpine install complete"
      ;;

    Darwin)
      _fatal "macOS not implemented"
      ;;

    CYGWIN*|MINGW*|MSYS*)
      _fatal "Windows POSIX not implemented"
      ;;

    *)
      _fatal "unsupported OS: $os"
      ;;
  esac
}

# ============================================================
# Main
# ============================================================

_main() {
  clear 2>/dev/null || true
  _debug "entering _main"
  _printHeader
  _install
  _debug "install complete"
}

_main
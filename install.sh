#!/usr/bin/env bash

set -euo pipefail

# ============================================================
# Colors (disable by exporting NO_COLOR=1)
# ============================================================
if [[ "${NO_COLOR:-0}" == "1" ]]; then
  COLOR_RESET="" COLOR_INFO="" COLOR_WARN="" COLOR_ERROR="" COLOR_DEBUG=""
else
  COLOR_RESET="\033[0m"
  COLOR_INFO="\033[1;34m"
  COLOR_WARN="\033[1;33m"
  COLOR_ERROR="\033[1;31m"
  COLOR_DEBUG="\033[1;35m"
fi

# ============================================================
# Logging
# ============================================================

_debug() {  # Only prints if DEBUG=1
  if [[ "${DEBUG:-0}" == "1" ]]; then
    echo -e "${COLOR_DEBUG}[DEBUG]${COLOR_RESET} $*"
  fi
}

_info() {
  echo -e "${COLOR_INFO}[ INFO] ${COLOR_RESET} $*"
}

_warn() {
  echo -e "${COLOR_WARN}[ WARN] ${COLOR_RESET} $*" >&2
}

_error() {
  echo -e "${COLOR_ERROR}[ERROR]${COLOR_RESET} $*" >&2
}

_fatal() {
  echo -e "${COLOR_ERROR}[FATAL]${COLOR_RESET} $*" >&2
  exit 1
}

# ============================================================
# Utils
# ============================================================

_run() {
  _debug "running command: $*"
  set +e  # <--- disable exit-on-error temporarily
  output="$("$@" 2>&1)"
  local status=$?
  set -e  # <--- re-enable strict mode
  if [[ $status -ne 0 ]]; then
    _error "$output"
    _fatal "command failed ($status): $*"
  else
    _debug "command completed: $*"
  fi
}

_run_subshell() {
  local cmd="$*"
  _run bash -c "$cmd"
}

_require() {
  local cmd="$1"
  local msg="${2:-}"

  if ! command -v "$cmd" >/dev/null 2>&1; then
    if [[ -n "$msg" ]]; then
      _fatal "$msg"
    else
      _fatal "required command '$cmd' not found in PATH"
    fi
  else
    _debug "found required command: $cmd"
  fi
}

# ============================================================
# Header
# ============================================================
_printHeader() {
cat <<'EOF'

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
  # docker run -it --rm --name alpine-vm --privileged alpine:3.22 /bin/sh
  # wget -O - https://raw.githubusercontent.com/train360-corp/projdocs/refs/heads/main/install.sh | sh


  _info "updating base os"
  _run apk update

  _info "installing dependencies"
  _run apk add git nodejs npm

  _info "pulling source code"
  _run git clone https://github.com/train360-corp/projdocs.git /projdocs

  _info "installing dependencies for admin portal"
  _run_subshell cd /projdocs && npm ci

  _info "building admin portal"
  _run_subshell cd /projdocs/apps/admin && npm run build
}

_install() {
  _info "installing ProjDocs"
  case "$(uname -s)" in
    Linux)
      _debug "os: Linux"

      if [ -f /etc/alpine-release ]; then
        ALPINE_VERSION="$(cat /etc/alpine-release 2>/dev/null)"
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
      _debug "detected os: macOS"
      _fatal "not implemented"
      ;;
    CYGWIN*|MINGW*|MSYS*)
      _debug "Detected Windows (POSIX environment)"
      _fatal "not implemented"
      ;;
    *)
      _fatal "detected os: $(uname -s)"
      ;;
  esac
}

# ============================================================
# Main
# ============================================================
_main() {
  clear || true
  _debug "entering _main"
  _printHeader
  _install
  _debug "install complete"
}

_main
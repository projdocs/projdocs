#!/usr/bin/env sh

set -eu

# docker run -it --rm --name alpine-vm --privileged -p 3000:3000 alpine:3.22 /bin/sh
# wget -O - https://raw.githubusercontent.com/train360-corp/projdocs/refs/heads/main/install.sh | sh

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


_gen_secret() {
    len="$1"
    : "${len:?length required}"
    LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom 2>/dev/null | head -c "$len"
}

_wait_for_postgres() {
  timeout="${1:-30}"   # seconds
  i=0
  while ! pg_isready >/dev/null 2>&1; do
    i=$((i + 1))
    if [ "$i" -ge "$timeout" ]; then
      echo "Postgres did not become ready within ${timeout}s" >&2
      return 1
    fi
    sleep 1
  done
}

_configure_postgres() {
  _sql_escape() { printf "%s" "$1" | sed "s/'/''/g"; }

  u=$(_sql_escape "${POSTGRES_USER}")
  p=$(_sql_escape "${POSTGRES_PASS}")
  d=$(_sql_escape "${POSTGRES_DB}")

  su - postgres -c "psql -q -X -A -t -v ON_ERROR_STOP=1 -f -" <<SQL
-- ROLE (transaction is fine here)
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${u}') THEN
    CREATE ROLE "${POSTGRES_USER}" LOGIN PASSWORD '${p}';
  ELSE
    ALTER ROLE "${POSTGRES_USER}" PASSWORD '${p}';
  END IF;
END
\$\$;

-- CREATE DATABASE must NOT be inside DO/transaction.
-- Use psql's \gexec to run it conditionally.

SELECT 'CREATE DATABASE _supabase OWNER "${POSTGRES_USER}"'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '_supabase')
\\gexec

SELECT 'CREATE DATABASE "${POSTGRES_DB}" OWNER "${POSTGRES_USER}"'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = '${d}')
\\gexec

-- Ownership (safe)
ALTER DATABASE _supabase OWNER TO "${POSTGRES_USER}";
ALTER DATABASE "${POSTGRES_DB}" OWNER TO "${POSTGRES_USER}";

GRANT ALL PRIVILEGES ON DATABASE _supabase TO "${POSTGRES_USER}";
GRANT ALL PRIVILEGES ON DATABASE "${POSTGRES_DB}" TO "${POSTGRES_USER}";

\\connect _supabase
GRANT ALL ON SCHEMA public TO "${POSTGRES_USER}";
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO "${POSTGRES_USER}";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${POSTGRES_USER}";
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO "${POSTGRES_USER}";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO "${POSTGRES_USER}";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "${POSTGRES_USER}";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO "${POSTGRES_USER}";

\\connect "${POSTGRES_DB}"
GRANT ALL ON SCHEMA public TO "${POSTGRES_USER}";
GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO "${POSTGRES_USER}";
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO "${POSTGRES_USER}";
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO "${POSTGRES_USER}";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO "${POSTGRES_USER}";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "${POSTGRES_USER}";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO "${POSTGRES_USER}";
SQL
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

  _info "configuring system"
  cat > /etc/motd <<'EOF'
ProjDocs, Powered by Alpine
Visit https://github.com/projdocs/projdocs for more information!

EOF
  _run mkdir -p /etc/supabase
  cat > /etc/supabase/runtime.env <<EOF
JWT_SECRET=$(_gen_secret 32)

POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_USER=supabase
POSTGRES_PASS=$(_gen_secret 32)
POSTGRES_DB=supabase

REALTIME_SECRET_KEY_BASE=$(_gen_secret 32)
EOF
  . /etc/supabase/runtime.env

  _info "installing postgres"
  _run apk add postgresql17 postgresql17-contrib postgresql17-openrc
  _run rc-update add postgresql default
  _run env PGDATA="/var/lib/postgresql/17/data" rc-service postgresql start

  _info "configuring postgres"
  _wait_for_postgres 30
  _configure_postgres
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
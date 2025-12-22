#!/usr/bin/env sh
set -e

cmd="${1:-}"
shift || true

echo() { printf '%s\n' "$@"; }

die() { echo "ERROR: $*" >&2; exit 1; }

TOKEN="${TOKEN:-}"
ENDPOINT="${ENDPOINT:-https://data-center.waterview.nicholasrbarrow.com/api2/json}"
AUTH="Authorization: PVEAPIToken=nrb@pam!test=$TOKEN"

_can_connect() {
  code="$(curl -s -o /dev/null -w '%{http_code}' -H "$AUTH" "$ENDPOINT" || echo 000)"
  [ "$code" = "200" ]
}

_do_test() {
  if _can_connect; then
    echo "OK"
  else
    die "FAILED"
  fi
}

_main() {

  # require jq
  command -v jq >/dev/null 2>&1 || die "jq is NOT installed"

  # ensure authentication token is passed
  if [ -z "$TOKEN" ]; then
    die "TOKEN is required"
  fi

  case "$cmd" in
    deploy)

      # get the next available VM ID
      _next_id="$(curl -s -H "$AUTH" "$ENDPOINT/cluster/nextid" | jq --raw-output '.data')"

      # reserve the VM ID and get ip
      _federation_resp=$(curl -s -w "")
      _federation_body="$(printf '%s' "$_federation_resp" | jq .data.ipv4 )"
      [ "$_federation_body" = "null" ] || die "failed to federate: $_federation_body"

      # create the VM
      _resp="$(
        curl -s -w '\n%{http_code}' -H "$AUTH" -X POST \
          --data vmid="$_next_id" \
          --data start=1 \
          --data unprivileged=1 \
          --data-urlencode features="nesting=1" \
          --data password="BADWOLF1" \
          --data ssh-public-keys="" \
          --data-urlencode ostemplate="local:vztmpl/alpine-3.22-default_20250617_amd64.tar.xz" \
          --data-urlencode rootfs="waterview:8" \
          --data cores=2 \
          --data memory=2048 \
          --data swap=2048 \
          --data-urlencode net0="name=eth0,bridge=projdocs,firewall=1,ip=172.16.1.100/32" \
          "$ENDPOINT/nodes/${NODE:-long-drink}/lxc"
      )"
      _body="$(printf '%s' "$_resp" | sed '$d')"
      _code="$(printf '%s' "$_resp" | tail -n1)"

      [ "$_code" = "200" ] || die "LXC create failed (HTTP $_code): $_body"
      _data="$(echo "$_body" | jq --raw-output '.data')"
      echo "Container Created ($_next_id): $_data"

      ;;
    nodes)
      resp="$(curl -s -H "$AUTH" "$ENDPOINT/nodes")"
      echo "$resp" | jq --raw-output '.data[].node'
      ;;
    test)
      _do_test
      ;;
    "")
      die "no command specified"
      ;;
    *)
      die "unknown command: $cmd"
      ;;
  esac
}

_main
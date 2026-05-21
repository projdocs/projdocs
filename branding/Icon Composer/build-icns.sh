#!/usr/bin/env bash
set -euo pipefail

# Always run relative to this script
cd "$(dirname "$0")"

# ---- Config / defaults ----
SRC_DIR="Icon Composer Project Exports"   # folder with exported PNGs
APP_NAME="${1:-ProjDocs}"                 # optional arg 1: output name
ICONSET="${APP_NAME}.iconset"
ICNS="${APP_NAME}.icns"

# Preferred variants to search (ordered)
PREFERRED_VARIANTS=("Default" "ClearLight" "ClearDark" "TintedLight" "TintedDark" "Dark" "Light")

# ---- Find a source PNG (prefer 1024, fallback to 512) ----
pick_src() {
  local v
  for v in "${PREFERRED_VARIANTS[@]}"; do
    # prefer 1024x1024@1x (best for generating all sizes incl. retina 512@2x)
    if SRC="$(/usr/bin/find "$SRC_DIR" -type f -name "*-${v}-1024x1024@1x.png" -print -quit)"; then
      [[ -n "${SRC:-}" ]] && echo "$SRC" && return 0
    fi
    # fallback: 512x512@1x
    if SRC="$(/usr/bin/find "$SRC_DIR" -type f -name "*-${v}-512x512@1x.png" -print -quit)"; then
      [[ -n "${SRC:-}" ]] && echo "$SRC" && return 0
    fi
  done
  return 1
}

SRC="$(pick_src)" || {
  echo "❌ Could not find a 1024x1024@1x or 512x512@1x PNG in \"$SRC_DIR\"." >&2
  exit 1
}

echo "🔎 Source: $SRC"
echo "🎯 Output: $ICNS"

# ---- Build iconset ----
rm -rf "$ICONSET"
mkdir -p "$ICONSET"

# 16/32
sips -z 16 16   "$SRC" --out "$ICONSET/icon_16x16.png" >/dev/null
sips -z 32 32   "$SRC" --out "$ICONSET/icon_16x16@2x.png" >/dev/null
sips -z 32 32   "$SRC" --out "$ICONSET/icon_32x32.png" >/dev/null
sips -z 64 64   "$SRC" --out "$ICONSET/icon_32x32@2x.png" >/dev/null

# 128/256
sips -z 128 128 "$SRC" --out "$ICONSET/icon_128x128.png" >/dev/null
sips -z 256 256 "$SRC" --out "$ICONSET/icon_128x128@2x.png" >/dev/null
sips -z 256 256 "$SRC" --out "$ICONSET/icon_256x256.png" >/dev/null
sips -z 512 512 "$SRC" --out "$ICONSET/icon_256x256@2x.png" >/dev/null

# 512 / 1024
sips -z 512 512 "$SRC" --out "$ICONSET/icon_512x512.png" >/dev/null
# If SRC is 1024x1024, this is a perfect retina 512@2x; if SRC is 512, this copies 512 (still OK)
cp "$SRC" "$ICONSET/icon_512x512@2x.png"

# ---- Build .icns ----
iconutil -c icns "$ICONSET" -o "$ICNS"

# ---- Quick preview (non-blocking) ----
qlmanage -p "$ICNS" >/dev/null 2>&1 &

echo "✅ Created $(pwd)/$ICNS"

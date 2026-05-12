#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

SRC="$ROOT_DIR/catalyst/docs/screenshots"
DEST="$ROOT_DIR/public/img/screenshots"

if [ ! -d "$SRC" ]; then
  echo "Error: $SRC not found. Did you initialize git submodules?" >&2
  echo "Run: git submodule update --init --recursive" >&2
  exit 1
fi

rm -rf "$DEST"
mkdir -p "$(dirname "$DEST")"
cp -rL "$SRC" "$DEST"

# Also copy to src/assets for Astro Image component optimization
ASSETS_DEST="$ROOT_DIR/src/assets/screenshots"
rm -rf "$ASSETS_DEST"
mkdir -p "$(dirname "$ASSETS_DEST")"
cp -rL "$SRC" "$ASSETS_DEST"

echo "✓ Screenshots copied to $DEST"
echo "✓ Screenshots copied to $ASSETS_DEST (for Image optimization)"

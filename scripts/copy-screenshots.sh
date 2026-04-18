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

echo "✓ Screenshots copied to $DEST"

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "→ Initializing submodules..."
git submodule update --init --recursive

echo "→ Configuring sparse checkout (screenshots only)..."
cd "$ROOT_DIR/catalyst"
git sparse-checkout set docs/screenshots
git checkout

echo "→ Copying screenshots to public/img/screenshots..."
cd "$ROOT_DIR"
rm -rf public/img/screenshots
mkdir -p public/img
cp -rL catalyst/docs/screenshots public/img/screenshots

echo "✓ Done. Run 'npm run dev' to start development."

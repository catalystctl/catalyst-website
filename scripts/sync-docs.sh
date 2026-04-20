#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

SRC="$ROOT_DIR/catalyst/docs"
DEST="$ROOT_DIR/src/content/docs"

if [ ! -d "$SRC" ]; then
  echo "Error: $SRC not found. Did you initialize git submodules?" >&2
  echo "Run: git submodule update --init --recursive" >&2
  exit 1
fi

# Ensure destination exists
mkdir -p "$DEST"

# Define mappings: "external_file|dest_subdir|frontmatter_title|description|order"
# Lines starting with # are comments. Empty lines are skipped.
#
# Format: external_filename|destination_path|title|description|order
#   - external_filename: file in $SRC (just the filename)
#   - destination_path: path relative to $DEST (including .md extension)
#   - title: frontmatter title
#   - description: frontmatter description (use "none" to omit)
#   - order: numeric sort order within its section

  # Format: external_filename|destination_path|title|description|order|keywords
  #   - keywords: comma-separated list (optional, use "none" to omit)

MAPPINGS="
getting-started.md|getting-started/getting-started.md|Getting Started|A step-by-step walkthrough for setting up and using Catalyst for the first time.|0|catalyst setup,first server,game server setup,catalyst tutorial
installation.md|getting-started/installation.md|Installation|Complete instructions for deploying Catalyst.|1|catalyst install,docker compose,game server panel install,catalyst deployment
admin-guide.md|admin-guide/admin-guide.md|Admin Guide|All administrative features — users, roles, nodes, templates, backups, security, and more.|0|catalyst admin,user management,server templates,node management,role permissions
user-guide.md|user-guide/user-guide.md|User Guide|Dashboard, servers, console, files, SFTP, backups, scheduling, alerts, and profile settings.|0|catalyst user guide,server console,file manager,SFTP access,server backups
agent.md|nodes/agent.md|Agent Guide|The Rust-based node agent that manages game server containers.|1|catalyst agent,node agent,containerd,rust agent,game server node
api-reference.md|api-reference/api-reference.md|API Reference|Complete reference for the REST API, WebSocket protocol, and SSE streaming.|0|catalyst api,REST API,websocket,SSE streaming,game server API
automation.md|automation/automation.md|Automation & Plugins|Scheduled tasks, webhooks, API automation, bulk operations, and plugins.|0|catalyst automation,scheduled tasks,webhooks,plugins,bulk operations
"

synced=0
skipped=0

while IFS= read -r line; do
  # Skip empty lines and comments
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

  IFS='|' read -r src_file dest_path title description order keywords <<< "$line"

  src_file=$(echo "$src_file" | xargs)  # trim whitespace
  dest_path=$(echo "$dest_path" | xargs)
  title=$(echo "$title" | xargs)
  description=$(echo "$description" | xargs)
  order=$(echo "$order" | xargs)
  keywords=$(echo "$keywords" | xargs)

  full_src="$SRC/$src_file"
  full_dest="$DEST/$dest_path"

  if [ ! -f "$full_src" ]; then
    echo "⚠ Warning: $src_file not found in $SRC — skipping"
    skipped=$((skipped + 1))
    continue
  fi

  # Build frontmatter
  tmp_fm=$(mktemp)
  {
    echo "---"
    echo "title: $title"
    if [ "$description" != "none" ]; then
      echo "description: $description"
    fi
    echo "order: $order"
    if [ -n "$keywords" ] && [ "$keywords" != "none" ]; then
      echo "keywords:"
      echo "$keywords" | tr ',' '\n' | while read -r kw; do
        kw=$(echo "$kw" | xargs)
        [ -n "$kw" ] && echo "  - $kw"
      done
    fi
    echo "---"
  } > "$tmp_fm"
  frontmatter=$(cat "$tmp_fm")
  rm -f "$tmp_fm"

  # Remove the existing first H1 from the source if present (it duplicates the title)
  # We'll strip lines until the first non-empty, non-comment content line that starts with #
  tmp_content=$(mktemp)
  stripped=false
  while IFS= read -r file_line; do
    if ! $stripped && [[ "$file_line" =~ ^#[[:space:]] ]]; then
      stripped=true
      continue
    fi
    echo "$file_line" >> "$tmp_content"
  done < "$full_src"

  # Strip manual Table of Contents blocks (## Table of Contents ... ---)
  tmp_clean=$(mktemp)
  in_toc=false
  while IFS= read -r file_line; do
    if [[ "$file_line" =~ ^##[[:space:]]Table.of.Contents ]]; then
      in_toc=true
      continue
    fi
    if $in_toc && [[ "$file_line" =~ ^---$ ]]; then
      in_toc=false
      continue
    fi
    $in_toc && continue
    echo "$file_line" >> "$tmp_clean"
  done < "$tmp_content"

  # Write destination: frontmatter + content
  mkdir -p "$(dirname "$full_dest")"
  {
    echo "$frontmatter"
    echo ""
    # Skip leading blank lines in content
    sed '/./,$!d' "$tmp_clean"
  } > "$full_dest"

  rm -f "$tmp_content" "$tmp_clean"

  rm -f "$tmp_content"

  # Count words for summary
  word_count=$(wc -w < "$full_src" | xargs)
  echo "✓ $dest_path ($word_count words)"
  synced=$((synced + 1))
done <<< "$MAPPINGS"

echo ""
echo "Synced $synced doc$( [ "$synced" -ne 1 ] && echo "s" ), skipped $skipped"

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
README.md|getting-started/introduction.md|Introduction|What Catalyst is and why it exists — start here.|0|catalyst,introduction,game server panel,overview
QUICKSTART.md|getting-started/quickstart.md|Quick Start|Get Catalyst running in 5 minutes with Docker.|1|catalyst quickstart,docker setup,5 minute install
first-server-tutorial.md|getting-started/first-server.md|Deploy Your First Server|End-to-end tutorial: from node to connected player with Minecraft Paper.|2|catalyst first server,minecraft paper,server creation,tutorial
getting-started.md|getting-started/getting-started.md|Getting Started|A step-by-step walkthrough for setting up and using Catalyst for the first time.|3|catalyst setup,first server,game server setup,catalyst tutorial
installation.md|getting-started/installation.md|Installation|Complete instructions for deploying Catalyst.|4|catalyst install,docker compose,game server panel install,catalyst deployment
INSTALLATION_DETAILED.md|getting-started/installation-detailed.md|Complete Installation Guide|The comprehensive reference for deploying Catalyst — every option, variable, and edge case.|5|catalyst install detailed,docker production,tls https,build from source
docker-setup.md|getting-started/docker-setup.md|Docker Setup|Complete reference for deploying Catalyst with Docker Compose — services, volumes, networking, TLS, and production hardening.|6|catalyst docker,docker compose,volumes,networking,TLS
pterodactyl-migration.md|getting-started/pterodactyl-migration.md|Pterodactyl Egg Migration|Import Pterodactyl eggs into Catalyst as templates.|7|catalyst migration,pterodactyl eggs,template import,nest
admin-guide.md|admin-guide/admin-guide.md|Admin Guide|All administrative features — users, roles, nodes, templates, backups, security, and more.|0|catalyst admin,user management,server templates,node management,role permissions
user-guide.md|user-guide/user-guide.md|User Guide|Dashboard, servers, console, files, SFTP, backups, scheduling, alerts, and profile settings.|0|catalyst user guide,server console,file manager,SFTP access,server backups
agent.md|nodes/agent.md|Agent Guide|The Rust-based node agent that manages game server containers.|0|catalyst agent,node agent,containerd,rust agent,game server node
api-reference.md|api-reference/api-reference.md|API Reference|Complete reference for the REST API, WebSocket protocol, and SSE streaming.|0|catalyst api,REST API,websocket,SSE streaming,game server API
automation.md|automation/automation.md|Automation & Plugins|Scheduled tasks, webhooks, API automation, bulk operations, and plugins.|0|catalyst automation,scheduled tasks,webhooks,plugins,bulk operations
plugins.md|plugins/plugins.md|Plugin System|Extend Catalyst with custom backend routes, frontend UI, scheduled tasks, WebSocket handlers, and data persistence.|0|catalyst plugins,plugin development,plugin SDK,plugin manifest
environment-variables.md|reference/environment-variables.md|Environment Variables|Complete reference for all Catalyst environment variables, grouped by service and category.|1|catalyst env,environment variables,configuration,docker env
architecture.md|reference/architecture.md|Architecture Overview|Deep dive into Catalyst system design, component responsibilities, data flows, and security model.|0|catalyst architecture,system design,data flow,authentication,authorization
troubleshooting.md|reference/troubleshooting.md|Troubleshooting|Common errors, solutions, FAQ, and debugging steps for Catalyst deployments.|2|catalyst troubleshooting,common errors,debugging,FAQ
usage-examples.md|reference/usage-examples.md|Usage Examples|Quick-start copy-paste examples for common Catalyst API operations.|3|catalyst usage examples,API examples,curl examples,server operations
benchmarks.md|reference/benchmarks.md|Benchmarks|Performance comparison between Catalyst and Pterodactyl — HTTP, operations, and scale.|4|catalyst benchmarks,performance,pterodactyl comparison,load testing
egg-migration-audit.md|reference/egg-migration-audit.md|Egg Migration Audit|Audit of egg-to-template migration coverage, gaps, and curation work.|5|catalyst egg migration,audit,templates,pterodactyl eggs
SECURITY.md|reference/security.md|Security Policy|Supported versions, vulnerability reporting, and security best practices.|6|catalyst security,vulnerability reporting,GPLv3,security policy
development.md|development/development.md|Development Guide|Set up a local dev environment, write tests, follow code style, and submit pull requests.|0|catalyst development,contributing,local dev setup,testing,PR process
"

synced=0
skipped=0
mapped_srcs=""

sync_one() {
  local src_file="$1" dest_path="$2" title="$3" description="$4" order="$5" keywords="$6"

  full_src="$SRC/$src_file"
  full_dest="$DEST/$dest_path"

  if [ ! -f "$full_src" ]; then
    echo "⚠ Warning: $src_file not found in $SRC — skipping"
    skipped=$((skipped + 1))
    return
  fi

  # Build frontmatter (YAML-quote title/description so colons don't break parsing)
  tmp_fm=$(mktemp)
  esc_title=$(printf '%s' "$title" | sed 's/"/\\"/g')
  esc_desc=$(printf '%s' "$description" | sed 's/"/\\"/g')
  {
    echo "---"
    echo "title: \"$esc_title\""
    if [ "$description" != "none" ]; then
      echo "description: \"$esc_desc\""
    fi
    echo "order: $order"
    if [ -n "$keywords" ] && [ "$keywords" != "none" ]; then
      echo "keywords:"
      echo "$keywords" | tr ',' '\n' | while read -r kw; do
        kw=$(echo "$kw" | xargs)
        esc_kw=$(printf '%s' "$kw" | sed 's/"/\\"/g')
        [ -n "$kw" ] && echo "  - \"$esc_kw\""
      done
    fi
    echo "---"
  } > "$tmp_fm"
  frontmatter=$(cat "$tmp_fm")
  rm -f "$tmp_fm"

  # Remove the existing first H1 from the source if present (it duplicates the title)
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

  # Count words for summary
  word_count=$(wc -w < "$full_src" | xargs)
  echo "✓ $dest_path ($word_count words)"
  synced=$((synced + 1))
}

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

  mapped_srcs="$mapped_srcs $src_file"
  sync_one "$src_file" "$dest_path" "$title" "$description" "$order" "$keywords"
done <<< "$MAPPINGS"

# Auto-sync any new .md files added upstream that lack an explicit mapping,
# so future docs appear without a script edit. They land in reference/ with
# a title derived from the first H1 and order 99 (end of section).
for candidate in "$SRC"/*.md; do
  [ -f "$candidate" ] || continue
  base=$(basename "$candidate")
  case " $mapped_srcs " in
    *" $base "*) continue ;;
  esac
  slug=$(echo "${base%.md}" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')
  [ -n "$slug" ] || continue
  derived=$(grep -m1 -E '^#[[:space:]]' "$candidate" | sed -E 's/^#[[:space:]]+//' | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//' | cut -c1-80)
  [ -n "$derived" ] || derived="$slug"
  echo "○ Auto-syncing unmapped $base → reference/$slug.md"
  sync_one "$base" "reference/$slug.md" "$derived" "none" "99" "none"
done

echo ""
echo "Synced $synced doc$( [ "$synced" -ne 1 ] && echo "s" ), skipped $skipped"

# Rewrite repo-relative Markdown links (./foo.md, QUICKSTART.md, docs/SECURITY.md)
# to site routes (/docs/...). Without this, in-doc links resolve to
# /docs/<section>/<file>.md which has no route and returns the 404 page.
python3 - "$DEST" <<'PY'
import re
import sys
from pathlib import Path

dest = Path(sys.argv[1])

ROUTES = {
    "readme.md": "/docs/getting-started/introduction/",
    "quickstart.md": "/docs/getting-started/quickstart/",
    "first-server-tutorial.md": "/docs/getting-started/first-server/",
    "getting-started.md": "/docs/getting-started/getting-started/",
    "installation.md": "/docs/getting-started/installation/",
    "installation_detailed.md": "/docs/getting-started/installation-detailed/",
    "docker-setup.md": "/docs/getting-started/docker-setup/",
    "pterodactyl-migration.md": "/docs/getting-started/pterodactyl-migration/",
    "admin-guide.md": "/docs/admin-guide/admin-guide/",
    "user-guide.md": "/docs/user-guide/user-guide/",
    "agent.md": "/docs/nodes/agent/",
    "api-reference.md": "/docs/api-reference/api-reference/",
    "automation.md": "/docs/automation/automation/",
    "plugins.md": "/docs/plugins/plugins/",
    "environment-variables.md": "/docs/reference/environment-variables/",
    "architecture.md": "/docs/reference/architecture/",
    "troubleshooting.md": "/docs/reference/troubleshooting/",
    "usage-examples.md": "/docs/reference/usage-examples/",
    "benchmarks.md": "/docs/reference/benchmarks/",
    "egg-migration-audit.md": "/docs/reference/egg-migration-audit/",
    "security.md": "/docs/reference/security/",
    "development.md": "/docs/development/development/",
}

GITHUB = "https://github.com/catalystctl/catalyst/blob/main"
EXTERNAL_FALLBACKS = {
    "license": f"{GITHUB}/LICENSE",
    "contributing.md": f"{GITHUB}/CONTRIBUTING.md",
}

LINK_RE = re.compile(r'(?<!\!)\[([^\]]+)\]\(([^)\s]+)(\s+"[^"]*")?\)')

def rewrite_url(url: str) -> str | None:
    if not url or url.startswith(("#", "/", "http://", "https://", "mailto:", "tel:")):
        return None
    path, sep, anchor = url.partition("#")
    base = path.rsplit("/", 1)[-1].strip()
    if not base:
        return None
    key = base.lower()
    if key in ROUTES:
        return ROUTES[key] + (sep + anchor if sep else "")
    if key in EXTERNAL_FALLBACKS:
        return EXTERNAL_FALLBACKS[key]
    if key.endswith(".md"):
        return ""  # unknown doc: drop link target so it renders as text
    return None

rewritten = 0
for md in sorted(dest.rglob("*.md")):
    text = md.read_text(encoding="utf-8")
    state = {"changed": False}

    def sub(m: re.Match) -> str:
        label, url, title = m.group(1), m.group(2), m.group(3) or ""
        new_url = rewrite_url(url)
        if new_url is None:
            return m.group(0)
        state["changed"] = True
        global rewritten
        rewritten += 1
        if new_url == "":
            return label
        # Clean labels that were raw filenames (automation.md, docs/SECURITY.md)
        # so the rendered text does not show a file extension.
        if label.strip().lower().endswith(".md"):
            clean = label.strip().rsplit("/", 1)[-1]
            clean = clean[: -len(".md")]
            label = clean or label
        return f"[{label}]({new_url}{title})"

    new_text = LINK_RE.sub(sub, text)
    if state["changed"]:
        md.write_text(new_text, encoding="utf-8")
        print(f"links rewritten in {md.relative_to(dest)}")

print(f"Rewrote {rewritten} doc link(s)")
PY

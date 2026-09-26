---
title: "Manage Game Servers with AI Assistants: Catalyst's MCP Endpoint"
description: "Catalyst can expose itself as an MCP server so AI assistants like Claude and Cursor can manage servers, nodes, files, and backups through the same permission-checked API. Here is how it works and how to use it safely."
pubDate: 2026-09-25
author: "Catalyst Team"
audience: ["businesses", "hosting-providers", "enterprises"]
keywords:
  - game server mcp
  - ai game server management
  - catalyst mcp
  - manage game servers with ai
  - claude game server panel
  - ai assistant server management
  - pterodactyl ai
category: "Product"
faqs:
  - q: "What is MCP in a game server panel?"
    a: "MCP, the Model Context Protocol, is a standard way for AI assistants to call tools on an external system. A panel that exposes MCP lets an assistant listed servers, read resources, send console commands, or create backups by calling defined tools, instead of a human clicking through the dashboard."
  - q: "Does Pterodactyl support MCP or AI assistants?"
    a: "Pterodactyl does not ship an MCP endpoint or a native AI integration. You would build that yourself on top of its Application and Client APIs. Catalyst includes an optional panel-hosted MCP endpoint plus a local MCP server package, both available from version 1.66.1."
  - q: "Is the Catalyst MCP endpoint enabled by default?"
    a: "No. Panel MCP access is off by default and only an administrator can enable it in Admin, then Security. When it is on, the endpoint takes effect immediately without a restart, and you connect an assistant with a dedicated, scoped API key."
  - q: "How many tools does the Catalyst MCP server expose?"
    a: "164 tools, mirroring the panel's REST operations across servers, files, nodes, users, roles, backups, databases, allocations, templates, alerts, and SFTP. The panel-hosted endpoint and the local stdio server expose the same catalogue, so an assistant sees identical coverage either way."
  - q: "Is it safe to let an AI assistant manage game servers?"
    a: "It can be, with least privilege. Use an API key scoped to only the permissions the job needs, keep the per-minute tool budget low, treat destructive tools as requiring explicit confirmation, and revoke the key when done. Catalyst permission-checks and audit-logs every tool call, and never accepts browser session cookies on the endpoint."
  - q: "What can an AI assistant do with the Catalyst MCP server?"
    a: "Read-only work is the safest starting point: list servers, check resource usage, read console logs, inspect files, and report node health. With broader scopes it can start and stop servers, send console commands, manage files, create backups, and administer users, subject to the same permissions as the API key."
  - q: "Do I need to run a separate MCP server for Catalyst?"
    a: "No. The panel can host the MCP endpoint itself at /api/mcp, so there is nothing extra to deploy. A local stdio server package is also published for assistants that prefer a local process, and both expose the same tools against your panel."
---

> **TL;DR:** Catalyst can expose itself as an **MCP server** at `/api/mcp`, letting AI assistants like Claude or Cursor manage servers, files, nodes, and backups through **164 permission-checked tools**. It is **off by default**, takes a scoped API key, and audit-logs every call. Pterodactyl ships no equivalent.

Most panel automation is code you wrote yourself: a billing hook, a Discord bot, a status page. AI assistants add a different mode of working, where you describe an outcome in plain language and the assistant calls the right panel operations to reach it.

Catalyst shipped an MCP endpoint for exactly this, and it is one of the features that landed while this blog was quiet. This post explains what it does, how to set it up, and where the guardrails are.

## What is MCP?

The Model Context Protocol is a standard for exposing tools to AI assistants. An MCP server publishes a catalogue of named tools with typed arguments; an assistant discovers them and calls them in response to a request.

For a game server panel, that means an assistant can answer "which nodes are above 85% memory?" or "restart every server on node 3 that has crashed" by calling real panel operations, not by scraping a dashboard.

## How Catalyst's MCP works

Catalyst offers two ways to expose the same catalogue:

- **Panel-hosted endpoint:** the panel itself serves a Streamable HTTP MCP endpoint at `https://panel.example.com/api/mcp`. Nothing extra to deploy.
- **Local stdio server:** the `@catalyst/mcp-server` package runs as a local process and talks to the panel's REST API, for assistants configured to launch a local server.

Both expose the **same 164 tools**, mirroring the panel's REST operations across servers, files, nodes, users, roles, backups, databases, allocations, templates, alerts, and SFTP. Execution goes back through the panel's own Fastify instance with the caller's API key, so every existing permission check and scoped grant applies. The MCP layer adds no new authorization path.

## Setting it up

1. Create a panel API key for the assistant under your profile, scoped to only the permissions it needs.
2. In the admin area, open **Security** and enable **Panel MCP access**. It takes effect immediately, with no restart.
3. Point your MCP client at `https://panel.example.com/api/mcp` and supply the dedicated key as the Bearer credential.
4. Verify with a read-only call such as `whoami`, then `list_servers`, before granting broader scopes.

Start read-only. An assistant that can list and report is useful and near-harmless; an assistant with delete rights is a different risk category.

## What you can ask it to do

Read-only, safe starting points:

- List all servers and their current state
- Report node memory and CPU pressure
- Fetch the last console lines for a crashing server
- Summarise disk usage across a fleet
- List installed templates or pending alerts

With broader scopes and appropriate caution:

- Start, stop, or restart a specific server
- Send a console command to a server
- Upload, edit, or organise server files
- Create a backup before a change
- Suspend or unsuspend users during a support workflow

The catalogue is broad, so the practical limit is your key's scope, not the tool list.

## The safety model

Catalyst's MCP endpoint is built conservatively:

- **Off by default.** An administrator must enable panel MCP access explicitly.
- **Scoped API keys.** The assistant acts with exactly the permissions of the key it is given.
- **Destructive tools require `confirm: true`.** Delete, reinstall, restore, and ban operations fail with a self-describing error unless the assistant explicitly confirms.
- **Permission-checked and audit-logged.** Every tool call goes through the same checks and audit trail as direct API use.
- **No session cookies.** Browser sessions are never accepted on the endpoint, so it cannot be abused from a logged-in tab.
- **Per-minute tool budget.** You can cap how many calls an assistant may make, which limits runaway loops.

The main new risk is not authorization, it is intent: a capable model with broad scopes can do a great deal quickly. Use a least-privilege key, keep the budget low, and revoke the key when the task is finished.

## Pterodactyl compared

Pterodactyl does not ship an MCP endpoint or a native AI integration. If you want this on Pterodactyl, you build it yourself against the Application and Client APIs, including the tool catalogue, the permission mapping, and the audit story.

Catalyst's advantage here is not that AI is inherently better at running servers. It is that the panel already has the primitives an MCP layer needs: a broad documented API, scoped keys, RBAC, and audit logging. That is why the endpoint could be added without a second authorization system.

## Limits and honest caveats

- **Catalyst is in early testing.** Treat the MCP endpoint as a power-user feature, not a guarantee.
- **Assistants make mistakes.** Use read-only keys for investigation, and require a human for irreversible actions.
- **It is not a monitoring system.** An assistant is not a substitute for alerts and dashboards; it is a way to query and act conversationally.
- **Not every task should be delegated.** Routine automation belongs in a script or plugin where behaviour is deterministic. MCP is for exploration, support, and one-off operations.

## Bottom line

The Catalyst MCP endpoint lets an AI assistant operate a game server panel through 164 permission-checked, audit-logged tools, with a safety model built around scoped keys, explicit confirmation for destructive actions, and no browser-session access. It is disabled until an administrator turns it on.

If you are evaluating panels for automation, compare the API and MCP surface: the [Pterodactyl API guide](/blog/pterodactyl-panel-api-guide/) and the [deployment comparison](/pterodactyl-alternative/#comparison) cover the rest. For the safety basics, see the [2026 Pterodactyl advisory timeline](/blog/pterodactyl-panel-security-advisories/).

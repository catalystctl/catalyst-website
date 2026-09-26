---
title: "Pterodactyl Panel API Guide: Application vs Client API, Keys, and Automation"
description: "How the Pterodactyl API works: the difference between the Application and Client APIs, how to authenticate, the endpoints that matter for automation and billing, and how Catalyst compares."
pubDate: 2026-09-25
author: "Catalyst Team"
audience: ["businesses", "hosting-providers", "enterprises"]
keywords:
  - pterodactyl panel api
  - pterodactyl api key
  - pterodactyl application api
  - pterodactyl client api
  - pterodactyl api automation
  - pterodactyl whmcs integration
  - game server panel api
category: "Developer"
faqs:
  - q: "What is the difference between the Pterodactyl Application API and the Client API?"
    a: "The Application API is the administrative API, authenticated with an admin-created key, and it manages the system: users, nodes, locations, nests, eggs, and servers. The Client API acts as a specific user and manages only the servers that user can access, such as power state, console, files, backups, and schedules."
  - q: "How do I authenticate with the Pterodactyl API?"
    a: "Send the API key as a bearer token in the Authorization header, along with Accept and Content-Type headers set to application/json. Application keys are created in the admin area and can be restricted by IP address; client keys are created by each user from their account page."
  - q: "How do I create a server through the Pterodactyl API?"
    a: "Use the Application API. A server creation request includes the owning user, the node and allocation, resource limits for memory, disk, and CPU, the nest and egg identifiers, the Docker image, the startup command, and any environment variables. The response returns the server identifier and its configuration."
  - q: "Does the Pterodactyl API have rate limits?"
    a: "Yes. The client API default was raised from 128 to 256 requests per minute in v1.12.1. The application API is rate limited as well. Build automation with backoff and queue retries rather than assuming unlimited calls, especially during bulk provisioning."
  - q: "Is there an official Pterodactyl API reference?"
    a: "Pterodactyl publishes API documentation, but the community has historically maintained the more browsable references because the official docs focus on setup. Always treat the running panel's endpoints as authoritative. Catalyst publishes a generated OpenAPI document instead, so its reference cannot drift from the code."
  - q: "Can I use the Pterodactyl API for WHMCS or billing automation?"
    a: "Yes. Billing systems use the Application API to create, suspend, unsuspend, and delete servers when orders and payments change. You need the server's identifier and the owning user, and you should handle failures idempotently so a retried webhook does not create duplicate servers."
  - q: "Is there a Pterodactyl WebSocket API?"
    a: "Yes. The client API returns a WebSocket URL and token for a server's live console, which the panel frontend uses to stream logs and send commands. Reconnecting requires requesting a fresh token rather than reusing an old one."
  - q: "How does the Catalyst API differ from Pterodactyl's?"
    a: "Catalyst exposes a broader HTTP surface, documented as 236 paths and 288 operations in its generated OpenAPI file, with scoped and expiring API keys and RBAC-aware permissions. It also ships an optional MCP endpoint so AI assistants can call the same permission-checked operations."
---

> **TL;DR:** Pterodactyl has two APIs. The **Application API** is admin-level and manages users, nodes, eggs, and servers; the **Client API** acts as one user and controls that user's servers. Both use `Authorization: Bearer <key>`. The client API rate limit rose to **256 requests/minute in v1.12.1**.

The Pterodactyl API is how hosting providers automate provisioning, billing, monitoring, and status pages. It is capable but split in two, and the split is the first thing to understand.

This guide covers both APIs, authentication, the endpoints that matter for automation, and how Catalyst's broader API and optional AI-assistant endpoint compare.

## The two APIs

| | Application API | Client API |
|---|---|---|
| Purpose | System administration | Per-user server control |
| Base path | `/api/application` | `/api/client` |
| Key created by | Admin | Each user |
| Scope | Users, nodes, locations, nests, eggs, servers | Owned servers: power, console, files, backups, schedules, databases |
| Typical caller | Billing system, provisioning service | Panel frontend, user dashboard, bots |

A server's owner rarely needs the Application API; a billing integration rarely needs the Client API. Keeping the two separate is a permission boundary, so do not hand an Application key to anything that only needs to manage one user's servers.

## Authentication

Both APIs authenticate with a bearer token:

```
Authorization: Bearer <api-key>
Accept: application/json
Content-Type: application/json
```

- **Application keys** are created in the admin area and can be restricted by source IP address. Treat them as high-value secrets, scope them narrowly, and never ship one to a browser.
- **Client keys** are created by users from their account page and act with that user's permissions. If a user is deleted or loses access to a server, their key loses that access too.
- **Rotate keys** after staff changes and after security advisories. There is no reason for a provisioning key to live forever.

## Endpoints that matter for automation

**Application API**

- `POST /api/application/servers` creates a server with resource limits, node, allocation, egg, and environment.
- `GET /api/application/servers` lists servers with pagination.
- `POST /api/application/servers/{id}/suspend` and `.../unsuspend` handle non-payment states.
- `DELETE /api/application/servers/{id}` removes a server and frees resources.
- `GET /api/application/nodes` and `/allocations` support capacity-aware placement.
- `GET /api/application/nests/{id}/eggs/{eggId}` retrieves a template's variables and startup.

**Client API**

- `GET /api/client/servers/{id}/resources` returns live CPU, memory, and disk usage.
- `POST /api/client/servers/{id}/power` sends `start`, `stop`, `restart`, or `kill`.
- `GET /api/client/servers/{id}/files/list` and `.../files/contents` handle file access.
- `GET /api/client/servers/{id}/backups` and `POST .../backups` manage backups.
- `GET /api/client/servers/{id}/websocket` returns the console WebSocket URL and token.

Exact paths evolve between releases, so verify against your panel's version rather than a blog post, including this one.

## A billing automation pattern

A typical WHMCS-style flow using the Application API:

1. Customer orders a plan.
2. Provisioning service picks a node with capacity.
3. It calls the server creation endpoint with the plan's limits, egg, and environment.
4. It stores the returned server identifier against the order.
5. On payment failure it suspends the server; on payment it unsuspends; on cancellation it deletes.
6. It polls client resources or subscribes to activity to drive a status page.

Two rules keep this reliable: make every step **idempotent**, so a retried webhook does not create a duplicate server, and respect **rate limits** with backoff and a queue. Bulk provisioning on a tight loop will hit limits and produce partial failures that are painful to reconcile.

## The API reference gap

Pterodactyl's official documentation covers setup and operations well, but the browsable API reference has often been maintained by the community. That creates a real risk: an integration is written against a reference that has drifted from the release running on your panel.

Two habits reduce that risk: generate your own OpenAPI or client from the running panel where possible, and pin integrations to a specific panel version so a panel update does not silently change behaviour under a working billing flow.

## How Catalyst compares

Catalyst's API is broader and ships with a generated reference rather than a hand-maintained one:

- **236 paths and 288 operations** in its generated OpenAPI document, covering servers, nodes, files, backups, users, roles, alerts, databases, templates, and SFTP.
- **Scoped and expiring API keys**, plus RBAC-aware permissions, so a key inherits precise access rather than all-or-nothing admin.
- **An optional MCP endpoint** that exposes 164 panel operations to AI assistants, executed through the same permission checks and audit logging as the REST API.

If your integration only needs to start and stop servers, Pterodactyl's API is sufficient. If you are building a control plane across many tenants with narrow keys and generated documentation, the difference in API surface and permission scoping matters. See the [Pterodactyl alternative comparison](/pterodactyl-alternative/#comparison) for the full table.

## Bottom line

Use the Application API for system-level automation and the Client API for per-user control. Authenticate with scoped bearer keys, respect rate limits, make provisioning idempotent, and verify endpoints against your own panel version.

For where the API fits in a hosting business, read [how to build a game hosting business with Catalyst](/blog/game-hosting-business-with-catalyst/). For the security side of key handling, see the [2026 Pterodactyl advisory timeline](/blog/pterodactyl-panel-security-advisories/).

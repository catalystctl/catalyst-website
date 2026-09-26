---
title: "Pterodactyl vs Pelican vs Catalyst: Which Game Server Panel Should You Use?"
description: "A side-by-side comparison of the three most popular game server panels: Pterodactyl, Pelican, and Catalyst. Architecture, performance, features, and when to pick each one."
pubDate: 2026-05-10
updatedDate: 2026-09-25
author: "Catalyst Team"
audience: ["hobbyists", "businesses", "hosting-providers"]
keywords:
  - pterodactyl vs pelican
  - pterodactyl vs catalyst
  - game server panel comparison
  - pelican panel
  - catalyst vs pterodactyl
  - best game server panel
faqs:
  - q: "Is Pelican a fork of Pterodactyl?"
    a: "Yes. Pelican is a community fork of Pterodactyl, so it shares the same PHP (Laravel) panel, Go Wings daemon, and Docker runtime. The projects differ in governance and roadmap, not architecture, which means Pelican inherits Pterodactyl's strengths and its limitations, including no native plugin API."
  - q: "What is the main difference between Pterodactyl and Pelican?"
    a: "Governance. Both use the same codebase and the same PHP plus Docker-and-Wings architecture. Pelican is maintained by a different team with a community-driven model. If you want a structurally different panel, you need an alternative such as Catalyst rather than a fork."
  - q: "Is Catalyst faster than Pterodactyl?"
    a: "Catalyst has not published a head-to-head benchmark, so treat latency claims with caution. What is verifiable is architectural: Catalyst nodes talk directly to containerd instead of going through the Docker daemon, and the panel is TypeScript on Fastify with PostgreSQL and Redis. Benchmark your own workload before assuming a speed difference."
  - q: "Which game server panel has the best API?"
    a: "Catalyst exposes 200+ API route handlers with bearer-token auth, scoped and expiring API keys, and RBAC-aware permissions, which suits billing and automation integrations. Pterodactyl and Pelican offer a solid REST plus WebSocket API that covers the core server lifecycle but has fewer endpoints and coarser permission scoping."
  - q: "Does Catalyst support Pterodactyl eggs?"
    a: "Yes. Catalyst can import Pterodactyl eggs and convert them into Catalyst templates, transferring startup commands, environment variables, and install scripts. Review eggs that depend on Docker-specific behaviour, because Catalyst game nodes run containerd rather than Docker."
  - q: "Can I switch from Pterodactyl to Pelican?"
    a: "Because Pelican is a fork, migration is closer to an upgrade than an import, and it keeps the same database and Wings node model. Moving from Pterodactyl or Pelican to Catalyst uses the built-in migration tool, which imports nodes, allocations, users, eggs, servers, and files."
---

> **TL;DR:** **Catalyst** is on a different ops model (TypeScript panel + Rust agent + containerd nodes) with native plugins and built-in Pterodactyl import. **Pterodactyl** and **Pelican** are the same PHP + Go Wings + Docker codebase with different teams. Pick Catalyst for containerd-native nodes and extensibility in early testing; Pterodactyl for maturity; Pelican for Pterodactyl governance without migration.

Choosing a game server panel used to be simple: you picked Pterodactyl and moved on. But with Pelican emerging as a fork and Catalyst building an entirely new architecture, you now have a real decision to make.

This comparison sticks to what the code and the docs actually show. We'll look at architecture, performance, features, operations, and ecosystem, so you can pick the panel that actually fits your needs, not just the one with the most GitHub stars. For all alternatives in one place, see our [buyer's guide to every Pterodactyl alternative](/blog/pterodactyl-alternatives-2026/).

## The three contenders

### Pterodactyl: the incumbent

Pterodactyl has been the standard for game server management since the mid-2010s. It's built with PHP (Laravel) on the backend, React on the frontend, and uses Docker for container management via the Wings daemon.

### Pelican: the fork

Pelican is a community fork of Pterodactyl. Same codebase, same architecture, but with a different governance model and development roadmap. It was created as an alternative to Pterodactyl's original maintainer model.

### Catalyst: the different ops model

Catalyst is built from scratch with TypeScript (Fastify, PostgreSQL + Redis) on the panel, TypeScript (React + Vite) on the frontend, and a Rust agent that talks directly to containerd on game nodes instead of Docker. It's not a fork; it's a fundamentally different ops model, currently in early testing.

## Architecture comparison

This is where the real differences live.

| Aspect | Pterodactyl | Pelican | Catalyst |
|--------|-------------|---------|----------|
| Panel | PHP (Laravel) | PHP (Laravel) | TypeScript (Fastify, PostgreSQL + Redis) |
| Frontend | React | React | React + Vite (TypeScript) |
| Container runtime (nodes) | Docker (via Wings) | Docker (via Wings) | containerd (native via Rust agent) |
| Node agent | Wings (Go) | Wings (Go) | Catalyst Agent (Rust, static binary) |
| Database | MySQL/MariaDB | MySQL/MariaDB | PostgreSQL + Redis |
| Maturity | Mature | Growing fork | Early testing |

Pelican and Pterodactyl share the same architecture because Pelican is a fork. Catalyst is the only panel with a fundamentally different node model.

**Why architecture matters:**

- **Panel stack:** Catalyst's panel is TypeScript on Fastify with PostgreSQL and Redis. Pterodactyl is PHP on Laravel. Both need a database and careful ops; neither is zero-maintenance.

- **Docker vs containerd:** Docker is a convenience layer on top of containerd. Catalyst game nodes talk directly to containerd, the same runtime that powers Kubernetes. The panel itself still ships as Docker Compose.

- **Wings vs Rust agent:** Wings (Go) runs on every Pterodactyl node. Catalyst's node agent is a single static Rust binary that talks to containerd, with console, files, SFTP, backups, and metrics.

## What to compare

Skip unverified latency and memory shootouts, since no public benchmark in this repo backs them. Compare what you can verify in code:

| What | Pterodactyl | Pelican | Catalyst |
|--------|-------------|---------|----------|
| Live console | Via Wings | Via Wings | Via panel gateway + Rust agent |
| File access | File manager + SFTP | File manager + SFTP | File manager + SFTP |
| Backups | Local / S3 | Local / S3 | Local / S3-compatible / SFTP |
| Scheduling | Schedules | Schedules | Cron tasks |
| Game templates | Eggs ecosystem | Eggs (compatible) | 167 included, imports Pterodactyl eggs |

Catalyst's advantage is structural (containerd-native nodes, native plugins, 50+ RBAC permissions, 200+ API route handlers), not a published latency number.

**When structure matters:**

- **containerd alignment:** If your nodes already run containerd/Kubernetes tooling, Catalyst nodes fit that model.
- **Large fleets:** If you're running many servers, granular RBAC and API-driven automation matter more than headlines.
- **API-heavy automation:** If you're making many API calls, check the actual route coverage (Catalyst: 200+ handlers across servers, nodes, users, files, backups, plugins).

## Feature comparison

| Feature | Pterodactyl | Pelican | Catalyst |
|---------|-------------|---------|----------|
| API surface | REST + WebSocket | REST + WebSocket | 200+ route handlers |
| Plugin system | No native API | No native API | Yes (hooks, routes, tasks) |
| RBAC granularity | Roles + subusers | Roles + subusers | 50+ granular permissions |
| API key scoping | API keys | API keys | Scoped + expiring |
| Audit logging | Activity logs | Activity logs | Built-in audit logs |
| Built-in migration tool | No | No | Yes (from Pterodactyl) |
| Scheduled tasks | Schedules | Schedules | Cron tasks |

The plugin system is the biggest differentiator. With Pterodactyl or Pelican, if you need custom API routes, new UI components, or integration with external services, you fork the project and maintain a separate codebase. With Catalyst, you write a TypeScript plugin that registers hooks, adds routes, and runs scheduled tasks, all without touching core code.

The RBAC difference matters for hosting providers. Pterodactyl and Pelican give you admin or user. Catalyst lets you create precise roles: "support staff" can restart servers but not delete them; "billing admin" can view allocations but not access consoles; "node operator" can manage their assigned nodes but not others.

## Ecosystem and community

| Aspect | Pterodactyl | Pelican | Catalyst |
|---------|-------------|---------|----------|
| Community size | Large | Medium | Growing |
| Egg/template library | Extensive | Growing (compatible) | Growing (imports Pterodactyl eggs) |
| Third-party themes | Many | Many | New |
| Documentation | Comprehensive | Growing | Comprehensive |
| Commercial adoption | Widespread | Some | Early |

Pterodactyl has the largest community and the most third-party resources. Pelican shares most of that ecosystem since it's a fork. Catalyst is newer but can import Pterodactyl eggs directly, and its plugin system reduces the need for third-party mods.

## When to pick each one

### Choose Pterodactyl if:
- You have a large existing installation and no reason to change
- Your team is deeply experienced with PHP/Laravel
- You rely on specific third-party Pterodactyl themes or mods

### Choose Pelican if:
- You want Pterodactyl's features but prefer Pelican's governance model
- You're starting fresh and want a community-driven alternative to Pterodactyl
- You don't need architectural improvements over Pterodactyl

### Choose Catalyst if:
- You want containerd-native nodes with a TypeScript panel
- You need a plugin system to extend the panel without forking
- You want granular RBAC for precise access control
- You're building automation on a broad API (200+ handlers) and accept early-testing churn
- You want to align with containerd/Kubernetes ecosystem

## Can you switch later?

Yes. Catalyst has a built-in migration tool that imports Pterodactyl (and by extension, Pelican) nodes, allocations, users, eggs, servers, and file data. The migration runs from the admin panel. No manual scripting required.

Check out the [migration guide](/migrate-from-pterodactyl/) for details.

## The bottom line

Pterodactyl and Pelican are the same architecture with different teams. If you want "Pterodactyl but different governance," pick Pelican. If you want a structurally different panel (containerd-native nodes, native plugins, 50+ permissions) and you accept early testing, Catalyst is the one. The [side-by-side comparison](/pterodactyl-alternative/#comparison) tells the full story. Migrating? Our [migration playbook for 50+ servers](/blog/migrate-50-servers-from-pterodactyl/) walks through a real-world rollout.

For the underlying details, read the [panel and Wings requirements](/blog/pterodactyl-panel-requirements/) and the [API guide](/blog/pterodactyl-panel-api-guide/), or start from [what the Pterodactyl panel is](/blog/what-is-pterodactyl-panel/).

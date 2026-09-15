---
title: "Introduction"
description: "What Catalyst is and why it exists — start here."
order: 0
keywords:
  - "catalyst"
  - "introduction"
  - "game server panel"
  - "overview"
---

Welcome to the Catalyst documentation. This is the central index for all guides, references, and technical documentation.

---

## ⚡ Get Running Now

**New to Catalyst?** Pick your path:

| Path | If you... | Start here |
|------|-----------|------------|
| **🚀 Simple** | Want to get running in 5 minutes with Docker | **[QUICKSTART](/docs/getting-started/quickstart/)** |
| **📖 Detailed** | Want to understand every option and edge case | **[INSTALLATION_DETAILED](/docs/getting-started/installation-detailed/)** |

> **Docker is the only supported deployment method.** You need Docker (or Podman) with Compose support. Nothing else required — no Node.js, no Rust, no database setup.

### Simple Path

For most users who just want Catalyst running:

```bash
# One-line install
curl -fsSL https://raw.githubusercontent.com/catalystctl/catalyst/main/install.sh | bash
cd catalyst-docker && nano .env && docker compose up -d
```

Then follow **[QUICKSTART](/docs/getting-started/quickstart/)** → **[Getting Started](/docs/getting-started/getting-started/)** for your first server.

### Detailed Path

For production deployments, custom setups, or when things go wrong:

1. **[INSTALLATION_DETAILED](/docs/getting-started/installation-detailed/)** — Complete install guide with every option
2. **[Docker Setup](/docs/getting-started/docker-setup/)** — Deep dive into Docker Compose, volumes, TLS, networking
3. **[Environment Variables](/docs/reference/environment-variables/)** — Every config variable explained

---

## 📚 All Guides

### Quick Start

| Guide | Audience | Detail Level |
|-------|----------|-------------|
| **[QUICKSTART](/docs/getting-started/quickstart/)** | New users — 5-minute Docker setup | Simple |
| **[Getting Started](/docs/getting-started/getting-started/)** | First-time users — walkthrough after install | Simple |
| **[Deploy Your First Game Server](/docs/getting-started/first-server/)** | First-time users — Minecraft Paper end to end | Simple |
| **[Pterodactyl Migration](/docs/getting-started/pterodactyl-migration/)** | Pterodactyl admins — egg import mapping + compatibility | Medium |
| **[Installation](/docs/getting-started/installation/)** | Devs & ops — full install instructions | Medium |
| **[Installation (Detailed)](/docs/getting-started/installation-detailed/)** | Production deployments — every option covered | Detailed |
| **[Usage Examples](/docs/reference/usage-examples/)** | Everyone — copy-paste API, CLI, and automation snippets | Reference |

### End User Guides

| Document | Description |
|----------|-------------|
| [User Guide](/docs/user-guide/user-guide/) | Game server management: console, files, backups, databases, tasks, SFTP |
| [First Game Server Tutorial](/docs/getting-started/first-server/) | Minecraft Paper walkthrough with verified UI labels |
| [Pterodactyl Migration](/docs/getting-started/pterodactyl-migration/) | Egg import conversion, compatibility table, troubleshooting |
| [Troubleshooting](/docs/reference/troubleshooting/) | Common errors, solutions, and debugging workflows |

### Administration

| Document | Description |
|----------|-------------|
| [Admin Guide](/docs/admin-guide/admin-guide/) | Node deployment, user/role management, templates, monitoring, health checks |
| [Agent Guide](/docs/nodes/agent/) | Deploy and configure the Rust agent on game server nodes (containerd, CNI) |
| [Environment Variables](/docs/reference/environment-variables/) | Complete reference of all 60+ configuration variables with defaults |

### Infrastructure & Deployment

| Document | Description |
|----------|-------------|
| [Docker Setup](/docs/getting-started/docker-setup/) | Docker Compose reference: services, volumes, networking, TLS, health checks |
| [Architecture Overview](/docs/reference/architecture/) | System design, component diagrams, data flow, security model, scaling |

### Developer Resources

| Document | Description |
|----------|-------------|
| [API Reference](/docs/api-reference/api-reference/) | Complete REST API endpoints with request/response schemas |
| [Automation & Plugin Guide](/docs/automation/automation/) | Scheduled tasks, webhooks, API automation, bulk operations, plugins |
| [Development Guide](/docs/development/development/) | Dev environment setup, testing, code style, build process |
| [Plugin System Guide](/docs/plugins/plugins/) | Complete plugin development guide: architecture, SDK, examples, security |
| [Plugin SDK README](/docs/getting-started/introduction/) | SDK package API surface, exports, and scaffolding CLI |

### Security

| Document | Description |
|----------|-------------|
| [Security Policy](/docs/reference/security/) | Security policy, vulnerability reporting, threat model, deployment warnings |

---

## 🏗️ Architecture at a Glance

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Nginx     │────▶│  Fastify    │
│  (React)    │◀────│  (Frontend) │◀────│  (Backend)  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐     ┌──────┴──────┐
                    │  Game Node  │◀────│  WebSocket  │
                    │Rust Agent   │     │   Gateway   │
                    │(containerd)│     └─────────────┘
                    └─────────────┘            │
                                        ┌──────┴──────┐
                                        │ PostgreSQL  │
                                        │   + Redis   │
                                        └─────────────┘
```

---

## 📖 Documentation Conventions

- Code blocks include language tags for syntax highlighting
- `::: tip`, `::: warning`, and `::: danger` admonitions highlight important notes
- All paths are relative to the repository root unless stated otherwise
- Environment variable examples use `bash` syntax

---

## 🛠️ Missing Something?

If you find gaps in the documentation or encounter unclear sections:

1. Check the [Troubleshooting](/docs/reference/troubleshooting/) guide
2. Review the [API Reference](/docs/api-reference/api-reference/) for technical details
3. Open an issue on GitHub with the `documentation` label

---

*Last updated: 2026-09-05 (implementation-verified accuracy pass)

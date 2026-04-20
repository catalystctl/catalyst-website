---
title: Introduction
description: What Catalyst is and why it exists.
order: 0
keywords:
  - catalyst
  - game server management
  - pterodactyl alternative
  - containerd
  - rust
---

Catalyst is a modern game server management platform built to replace Pterodactyl. It provides a full-featured web panel for managing game servers, nodes, users, and more.

## Why Catalyst?

Pterodactyl has been the standard for game server management, but it has limitations:

- **Outdated stack** — Built on older PHP and Node.js patterns
- **Limited API** — Fewer endpoints, less flexibility for automation
- **No plugin system** — Can't extend functionality without forking

Catalyst addresses all of this with a modern architecture.

## Architecture

| Component | Technology |
|-----------|-----------|
| Backend | Rust (Axum) |
| Frontend | TypeScript (React + Vite) |
| Runtime | containerd |
| Database | PostgreSQL |
| Cache | Redis |
| WebSocket | Real-time console streaming |

## Key Features

- **60+ REST API endpoints** for full automation
- **Real-time WebSocket console** with sub-10ms latency
- **RBAC** with 20+ granular permissions
- **Plugin system** for custom API routes and tasks
- **containerd runtime** for superior container performance
- **Automatic crash detection and recovery**

## Status

Catalyst is currently in **early testing**. The core panel, API, and node agent are functional with 25+ admin pages and comprehensive E2E test coverage.

> Want to contribute? Check out our [contributing guide](https://github.com/catalystctl/catalyst/blob/main/CONTRIBUTING.md).

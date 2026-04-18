---
title: Installation
description: Deploy Catalyst with Docker Compose in 60 seconds.
order: 1
---

Catalyst is designed to be easy to deploy. The fastest way is with Docker Compose.

## Prerequisites

- Docker and Docker Compose
- A domain name (optional, for HTTPS)
- At least 2GB RAM

## Quick Start

```bash
git clone https://github.com/catalystctl/catalyst.git
cd catalyst
cp .env.example .env
docker compose up -d
```

That's it. The panel will be available at `http://localhost:8080`.

## Environment Variables

Key variables to configure in your `.env` file:

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_URL` | The public URL of your panel | `http://localhost:8080` |
| `DB_HOST` | PostgreSQL host | `catalyst-db` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `REDIS_HOST` | Redis host | `catalyst-redis` |
| `JWT_SECRET` | Secret for signing JWTs | (required) |

## After Installation

1. Open the panel in your browser
2. Create the first admin account
3. Configure your first node
4. Start deploying game servers

> **Tip:** For production, set up a reverse proxy (Caddy or Nginx) with TLS.

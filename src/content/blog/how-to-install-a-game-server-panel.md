---
title: "How to Install a Game Server Panel in 2026: Pterodactyl vs Catalyst"
description: "A practical walkthrough of installing a game server panel, comparing the manual Pterodactyl and Wings setup with Catalyst's one-command Docker Compose install and Rust agent."
pubDate: 2026-09-25
author: "Catalyst Team"
audience: ["hobbyists", "businesses", "hosting-providers"]
keywords:
  - how to install pterodactyl panel
  - pterodactyl panel install
  - install game server panel
  - game server panel setup
  - pterodactyl wings install
  - catalyst install
category: "Guides"
faqs:
  - q: "How do I install the Pterodactyl panel?"
    a: "Pterodactyl's panel install is manual: install PHP 8.1+, Composer, MySQL or MariaDB, Redis, and Nginx or Apache, download the panel, install its Composer dependencies, run the interactive environment setup and database migrations, create an admin user, then configure the queue worker, cron job, and web server. Each game node then needs Docker and Wings installed and configured separately."
  - q: "How long does it take to install a game server panel?"
    a: "A manual Pterodactyl install typically takes 30 to 60 minutes for the panel and another 15 to 30 minutes per node, depending on your familiarity with PHP, Nginx, and Docker. Catalyst's panel installs with one script that brings up its containers, and each node needs containerd plus the agent, which is usually much faster."
  - q: "Do I need Docker to install a game server panel?"
    a: "Pterodactyl needs Docker on every game node for Wings to run containers. Catalyst uses Docker only on the panel host, where the panel, PostgreSQL, and Redis run as a Compose stack, and uses containerd plus the Rust agent on game nodes. Either way you need a container runtime on the machines that host games."
  - q: "How do I update a game server panel?"
    a: "Catalyst updates the stack files with install.sh --update, or you can run catalyst-docker/update.sh and pull the latest images, and the panel keeps running during the update. Pterodactyl requires pulling the latest panel code, running Composer and database migrations, and updating Wings on every node individually."
  - q: "Can I install a game server panel on Windows?"
    a: "No mainstream game server panel targets Windows as a host. Pterodactyl, Pelican, Catalyst, and PufferPanel all install on 64-bit Linux because they depend on Linux container runtimes, cgroups, and namespaces. Use Ubuntu or Debian on the server and manage it from any browser, including on Windows."
  - q: "What should I do after installing a game server panel?"
    a: "Put the panel behind TLS, keep the database and Redis private, open only the ports you need, create a non-admin support role, configure off-host backups, and test restoring one before you rely on it. Then create a first server from a template and confirm the console, files, and SFTP all work."
---

> **TL;DR:** Pterodactyl's install is manual on two layers: a PHP/Laravel panel with MySQL, Redis, and a web server, then Docker plus Wings on every node. **Catalyst** installs the panel with one script that brings up four containers and pairs each node with a Rust agent and containerd. Both need 64-bit Linux; neither supports Windows as a host.

Installing a game server panel is the step where most people get stuck. The panels themselves are free, but the setup differs enormously between a manual PHP deployment and a panel that ships its own containers.

This guide walks through both paths at a practical level, then gives you a post-install checklist that matters more than the install itself.

## Before you start

Whichever panel you choose, have these ready:

- A 64-bit Linux host (Ubuntu 22.04 or 24.04 LTS is the easiest choice)
- Root or sudo access
- A domain name if you want TLS on the panel
- A plan for ports: the panel web port, the node daemon port, SFTP, and one game port per server
- Enough RAM for the panel stack plus the games you intend to run

If you are still deciding between panels, start with [what the Pterodactyl panel is](/blog/what-is-pterodactyl-panel/) and the [requirements checklist](/blog/pterodactyl-panel-requirements/) so you size the host correctly.

## Installing Pterodactyl

Pterodactyl's install is split into a panel process and a per-node process.

### Phase 1: The panel host

On a fresh Linux host you install and configure, in order:

1. **PHP 8.1+ and its extensions**, plus Composer 2
2. **MySQL or MariaDB** and a database for the panel
3. **Redis**, for queues and caching
4. **Nginx or Apache**, with a server block pointing at the panel's `public` directory
5. **The panel codebase**, followed by Composer dependency installation
6. **Environment setup and database migrations**, run interactively through the panel's CLI
7. **An admin user**, queue worker, and cron job
8. **TLS**, typically via Let's Encrypt

This is a well-documented but manual process. Expect 30 to 60 minutes if things go smoothly, and longer if PHP extensions, file permissions, or the web server configuration fight back.

### Phase 2: Every game node

For each machine that will host games:

1. Install **Docker**
2. Create the node and its allocations in the panel
3. Install and configure **Wings**, the Go node daemon
4. Start the Wings service and verify the node shows as connected
5. Open the node's daemon port, SFTP port, and game ports

Budget 15 to 30 minutes per node, and repeat the Wings update on every node whenever you upgrade. There is no single command that sets up panel and nodes together.

## Installing Catalyst

Catalyst deliberately collapses the setup.

### Step 1: Install the panel

One script handles the panel host:

```bash
curl -fsSL https://raw.githubusercontent.com/catalystctl/catalyst/main/install.sh | bash
```

The installer runs a guided setup, generates secure secrets, writes your `.env`, and brings up four containers through Docker Compose: the frontend, the backend panel, PostgreSQL, and Redis. You set `PUBLIC_URL` to your domain or IP, then start the stack:

```bash
cd catalyst-docker
docker compose up -d
```

Open the panel URL and create your admin account. There is no PHP, Composer, MySQL, Nginx, or Apache to install by hand.

The installer also supports flags that make repeat installs and automation easier:

- `--dry-run` to preview changes
- `--update` to refresh the stack files while keeping your `.env`
- `--reconfigure` to re-run configuration prompts
- `--set KEY=VALUE` and `--env-file FILE` for non-interactive configuration
- `--uninstall` to remove the stack

It can self-verify against a published `INSTALL_SHA256` checksum and pins the Docker repository GPG fingerprint, which is useful when you script deployments.

### Step 2: Add a node

Game nodes run containerd plus the Catalyst agent instead of Docker and Wings. In the panel, register a node and follow the generated instructions to install the agent. The agent is a single Rust static binary: configure it with the panel URL and token, start it, and the node appears online. SFTP is served by the agent itself on port 2022.

## Install effort compared

| Step | Pterodactyl | Catalyst |
|------|-------------|----------|
| Panel dependencies | PHP, Composer, MySQL, Redis, Nginx/Apache | Docker + Compose (script installs the rest) |
| Panel install | Manual, multi-step | One script |
| Panel config | Interactive CLI + web server + TLS | `.env` values, then `docker compose up -d` |
| Node runtime | Docker + Wings | containerd + Catalyst agent |
| Node install | Manual per node | Agent binary + token per node |
| Typical panel time | 30-60 minutes | Minutes |
| Typical node time | 15-30 minutes | Minutes |
| Update path | Manual panel update + Wings per node | `install.sh --update` or `update.sh`, then pull images |

That difference is the point of Catalyst's ops model. If you enjoy tuning PHP and Nginx, Pterodactyl is fine. If you want the panel to be a black box you update with one command, Catalyst is shorter.

## Post-install checklist

The install is not finished when the login page loads. Do these next:

1. **TLS everywhere.** Put the panel behind HTTPS before you create users.
2. **Keep the database and Redis private.** Bind them to localhost or a private network. Never expose MySQL or Redis to the internet.
3. **Open only what you need.** Panel HTTP/HTTPS, node daemon, SFTP, and game ports. Close everything else.
4. **Create roles before users.** Set up a support role that can restart servers but not delete them, using granular permissions rather than admin for everyone. See [granular RBAC](/blog/enterprise-game-server-management/).
5. **Configure off-host backups and test a restore.** Panel-local backups are not a disaster plan. Read the [game server backup guide](/blog/game-server-backup-guide/).
6. **Create a first server from a template**, then verify console, file manager, and SFTP all work end to end.

## Common install problems

- **PHP extension missing:** the panel's setup will complain about a specific extension; install it and re-run.
- **File permissions:** the panel's storage and cache directories must be writable by the web user.
- **Node never connects:** usually a firewall blocking the Wings port, a wrong daemon secret, or a TLS mismatch.
- **cgroup errors on nodes:** old kernels or misconfigured cgroup v2 cause container limit failures.
- **TLS loop after install:** if the panel sits behind a proxy, set the trusted proxy configuration correctly.
- **Forgotten queue worker or cron:** without them, schedules and background jobs silently do nothing.

## Bottom line

Pterodactyl's install is a manual PHP deployment plus a per-node Wings setup. Catalyst's is a one-command panel install plus a single Rust agent per node. Both end in the same place: a web panel managing game servers across one or more machines.

Whichever you install, spend more time on the post-install checklist than on the install itself. TLS, private database access, least-privilege roles, and tested off-host backups are what keep a game hosting setup healthy.

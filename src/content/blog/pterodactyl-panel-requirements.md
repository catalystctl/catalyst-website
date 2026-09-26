---
title: "Pterodactyl Panel Requirements: The Complete Checklist for 2026"
description: "Exactly what the Pterodactyl panel and Wings nodes require: operating systems, PHP and database versions, kernel and container prerequisites, port allocations, and realistic sizing."
pubDate: 2026-09-25
author: "Catalyst Team"
audience: ["hobbyists", "businesses", "hosting-providers"]
keywords:
  - pterodactyl panel requirements
  - pterodactyl system requirements
  - pterodactyl wings requirements
  - pterodactyl server requirements
  - pterodactyl install requirements
  - game server panel requirements
category: "Guides"
faqs:
  - q: "How much RAM does the Pterodactyl panel need?"
    a: "Budget about 1GB of RAM for the panel stack at small scale, covering PHP-FPM, Nginx or Apache, the database, and Redis. A busy panel serving many live consoles benefits from 2GB or more, and the database is usually the first service to separate onto its own host."
  - q: "What PHP version does Pterodactyl require?"
    a: "Pterodactyl's panel needs PHP 8.1 or newer at the time of writing, with the usual Laravel extensions such as cli, fpm, openssl, mbstring, tokenizer, bcmath, xml, ctype, json, curl, zip, mysql, and pdo_mysql, plus Composer 2."
  - q: "What database does Pterodactyl use?"
    a: "Pterodactyl uses MySQL or MariaDB for its data. MySQL 5.7.22 or newer, or MariaDB 10.2 or newer, is required, and MySQL 8 works. Redis is a separate dependency used for queues, caching, and session handling, not as the primary database."
  - q: "What are the Wings node requirements?"
    a: "Each game node needs a 64-bit Linux kernel with cgroup support, Docker, root access, and the Wings daemon. Wings itself is lightweight, around a few tens of megabytes of RAM, but the node must have enough CPU, RAM, and disk for the game servers it hosts."
  - q: "Which ports does a Pterodactyl install need open?"
    a: "The panel needs HTTP and HTTPS (80 and 443). Each node needs the Wings daemon port, typically 8080, and the SFTP port, typically 2022, reachable from the panel, plus one game port per server such as 25565 for Minecraft. Never expose the database or Redis to the internet."
  - q: "Can I run the Pterodactyl panel and Wings on the same machine?"
    a: "Yes, and many hobby installs do. The panel and a node can share one machine as long as Docker, PHP, the database, and Redis coexist within its resources. At hosting scale you separate the panel and database from dedicated game nodes."
  - q: "What are Catalyst's requirements compared with Pterodactyl?"
    a: "Catalyst's panel needs a Linux host with Docker and Docker Compose, which run the panel, PostgreSQL, and Redis as four containers, and installs with one script. Game nodes need containerd plus the Catalyst agent rather than Docker and Wings. There is no PHP, MySQL, Composer, or manual web-server setup."
---

> **TL;DR:** The Pterodactyl **panel** needs Linux with PHP 8.1+, Composer, MySQL 5.7+/MariaDB 10.2+, Redis, and Nginx or Apache, in roughly 1GB of RAM. Each **Wings node** needs 64-bit Linux, root, Docker, and cgroup-capable kernel support, plus one game port per server. [Catalyst](/pterodactyl-alternative/) swaps the panel stack for a one-command Docker Compose install and replaces Wings plus Docker with a Rust agent and containerd.

Before you install a game server panel, you want to know exactly what it needs. Pterodactyl has one of the longer requirement lists of any self-hosted panel because its panel and node layers are separate PHP and Go applications with their own dependencies.

This checklist covers the panel host, the Wings game nodes, networking, and realistic sizing, then compares the requirements with [Catalyst](/pterodactyl-alternative/) so you can plan either path.

## Requirement summary

| Layer | Pterodactyl | Catalyst |
|-------|-------------|----------|
| Panel OS | Linux (Ubuntu, Debian, Rocky, and similar) | Linux |
| Panel runtime | PHP 8.1+ with Laravel extensions, Composer 2 | Docker + Docker Compose (4 containers) |
| Panel dependencies | Nginx or Apache, MySQL 5.7+/MariaDB 10.2+, Redis | PostgreSQL + Redis (bundled in the stack) |
| Panel RAM | ~1GB minimum, 2GB+ recommended | Depends on stack; PostgreSQL and Redis dominate |
| Node runtime | Docker + Wings (Go daemon) | containerd + Catalyst agent (Rust static binary) |
| Node access | root | root for the containerd socket, CNI, and firewall |
| Node kernel | 64-bit with cgroup support | 64-bit Linux with containerd |
| Node daemon | Wings | Catalyst agent |

## Panel host requirements

### Operating system

Pterodactyl is designed for 64-bit Linux. Ubuntu 22.04 or 24.04 LTS and Debian are common, and RHEL-family distributions such as Rocky work with the right repositories. Windows is not a supported panel host; the documented path is Linux.

### PHP and extensions

The panel is a Laravel application, so it needs PHP 8.1 or newer with a specific extension set: `cli`, `fpm`, `openssl`, `mbstring`, `tokenizer`, `bcmath`, `xml` or `dom`, `ctype`, `json`, `curl`, `zip`, `gd`, `mysql`, and `pdo_mysql`. Composer 2 is required to install dependencies. Version numbers move over time, so check the official docs for the current minimum.

### Database

Pterodactyl stores its data in MySQL or MariaDB. MySQL 5.7.22+/8 and MariaDB 10.2+ are supported. This is a hard requirement: unlike Catalyst, there is no PostgreSQL option, and there is no bundled database.

### Redis

Redis is a required companion service for queues, caching, and sessions. It is not the primary database, but the panel will not behave correctly without it.

### Web server

Nginx is the documented default, with Apache as an alternative. You configure TLS with Let's Encrypt or your own certificates. This is manual work: the panel does not ship a web server for you.

### Panel resources

For a small install, plan on about 1GB of RAM for PHP-FPM, the web server, the database, and Redis. A panel managing many nodes and many concurrent console sessions needs more, and the database is usually the first component to move to its own host. Disk needs are modest: the panel stores metadata, not game files.

## Wings node requirements

Nodes are the machines that actually run games, and they have their own prerequisites.

### Linux kernel and architecture

Wings targets 64-bit Linux on x86_64 or arm64. The kernel must support cgroups, and modern 5.x+ kernels with cgroups v2 are preferred. Very old kernels cause container resource-limit problems that are painful to debug.

### Docker

Wings manages Docker containers and needs access to the Docker daemon. That means Docker installed on every node, and root or equivalent access for Wings. It also means the Docker socket exists on each node, which is a root-equivalent interface and a real consideration on multi-tenant hosts.

### Resource sizing

Wings itself is light, on the order of tens of megabytes of RAM. The node's real requirements come from the game servers it hosts. A Minecraft server needs CPU, RAM, and fast disk; a modded server or a large survival world needs substantially more. Add overhead for the OS and Docker, then divide your total capacity by the per-server limits you intend to sell.

### Ports

Each node needs the Wings daemon port open (commonly 8080), the SFTP port (commonly 2022), and one allocation per game server. Your node's IP range and port blocks must be registered with the panel before servers can be created on it.

## Network requirements

| Purpose | Typical port | Notes |
|---------|--------------|-------|
| Panel web UI | 80 / 443 | TLS strongly recommended |
| Wings daemon | 8080 | Must be reachable from the panel |
| Node SFTP | 2022 | For file access |
| Game servers | One per server, e.g. 25565 | Allocated and tracked by the panel |
| MySQL / Redis | 3306 / 6379 | Never expose publicly |

A single public IP works for small installs. Hosting providers usually allocate blocks of ports across multiple IPs so customers can run servers on standard ports.

## Sizing examples

**Hobby install (1-5 servers):** One small VPS or home machine running the panel, database, Redis, and a Wings node. 4-8GB of RAM total is workable for a few Minecraft servers.

**Small host (10-50 servers):** Separate the database from the panel, add one or two game nodes, and give each node RAM based on the server limits you sell. Monitor node memory before it saturates.

**Growing host (100+ servers):** Dedicated panel host, replicated database, multiple nodes, and a plan for backup storage. At this point granular permissions and API automation stop being optional, which is where [granular RBAC](/blog/enterprise-game-server-management/) starts to matter.

## Requirement mistakes to avoid

- **Exposing the database or Redis.** They belong on a private network or localhost only.
- **Ignoring cgroup support.** Container limits silently misbehave on old or misconfigured kernels.
- **Under-sizing the panel.** The database and PHP-FPM compete for RAM with the web server.
- **Forgetting backup storage.** Game files are large; plan S3-compatible or remote storage separately from the panel disk.
- **Skipping TLS.** Sessions and console traffic should never run over plain HTTP.

## Catalyst's requirements, for comparison

Catalyst changes two layers:

- **Panel:** a Linux host with Docker and Docker Compose. The install script brings up four containers (frontend, backend, PostgreSQL, and Redis) and generates secrets. There is no PHP, Composer, MySQL, Nginx, or Apache to install by hand.
- **Nodes:** containerd plus the Catalyst agent, a Rust static binary. Nodes do not run Docker or Wings. The agent serves SFTP itself on port 2022 and talks directly to containerd, so the Docker socket does not exist on game nodes.

Everything else is familiar: 64-bit Linux, root for the container runtime and firewall, and one game port per server.

If you are weighing the two, our [installation walkthrough](/blog/how-to-install-a-game-server-panel/) compares the setup steps, and the [Pterodactyl alternative comparison](/pterodactyl-alternative/#comparison) covers the architecture.

## Bottom line

Pterodactyl's requirements are not unreasonable, but they are broad: a full PHP and Laravel stack with MySQL, Redis, and a web server for the panel, and Docker plus Wings with cgroup-capable kernels on every node. Plan for roughly 1GB of panel RAM, plus node capacity for the games you intend to run, and keep the database and Redis private.

If you would rather not maintain that surface, a panel that ships its own stack and uses containerd on nodes removes several dependencies at once. Either way, size the panel and the nodes separately, and plan backup storage before you need it.

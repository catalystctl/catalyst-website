---
title: "containerd vs Docker for Game Servers: Why the Runtime Matters"
description: "A technical look at why containerd is replacing Docker as the container runtime for game servers. Performance benchmarks, memory overhead comparison, and what this means for hosting providers."
pubDate: 2026-04-05
updatedDate: 2026-09-25
author: "Catalyst Team"
audience: ["enterprises", "hosting-providers", "businesses"]
keywords:
  - containerd vs docker
  - game server container runtime
  - containerd game server
  - docker overhead
  - game server performance
  - kubernetes game server
faqs:
  - q: "Is containerd faster than Docker for game servers?"
    a: "containerd removes the Docker daemon from the critical path, so container start, stop, and restart operations go through fewer layers. Catalyst has not published an independent head-to-head benchmark, so measure container start time and memory on your own hardware and games rather than assuming a multiple."
  - q: "Can containerd run existing Docker images?"
    a: "Yes. containerd runs the same OCI images as Docker, so most game server images work unchanged. The practical exception is Docker Compose-specific behaviour inside a container, which does not apply when the node talks to containerd directly. That affects a small minority of images."
  - q: "Can I run Pterodactyl Docker images on Catalyst's containerd nodes?"
    a: "Yes. Catalyst imports Pterodactyl eggs and converts them into templates, and Pterodactyl's Docker images run under containerd because they are OCI images. Review eggs that depend on Docker-only features or Compose files before moving them to production."
  - q: "Do I need to uninstall Docker to use Catalyst?"
    a: "Game nodes need containerd plus the Catalyst agent, not the Docker daemon. The panel itself ships as a Docker Compose stack with four containers (frontend, backend, PostgreSQL, and Redis), so Docker stays on the panel host and disappears from game nodes."
  - q: "Is Docker still fine for game servers?"
    a: "Yes for small deployments. Under roughly 50 servers per host the daemon overhead is negligible, and Docker remains convenient for development and staging because of its CLI and Compose tooling. The containerd advantage grows with node density and multi-tenant security requirements."
  - q: "What is the security difference between Docker and containerd for game hosting?"
    a: "containerd exposes no user-facing REST API socket, so there is no Docker socket to grant root-equivalent access, and its daemon is a much smaller target. Both runtimes use the same Linux namespaces and cgroups for container isolation, so the difference is the daemon's attack surface, not the isolation mechanism."
---

If you're running game servers in containers, you're probably using Docker. It's the default: every major game server panel (Pterodactyl, Pelican, PufferPanel) uses Docker as its container runtime.

But there's a shift happening. Kubernetes moved to containerd as its default runtime in 2022. Cloud providers are dropping the Docker daemon in favor of containerd. And Catalyst is the first game server panel built directly on containerd, without Docker in the middle.

This article explains the technical differences, benchmarks the performance gap, and helps you decide whether the runtime choice matters for your deployment.

## The container stack, explained

To understand the difference, you need to understand the layers:

### Docker's stack

```
Game Server Process
    ↓
Container (namespace + cgroup)
    ↓
Docker Engine (daemon)
    ↓
containerd (embedded in Docker)
    ↓
runc (OCI runtime)
    ↓
Linux Kernel
```

Docker is a convenience layer on top of containerd. The Docker daemon provides the `docker` CLI, image building, networking, and volume management. Under the hood, Docker uses containerd to actually run containers.

### containerd's stack (Catalyst)

```
Game Server Process
    ↓
Container (namespace + cgroup)
    ↓
containerd (direct)
    ↓
runc (OCI runtime)
    ↓
Linux Kernel
```

Catalyst talks directly to containerd. No Docker daemon, no extra API layer, no extra process. Same underlying container technology, fewer layers of abstraction.

### What this means in practice

Every layer adds:
- **Memory overhead**: Each daemon process uses RAM
- **Latency**: API calls go through more hops
- **Attack surface**: More code running means more potential vulnerabilities
- **Failure points**: More processes that can crash

## Performance: measure your own workload

Docker uses containerd under the hood, while Catalyst's agent talks to containerd directly. Removing a daemon from the game-node path can simplify operations, but it does **not** establish a universal memory or speed advantage. Game-server performance depends on the workload, container configuration, kernel, storage, network, and versions in use.

We have not published a reproducible head-to-head benchmark for these panels. Before planning capacity or estimating hosting revenue, measure daemon memory, per-server memory, cold and warm starts, image pulls, and restart times on your own nodes with matching workloads. Avoid treating architectural differences as guaranteed percentage gains.

## Operational differences

### Process management

**Docker:**
- Requires `dockerd` running as a daemon on every node
- Docker daemon crashes affect all containers on the host
- Updates to Docker require restarting the daemon, which can disrupt running containers
- The Docker socket (`/var/run/docker.sock`) is a privilege escalation risk

**containerd:**
- Single lightweight process (`containerd`) per node
- No daemon-level API that exposes container management to unauthorized users
- Updates to containerd can be done without restarting running containers
- Smaller attack surface: no Docker socket, no REST API on the daemon

### Kubernetes alignment

If you're running or planning to run Kubernetes alongside your game servers (for web services, billing, monitoring, etc.), containerd is the standard runtime. Using containerd for game servers means:

- **Consistent tooling** across your infrastructure
- **Shared operational knowledge**: your team already knows how to manage containerd
- **Easier migration** if you want to run game servers inside Kubernetes in the future

### Image compatibility

Good news: containerd runs the same OCI images as Docker. Your existing Pterodactyl Docker images work with Catalyst's containerd runtime without modification.

The only difference is that Docker Compose-specific configurations (like `docker-compose.yml` inside a container) don't apply to containerd. This affects fewer than 5% of game server images in practice.

## Security comparison

### Attack surface

| Component | Docker | containerd |
|-----------|--------|------------|
| Daemon process | dockerd (~15M lines) | containerd (~2M lines) |
| Exposed API | REST API on socket | gRPC (internal only) |
| Socket permissions | docker group = root equiv | No user-facing socket |
| CVE history (2024-2025) | 12 | 3 |

The Docker daemon is a large, complex piece of software with a REST API that's exposed via a socket. Historically, access to the Docker socket has been equivalent to root access on the host. This is a real security concern for multi-tenant game server deployments.

containerd has a smaller codebase, no user-facing API socket, and fewer historical CVEs. It was designed as a production runtime, not a developer convenience tool.

### Container isolation

Both Docker and containerd use the same Linux namespace and cgroup mechanisms for isolation. The isolation quality is identical; the difference is in the daemon's attack surface, not the container's isolation properties.

## When Docker is fine

Docker isn't bad. For many deployments, it works perfectly well:

- **Small deployments (<50 servers):** The memory overhead is negligible
- **Developer workflows:** Docker's CLI and Compose are convenient for development
- **Non-production environments:** Testing and staging don't need production-grade efficiency

If you're running 10 servers for your community and Docker works, there's no urgent need to switch.

## When containerd is better

The containerd advantage grows with scale:

- **50+ servers per node:** The memory savings add up to real money
- **Multi-tenant hosting:** Smaller attack surface and no Docker socket risk
- **Kubernetes environments:** Consistent runtime across your infrastructure
- **High-churn environments:** 30% faster container start/stop means faster provisioning
- **Security-sensitive deployments:** Fewer CVEs, smaller attack surface

## Catalyst's containerd implementation

Catalyst doesn't just use containerd; it's designed around containerd's strengths:

- **Direct gRPC communication** with containerd for all container operations
- **Per-server namespace isolation** matching Kubernetes best practices
- **Overlayfs snapshots** for efficient image and container storage
- **Resource management** via cgroups v2 for accurate per-server limits
- **No Docker dependency**: the node agent is a single Rust binary that talks to containerd directly

The result is a game server panel that uses less RAM per server, starts containers faster, and has a smaller attack surface than any Docker-based alternative.

## The bottom line

Docker is a developer convenience tool that adds overhead for production workloads. containerd is a production runtime designed for scale. For game server management at any serious scale, containerd is the better choice, and Catalyst is the only panel that uses it natively.

[See how Catalyst's performance compares](/pterodactyl-alternative/#comparison) to Docker-based panels, or [try it yourself](https://docs.catalystctl.com/admin/installation/) with a one-line install. For the compliance and RBAC story that enterprises pair with this, see [enterprise management](/blog/enterprise-game-server-management/).

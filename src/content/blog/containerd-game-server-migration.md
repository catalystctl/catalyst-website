---
title: "Moving Game Servers from Docker to containerd: The Checks That Matter"
description: "A practical migration checklist for moving game workloads from Docker-based nodes to containerd. Covers images, mounts, networking, users, storage, backups, and rollback."
pubDate: 2026-10-07
author: "Catalyst Team"
audience: ["hosting-providers", "developers", "businesses"]
keywords:
  - Docker to containerd migration
  - containerd game servers
  - migrate game server runtime
  - Catalyst containerd
  - Docker game server alternative
category: "Infrastructure"
faqs:
  - q: "Can a Docker game server run on containerd without changes?"
    a: "Sometimes, but not always. The game process may work unchanged while the surrounding template fails because it expects Docker commands, Docker socket access, a particular mount path, or Docker-specific networking behavior. Test the complete lifecycle rather than assuming image compatibility proves migration compatibility."
  - q: "Does Catalyst use containerd for game server nodes?"
    a: "Yes. Catalyst’s node architecture uses a Rust agent that communicates directly with containerd. The panel deployment itself can still use Docker Compose; the distinction is the runtime used on game-server nodes."
  - q: "What should I test during a containerd migration?"
    a: "Test image pulls, startup and shutdown, environment variables, bind mounts, file ownership, ports, console access, SFTP, backups, resource limits, restart behavior, and recovery after a node reboot. Test a representative modded server, not only a fresh vanilla server."
---

A runtime migration is easy to underestimate because the game binary does not know whether it was launched by Docker or containerd. The surrounding assumptions do.

Moving a node is not just “pull the same image somewhere else.” It changes how the agent starts the process, how mounts are described, how resources are enforced, and which operational commands are available to templates.

## Separate the workload from the wrapper

Most game data is portable: world files, configuration, plugins, mods, and server-side databases. The wrapper around that data may not be.

Inventory every place the existing deployment refers to:

- the Docker CLI or Docker socket;
- container names and labels;
- bind-mount paths;
- user and group IDs;
- network names and port publishing;
- Docker health checks;
- privileged mode or extra capabilities;
- image entrypoints and signals.

Anything in that list needs an explicit mapping or removal.

## Test the image, then test the template

An image that starts with `docker run` is not proof that the panel template is portable. Recreate the actual server definition: environment variables, working directory, mounts, ports, user, resource limits, and stop behavior.

Pay attention to the stop signal. Games that save only on a clean shutdown can lose data if the new runtime sends a different signal or if the agent timeout is too short.

## Storage and ownership cause quiet failures

Copying files as root can hide an ownership problem until the game tries to save. After migration, verify that the process can create and modify:

- the world or save directory;
- logs;
- cache and temporary files;
- plugin or mod directories;
- generated configuration;
- backup staging paths.

Test a real save and restart. A server that boots from an existing world but cannot write it is not migrated successfully.

## Networking needs a player test

Check the allocated port from outside the node. Verify IPv4 and IPv6 behavior if you advertise both, and test any query or voice ports separately from the main game port.

Do not validate networking only from the node itself. A local connection can succeed while a firewall, reverse path, or upstream security group blocks players.

## Resource limits are not identical by name

Record the intended CPU, memory, and disk limits before migration. Afterward, confirm both the panel’s displayed values and the process’s observed behavior.

Leave room for the runtime, agent, filesystem cache, updates, and backup work. A limit that looks correct in a panel can still create contention when several servers save at once.

## Backups are your rollback mechanism

Take a fresh backup before stopping the source server. Restore it to the destination as a new test server and compare the world, configuration, plugins, and player data.

For a live migration, the safest sequence is usually:

1. announce a maintenance window;
2. stop the source cleanly;
3. take a final backup or synchronized copy;
4. start the destination with the same allocations and settings;
5. test from a player client;
6. watch logs and resource use;
7. keep the source intact until the acceptance period ends.

Do not decommission the old node because the new server started once.

## A migration acceptance test

- [ ] Server starts from the intended image or template
- [ ] World loads and saves successfully
- [ ] Plugins/mods are present and compatible
- [ ] Console and file access work
- [ ] SFTP works if customers use it
- [ ] Main and secondary ports are reachable externally
- [ ] CPU, memory, and disk limits are enforced as intended
- [ ] Scheduled and manual backups succeed
- [ ] Restart and node reboot behavior are understood
- [ ] Rollback data remains available

Catalyst’s containerd-native agent is useful when you want the node runtime to align with containerd-based infrastructure. The benefit is architectural, not magical compatibility. Treat every imported template as a deployment that deserves a test, especially when it contains Docker-specific commands.

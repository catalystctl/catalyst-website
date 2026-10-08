---
title: "Catalyst vs Pterodactyl 2.0: What Actually Changed?"
description: "A factual comparison of Catalyst and Pterodactyl 2.0's current development build. Learn what Pterodactyl 2.0 changes, what it does not change, and which panel fits your deployment."
pubDate: 2026-10-07
author: "Catalyst Team"
audience: ["hobbyists", "businesses", "hosting-providers", "enterprises"]
keywords:
  - catalyst vs pterodactyl 2.0
  - pterodactyl v2 alternative
  - pterodactyl 2.0 comparison
  - pterodactyl alternative
  - game server panel comparison
  - pterodactyl v2 release
category: "Comparisons"
faqs:
  - q: "Has Pterodactyl 2.0 been officially released?"
    a: "No. As of October 7, 2026, the official Pterodactyl 2.0 documentation says that 2.0 is not released yet. The available 2.0 documentation describes a development version, and the official GitHub releases page lists v1.15.1 as the latest stable panel release."
  - q: "What is Pterodactyl 2.0?"
    a: "Pterodactyl 2.0 is the next major version of the Pterodactyl Panel, currently available for testing from the 2.0-develop branch and its pre-release documentation. It includes a rebuilt frontend, an extension system, tags replacing nests, an Admin API, and updated platform requirements."
  - q: "Does Pterodactyl 2.0 replace Wings?"
    a: "No. Pterodactyl 2.0 continues to use Wings and Docker for game-server nodes. The official requirements documentation says Wings 1.13.2 and 1.13.3 were tested with the 2.0 Panel. Catalyst uses a different node architecture: a Rust agent that communicates directly with containerd."
  - q: "Is Catalyst a fork of Pterodactyl?"
    a: "No. Catalyst is a separate game-server management platform. Its panel uses TypeScript, Fastify, PostgreSQL, and Redis, while its nodes use a Rust agent and containerd. It can import Pterodactyl eggs and provides a documented migration path from Pterodactyl."
  - q: "Should I run Pterodactyl 2.0 in production?"
    a: "The official Pterodactyl documentation labels 2.0 as unreleased and warns that the development version may change. Do not treat it as a stable production release without testing it against your own integrations, themes, extensions, eggs, and upgrade procedure."
  - q: "Which is better, Catalyst or Pterodactyl 2.0?"
    a: "Neither is universally better. Choose Pterodactyl 2.0 if you want to stay in the Pterodactyl ecosystem and are prepared to test a pre-release major version. Choose Catalyst if you want containerd-native nodes, a Rust agent, a TypeScript panel, granular RBAC, native plugins, and a Pterodactyl migration path."
---

> **TL;DR:** Pterodactyl 2.0 is a significant redesign, but it is **not a stable release as of October 7, 2026**. The official documentation describes a development version. Pterodactyl 2.0 keeps the familiar Docker-and-Wings node model, while Catalyst uses a Rust agent and containerd. Choose based on your runtime, extension, upgrade, and support requirements, not on the major-version number alone.

Pterodactyl 2.0 has generated understandable interest: it introduces a new frontend, an extension system, changes to eggs and nests, and an administrative API. That makes it worth evaluating against Catalyst.

It is also important to use precise language. **Pterodactyl 2.0 has not been released as a stable version.** The official [Pterodactyl 2.0 documentation](https://docs.pterodactyl.io/v2) currently warns that 2.0 is not released and that its development documentation may change. The [official GitHub releases page](https://github.com/pterodactyl/panel/releases) currently lists Pterodactyl v1.15.1 as the latest stable panel release.

This comparison separates documented facts from assumptions and compares Catalyst with the Pterodactyl 2.0 development line rather than with a hypothetical final release.

## Pterodactyl 2.0 status: announced development version, not stable

The status affects every operational decision:

| Question | Current answer |
| --- | --- |
| Is Pterodactyl 2.0 stable? | No; the official documentation labels it unreleased and pre-release. |
| What is the stable Pterodactyl line? | The official releases page currently lists v1.15.1 as latest. |
| Can administrators test 2.0? | Yes, from the `2.0-develop` development line and its Docker/source instructions. |
| Should a production panel be upgraded casually? | No. Use a separate test deployment and follow the 2.0 upgrade documentation. |
| Does 2.0 change the node daemon? | No fundamental replacement is documented; 2.0 continues to use Wings and Docker. |

Calling a development build “released” can lead to the wrong upgrade procedure, unsupported assumptions, and accidental downtime. The safe description is **Pterodactyl 2.0 development build** until the project publishes a stable release.

## Quick comparison

| Area | Pterodactyl 2.0 development line | Catalyst |
| --- | --- | --- |
| Release status | Pre-release; official docs say it is not released | Available open-source platform; consult the project release notes for the current version |
| Panel stack | PHP/Laravel with a rebuilt React frontend | TypeScript/Fastify with PostgreSQL and Redis |
| Node runtime | Docker | containerd |
| Node agent | Wings, written in Go | Catalyst Agent, written in Rust |
| Database | MySQL or MariaDB | PostgreSQL |
| Cache/queue | Redis | Redis |
| Extensions | Versioned Pterodactyl extension system | Native TypeScript plugin system |
| Egg organization | Tags replace nests in 2.0 | Catalyst templates; imports Pterodactyl eggs |
| API changes | Adds an Admin API; Client and Application API paths remain | Broad API surface with scoped, expiring API keys and RBAC-aware permissions |
| Migration | Requires the documented 1.x-to-2.0 upgrade process | Built-in Pterodactyl migration workflow |

The most important difference is not React versus React, or PHP versus TypeScript. It is the **node runtime and operations model**: Pterodactyl 2.0 continues to operate through Wings and Docker, while Catalyst communicates directly with containerd through its Rust agent.

## What Pterodactyl 2.0 changes

### 1. A rebuilt frontend and admin area

The official migration documentation says that 2.0 has a rebuilt frontend and a new admin area. Source builds use npm and Vite, and the documented source-build requirement is Node.js 22.12 or newer.

That is a meaningful change for teams with custom themes or modified panel files. The official upgrade guidance says that files changed or added in the 1.x panel directory do not simply carry over. Teams need to rebuild customizations as 2.0 themes or extensions.

### 2. A supported extension model

Pterodactyl 2.0 introduces an extension system intended to avoid editing core panel files for every customization. That improves the upgrade story compared with maintaining local patches, but extension compatibility still needs to be checked across pre-release updates.

Catalyst also has a native plugin model based on TypeScript hooks, routes, and tasks. The practical question is not whether either panel has “plugins”; it is whether the extension API, documentation, permissions, and release process fit your team.

### 3. Nests become tags

Pterodactyl’s official 2.0 migration documentation says that eggs are grouped with tags rather than nests. Existing eggs continue to work, but integrations that call the old nest endpoints need attention:

- `/api/application/nests` endpoints are removed in 2.0.
- Integrations should use egg and tag endpoints instead.
- Billing modules that store nest IDs need to be tested or updated.
- The official WHMCS module has a 2.0-compatible update, according to the migration documentation.

This is an API and data-model change, not just a visual rename.

### 4. New platform requirements

The official 2.0 requirements list PHP 8.3 or 8.4, Composer 2, Redis, and MySQL 8 or 9 or MariaDB 10.11 or 11. The documentation also requires the `intl` PHP extension.

Pterodactyl 2.0 does not switch to PostgreSQL. Catalyst does: Catalyst’s panel stack uses PostgreSQL with Redis, while Pterodactyl’s documented 2.0 requirements remain MySQL/MariaDB plus Redis.

### 5. An Admin API

Pterodactyl 2.0 adds an Admin API at `/api/admin`, used by the new admin area for operations such as managing eggs, tags, settings, and extensions. The official documentation says the Client and Application API paths remain.

That is useful for administration and tooling, but it is not the same architectural choice as replacing the node runtime. Catalyst’s API is designed around its own panel and agent model and adds scoped, expiring API keys and granular permissions for automation.

## What Pterodactyl 2.0 does not change

Several comparisons accidentally imply changes that the official documentation does not support:

- **It does not replace Wings with a Rust agent.** Pterodactyl 2.0 still uses Wings on nodes.
- **It does not replace Docker with containerd as the supported node runtime.** The requirements documentation continues to describe Docker-managed game servers.
- **It does not move the panel to PostgreSQL.** MySQL and MariaDB remain the documented databases.
- **It does not make every 1.x theme or addon compatible automatically.** The upgrade documentation explicitly describes rebuilding customizations.
- **It does not make the development build a stable production release.** The official docs still call it unreleased.

## Catalyst versus Pterodactyl 2.0 by use case

### Choose Pterodactyl 2.0 development if you need ecosystem continuity

Pterodactyl 2.0 is the natural test choice when you already depend on:

- Pterodactyl’s established community and documentation;
- existing Wings nodes and Docker workflows;
- Pterodactyl-compatible billing, automation, or egg tooling;
- the new extension and theme model, after verifying compatibility;
- a willingness to run a pre-release major version in a test environment.

Existing Pterodactyl operators should start with a clone or staging environment. Inventory application API consumers, nest-related endpoints, billing modules, custom themes, edited panel files, database versions, and every extension before planning a production migration.

### Choose Catalyst if you want a different node architecture

Catalyst is the stronger fit when your requirements include:

- containerd-native game-server nodes;
- a Rust node agent rather than Wings;
- a TypeScript/Fastify panel with PostgreSQL;
- granular RBAC for support, billing, and node-operator roles;
- native TypeScript plugins and scheduled tasks;
- scoped and expiring API keys for automation;
- importing Pterodactyl eggs and migrating from an existing Pterodactyl installation.

Catalyst is not a drop-in Wings replacement. A migration should test Docker-specific egg behavior, startup scripts, volumes, networking, backups, SFTP, allocations, integrations, and rollback procedures before moving customer workloads.

## Is Catalyst faster than Pterodactyl 2.0?

There is no responsible universal answer without a controlled benchmark. Catalyst and Pterodactyl 2.0 use different panel and node architectures, so performance depends on the workload, database, node density, game servers, storage, network, and configuration.

The verifiable architectural distinction is that Catalyst nodes communicate directly with containerd, while Pterodactyl 2.0 continues to use Wings and Docker. That may matter for your operations and isolation model, but it should not be presented as a guaranteed latency or memory win without measurements from your fleet.

## Upgrade and migration checklist

Before evaluating either platform for production, answer these questions:

1. Is the target version stable, or is it a development build?
2. Which API endpoints do billing, provisioning, and Discord integrations call?
3. Do any integrations depend on Pterodactyl nests or nest IDs?
4. Are themes, addons, or local core edits part of the current panel?
5. Which database versions and PHP versions are installed?
6. Do your eggs assume Docker-specific behavior?
7. Can you test backups, restores, console access, SFTP, allocations, and server transfers?
8. Do you have a documented rollback and a separate staging environment?

For an existing Pterodactyl installation, compare the official [Pterodactyl 2.0 upgrade documentation](https://docs.pterodactyl.io/v2/upgrading/upgrading-from-v1) with Catalyst’s [Pterodactyl migration guide](/migrate-from-pterodactyl/). They describe different migration models: Pterodactyl 2.0 upgrades the Pterodactyl panel and preserves the Wings model; Catalyst moves workloads to a different panel and node agent.

## Bottom line

Pterodactyl 2.0 is a substantial planned evolution of Pterodactyl, with a rebuilt frontend, extensions, tags, an Admin API, and updated requirements. It is **not yet a stable release**, according to the project’s official documentation.

Catalyst and Pterodactyl 2.0 are therefore not identical alternatives. Pterodactyl 2.0 keeps the Docker-and-Wings foundation while modernizing the panel experience and extension model. Catalyst takes a different route with a TypeScript panel, PostgreSQL, a Rust agent, and containerd-native nodes.

If you want to stay with Pterodactyl’s ecosystem, test 2.0 carefully as it matures. If you want a different runtime and an extensible, API-first platform with a Pterodactyl migration path, evaluate Catalyst against a representative workload. In both cases, verify the current release status before touching production.

### Sources checked

- [Pterodactyl 2.0 documentation](https://docs.pterodactyl.io/v2)
- [Changes from Pterodactyl 1.x](https://docs.pterodactyl.io/v2/upgrading/changes-from-v1)
- [Pterodactyl 2.0 requirements](https://docs.pterodactyl.io/v2/panel/requirements)
- [Pterodactyl GitHub releases](https://github.com/pterodactyl/panel/releases)

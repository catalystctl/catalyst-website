---
title: "How to Update Pterodactyl Panel and Wings Without Breaking Anything"
description: "A safe update procedure for Pterodactyl Panel and Wings: what to back up first, the exact order of operations, version compatibility, rollback, and the errors to expect."
pubDate: 2026-09-25
author: "Catalyst Team"
audience: ["hobbyists", "businesses", "hosting-providers"]
keywords:
  - how to update pterodactyl panel
  - update pterodactyl wings
  - pterodactyl latest version
  - pterodactyl panel upgrade
  - pterodactyl update guide
  - pterodactyl rollback
category: "Guides"
faqs:
  - q: "How do I update the Pterodactyl panel?"
    a: "Put the panel into maintenance mode, back up the database and .env, download the new release into the panel directory, run Composer install with production flags, run database migrations, clear caches, then bring the panel back up and restart the queue worker. Read the release notes for every version you skip, not just the newest one."
  - q: "How do I update Wings on a node?"
    a: "Download the new Wings binary, stop the Wings service, replace the binary, and start the service again. Wings is a single Go binary, so the update is quick, but you must repeat it on every node and verify each one reconnects to the panel before moving on."
  - q: "Do I need to update Wings and the panel at the same time?"
    a: "Usually you should update the panel first, then Wings, and keep them within the versions the release notes consider compatible. Some security fixes span both, such as CVE-2026-54593, which required Panel v1.12.3 and Wings v1.12.2. Leaving Wings far behind the panel is a common cause of node connection problems."
  - q: "What is the latest Pterodactyl version?"
    a: "As of 25 September 2026 the latest panel release on GitHub was v1.15.1, published on 14 August 2026, following v1.15.0 on 3 August 2026. Always confirm against the repository's releases page, because patch releases ship between documentation updates."
  - q: "Will updating Pterodactyl break my eggs or theme?"
    a: "Eggs are data, so they survive a normal update; the risk is an egg whose install script depends on behaviour that changed. Custom themes are the bigger risk, because they patch panel files that a new release may replace. Re-apply theme customisations after updating, or move them into a template or plugin layer where the panel supports it."
  - q: "Can I roll back a Pterodactyl update?"
    a: "A code rollback is possible by redeploying the previous release, but database migrations are the hard part: reverting them may lose data written since the update. That is why a verified database backup before every update is the real rollback plan, not downgrading the code."
  - q: "How often does Pterodactyl release updates?"
    a: "The project shipped ten panel releases between January and August 2026, from v1.12.0 to v1.15.1, with Wings fixes in the same window. Treat security advisories as urgent and routine releases as something to schedule deliberately, such as monthly."
---

> **TL;DR:** Update the **panel first**, then **Wings on every node**. Before either, back up the database and `.env` (especially `APP_KEY`), read the release notes for every version you skip, and test one node before rolling the rest. As of 25 September 2026 the latest panel release was **v1.15.1 (14 August 2026)**.

Updating a game server panel is routine until it goes wrong. A failed Pterodactyl update can take the panel offline, leave nodes disconnected, or lose data if migrations run against an unprotected database. The procedure below is deliberately conservative.

If you have not updated in a while, check the [2026 security advisory timeline](/blog/pterodactyl-panel-security-advisories/) first, because some updates are security fixes rather than feature releases.

## Before you update

1. **Back up the database and `.env`.** The `.env` file holds `APP_KEY`, and losing it makes encrypted data unrecoverable. Test that your database backup restores.
2. **Read the release notes** for every version between the one you run and the target. Skipping releases hides breaking changes and extra migration steps.
3. **Put the panel into maintenance mode** so no one writes data mid-migration.
4. **Announce a window.** Even a clean panel update restarts services, and a Wings update can interrupt consoles.
5. **Update a staging or spare node first** if you have one. It is the cheapest way to find a problem.

## Updating the panel

The exact commands vary slightly by version and installation method, so treat this as the order of operations rather than a copy-paste script:

1. Enter maintenance mode from the panel's artisan CLI.
2. Back up the database and the `.env` file, and copy the current code directory aside.
3. Download the new release archive over the existing code, or check out the tag.
4. Install PHP dependencies with production flags, so dev dependencies are excluded.
5. Run database migrations with force, allowing the schema to move to the new version.
6. Clear and rebuild caches, config, routes, and compiled views.
7. Leave maintenance mode and restart the queue worker so background jobs use the new code.
8. Log in an confirm the panel version, then check that servers and nodes still show correctly.

If you run the panel behind a load balancer or multiple app instances, take them out of rotation one at a time and run migrations once, from a single instance.

## Updating Wings on each node

Wings is a single Go binary, so the mechanics are simple but the repetition is the risk:

1. For each node, download the new Wings binary for its architecture.
2. Stop the Wings service.
3. Replace the binary.
4. Start the service and watch the logs.
5. Confirm the node shows connected and healthy in the panel before moving to the next node.

Do nodes one at a time and keep servers running where the release notes do not require a container restart. If a node fails to reconnect, stop and diagnose before continuing: a systematic problem across nodes is far worse than one broken node.

## Version compatibility

Panel and Wings are separate programs that speak a versioned protocol. Keep them close together, and when an advisory spans both, update both. CVE-2026-54593 is the clearest example: the fix required Panel v1.12.3 and Wings v1.12.2, so updating only one left the other half of the problem in place.

A practical rule: update the panel to the target release, then update Wings to the release published in the same window. If the panel's admin area flags an outdated node, treat it as a warning to act on, not noise.

## Rollback planning

Rolling back code is easy; rolling back a database is not. Once migrations have run and users have written data, a downgrade can lose that data. Plan for rollback like this:

- **Backup is the rollback.** A verified pre-update database dump plus the old code directory is what actually restores service.
- **Snapshot the node** before a Wings update if your infrastructure supports it.
- **Keep the old release** on disk for a few days so a code revert is a directory swap.
- **Do not re-run old migrations** against a newer schema; restore the dump instead.

## Updating Catalyst instead

Catalyst's update path is deliberately shorter, for comparison:

```bash
cd catalyst-docker
./update.sh
# or refresh stack files first:
# install.sh --update
docker compose pull
docker compose up -d
```

The installer supports `--update` to refresh the Compose stack files while preserving your `.env`, and the panel keeps running while images are pulled. Nodes update the Rust agent binary; agent self-updates are serialized and verified. The trade is that Catalyst is younger and in early testing, so read its release notes with the same care.

## Common update problems

- **500 error after updating:** usually a cache or permission problem. Clear caches and check that the storage and cache directories are writable.
- **Node shows disconnected:** usually a Wings version mismatch or a stale node token. Update Wings and restart the service.
- **Migrations fail midway:** restore the database backup and retry with the correct PHP and database versions.
- **Theme broken or missing:** custom themes patch core files that the update replaced. Re-apply them after the update.
- **Queue jobs not running:** the queue worker is still on old code. Restart it after the update.
- **SSL or proxy regressions:** check the trusted-proxy and URL settings after any update that touches request handling.

## Bottom line

Back up and verify restores, read the release notes, update the panel, then update Wings node by node, and confirm each node reconnects. Keep panel and Wings versions close, and treat security releases as urgent.

If you would rather a panel updated itself with fewer manual steps, compare the [installation and update paths for Pterodactyl and Catalyst](/blog/how-to-install-a-game-server-panel/). For the security reasons updates matter, see the [2026 advisory timeline](/blog/pterodactyl-panel-security-advisories/).

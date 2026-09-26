---
title: "How to Back Up Game Servers: A Practical Guide for Hosts and Hobbyists"
description: "A complete game server backup strategy: what to back up, where to store it, how often, how to encrypt credentials, and how to test restores before you need them."
pubDate: 2026-09-25
author: "Catalyst Team"
audience: ["hobbyists", "businesses", "hosting-providers", "enterprises"]
keywords:
  - game server backup
  - minecraft server backup
  - pterodactyl backup
  - game server backup strategy
  - s3 game server backup
  - server backup automation
category: "Operations"
faqs:
  - q: "How often should I back up a game server?"
    a: "For an active community, daily backups are the sensible default, with a manual backup before any risky change such as a mod update, a world edit, or a version upgrade. Servers with high-value progression or economy data benefit from more frequent snapshots and a longer retention window."
  - q: "Where should game server backups be stored?"
    a: "Store at least one copy off the node that runs the server. S3-compatible object storage is the usual choice, and Catalyst also supports SFTP targets and streamed archives. Keeping a local copy as well gives you fast restores, but a node failure must never take the only backup with it."
  - q: "Does Pterodactyl support backups?"
    a: "Yes. Pterodactyl can create server backups to local storage or to S3-compatible object storage, and it schedules them through the panel. You configure the backup limits and retention yourself, and restore is available from the panel or API."
  - q: "How does Catalyst handle game server backups?"
    a: "Catalyst supports four backup storage modes: local, S3-compatible, SFTP, and stream. Credentials for remote targets are encrypted at rest with AES-GCM, backups can be scheduled per server, and retention is configurable. Restore and download are permission-checked, so a role can be allowed to back up without being allowed to delete."
  - q: "Are game server backups encrypted?"
    a: "They should be, at least in transit and ideally at rest. Catalyst encrypts stored backup credentials with AES-GCM and can stream an encrypted backup directly to its target, so the archive never sits unencrypted on the node. For S3 targets, enable bucket-side encryption as well."
  - q: "How do I test a game server backup?"
    a: "Restore it to a throwaway server and actually join it. Check the world loads, plugins and mods are present, permissions are intact, and the console starts cleanly. An untested backup is a guess; test restores on a schedule, not just once."
---

> **TL;DR:** Back up the **world or save data, configs, plugins or mods, and any server-side databases**, store at least one copy **off the node**, keep several generations, and **test a restore** before you rely on it. Pterodactyl backs up to local or S3 storage. [Catalyst](/pterodactyl-alternative/) adds SFTP and stream targets, AES-GCM-encrypted credentials, configurable retention, and permission-gated restores.

Game servers accumulate irreplaceable data: built worlds, player progression, economies, plugin databases, and years of community history. Hardware fails, mods corrupt worlds, and players occasionally delete the wrong thing. A backup strategy is the difference between a bad afternoon and a dead community.

This guide covers what to back up, where to put it, how to automate it, and how to verify it actually works, with notes on how Pterodactyl and [Catalyst](/blog/pterodactyl-vs-pelican-vs-catalyst/) handle backups.

## What to back up

A complete game server backup includes more than the world folder:

| Data | Why it matters |
|------|----------------|
| World / save data | The irreplaceable part: builds, progression, terrain |
| Server configuration | `server.properties`, `config/`, whitelist, ops |
| Plugins and mods | Exact versions matter for compatibility |
| Plugin databases | LuckPerms, economy, quest, and region data |
| Startup environment | Template variables, JVM flags, startup command |

Backing up only the world is a common mistake. If a restore loses your plugin versions or permissions database, players notice immediately.

Some panels also let you back up the whole server directory, which is simpler and safer for consistency, at the cost of size.

## Where to store backups

Follow one rule above all others: **a backup on the same node as the server is not a backup.** Node disk failure, ransomware, or an accidental deletion can take both.

Common targets:

- **Local storage** on the panel or a mounted volume: fast to restore, weak against host failure.
- **S3-compatible object storage**: the standard offsite target. AWS S3, Cloudflare R2, Backblaze B2, Wasabi, Google Cloud Storage, and self-hosted MinIO all work.
- **SFTP**: a remote server you control, useful when you already have NAS or backup infrastructure.
- **Streamed archives**: write the archive directly to the target without staging it on the node first, which saves node disk during large backups.

A practical pattern is **local for speed plus remote for safety**: keep a recent local copy for fast restores, and a remote copy for disasters, with more generations retained remotely.

## How often, and how many

Backup frequency is a trade between recovery point, cost, and load:

- **Hobby servers:** daily is plenty, plus a manual backup before updates.
- **Active communities:** daily or twice daily, with longer retention.
- **Commercial hosting:** per-plan schedules, customer-triggered backups, and a retention policy you can explain in your terms of service.

Retention matters as much as frequency. Keep enough generations to recover from a problem you did not notice immediately, such as a corrupted chunk discovered three days later. A common policy is seven daily backups plus four weekly ones.

## Encryption and credentials

Backup targets need credentials, and credentials leak when stored carelessly. Two things to get right:

1. **Encrypt stored credentials at rest.** Catalyst encrypts backup credentials with AES-GCM and refuses to store them in plaintext in production.
2. **Prefer encryption in transit and at rest.** Streamed backups can be encrypted before they leave the node, and S3 buckets should have server-side encryption enabled. Never send backups over plain FTP or unencrypted HTTP.

Also scope the credentials. A backup key should be able to write to one bucket or prefix, not administer your whole cloud account.

## Automating backups

Manual backups get skipped. Automate them:

- **Schedule per server**, not one global schedule, so a busy server and an idle one can differ.
- **Back up before risky operations**, such as game version updates or large mod changes.
- **Alert on failure.** A silently failing backup job is worse than no job, because it creates false confidence.
- **Include backups in your monitoring**, with disk and object-storage usage watched so you are not surprised by limits.

Pterodactyl schedules backups through the panel with local or S3 targets and configurable limits. Catalyst supports scheduled backups across local, S3, SFTP, and stream targets, with retention and permission-gated restore, so a support role can trigger a backup without gaining delete rights.

## Restoring: the part everyone forgets

An untested backup is a guess. Make restore testing routine:

1. Restore the backup to a **throwaway server**, never over production first.
2. Confirm the world loads and the console starts without errors.
3. Check plugins, mods, and permission databases are present and working.
4. Join the server as a player and verify the actual experience.
5. Record how long the restore took, because that is your real recovery time.

Run this periodically, and always after changing your backup configuration. Restore is also a permission worth separating: an operator who can restore does not necessarily need delete rights.

## A backup checklist

- [ ] World or save data covered
- [ ] Configs, plugins, mods, and plugin databases covered
- [ ] At least one copy off the node
- [ ] Credentials encrypted and least-privilege scoped
- [ ] Schedule set per server, with a pre-update manual backup habit
- [ ] Retention long enough to catch delayed corruption
- [ ] Failure alerts wired into your monitoring
- [ ] Restore tested recently on a throwaway server
- [ ] Restore permission separated from delete permission

## Panel comparison

| Capability | Pterodactyl | Catalyst |
|------------|-------------|----------|
| Local backups | Yes | Yes |
| S3-compatible | Yes | Yes |
| SFTP target | No | Yes |
| Streamed archive | Limited | Yes |
| Credential encryption | Depends on setup | AES-GCM at rest |
| Retention policy | Manual/limited | Configurable |
| Permission-scoped restore | Coarse | Granular |

Pterodactyl's backup support is solid for most deployments. Catalyst's additions matter most to hosts who need offsite targets beyond S3, encrypted credentials by default, and access control that separates backing up from deleting.

## Bottom line

Back up more than the world, store a copy somewhere other than the node, automate it per server, encrypt the credentials, and test restores on a schedule. Do those five things and you will survive the failures that end communities.

If you are choosing a panel and backups are central to your operations, compare how each handles targets, encryption, retention, and restore permissions, then test a restore in your own environment before trusting either.

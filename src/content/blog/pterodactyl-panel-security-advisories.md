---
title: "Pterodactyl Panel Security Advisories in 2026: Every CVE and How to Patch"
description: "A dated, sourced timeline of Pterodactyl Panel releases and 2026 CVEs — CVE-2026-26016, CVE-2026-54593, CVE-2026-61609, CVE-2026-86177 — with affected and fixed versions, plus a hardening checklist."
pubDate: 2026-09-25
author: "Catalyst Team"
audience: ["businesses", "hosting-providers", "enterprises"]
keywords:
  - pterodactyl panel vulnerability
  - pterodactyl panel security
  - pterodactyl 2026 cve
  - CVE-2026-26016
  - CVE-2026-54593
  - CVE-2026-61609
  - CVE-2026-86177
  - pterodactyl panel update
category: "Security"
faqs:
  - q: "Is Pterodactyl still maintained in 2026?"
    a: "Yes. Pterodactyl Panel shipped releases from v1.12.0 (6 January 2026) through v1.15.1 (14 August 2026), which is eight releases in roughly eight months, and Wings received fixes alongside them. Claims that the project is in maintenance mode are out of date; check the GitHub releases page for the current tag."
  - q: "What CVEs affected Pterodactyl Panel in 2026?"
    a: "The notable public advisories are CVE-2026-26016 (fixed in v1.12.1), CVE-2026-54593 (improper JWT scoping in Wings upload, fixed in Panel v1.12.3 and Wings v1.12.2), CVE-2026-61609 (shared login rate-limit bucket causing panel-wide auth lockout, fixed in v1.13.0), and CVE-2026-86177 (scheduled-task permission escalation, fixed in v1.14.1)."
  - q: "Is CVE-2026-26016 fixed?"
    a: "Yes. CVE-2026-26016 was fixed in Pterodactyl Panel v1.12.1, released on 14 February 2026. That release scoped remote node access tokens so a node can only reach servers belonging to the same node, and also revoked SFTP sessions when a user changes their password or is deleted."
  - q: "Do I need to rotate node tokens after patching Pterodactyl?"
    a: "Rotate node tokens as a precaution after applying the v1.12.1 fix and any Wings update, because the issue involved node access-token scope. Also rotate any API keys and panel secrets you have reason to believe were exposed, and review audit and activity logs for unexpected node-to-server access."
  - q: "How do I know which Pterodactyl version I am running?"
    a: "The panel version is shown in the admin area and in the footer, and it is also available from the panel's own API and the `php artisan` version output. For Wings, run the Wings binary with its version flag or check the node's systemd unit output. Compare both against the fixed versions in the advisory table."
  - q: "How does Catalyst handle security differently?"
    a: "Catalyst is not Pterodactyl and does not inherit these CVEs, but it has its own hardening work: salted HMAC API-key hashing, central secret redaction, SSE and console subscribers bound to the authenticated user, SFTP token timeouts with revalidation, symlink-safe path checks, AES-GCM backup encryption, and verified agent self-updates. Review the source and run your own assessment before production."
  - q: "Should I move off Pterodactyl because of these CVEs?"
    a: "Not on CVE count alone. Pterodactyl remains actively maintained and patched, and some advisories affect only subusers or specific configurations. Patch fully, reduce subuser permissions, and subscribe to Pterodactyl's security advisories. If you need granular, auditable permissions as a first-class feature rather than a bolt-on, that is a separate architectural decision."
---

> **TL;DR:** Pterodactyl Panel was **actively maintained in 2026**, shipping v1.12.0 through v1.15.1 between January and August. Four public advisories matter: **CVE-2026-26016** (fixed v1.12.1), **CVE-2026-54593** (Wings JWT scoping, fixed Panel v1.12.3 / Wings v1.12.2), **CVE-2026-61609** (login rate-limit lockout, fixed v1.13.0), and **CVE-2026-86177** (scheduled-task escalation, fixed v1.14.1). Patch the panel and Wings together, then rotate tokens.

*Last updated: 25 September 2026. Verified against the Pterodactyl GitHub release history and public advisory data. Check the official security advisories page for changes after this date.*

Security content about a project you rely on should be dated and sourced, so this page keeps a timeline rather than opinions. If you run Pterodactyl Panel, you should know exactly which advisories affect which versions and what to do about them.

## Is Pterodactyl still maintained in 2026?

Some comparison articles still describe Pterodactyl as abandoned or in maintenance mode. The release history does not support that. Panel releases in 2026:

| Version | Released | Notable fixes |
|---------|----------|---------------|
| v1.12.0 | 6 Jan 2026 | CVE-2025-68954, CVE-2025-69197, CVE-2025-69198 |
| v1.12.1 | 14 Feb 2026 | CVE-2026-26016; node token scoping; SFTP session revocation |
| v1.12.2 | 26 Mar 2026 | Task chain dispatch, server transfer permission checks, Docker image fixes |
| v1.12.3 | 23 May 2026 | Email-change rate limit; JWT scope now required |
| v1.12.4 | 30 May 2026 | Locking fix for resource creation |
| v1.13.0 | 15 Jun 2026 | API key overflow, admin API layout, maintenance status |
| v1.14.0 | 22 Jun 2026 | Release train |
| v1.14.1 | 29 Jun 2026 | Release train |
| v1.15.0 | 3 Aug 2026 | MariaDB migration fix, Compose v2 command |
| v1.15.1 | 14 Aug 2026 | Reinstall action gated by skip-install-scripts setting |

That is a steady cadence, and Wings receives security fixes in the same window. Treat any "Pterodactyl is dead" claim as a signal to check the repository rather than the blog post.

## The 2026 Pterodactyl CVE timeline

| CVE / advisory | Type | Affects | Fixed in |
|----------------|------|---------|----------|
| CVE-2026-26016 | Node access-token scope | Panel before v1.12.1 | Panel v1.12.1 |
| CVE-2026-54593 | Improper JWT scoping in Wings upload | Panel before v1.12.3, Wings before v1.12.2 | Panel v1.12.3 / Wings v1.12.2 |
| CVE-2026-61609 | Shared rate-limit key, auth lockout DoS | v1.7.0 up to v1.13.0 | Panel v1.13.0 |
| CVE-2026-86177 | Scheduled-task permission escalation | Panel before v1.14.1 | Panel v1.14.1 |

Older advisories fixed in the same period: CVE-2025-68954, CVE-2025-69197, and CVE-2025-69198, all fixed in v1.12.0 on 6 January 2026.

## What each advisory means

### CVE-2026-26016 — node token scope

Fixed in Panel v1.12.1. The release scoped remote node access tokens so a node can only reach servers that belong to the same node. Previously, a node could access information and control the installation status of any server in the system. The same release began revoking SFTP sessions when a user changes their password or their account is deleted, and raised the default client API rate limit from 128 to 256 requests per minute.

**Action:** Update the panel to at least v1.12.1, then rotate node tokens as a precaution and review node activity in your logs.

### CVE-2026-54593 — Wings JWT scoping

The Wings `/upload/file` endpoint accepted any valid panel-signed JWT containing `server_uuid`, `user_uuid`, and `unique_id` claims without checking the token's intended purpose. Because the panel issues JWTs with those same claims for lower-privilege operations such as WebSocket authentication and backup downloads, an authenticated subuser could replay a token to upload files without holding the `file.create` permission.

**Affects:** Pterodactyl Panel before v1.12.3 and Wings before v1.12.2.
**Action:** Update both the panel and Wings, because the fix spans them. Then review subuser file permissions and audit logs for unexpected uploads.

### CVE-2026-61609 — authentication rate-limit lockout

From v1.7.0 until v1.13.0, the authentication rate limiter in `RouteServiceProvider::configureRateLimiting()` applied a single global bucket to the login and two-factor checkpoint endpoints instead of keying by IP address or account. Because the bucket was shared panel-wide, an unauthenticated attacker could exhaust it and lock every user out of authentication, including administrators.

**Affects:** v1.7.0 up to v1.13.0.
**Action:** Update to at least v1.13.0. This is a denial of service, not data exposure, but a panel-wide login lockout is operationally severe for a hosting business.

### CVE-2026-86177 — scheduled-task permission escalation

Pterodactyl Panel before v1.14.1 failed to validate action-specific permissions when creating scheduled tasks. A subuser with only the `schedule.update` permission could create a task, immediately trigger it, and run game-server console commands, change server power state, or create backups beyond their assigned authority.

**Affects:** Panel before v1.14.1.
**Action:** Update to at least v1.14.1 and review which subusers hold schedule permissions. Consider removing scheduled-task rights from anyone who does not need them.

## How to patch Pterodactyl safely

1. **Back up first:** database and `.env` at minimum, and confirm the backup restores. Losing `APP_KEY` makes encrypted data unrecoverable, so treat that file as critical.
2. **Read the release notes** for every version between yours and the target, not just the latest.
3. **Update the panel:** pull the new release, install Composer dependencies, run migrations, and restart the queue worker.
4. **Update Wings on every node.** Panel and Wings fixes sometimes land together, as with CVE-2026-54593.
5. **Rotate secrets as warranted:** node tokens, API keys, and any credentials tied to the affected subsystem.
6. **Review logs** for the activity each advisory describes, such as subuser uploads or unexpected scheduled tasks.
7. **Subscribe to advisories** so you hear about the next one from the project rather than from a news site.

Keep panel and Wings versions aligned where the advisory spans both, and remember that third-party themes, addons, and billing modules can reintroduce risk even on a patched core.

## Hardening checklist

- [ ] Panel and Wings on patched versions, tracked against the table above
- [ ] Subusers limited to the permissions they actually need
- [ ] Scheduled-task permissions granted sparingly
- [ ] Node tokens and API keys rotated after a security release
- [ ] `APP_KEY` backed up separately from the database
- [ ] TLS on the panel, database and Redis private
- [ ] Wings daemon port restricted to the panel host where possible
- [ ] Audit/activity logs retained and reviewed
- [ ] Advisories and release notes monitored

## Catalyst's take

*This section is vendor perspective, not part of the neutral timeline.*

Catalyst is a different codebase, so it does not inherit the Pterodactyl CVEs above. During a single hardening wave on 10 September 2026 it shipped a set of related fixes: salted HMAC hashing for API keys, central redaction of secrets in logs, console and metrics subscribers bound to the authenticated user, SFTP token timeouts with heartbeat revalidation, secure cookie policy, symlink-safe path handling, AES-GCM streaming for backup encryption, and serialized, verified agent self-updates. Permission catalog enforcement was tightened afterward to close authorization bypasses.

None of that makes Catalyst automatically safer than a fully patched Pterodactyl; it is a younger project in early testing. The relevant difference is architectural: permissions, audit logging, and scoped API keys are first-class features rather than add-ons, which makes least-privilege operation easier to sustain. Review the source and run your own security assessment either way.

## Bottom line

Pterodactyl is maintained, and its 2026 advisories are patchable. Update the panel and Wings to the fixed versions in the table, rotate node tokens after CVE-2026-26016 and CVE-2026-54593, tighten subuser and scheduled-task permissions, and subscribe to the project's advisories.

If you are evaluating panels on security architecture, compare how each handles granular permissions and audit logging, and read [granular RBAC for game server panels](/blog/enterprise-game-server-management/) alongside this page. For the runtime and isolation layer, see [containerd vs Docker for game servers](/blog/containerd-vs-docker-game-servers/).

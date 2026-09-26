---
title: "Fix Pterodactyl Panel Errors: 500, 502, Red Heart, and Invalid MAC"
description: "A troubleshooting guide for the most common Pterodactyl Panel problems: where to find the real error, what each symptom means, and the fix for node, proxy, SSL, and database failures."
pubDate: 2026-09-25
author: "Catalyst Team"
audience: ["hobbyists", "businesses", "hosting-providers"]
keywords:
  - pterodactyl panel not working
  - pterodactyl panel 500 error
  - pterodactyl node not detected
  - pterodactyl red heart
  - pterodactyl panel error connecting to node
  - pterodactyl invalid mac
  - pterodactyl troubleshooting
category: "Troubleshooting"
faqs:
  - q: "Why does my Pterodactyl node show a red heart?"
    a: "A red heart means the panel cannot reach Wings. Check that the Wings service is running on the node, that the node's daemon port is reachable from the panel, that the node token matches the one in the panel, and that TLS certificates on Wings are valid and trusted. The Wings journal usually names the exact failure."
  - q: "How do I fix a Pterodactyl 500 error?"
    a: "Open the Laravel log in the panel's storage/logs directory and read the actual exception rather than guessing. Common causes are wrong file permissions on storage and cache, a failed or pending database migration, and a cache holding stale configuration. Fix the logged cause, then clear caches."
  - q: "Why can't the panel connect to Wings?"
    a: "The usual reasons are a firewall blocking the Wings port, a node token mismatch after reinstalling Wings, Wings listening on a different interface or port than configured, and certificate errors when Wings uses HTTPS. Confirm the port is open from the panel host and check the Wings service logs."
  - q: "What ports does Pterodactyl need open?"
    a: "The panel needs HTTP and HTTPS (80 and 443). Each node needs the Wings daemon port, commonly 8080, and the SFTP port, commonly 2022, reachable from the panel, plus one game port per server such as 25565. Never expose the database or Redis to the internet."
  - q: "Why do I get an invalid MAC error in Pterodactyl?"
    a: "An invalid MAC error means encrypted data cannot be decrypted with the current APP_KEY, which happens when the encryption key changed or a database was restored without its matching .env. Restore the original APP_KEY, or restore the database and .env together as a pair; encrypted values cannot be recovered without the original key."
  - q: "Why does the Pterodactyl panel show 502 Bad Gateway?"
    a: "A 502 usually means the web server could not reach PHP-FPM, so the panel's PHP process is down or misconfigured. Check that PHP-FPM is running, that its socket or port matches the web server configuration, and that PHP has not run out of memory. The web server error log names the failed upstream."
  - q: "Why is my Pterodactyl panel not loading at all?"
    a: "If you get a blank page or an unresponsive panel, check the web server and PHP-FPM services first, then the browser console for failed asset or WebSocket requests, then the panel log. A full disk, exhausted PHP workers, or an expired TLS certificate are common causes of a panel that serves nothing."
  - q: "Where are the Pterodactyl logs?"
    a: "Panel application errors are in the Laravel log under the panel's storage/logs directory, and the web server and PHP-FPM keep their own error logs. On game nodes, Wings logs go to the systemd journal, readable with journalctl -u wings. Start with those three, not the browser."
---

> **TL;DR:** Read the real log before changing anything: the panel's **Laravel log**, the **web server/PHP-FPM log**, and **Wings' journal** on the node. A red heart means the panel cannot reach Wings; a 500 means a PHP exception; a 502 means PHP-FPM is unreachable; an invalid MAC means the `APP_KEY` no longer matches the database.

Pterodactyl failures look mysterious because the browser only shows a generic page. Almost every problem reduces to one of a few layers: the web server, PHP, the database, the node connection, or the container runtime. This guide maps symptoms to layers and points at the log that names the cause.

If the panel is entirely down, work from the outside in: web server, then PHP-FPM, then the Laravel log.

## Find the real error first

| Layer | Where to look |
|-------|---------------|
| Panel application | Laravel log in the panel's `storage/logs` directory |
| Web server | Nginx or Apache error log for the site |
| PHP | PHP-FPM log, and the web server's upstream errors |
| Database | MySQL/MariaDB error log |
| Node agent | Wings journal via `journalctl -u wings` |
| Browser | Developer console and network tab for failed requests and WebSockets |

Read the exception message and the request path. Most of these errors have exactly one cause, and it is written down.

## The panel returns 500 Internal Server Error

A 500 is a PHP exception. The specific exception is in the Laravel log.

Common causes:

- **File permissions.** The panel's `storage` and `bootstrap/cache` directories must be writable by the web user. This is the single most common cause after a manual install.
- **Failed or pending migrations.** A half-applied schema throws on nearly every request. Check the migration status and finish or restore.
- **Stale configuration cache.** Configuration cached before an `.env` change can produce confusing failures. Clear and rebuild the caches.
- **Wrong PHP version or missing extension.** A version bump can remove an extension the panel needs.

Fix the logged cause, then clear config, route, and view caches.

## The panel returns 502 or 504

A 502 means the web server could not reach PHP-FPM. A 504 means it waited too long.

- Confirm PHP-FPM is running and listening on the socket or port the web server expects.
- Check whether PHP workers are exhausted or a single slow request is blocking others.
- Look for out-of-memory kills in the system log.
- If the panel sits behind a second proxy, a timeout there can produce 504s while the panel is healthy.

## Node shows a red heart or "not detected"

This is the most common Pterodactyl problem, and it is a connectivity issue between the panel and Wings. Work through it in order:

1. **Is Wings running?** Check the service status and the journal on the node.
2. **Is the port reachable?** From the panel host, test the node's daemon port (commonly 8080). A firewall, security group, or NAT rule is the usual culprit.
3. **Does the token match?** Reinstalling Wings without updating the node's configuration in the panel causes a token mismatch.
4. **Is Wings listening where you think?** A daemon bound to the wrong interface or a changed port breaks the connection.
5. **Are certificates valid?** If Wings uses TLS, an untrusted or expired certificate fails the handshake. The Wings journal will say so.
6. **Is the node overloaded?** A node with no free memory or a full disk can fail health checks.

Fix one node fully before applying the same change to others.

## Panel does not load, or loads without styles

- Check the web server and PHP-FPM first; a stopped service serves nothing.
- Open the browser console: failed asset requests often indicate a wrong `APP_URL` or a mixed-content problem after moving to HTTPS.
- Check disk space. A full disk breaks sessions, caches, and logs in confusing ways.
- Check the TLS certificate. An expired certificate can make the panel appear broken while the app is fine.

## Cannot log in behind a reverse proxy

If authentication loops or the panel ignores HTTPS, the trusted-proxy configuration is wrong. Pterodactyl needs to know which proxies it can trust, usually set through `TRUSTED_PROXIES` in `.env`, so it can read the forwarded protocol and client IP correctly. Misconfiguration also breaks secure cookies, which makes logins appear to succeed and then immediately fail.

Set the trusted proxies to your proxy addresses, not to everything, and make sure the proxy forwards the original host, protocol, and WebSocket upgrade headers. Cloudflare Tunnel, Nginx Proxy Manager, and similar tools all need the same treatment.

## Console or WebSocket will not connect

The live console uses a WebSocket connection to the node. If the panel loads but the console spins forever:

- Confirm the proxy passes WebSocket upgrade headers.
- Check that the browser can reach the node's WebSocket port, directly or through the proxy.
- Look for mixed-content blocking when the panel is HTTPS but a node URL is plain HTTP.
- Recheck the node token and Wings logs.

## Invalid MAC when decrypting

This error means encrypted data cannot be decrypted with the current `APP_KEY`. It typically appears after:

- Changing `APP_KEY` in `.env`.
- Restoring a database from one installation into another with a different `.env`.
- Moving an installation and copying only part of it.

The only reliable fix is to restore the original `APP_KEY`, or restore the database and `.env` together as a matching pair. Encrypted values cannot be recovered without the original key, which is why `APP_KEY` belongs in your backup set and your secret manager.

## Database connection errors

- Confirm the database service is running and accepting connections.
- Check the credentials and host in `.env` against the actual database user and grants.
- Watch for connection limits: a panel with many workers can exhaust a small database's `max_connections`.
- Check the database error log for corruption or disk-full conditions.

## Permission and SELinux problems

On RHEL-family systems, SELinux can block the web server from writing to the panel's storage directories even when Unix permissions look correct. Apply the appropriate SELinux context to the panel directory rather than disabling SELinux globally. On any distribution, confirm ownership and permissions match what the panel's installation guide specifies.

## Backup failures

- Check credentials and bucket permissions for S3 targets.
- Confirm the node has free disk if backups stage locally first.
- Verify the backup size limit and retention settings.
- Test a restore; a backup that cannot restore is not a backup. See the [game server backup guide](/blog/game-server-backup-guide/).

## When the problem is the platform

Some problems are environmental rather than panel bugs. OpenVZ and similar container-based VPS platforms are a poor fit because Docker and cgroup behaviour differ from a normal kernel. Old kernels cause cgroup errors that look like panel bugs. Verify your host meets the [Pterodactyl requirements](/blog/pterodactyl-panel-requirements/) before debugging deeper.

## Bottom line

Read the panel's Laravel log, the web server and PHP-FPM logs, and the Wings journal. A red heart is connectivity, a 500 is a PHP exception, a 502 is PHP-FPM, and an invalid MAC is a key mismatch. Fix the logged cause, then re-check the node connection end to end.

If node connection problems are a recurring cost of your current stack, the [installation comparison](/blog/how-to-install-a-game-server-panel/) shows how Catalyst replaces Wings and Docker with a single Rust agent on containerd.

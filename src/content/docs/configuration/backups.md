---
title: Backups
description: Automatic and manual backup management for game servers.
order: 1
---

Catalyst supports both automatic and manual backups for game servers.

## Manual Backups

1. Navigate to a server's **Backups** tab
2. Click **Create Backup**
3. The backup is created as a compressed archive

## Automatic Backups

Configure scheduled backups per server:

| Setting | Description |
|---------|-------------|
| Frequency | Hourly, daily, or weekly |
| Retention | Number of backups to keep |
| Compression | gzip or zstd |

## Storage

Backups are stored on the node's local filesystem by default. You can configure remote storage (S3-compatible) in the node settings.

> **Warning:** Large server worlds (50GB+) may take several minutes to back up. Consider scheduling backups during off-peak hours.

---
title: SFTP Access
description: Configure SFTP for file management on game servers.
order: 0
---

Catalyst provides SFTP access to game server file systems, allowing you to upload mods, configs, and worlds without using the web-based file manager.

## Enabling SFTP

SFTP is enabled by default on each node. The SFTP server runs on a configurable port (default: `2022`).

## Connection Details

| Field | Value |
|-------|-------|
| Host | Your node's FQDN |
| Port | `2022` (default) |
| Username | `catalyst.<server_uuid>` |
| Password | Your panel password |

## Permissions

The SFTP user is sandboxed to the server's data directory. Users can only access files for servers they have permission to manage.

## Configuration

In the node configuration:

```yaml
sftp:
  port: 2022
  bind_address: "0.0.0.0"
```

> **Security tip:** Restrict SFTP access with a firewall rule if your node is publicly accessible.

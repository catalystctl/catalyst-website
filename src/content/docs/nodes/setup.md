---
title: Node Setup
description: Install and configure a Catalyst node agent.
order: 0
---

A Catalyst **node** is the machine that actually runs game server containers. The node agent is written in Rust for maximum performance.

## Requirements

- Linux (Ubuntu 22.04+ recommended)
- containerd runtime installed
- At least 4GB RAM (more for larger servers)
- The node must be reachable by the panel

## Installation

After registering the node in the panel, run the agent install command on your node machine:

```bash
curl -sSL https://get.catalystctl.com | bash -s -- \
  --panel-url https://your-panel.com \
  --token <node-token> \
  --fqdn node1.example.com
```

The agent will:

1. Install and configure containerd
2. Set up the bridge network
3. Connect to the panel via WebSocket
4. Begin accepting server deployments

## Resource Limits

Configure what the node can allocate:

| Resource | Description |
|----------|-------------|
| Memory | Total RAM available for servers |
| CPU | CPU cores available (in %) |
| Disk | Total disk space for server data |
| Ports | Port range for server assignments |

## Monitoring

Node health is reported to the panel in real-time. Check **Admin → Nodes → Node Details** for:

- CPU and memory usage
- Disk I/O
- Network throughput
- Container status

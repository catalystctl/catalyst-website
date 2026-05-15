---
title: "Setting Up Your First Game Server: A Complete Beginner's Guide"
description: "Never ran a game server before? This guide covers everything from choosing hardware to installing Catalyst, creating your first server, and inviting friends to play. No experience required."
pubDate: 2026-04-10
author: "Catalyst Team"
audience: ["hobbyists"]
keywords:
  - first game server
  - how to set up game server
  - game server beginner guide
  - minecraft server setup
  - game server hosting tutorial
  - self host game server
---

You want to run your own game server. Maybe you're tired of playing on public servers with 200ms ping and someone else's rules. Maybe your Discord group wants a private world. Maybe you just want to learn how this stuff works.

Whatever the reason, this guide will get you from zero to a working game server in under an hour. No experience required.

## What you need

### A computer to run the server

This can be:
- An old laptop or desktop you're not using anymore
- A $50 used mini PC from eBay
- A cloud VPS ($5-10/month from DigitalOcean, Hetzner, or Vultr)
- Even a Raspberry Pi 5 (for small Minecraft servers with 5-10 players)

**Minimum specs for a Minecraft server:**
- 2 CPU cores
- 4GB RAM (2GB for the server, 2GB for the OS)
- 20GB of storage

### A Linux operating system

Ubuntu Server 22.04 or 24.04 is the easiest choice. If you're using a cloud VPS, most providers let you select Ubuntu during setup.

If you've never used Linux before, don't worry — you only need a few commands, and we'll give you all of them.

### An internet connection

- At least 5 Mbps upload speed (check at [speedtest.net](https://speedtest.net))
- Access to your router's admin panel (for port forwarding — we'll walk you through it)

## Step 1: Install Linux (if needed)

If you're using a cloud VPS, skip this step — Linux is already installed.

If you're using an old PC:
1. Download [Ubuntu Server](https://ubuntu.com/download/server) and flash it to a USB drive using [Rufus](https://rufus.ie) (Windows) or [Balena Etcher](https://etcher.balena.io) (Mac/Windows)
2. Boot from the USB drive and follow the installer
3. Choose "Install OpenSSH Server" when asked — this lets you manage the server remotely

## Step 2: Install Docker

Docker is the software that runs your game server in an isolated container. It keeps your server separate from the rest of your system.

Connect to your server (via SSH or directly) and run:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

Log out and back in for the group change to take effect. Verify it works:

```bash
docker --version
```

You should see something like `Docker version 27.x.x`.

## Step 3: Install Catalyst

Catalyst is the panel that gives you a web interface to manage your game servers. One command:

```bash
curl -fsSL https://raw.githubusercontent.com/catalystctl/catalyst/main/install.sh | bash
```

This downloads everything and creates a configuration file. Edit it:

```bash
cd catalyst-docker
nano .env
```

Find the line that says `PUBLIC_URL=` and set it to your server's IP address or domain. Save and exit (Ctrl+X, Y, Enter).

Start the panel:

```bash
docker compose up -d
```

Open a web browser and go to `http://your-server-ip`. You should see the Catalyst login page. Create your admin account.

## Step 4: Set up a node

A "node" is the machine that actually runs game servers. Since you're running everything on one machine, the panel and the node are the same box.

1. In Catalyst, go to **Nodes → Register Node**
2. Follow the instructions to download and run the Catalyst agent on your machine
3. The agent is a small program that connects to the panel and reports "I'm here and ready to run servers"

You should see the node appear as "Online" in the nodes list.

## Step 5: Create your first server

1. Go to **Servers → Create Server**
2. Pick a template (Minecraft Java is the most popular)
3. Set resources:
   - **Memory:** 2048MB (2GB) for a small Minecraft server
   - **CPU:** 100% (let it use a full core)
   - **Disk:** 5000MB (5GB) — more than enough for a new world
4. Select your node
5. Click **Create**

The server starts automatically. Click on it to see the console — you'll see the Minecraft server starting up in real time. When you see "Done (X.XXXs)!", the server is ready.

## Step 6: Let your friends connect

This is where most people get stuck. Your server is running, but nobody can connect to it from the internet yet. You need to:

### Find your public IP

Visit [whatismyip.com](https://whatismyip.com) from any device on your network. Your public IP is the number at the top (something like `203.0.113.42`).

### Forward the Minecraft port

Your router blocks incoming connections by default. You need to tell it "if someone connects on port 25565, send them to my server."

1. Find your server's local IP: Run `ip addr` on your server. Look for something like `192.168.1.100`
2. Log into your router (usually `http://192.168.1.1` — check the label on the back)
3. Find "Port Forwarding" (sometimes under "NAT" or "Advanced")
4. Add a rule:
   - **External port:** 25565
   - **Internal port:** 25565
   - **Internal IP:** Your server's local IP (e.g., 192.168.1.100)
   - **Protocol:** TCP
5. Save and apply

### Test it

Have a friend open Minecraft and add a server with the address `your-public-ip:25565`. They should see it appear in the server list.

Can't connect? Common issues:
- **Wrong IP:** Make sure you're using the public IP, not the local one
- **Firewall:** Ubuntu's firewall might be blocking the port. Run `sudo ufw allow 25565/tcp`
- **ISP blocking:** Some ISPs block common game ports. Try using port 25566 instead and update the server properties

## Step 7: Customize your server

Through Catalyst's file manager, you can:

- **Edit server.properties** — Change the server name, difficulty, game mode, max players
- **Add operators** — Edit ops.json to give yourself and friends admin access
- **Install mods** — Upload Forge or Fabric mod JARs to the mods folder
- **Install plugins** — Upload Paper/Spigot plugins for server features
- **Set up a whitelist** — Only allow specific players to join

You can do all of this from the Catalyst web interface — no SSH or command line needed.

## Running more than one server

One of the best things about Catalyst is managing multiple servers from one dashboard. Want to add a creative world, a modded server, or a completely different game?

1. Go to **Servers → Create Server**
2. Pick a different template (or the same one with different settings)
3. Give it different resources
4. Forward a different port (25566, 25567, etc.)

All your servers show up on one dashboard with their status, resource usage, and console access.

## Keeping your server safe

### Backups

Catalyst can automatically back up your server world and configuration. Set up a daily backup schedule in the server settings — if anything goes wrong, you can restore from the panel.

### Whitelist

If only friends are playing, enable the whitelist:

1. Edit `server.properties` in the file manager
2. Set `white-list=true`
3. Save and restart the server
4. Add players with the `/whitelist add PlayerName` command in the console

This prevents random people from joining your server.

### Keep it updated

Catalyst releases updates regularly. To update:

```bash
cd catalyst-docker
docker compose pull
docker compose up -d
```

This downloads the latest version and restarts the panel. Your servers keep running during the update.

## You did it

You now have a game server running at home, managed through a web panel, accessible to your friends. From here, you can:

- Add more servers for different games
- Install mods and plugins to customize the experience
- Monitor resource usage through the dashboard
- Set up automatic backups for peace of mind

If you want to go deeper, the [Catalyst documentation](/docs/) covers everything from node management to the plugin system to the full API reference.

[Get started now](/docs/getting-started/quickstart/) — your server is 60 seconds away.

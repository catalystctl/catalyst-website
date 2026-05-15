---
title: "How to Host a Minecraft Server at Home in 2026"
description: "Step-by-step guide to hosting a Minecraft server at home using Catalyst. From hardware requirements to port forwarding, backups, and running multiple worlds — everything a hobbyist needs."
pubDate: 2026-05-08
author: "Catalyst Team"
audience: ["hobbyists"]
keywords:
  - host minecraft server at home
  - minecraft server setup
  - game server at home
  - catalyst minecraft
  - self-hosted minecraft
  - minecraft java server
---

Running your own Minecraft server at home is one of the most rewarding things you can do as a gamer. You control the rules, the mods, the player limit, and the world — no more relying on someone else's server that disappears overnight.

This guide walks you through setting up a Minecraft Java server at home using Catalyst, from hardware requirements to port forwarding to running multiple worlds.

## What you need before you start

### Hardware

You don't need a dedicated server rack. Any decent home PC or mini PC will work:

- **CPU:** Any modern dual-core processor. Minecraft is single-threaded for the main world tick, so clock speed matters more than core count.
- **RAM:** 4GB minimum for the server, 8GB recommended. If you're running modpacks, 12-16GB is better.
- **Storage:** An SSD makes a huge difference for chunk loading and world saves. 50GB is plenty for a few worlds.
- **Network:** A stable internet connection with at least 10 Mbps upload. More players = more upload needed.

**Good budget options:**
- A used Dell OptiPlex mini PC ($100-150)
- A Raspberry Pi 5 (for very small servers, 5-10 players)
- An old gaming PC you're not using anymore

### Software

- **Linux:** Ubuntu Server 22.04 or 24.04 LTS is the easiest choice. Debian works too.
- **Docker and Docker Compose:** Catalyst installs via Docker, so you need these first.
- **Catalyst:** The game server panel itself.

## Step 1: Set up your server machine

If you're using a dedicated PC:

1. Install Ubuntu Server (or your preferred Linux distro)
2. Update everything: `sudo apt update && sudo apt upgrade -y`
3. Install Docker: `curl -fsSL https://get.docker.com | sh`
4. Add your user to the docker group: `sudo usermod -aG docker $USER`

If you're running this on your desktop alongside other things, that works too — just make sure Docker is installed.

## Step 2: Install Catalyst

One command:

```bash
curl -fsSL https://raw.githubusercontent.com/catalystctl/catalyst/main/install.sh | bash
```

This downloads the Catalyst Docker Compose setup, generates secure secrets, and creates your `.env` file.

Next, configure your public URL:

```bash
cd catalyst-docker
nano .env
# Set PUBLIC_URL to your public IP or domain
```

Then start the panel:

```bash
docker compose up -d
```

Catalyst is now running at `http://localhost`. Open it in your browser and create your admin account.

## Step 3: Set up a node

A "node" in Catalyst is the machine that actually runs your game servers. If you're running everything on one machine, the panel and the node are the same box.

1. In the Catalyst admin panel, go to Nodes → Register Node
2. Follow the instructions to install the Catalyst agent on your machine
3. The agent is a lightweight Rust binary — download it, configure it with your panel URL and token, and run it

The agent connects back to the panel and reports its status. You should see it appear as "online" in the nodes list.

## Step 4: Create a Minecraft server

1. In the Catalyst panel, go to Servers → Create Server
2. Select the Minecraft template (Catalyst imports Pterodactyl-compatible eggs, so Minecraft Java, Bedrock, and modded variants are all available)
3. Choose your node, set the resource limits (memory, CPU, disk), and pick your Minecraft version
4. Click Create

The server will start automatically. You can watch the console output in real-time through the Catalyst panel — with sub-10ms latency, you'll see log lines appear almost instantly.

## Step 5: Port forwarding

This is the part most guides gloss over. For other players to connect to your server from the internet, you need to forward a port on your router.

1. **Find your local IP:** Run `ip addr` on your server machine. Look for something like `192.168.1.100`.
2. **Find your public IP:** Visit [whatismyip.com](https://whatismyip.com) from any device on your network.
3. **Log into your router:** Usually `http://192.168.1.1` or `http://192.168.0.1`. Check your router's manual.
4. **Set up port forwarding:** Forward port 25565 (the default Minecraft port) to your server's local IP.
5. **Test it:** Have a friend connect to `your-public-ip:25565` in Minecraft.

**Pro tip:** If your ISP gives you a dynamic IP (most do), consider setting up a free dynamic DNS service like DuckDNS so your players can connect using a hostname instead of an IP that changes.

## Step 6: Configure your Minecraft server

Once the server is running, you can customize it through Catalyst's built-in file manager:

- **server.properties:** Change the motd, player limit, difficulty, game mode, and more
- **ops.json:** Add server operators
- **whitelist.json:** Restrict access to specific players
- **Mods and plugins:** Upload Forge/Fabric mods or Paper/Spigot plugins through the file manager

You can edit files directly in the Catalyst panel — no SSH required.

## Running multiple worlds

One of the nice things about Catalyst is how easy it is to run multiple servers. Want a creative world and a survival world? A modded server and a vanilla server? Just create another server in the panel:

1. Servers → Create Server
2. Pick a different template or the same one with different settings
3. Assign it to your node with different resource limits
4. Forward a different port (25566, 25567, etc.) for each additional server

Catalyst manages all of them from one dashboard — CPU usage, memory, console, file access, everything.

## Backups

Catalyst supports S3-compatible backups out of the box. For a home server, the easiest approach is:

1. Set up a local MinIO instance (S3-compatible storage that runs on your machine)
2. Configure Catalyst to back up to it
3. Set a schedule — daily or weekly, depending on how active your server is

You can also manually trigger backups from the panel before making big changes (updating mods, resetting the end dimension, etc.).

## Security tips for home servers

Running a server at home means exposing a port to the internet. A few precautions:

- **Keep Catalyst updated.** Security patches are released regularly.
- **Use the firewall.** Only open the ports you need (25565 for Minecraft, the Catalyst panel port if you want remote access).
- **Enable the whitelist.** If only friends are playing, `white-list=true` in server.properties prevents random players from joining.
- **Don't expose the panel directly.** Use Cloudflare Tunnel or a VPN like Tailscale if you want to access the panel remotely without opening another port.

## Performance tuning

If your server is lagging with lots of players:

- **Allocate more RAM:** Increase the memory limit in Catalyst's server settings
- **Use Paper instead of Vanilla:** Paper is a drop-in replacement that's significantly faster for most workloads
- **Pre-generate chunks:** Use a plugin like Chunky to pre-generate the world, reducing lag from exploration
- **Set view distance carefully:** 10-12 is usually fine. Higher values exponentially increase server load
- **Monitor through Catalyst:** The built-in resource graphs show you exactly where the bottleneck is

## You're running a server

That's it — you now have a Minecraft server running at home, managed through Catalyst, accessible to your friends. No more paying for hosting, no more relying on someone else's server, no more arbitrary limits.

If you outgrow your home setup, the same Catalyst panel can manage remote nodes too. Add a VPS as a second node, migrate your servers, and keep going — all from the same dashboard.

Ready to get started? [Install Catalyst](/docs/getting-started/quickstart/) and have your server running in under five minutes.

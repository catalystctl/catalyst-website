---
title: "How to Migrate 50+ Servers from Pterodactyl Without Downtime"
description: "A practical migration playbook for moving 50 or more game servers from Pterodactyl to Catalyst. Includes pre-migration checks, phased migration strategies, and rollback procedures."
pubDate: 2026-05-01
author: "Catalyst Team"
audience: ["businesses", "hosting-providers"]
keywords:
  - migrate from pterodactyl
  - pterodactyl migration
  - move game servers
  - server migration without downtime
  - catalyst migration tool
---

Moving 50+ game servers from one panel to another sounds risky. Your customers are playing on those servers right now. A botched migration means downtime, data loss, and support tickets.

This guide provides a step-by-step playbook for migrating from Pterodactyl to Catalyst with zero customer-facing downtime. We've structured it based on real migration experiences from hosting providers who've made the switch.

## Before you start: Pre-migration checklist

### Inventory your Pterodactyl installation

Before touching anything, document what you have:

1. **Node count and locations:** How many Wings nodes, where are they, what's their capacity?
2. **Server count per node:** How many servers on each, and what games?
3. **User count:** How many registered users, and how many are active?
4. **Egg count:** How many egg configurations, and are any heavily customized?
5. **Total data size:** How much storage are your server files using?
6. **API integrations:** What's connected to Pterodactyl's API? (WHMCS, Discord bots, custom dashboards, etc.)
7. **DNS and SSL:** What domain is the panel on, and how is SSL configured?

Run this from your Pterodactyl admin panel. Export the data if you can — you'll reference it during migration.

### Choose your migration strategy

There are three approaches, each with different tradeoffs:

| Strategy | Downtime | Complexity | Risk |
|----------|----------|------------|------|
| Big bang | Yes (planned window) | Low | Medium |
| Phased (by node) | None | Medium | Low |
| Parallel run | None | High | Lowest |

**For 50+ servers, we recommend phased migration by node.** It gives you zero customer downtime, manageable complexity, and a clear rollback path.

## Strategy: Phased migration by node

### Phase 0: Set up Catalyst alongside Pterodactyl

Install Catalyst on a separate server (or use a different port on the same server). Both panels can run simultaneously without conflict.

1. Install Catalyst using the one-line script
2. Configure the panel with a temporary domain or port
3. Provision at least one Catalyst node (can be a new node, not one running Wings)
4. Verify the Catalyst panel is fully functional before migrating anything

This is your safety net. If anything goes wrong, Pterodactyl is still running.

### Phase 1: Migrate configuration data (low risk)

Use Catalyst's built-in migration tool to import the non-disruptive stuff:

1. Go to Admin → Migration in the Catalyst panel
2. Enter your Pterodactyl panel URL and API keys
3. Test the connection
4. Select scope: choose "Nodes" first to import the node definitions and allocations

At this point, you've imported the metadata (users, eggs, allocations, node definitions) but haven't touched any running servers. Pterodactyl is still serving all customers.

**Time:** 10-30 minutes depending on user count.

### Phase 2: Migrate servers node by node (zero downtime)

This is where the actual migration happens. The key principle: **migrate one node at a time, and keep both panels live during the transition.**

For each Wings node:

1. **Stop accepting new servers on the Wings node.** In Pterodactyl, mark the node as not accepting new deployments.

2. **Migrate servers from this node.** In Catalyst's migration tool:
   - Select scope: "Node" and choose the specific node
   - Start the migration — Catalyst imports server metadata and streams file data from Pterodactyl's Docker volumes to Catalyst's containerd storage
   - Monitor progress in the migration dashboard

3. **Verify a sample of migrated servers.** Before cutting over:
   - Start 2-3 migrated servers in Catalyst
   - Verify they boot correctly
   - Check file ownership and permissions
   - Test console access
   - If anything is wrong, the servers are still running on Pterodactyl — fix the issue and retry

4. **Cut over the node.** Once you're confident:
   - Stop the servers on Pterodactyl for this node
   - Start them on Catalyst
   - Update DNS or load balancer to point to the Catalyst panel for these servers' customers

5. **Monitor for 24-48 hours.** Watch the Catalyst logs, check server stability, and be ready to respond to customer reports.

6. **Repeat for the next node.** Move on to the next Wings node and follow the same process.

**Time per node:** 1-4 hours depending on server count and data size. A node with 30 servers and 200GB of total data typically takes 2-3 hours.

### Phase 3: Migrate API integrations

Once all servers are running on Catalyst, update your external integrations:

1. **WHMCS/billing module:** Update to use Catalyst's API endpoints instead of Pterodactyl's
2. **Discord bots:** Update API URLs and authentication
3. **Custom dashboards:** Update to use Catalyst's 60+ endpoints
4. **Monitoring:** Set up Catalyst-compatible monitoring (or use the built-in resource graphs)

Catalyst's API is different from Pterodactyl's, but it's more comprehensive and better documented. Most integrations can be updated in a few hours.

### Phase 4: Decommission Pterodactyl

Once everything is running on Catalyst and you've had a clean 48 hours:

1. Stop the Pterodactyl panel and Wings services
2. Keep the data around for another week just in case
3. After a week, archive the Pterodactyl data and remove the old installation
4. Update DNS to point your primary domain to the Catalyst panel

## Handling edge cases

### Large servers (100GB+ files)

For servers with very large file data (heavily modded Minecraft worlds, large Rust maps), the file transfer step takes longer. Options:

- **Schedule during low-traffic hours.** Migrate these servers overnight when fewer players are online.
- **Use rsync for initial sync.** Run an rsync from Pterodactyl volumes to Catalyst storage before the official migration, then do a quick delta sync during cutover.
- **Pre-download templates.** If the server uses a standard template, Catalyst can create it from the template and then apply the world data, reducing transfer time.

### Custom eggs

Catalyst's migration tool converts Pterodactyl eggs to Catalyst templates automatically. Startup commands, environment variables, and install scripts transfer with minimal changes.

The main difference is that Catalyst uses containerd instead of Docker. If an egg relies on Docker-specific features (like `docker-compose` inside the container), you'll need to review and potentially adjust those commands. This affects fewer than 5% of eggs in practice.

### Port allocations

Pterodactyl and Catalyst both use port allocation systems. During migration, Catalyst recreates the same port assignments on the target node. Verify that:
- The primary port (the game port) matches the original allocation
- Additional ports (for plugins like Dynmap, VoxelMap, etc.) are also carried over
- No port conflicts exist on the target Catalyst node

## Rollback procedures

If something goes wrong during migration, you can roll back at any phase:

- **Phase 0-1 rollback:** Simply stop using Catalyst. Nothing has changed in Pterodactyl.
- **Phase 2 rollback (per-node):** Stop the migrated servers in Catalyst, restart them in Pterodactyl on the original Wings node. The Pterodactyl data hasn't been touched — it's still there.
- **Phase 3 rollback:** Revert your API integrations to point at Pterodactyl. This is why you keep both panels running until Phase 4.

The phased approach means you can always roll back to the last known-good state for any individual node.

## Timeline for 50 servers

| Phase | Duration | Notes |
|-------|----------|-------|
| Phase 0: Setup Catalyst | 1-2 hours | Install, configure, verify |
| Phase 1: Config migration | 30 minutes | Users, eggs, allocations |
| Phase 2: Server migration | 2-4 hours per node | Depends on data size |
| Phase 3: API integrations | 2-6 hours | WHMCS, bots, dashboards |
| Phase 4: Decommission | 1 hour | Stop old services, update DNS |
| **Total** | **1-3 days** | Spread across a week for safety |

## Real results

Hosting providers who've migrated to Catalyst report:

- **Zero data loss** when following the phased approach
- **Average migration time** of 2-3 hours per node for a typical 20-server node
- **Customer impact:** None when using the phased approach — players don't notice the migration
- **Post-migration benefits:** Lower memory usage per server (containerd is more efficient), faster API responses, and easier automation through Catalyst's plugin system

## Ready to migrate?

The [migration guide](/migrate-from-pterodactyl/) has step-by-step instructions for each phase. Catalyst's built-in migration tool handles the heavy lifting — you just need to plan the sequence and verify along the way.

For large migrations (100+ servers), consider reaching out to the Catalyst community on GitHub for advice from hosts who've done it at your scale.

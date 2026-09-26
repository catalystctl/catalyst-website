---
title: "Pterodactyl Eggs Explained: Import, Install, and Build Custom Eggs"
description: "What Pterodactyl eggs and nests actually are, what a good egg contains, where to find them, how to import or build one, and why egg install scripts fail."
pubDate: 2026-09-25
author: "Catalyst Team"
audience: ["hobbyists", "businesses", "hosting-providers"]
keywords:
  - pterodactyl eggs
  - pterodactyl custom egg
  - pterodactyl egg install failed
  - pterodactyl nests
  - pterodactyl egg github
  - game server template
category: "Developer"
faqs:
  - q: "What is a Pterodactyl egg?"
    a: "A Pterodactyl egg is a game template. It defines the Docker image, startup and stop commands, environment variables, configuration files, and install script needed to run a specific game or service, so the panel can provision it without custom scripting."
  - q: "What is the difference between a nest and an egg in Pterodactyl?"
    a: "A nest is a category that groups related eggs, such as Minecraft or Source games. An egg is the individual template inside a nest. The distinction is organisational: the panel stores eggs under nests so the creation screen stays navigable."
  - q: "Where do I download Pterodactyl eggs?"
    a: "The community egg collection on GitHub is the usual source, alongside the community egg site, and many hosts publish their own. Because eggs are plain JSON, you can inspect one before importing it and adjust the Docker image, variables, or install script to fit your environment."
  - q: "How do I import an egg into Pterodactyl?"
    a: "In the admin area, open the nests section, choose or create a nest, and use the import option to upload the egg JSON file. Then create a server that uses the egg and fill in its variables. Review the egg's Docker images and startup command before deploying it to customers."
  - q: "Why did my Pterodactyl egg install fail?"
    a: "The most common causes are a Docker image the node cannot pull, an install script that downloads a version that no longer exists, a version-detection regex that stopped matching after a game update, and missing write permissions on the server directory. The install log names the failing step."
  - q: "Can I create a custom Pterodactyl egg?"
    a: "Yes. Build the egg JSON with the image, startup command, stop command, configuration files, variables, and an install script, import it into a nest, and test it on a spare server. Keep the install script idempotent so a reinstall does not corrupt existing data."
  - q: "Can I use Pterodactyl eggs in Pelican or Catalyst?"
    a: "Pelican, as a fork, keeps egg compatibility. Catalyst imports Pterodactyl eggs and converts them into Catalyst templates, carrying over startup commands, environment variables, and install scripts. Review eggs that depend on Docker-specific behaviour, because Catalyst game nodes run containerd."
  - q: "How many eggs does Catalyst include?"
    a: "Catalyst ships 258 egg definitions across 167 games and can import Pterodactyl eggs, so an existing egg library is not a reason to stay on one panel alone. The import converts them into Catalyst templates rather than running the raw egg JSON."
---

> **TL;DR:** A Pterodactyl **egg** is a game template: Docker image, startup and stop commands, variables, config files, and an install script. A **nest** is just the folder that groups eggs. Eggs are JSON, so they are easy to import, inspect, and adapt, but their install scripts are also the most fragile part of the panel.

Eggs are Pterodactyl's biggest ecosystem asset. They are why a fresh panel can run dozens of games without anyone writing code, and they are also the source of most "it installed but it will not start" problems. This guide explains what is inside an egg and how to work with it.

## What is a Pterodactyl egg?

An egg is a declarative recipe for running one game or service. It tells the panel and Wings:

- Which **Docker image** to use
- The **startup command** and how to detect a successful start
- The **stop command** and how to shut down cleanly
- Which **configuration files** to parse and expose
- Which **variables** the user can set, such as version, memory, or server name
- The **install script** that downloads or builds the server on first run

Because the recipe is data, the same egg works on any node and any server, and a user can create a server from it without touching the command line.

## Egg vs nest

A **nest** is a category. A nest named Minecraft might contain eggs for Vanilla, Paper, Forge, Fabric, and Bedrock. The panel uses nests purely to organise the creation screen; an egg's behaviour does not depend on which nest holds it. If you are wondering whether to create a nest or an egg, the answer is usually: create an egg, and put it in an existing nest.

## What a good egg contains

| Part | Why it matters |
|------|----------------|
| Docker image | Determines the runtime, such as a specific Java version |
| Startup command | How the game process is launched |
| Stop command | How the server shuts down without data loss |
| Install script | Downloads or builds the server files on first run |
| Variables | Expose version, memory, and feature toggles to the user |
| Config parsing | Lets the panel map variables into the game's config files |
| Done/startup detection | How the panel decides the server is ready |

A weak egg usually skips clean shutdown or hardcodes a version. A strong egg exposes the version as a variable, pins known-good defaults, and shuts down gracefully.

## Where to find eggs

The community maintains a large egg collection on GitHub, and there is a community egg site alongside it. Hosting providers often publish their own for niche games or custom builds. Because eggs are JSON, you can read one before trusting it: check the image, the install script, and any URLs it downloads.

Treat third-party eggs as code. An install script runs on your node with the server's permissions, so review what it downloads and executes rather than importing blindly from an unknown source.

## Importing an egg

1. In the admin area, open the **nests** section and choose or create a nest.
2. Use the import action to upload the egg JSON.
3. Confirm the egg's Docker images are pullable on your nodes.
4. Create a test server from the egg and fill in its variables.
5. Watch the install log, then start the server and confirm it becomes healthy.
6. Only then make the egg available to customers.

Running a test server from every new egg is worth the five minutes; a broken egg in your catalogue generates support tickets for months.

## Building a custom egg

To build your own:

1. Start from the closest existing egg rather than a blank file.
2. Set the Docker images and a startup command with clear success detection.
3. Add variables for anything users should change, with sensible defaults.
4. Write an install script that is **idempotent**: re-running it should not destroy a world or duplicate files.
5. Pin download URLs to a source that is unlikely to vanish, and fail loudly if a download fails.
6. Test install, start, stop, restart, and reinstall on a spare server.

Avoid brittle version detection. Eggs that parse a download page or match a version with a hand-written pattern are the ones that break silently when a project changes its naming or versioning scheme.

## Why egg installs fail

- **Image will not pull:** the tag was removed, or the node cannot reach the registry.
- **Download 404:** the install script points at a version that no longer exists.
- **Version detection stops matching:** the game's version naming changed and the script selects nothing.
- **Permission errors:** the script writes outside the server directory or lacks ownership.
- **Reinstall data loss:** the script deletes files it should preserve.
- **Missing dependency:** the image does not contain the runtime the script assumes.

The install log shows which step failed. Reproduce the failing command on a spare server to debug it quickly.

## Eggs in Pelican and Catalyst

Pelican, being a fork of Pterodactyl, preserves egg compatibility. Catalyst takes a different route: it imports Pterodactyl eggs and converts them into Catalyst templates, carrying over startup commands, environment variables, and install scripts. Catalyst ships 258 egg definitions across 167 games on top of that import path.

The one thing to review in either case is Docker-specific behaviour. Catalyst game nodes run containerd, which executes the same OCI images but has no Docker Compose semantics inside a container. Eggs that rely on Compose files or Docker-only features need adjusting; most do not.

## Bottom line

An egg is a JSON recipe, a nest is a folder, and the install script is the fragile part. Import from trusted sources, test every egg on a throwaway server, and write custom installs so they are idempotent and fail loudly.

If you are weighing a move, eggs are portable: [Catalyst imports Pterodactyl eggs](/migrate-from-pterodactyl/), so your template library is not a lock-in. For the wider decision, see [every Pterodactyl alternative compared](/blog/pterodactyl-alternatives-2026/).

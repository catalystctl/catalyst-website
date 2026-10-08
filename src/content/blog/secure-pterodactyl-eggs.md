---
title: "How to Review a Pterodactyl Egg Before Running It on a Production Node"
description: "Pterodactyl eggs are executable deployment instructions, not harmless configuration files. This practical review checklist covers install scripts, downloads, permissions, variables, and safer testing."
pubDate: 2026-10-07
author: "Catalyst Team"
audience: ["hosting-providers", "businesses", "developers"]
keywords:
  - secure Pterodactyl eggs
  - review Pterodactyl egg
  - Pterodactyl egg security
  - game server template security
  - Catalyst templates
category: "Security"
faqs:
  - q: "Are Pterodactyl eggs safe to import?"
    a: "An egg should be treated as code, not trusted data. Its install script and startup commands can download and execute software on a node, so review the source, pin downloads where practical, and test it on an isolated node before production use."
  - q: "What should I check in a Pterodactyl egg?"
    a: "Review the install script, startup command, Docker image, environment variables, download URLs, version detection, file paths, cleanup behavior, and permissions. Look for shell commands that fetch untrusted content, delete broad paths, or expose secrets."
  - q: "Can Catalyst import Pterodactyl eggs?"
    a: "Yes. Catalyst can import Pterodactyl eggs and convert their startup commands, variables, and install scripts into Catalyst templates. Review Docker-specific behavior after import because Catalyst nodes use containerd rather than Docker."
---

An egg looks like JSON. That makes it easy to forget what it really is: a package of instructions for installing and launching software on a node.

The format is convenient. It is also a trust boundary. An install script can download files, unpack archives, create directories, change permissions, and run commands. Importing an egg from a random repository is closer to installing a deployment script than importing a theme.

## Read the install script first

Do not begin with the display name or the author field. Open the install script and read it line by line.

Look for:

- downloads from domains you do not recognize;
- `curl | sh` or `wget | bash` patterns;
- URLs that follow a moving `latest` release;
- archives extracted without checking their contents;
- recursive permission changes outside the server directory;
- commands that delete files or directories broadly;
- secrets embedded in URLs or shell arguments;
- package-manager commands that add an unexpected repository.

None of these automatically proves that an egg is malicious. They are places where an operator needs an explanation before approving it.

## Check the startup path separately

The install script runs during provisioning. The startup command runs every time the server starts. Read both.

A startup command should make the important inputs visible as variables: game version, memory, port, configuration path, and any feature toggles. Avoid templates that hide a second download script behind a short command unless you have reviewed that script too.

Pin versions when reproducibility matters. A template that downloads “the latest” can change behavior without an egg update, which makes an incident difficult to reproduce.

## Variables are part of the interface

Variables are not just form fields. They control what customers can change and what the install script receives.

For each variable, ask:

1. Is the default valid?
2. Is the value validated?
3. Does the description tell an operator what it changes?
4. Can the value inject shell syntax into a command?
5. Does the install script use it consistently?

An exposed variable should have a reason to exist. A template with dozens of undocumented switches is harder to support than one with a smaller, deliberate interface.

## Test on a disposable node

The safest review process is boring:

1. Import the egg into a test panel.
2. Use a disposable node with no customer workloads.
3. Capture the install output and the files it creates.
4. Inspect network connections and downloaded artifacts.
5. Start the server with test values.
6. Stop it cleanly, restart it, and remove it.
7. Repeat after changing the game version.

If the egg fails, keep the install log. “It did not work” is not enough information to improve a template.

## Docker assumptions matter when migrating

Catalyst can import Pterodactyl eggs, but an imported egg may contain Docker-specific assumptions. Check image names, bind mounts, user IDs, filesystem paths, networking behavior, and commands that expect a Docker socket or Docker CLI.

The import saves work; it does not remove the need for review. Treat the converted result as a new deployment artifact and run it through the same test process.

## A short approval checklist

- [ ] Source repository and commit are recorded
- [ ] Install script has been read
- [ ] Startup command has been read
- [ ] Downloads use known sources and sensible version pinning
- [ ] No unexpected credentials, repositories, or deletion commands
- [ ] Variables are documented and validated
- [ ] Test install and restart succeeded
- [ ] Logs and created files were inspected
- [ ] Docker-specific behavior was checked when importing to Catalyst

Eggs are one of the reasons game server panels are useful: they turn a messy install into a repeatable template. That benefit only holds when the template itself is reviewed like code.

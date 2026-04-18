---
title: Quick Start Guide
description: Go from zero to a running game server in minutes.
order: 2
---

This guide walks you through deploying your first game server on Catalyst.

## Step 1 — Install Catalyst

Follow the [installation guide](/docs/getting-started/installation/) to get the panel running.

## Step 2 — Create an Admin Account

On first launch, you'll be prompted to create the admin account. This account has full access to all features.

## Step 3 — Register a Node

A **node** is a machine that runs game server containers.

1. Go to **Admin → Nodes**
2. Click **Register Node**
3. Enter the node's FQDN and resource limits
4. Install the Catalyst agent on the node using the provided command

## Step 4 — Add a Template

Templates define what game servers can be deployed.

1. Go to **Admin → Templates**
2. Create a new template or import an existing one
3. Configure the Docker image, startup command, and resource defaults

## Step 5 — Deploy a Server

1. Go to **Servers** in the user panel
2. Click **Create Server**
3. Select a template and node
4. Set the server name and resource allocation
5. Click **Deploy**

Your server will be running in seconds. You can access the console, manage files, view metrics, and more from the server detail page.

## What's Next?

- Configure [SFTP access](/docs/configuration/sftp/) for file management
- Set up [automatic backups](/docs/configuration/backups/)
- Install [plugins](/docs/plugins/overview/) to extend functionality

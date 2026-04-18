---
title: Overview
description: Extend Catalyst with plugins.
order: 0
---

The Catalyst plugin system allows you to extend the panel with custom functionality without modifying the core codebase.

## How Plugins Work

Plugins can register:

- **API routes** — Custom REST endpoints
- **Tasks** — Scheduled or on-demand background jobs
- **Hooks** — React to events (server start, stop, crash, etc.)

## Installing Plugins

1. Go to **Admin → Plugins**
2. Click **Install Plugin**
3. Provide the plugin URL or upload a plugin archive

## Creating a Plugin

Plugins are simple TypeScript modules:

```typescript
// my-plugin/index.ts
export default {
  name: "My Plugin",
  version: "1.0.0",

  // Register a custom API route
  routes: [
    {
      method: "GET",
      path: "/api/plugins/my-plugin/status",
      handler: (ctx) => {
        return ctx.json({ status: "ok" });
      },
    },
  ],

  // React to server events
  hooks: {
    "server.start": async (server) => {
      console.log(`Server ${server.name} started`);
    },
  },
};
```

## Plugin Directory

Browse available plugins in the **Admin → Plugins** panel, or contribute your own via pull request to the [Catalyst repository](https://github.com/catalystctl/catalyst).

const card = {
  name: "Catalyst",
  version: "0.0.1",
  description: "Open-source game server management with a TypeScript panel, Rust node agent, and containerd runtime.",
  supportedInterfaces: [
    {
      url: "https://catalystctl.com/",
      protocolBinding: "HTTP+JSON",
    },
  ],
  capabilities: [
    { id: "server-management", name: "Server management", description: "Manage game servers, nodes, files, and backups." },
    { id: "plugin-discovery", name: "Plugin discovery", description: "Discover Catalyst plugins from the marketplace." },
  ],
  skills: [
    { id: "search-plugins", name: "Search plugins", description: "Find plugins in the Catalyst marketplace." },
    { id: "read-documentation", name: "Read documentation", description: "Navigate Catalyst documentation and guides." },
  ],
};

export const GET = () =>
  new Response(JSON.stringify(card), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });

const card = {
  serverInfo: { name: "catalyst-website", version: "0.0.1" },
  description: "Discovery card for Catalyst website tools.",
  transports: [
    {
      type: "streamable-http",
      endpoint: "https://catalystctl.com/mcp",
    },
  ],
  capabilities: {
    tools: {},
    resources: {},
    prompts: {},
  },
};

export const GET = () =>
  new Response(JSON.stringify(card), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });

const index = {
  $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  skills: [
    {
      name: "catalyst-website",
      type: "skill-md",
      description: "Understand and navigate the Catalyst website, product, plugins, templates, and documentation.",
      url: "https://catalystctl.com/skills/catalyst-website/SKILL.md",
      digest: "sha256:5de7dfcece514f2686800b576c81e8941a352f14ac5c72c96116efabd24d6b22",
    },
  ],
};

export const GET = () =>
  new Response(JSON.stringify(index), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });

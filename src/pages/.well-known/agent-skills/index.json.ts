const index = {
  $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  skills: [
    {
      name: "catalyst-website",
      type: "skill-md",
      description: "Understand and navigate the Catalyst website, product, plugins, and documentation.",
      url: "https://catalystctl.com/skills/catalyst-website/SKILL.md",
      digest: "sha256:6621ff9a98430a09760e06ad9cba2c0589975c8dea9fed21cd7e3edacf08cf98",
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

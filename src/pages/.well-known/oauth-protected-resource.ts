const metadata = {
  resource: "https://catalystctl.com",
  authorization_servers: ["https://catalystctl.com"],
  scopes_supported: ["openid", "profile", "email", "api"],
  bearer_methods_supported: ["header"],
};

export const GET = () =>
  new Response(JSON.stringify(metadata), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });

const directory = {
  keys: [
    {
      kty: "EC",
      kid: "catalyst-web-bot-2026",
      crv: "P-256",
      x: "ACx9CHDitLPkDJbfEYE9Wf37WynKyjfiDykKnQLD6h4",
      y: "3MZ3e8i3q3vQ2PmSWZSqzdYJbQXXoh1std0dn6Gead8",
      use: "sig",
      alg: "ES256",
    },
  ],
};

export const GET = () =>
  new Response(JSON.stringify(directory), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });

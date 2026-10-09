const issuer = "https://catalystctl.com";

const configuration = {
  issuer,
  authorization_endpoint: `${issuer}/oauth/authorize`,
  token_endpoint: `${issuer}/oauth/token`,
  jwks_uri: `${issuer}/.well-known/http-message-signatures-directory`,
  grant_types_supported: ["authorization_code", "client_credentials", "refresh_token"],
  response_types_supported: ["code"],
  scopes_supported: ["openid", "profile", "email", "api"],
  subject_types_supported: ["public"],
  id_token_signing_alg_values_supported: ["RS256"],
  token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post"],
};

export const GET = () =>
  new Response(JSON.stringify(configuration), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });

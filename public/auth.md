# auth.md

## Agent audience

Catalyst is an open-source game server panel. Agents may use the Catalyst API to
manage panels, nodes, game servers, files, backups, and related resources on
behalf of an operator.

## Registration and provisioning

Catalyst does not currently provide a public, centralized agent-registration
service. An operator must provision an API credential in the Catalyst panel and
provide it to the agent through the operator's secret-management system.

The API documentation describes authentication and credential provisioning:

- [Authentication](https://docs.catalystctl.com/api/authentication/)
- [API reference](https://docs.catalystctl.com/api/reference/)

## Supported method

Use the API credential as a bearer token in the `Authorization` request header:

```http
Authorization: Bearer <api-token>
```

Do not place credentials in URLs, source code, or client-visible logs. Tokens
should be scoped to the minimum permissions required and revoked by the panel
operator when no longer needed.

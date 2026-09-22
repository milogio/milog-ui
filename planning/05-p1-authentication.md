# P1: Stabilize Authentication

Status: **In progress — encrypted UI sessions are implemented, but the target tenant-bound API authentication contract is blocked on API endpoints.**

## Goal

Replace compatibility probing with one documented first-party authentication and tenant-session contract.

## Problem

MiLog UI currently probes multiple login and user endpoints and can fall back to Passport's password grant. The API architecture review recommends reassessing Passport. Removing legacy endpoints before defining the UI contract would break login and session restoration.

The timeline may also use a server-side tenant API key, which can make an authenticated UI session appear tenant-scoped without the API independently associating the user with that tenant.

## Required architecture decision

Choose and document one model:

1. A dedicated MiLog UI login/session API that returns user and tenant context.
2. OAuth authorization code flow with PKCE through a supported identity provider.
3. A trusted backend-for-frontend session that exchanges credentials server-side.

Do not retain the OAuth password grant as the long-term browser-login design.

## Implementation

- Replace endpoint probing in `lib/milogServer.ts` with the selected explicit endpoints.
- Validate runtime configuration at server startup and return actionable configuration errors.
- Keep access tokens, API keys, and client secrets in server-only code and HTTP-only cookies where appropriate.
- Bind tenant context to the authenticated identity rather than only to deployment environment variables.
- Distinguish upstream `401`, `403`, validation, and availability failures in UI route responses.
- Define session lifetime, refresh, expiration, logout, and revoked-credential behavior.
- Review cookie security attributes for local, preview, and production environments.
- Decide how authentication applies to shared timeline views.

## Affected files

- `lib/milogServer.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/session/route.ts`
- `app/api/timeline/route.ts`
- `providers/auth-provider.tsx`
- `components/LoginForm.tsx`
- `.env.example`
- `README.md`
- Auth and route-handler tests

## Acceptance criteria

- Login uses one documented flow with no fallback probing.
- A session reliably restores user and tenant context.
- Expired and revoked sessions return the user to login with an understandable message.
- Secrets never enter client bundles, browser storage, browser-visible URLs, or client logs.
- Timeline access is authorized for the session's tenant.
- Logout invalidates both local session state and any server-side session or token required by the chosen model.

## Dependencies and risks

- Requires an API-side authentication decision before legacy Passport endpoints are removed.
- Changing session encoding may require invalidating existing UI cookies.
- Public shared views need a separate scoped authorization model.

## Architecture decision

MiLog UI will use a trusted backend-for-frontend session against one dedicated API contract: `/auth/login`, `/auth/session`, and `/auth/logout`. The API login response must bind the authenticated user to a tenant and issue a bearer token; the UI encrypts that server-side session into an HTTP-only cookie and forwards the token only from route handlers.

Until the API adds that contract, the UI uses one explicit compatibility flow matching the routes that exist today: Passport `/oauth/token`, `/api/user`, and the configured tenant API key for `/api/v1/timeline`. There is no endpoint probing, and credentials remain server-only. This compatibility mode cannot satisfy tenant-to-user binding or upstream logout revocation, so the stage must remain incomplete.

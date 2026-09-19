# P2: Update Deployment Configuration

## Goal

Align MiLog UI configuration and operational documentation with the API's new production container topology.

## Implementation

- Replace `NEXT_PUBLIC_MILOG_API_URL` with a server-only `MILOG_API_URL` because API calls are made by route handlers and server utilities.
- Keep the public browser origin separate if the UI needs it for generated links.
- Update `.env.example` with required and optional variables, safe examples, and comments describing ownership.
- Update the README with:
  - Local API address and TLS behavior
  - Production ingress/API address
  - Authentication configuration
  - Tenant API-key usage if it remains supported
  - Health and smoke-test procedures
- Ensure UI deployment networking can reach the API Nginx service without assuming a browser-accessible internal hostname.
- Confirm TLS termination and certificate validation behavior in development and production.
- Add configuration validation so missing production variables fail early.
- Define compatible release ordering for API migrations and UI rollout.

## Deployment sequence

1. Deploy API migrations and cursor-compatible API behavior while preserving offset compatibility.
2. Verify the API health endpoint and first/second cursor pages.
3. Deploy the cursor-aware UI.
4. Verify login, session restoration, timeline filters, load more, export, alerts, and sharing.
5. Remove obsolete compatibility behavior only after production telemetry confirms the new path is in use.

## Affected files

- `.env.example`
- `README.md`
- `lib/milogServer.ts`
- Deployment manifests or hosting configuration when added
- Smoke-test scripts or documented commands

## Acceptance criteria

- The API base URL is absent from the client bundle unless intentionally exposed for a documented reason.
- Production fails fast when required server configuration is missing.
- UI containers can reach the API through the intended network path.
- A documented smoke test verifies authentication and at least two cursor pages.
- Rollback instructions identify compatibility constraints between UI and API releases.

## Dependencies and risks

- Depends on the final authentication configuration.
- API and UI may be deployed independently, so both sides need a compatibility window.
- Local self-signed TLS must not encourage disabling certificate verification in production.


# MiLog UI

MiLog UI is a Next.js App Router application for the MiLog marketing page, login flow, authenticated timeline dashboard, and read-only shared timeline views.

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file from the example:

```bash
cp .env.example .env.local
```

For local API development, set:

```env
MILOG_API_URL=http://localhost:8980
MILOG_SESSION_SECRET=replace-with-at-least-32-random-characters
```

Generate a local session secret with `openssl rand -base64 32`. Both variables are server-only and must never use the `NEXT_PUBLIC_` prefix.

## Authentication Contract

MiLog UI uses a backend-for-frontend session. The browser submits credentials only to the UI route handler, which calls the versioned tenant-bound API:

- `POST /api/v1/auth/login` authenticates into one tenant.
- `POST /api/v1/auth/refresh` rotates short-lived access and refresh tokens.
- `GET /api/v1/auth/me` validates and restores the tenant-bound identity.
- `POST /api/v1/auth/logout` revokes the current token family.
- `GET /api/v1/timeline` accepts either producer API keys or tenant-bound UI bearer tokens. The UI always uses the bearer token.

UI sessions last no longer than eight hours, are revalidated when restored, and are stored in an encrypted HTTP-only, same-site cookie. Access and rotating refresh tokens remain inside the encrypted server-managed cookie and are never returned to browser JavaScript.

Users with multiple active memberships are prompted to select a tenant before the session is issued. Revoked credentials, inactive memberships, and expired sessions return the viewer to login with an understandable message.

## Signup and API credentials

The UI now supports owner signup, email verification, entitlement status, and owner/admin API-key management through server-side `/api/v1` calls. The API owns users, tenants, evaluation policy, and keys. `MILOG_TERMS_URL` must point to approved terms before the UI enables signup or links to it from login; production URLs must use HTTPS. Configure `MILOG_UI_URL` in the API to this UI's actual origin and enable production SMTP with SPF, DKIM, and DMARC before publishing signup.

The `/verify-email` page removes its token from browser history before submitting it and uses `Referrer-Policy: no-referrer`. Created API keys are shown once; the list contains only metadata. Owners and admins can create temporary keys when `GET /entitlement` allows it and can revoke keys. Current passwords are required for creation and cleared from the form after submission. Paid checkout and paid-key creation are not exposed because billing integration is not available.

Because the email link initially contains `?token=`, redact that query parameter from UI reverse-proxy, access, error, and analytics logs before enabling signup. The page itself does not log or retain the token.

Public marketing signup and evaluation claims remain withheld until approved onboarding terms and launch policy are ready. The API's evaluation and key limits are configuration, so the UI uses entitlement eligibility rather than copying their default values.

Do not commit `.env.local`; it is ignored by git.

## Run

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run with Docker Compose

The included `compose.yaml` builds the production image and loads its container-specific runtime configuration from `.env.docker`. Set the API address from the container's point of view:

```bash
cp .env.docker.example .env.docker
```

Populate `MILOG_SESSION_SECRET` before starting Compose. The example API address connects to a separately running MiLog API container through the API's published host port. Keep `.env.local` for running the UI directly on the host.

Build and start the UI:

```bash
docker compose up -d --build
```

After source changes, rebuild and recreate only the UI service:

```bash
docker compose up -d --build --force-recreate ui
```

Inspect its state and logs:

```bash
docker compose ps
docker compose logs -f ui
```

If the API uses another published address, change `MILOG_API_URL` in `.env.docker`. `MILOG_API_URL=http://localhost:8980` is appropriate for running the UI directly on the host, but not inside a container because container-localhost refers to the UI container itself.

Password testing should use HTTPS, including locally:

```bash
npm run dev -- --experimental-https
```

Use `https://localhost:3000`. For LAN testing, provide a locally trusted certificate containing the machine hostname or IP through Next.js's `--experimental-https-key` and `--experimental-https-cert` options. Never disable TLS certificate verification.

Important routes:

- `/` - marketing landing page
- `/login` - MiLog login
- `/timeline` - authenticated timeline dashboard
- `/share/[shareId]` - read-only shared timeline

## Maintenance Commands

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run check
```

Use `npm run clean` to remove generated `.next` and `coverage` output.

### API contract drift

The API OpenAPI snapshots live in `contracts/`. TypeScript definitions generated from those documents are checked in under `lib/generated/` and the application-facing API types reference them directly. `npm run check` fails when the generated files do not match the snapshots.

When the MiLog API contract changes, copy the updated `docs/public-api.oas.yaml` and `docs/ui-api.oas.yaml` files into `contracts/`, then run:

```bash
npm run contract:generate
npm run contract:check
```

Commit the schema snapshots and generated types in the same change. CI runs the contract check before lint, typecheck, tests, and the production build.

## Production Deployment

The included multi-stage `Dockerfile` builds Next.js standalone output and runs as an unprivileged user on port `3000`. Required runtime configuration is validated when the production server starts:

```env
MILOG_API_URL=http://milog-nginx
MILOG_SESSION_SECRET=<at-least-32-random-characters>
```

`MILOG_API_URL` belongs to the UI server, not the browser. In the API production Compose topology, attach the UI container to the API's private network and use the API Nginx service name. Do not use a browser-visible hostname or publish the internal API solely for the UI.

TLS should terminate at the public ingress or reverse proxy in front of MiLog UI. Plain HTTP between UI and API is acceptable only on a private, access-controlled container network. If that hop crosses an untrusted network, use an HTTPS API URL with a certificate trusted by the container. Never set `NODE_TLS_REJECT_UNAUTHORIZED=0`.

For rolling deployments, optionally set `DEPLOYMENT_VERSION` to the immutable release or image identifier at build time. All replicas for one release must use the same build and session secret.

### Health and smoke tests

The container health check calls `GET /api/health`. It returns `200` only when required configuration is valid and the API is reachable; an unauthenticated `401` from the API authentication endpoint counts as reachable.

After deployment, use a dedicated low-privilege smoke-test user whose tenant contains more than one cursor page:

```bash
MILOG_SMOKE_ORIGIN=https://milog.example.com \
MILOG_SMOKE_EMAIL=smoke@example.com \
MILOG_SMOKE_PASSWORD='from-your-secret-manager' \
MILOG_SMOKE_TENANT_ID=optional-tenant-uuid \
npm run smoke
```

The test verifies login, encrypted cookie issuance, session restoration, two non-overlapping cursor pages, tenant isolation, and logout. Credentials are read only from the process environment and are not printed.

### Release order and rollback

1. Back up the API database and deploy API migrations.
2. Deploy the API version supporting tenant-bound login, refresh, revocation, bearer timeline reads, and cursor pagination while retaining producer API-key and offset compatibility.
3. Verify API authentication and cursor behavior, then verify UI `/api/health`.
4. Deploy the UI image and run `npm run smoke`.
5. Manually verify filters, load more, export, alerts, shared links, session restoration, and logout.
6. Remove compatibility behavior only after production telemetry confirms the new paths are in use.

To roll back the UI, restore the previous UI image while leaving the compatible API release and migrations in place. Do not roll the API back below tenant-bound authentication or cursor support while this UI release is active. Database migrations must use the API project's documented rollback procedure; avoid reversing authentication migrations while active UI sessions exist.

## Test Coverage Priorities

Use coverage as a map of missing product behavior, not just a line-percentage target. New tests should name the component, provider, route, or library entity they protect and should favor user-visible behavior, state transitions, API normalization, persistence, and failure handling.

Highest-priority gaps:

- Auth and API boundaries: `LoginForm`, `AuthProvider`, auth route handlers, timeline route handlers, and `lib/milogServer.ts`.
- Timeline behavior: `TimelinePage`, `TimelineFeed`, `TimelineItem`, query drawer state, details drawer state, row selection, inline JSON expansion, refresh, pagination, and shared read-only mode.
- Query and persistence: `FilterPanel`, URL filter serialization, debounced filter changes, localStorage-backed last-used filters, and clear-filter behavior.
- Metadata and exports: `MetadataColumnSelector`, `MetadataChips`, CSV/JSON export formatting, selected metadata columns, and download/copy side effects.
- Share and alerts: share-state encode/decode, `ShareModal`, `AlertsModal`, `AlertBuilder`, alert matching, alert polling, enable/disable, and delete behavior.
- Utility states and providers: `EmptyState`, `ErrorState`, `LoadingSkeleton`, `ToastProvider`, and copy/export/alert toast flows.

Stage 8 adds direct coverage for OpenAPI drift, real Laravel pagination fixtures, UI route-handler status propagation, authentication restore/expiry/logout, timeline pagination and deduplication, filter URL/localStorage persistence, refresh behavior, alert persistence, sharing, and details copy actions. The remaining entries above are the next incremental coverage opportunities rather than release blockers.

## Project Notes

- This project uses Next.js 16 App Router, React 19, Tailwind CSS 4, TanStack Query, and Vitest.
- Next.js 16 removed `next lint`; linting is run through `eslint .`.
- Tailwind CSS is wired through `@tailwindcss/postcss`.
- The app uses CSS font stack names for `Inter` and `JetBrains Mono` instead of `next/font` so local/offline builds do not need to fetch Google-hosted font assets.
- In restricted sandboxes, `next build` can require elevated execution because Turbopack CSS processing may try to bind a local port.

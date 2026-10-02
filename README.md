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
- `GET /api/v1/timeline` must accept the tenant-bound bearer token. The UI sends it, but the current API route still requires `X-API-Key`; apply the UI tenant middleware before deploying this flow.

UI sessions last no longer than eight hours, are revalidated when restored, and are stored in an encrypted HTTP-only, same-site cookie. Access and rotating refresh tokens remain inside the encrypted server-managed cookie and are never returned to browser JavaScript.

Users with multiple active memberships are prompted to select a tenant before the session is issued. Revoked credentials, inactive memberships, and expired sessions return the viewer to login with an understandable message.

Do not commit `.env.local`; it is ignored by git.

## Run

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

## Test Coverage Priorities

Use coverage as a map of missing product behavior, not just a line-percentage target. New tests should name the component, provider, route, or library entity they protect and should favor user-visible behavior, state transitions, API normalization, persistence, and failure handling.

Highest-priority gaps:

- Auth and API boundaries: `LoginForm`, `AuthProvider`, auth route handlers, timeline route handlers, and `lib/milogServer.ts`.
- Timeline behavior: `TimelinePage`, `TimelineFeed`, `TimelineItem`, query drawer state, details drawer state, row selection, inline JSON expansion, refresh, pagination, and shared read-only mode.
- Query and persistence: `FilterPanel`, URL filter serialization, debounced filter changes, localStorage-backed last-used filters, and clear-filter behavior.
- Metadata and exports: `MetadataColumnSelector`, `MetadataChips`, CSV/JSON export formatting, selected metadata columns, and download/copy side effects.
- Share and alerts: share-state encode/decode, `ShareModal`, `AlertsModal`, `AlertBuilder`, alert matching, alert polling, enable/disable, and delete behavior.
- Utility states and providers: `EmptyState`, `ErrorState`, `LoadingSkeleton`, `ToastProvider`, and copy/export/alert toast flows.

## Project Notes

- This project uses Next.js 16 App Router, React 19, Tailwind CSS 4, TanStack Query, and Vitest.
- Next.js 16 removed `next lint`; linting is run through `eslint .`.
- Tailwind CSS is wired through `@tailwindcss/postcss`.
- The app uses CSS font stack names for `Inter` and `JetBrains Mono` instead of `next/font` so local/offline builds do not need to fetch Google-hosted font assets.
- In restricted sandboxes, `next build` can require elevated execution because Turbopack CSS processing may try to bind a local port.

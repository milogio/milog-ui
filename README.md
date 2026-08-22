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
NEXT_PUBLIC_MILOG_API_URL=http://localhost:8980
```

Optional local API compatibility settings:

```env
MILOG_PASSPORT_CLIENT_ID=
MILOG_PASSPORT_CLIENT_SECRET=
MILOG_TIMELINE_API_KEY=
MILOG_LOCAL_TENANT_ID=
MILOG_LOCAL_TENANT_NAME=
```

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

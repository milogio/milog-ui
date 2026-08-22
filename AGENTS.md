<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Testing Guidelines

Coverage work should focus on missing product surfaces and risky entities before pursuing a line-percentage target. When adding tests, prefer proving user-visible behavior, API normalization, state persistence, and failure handling over snapshotting markup.

Prioritize coverage for:

- Auth and API boundaries: `LoginForm`, `AuthProvider`, auth route handlers, timeline route handlers, and `lib/milogServer.ts`.
- Timeline behavior: `TimelinePage`, `TimelineFeed`, `TimelineItem`, query drawer state, details drawer state, row selection, inline JSON expansion, refresh, pagination, and shared read-only mode.
- Query and persistence: `FilterPanel`, URL filter serialization, debounced filter changes, localStorage-backed last-used filters, and clear-filter behavior.
- Metadata and exports: `MetadataColumnSelector`, `MetadataChips`, CSV/JSON export formatting, selected metadata columns, and download/copy side effects.
- Share and alerts: share-state encode/decode, `ShareModal`, `AlertsModal`, `AlertBuilder`, alert matching, alert polling, enable/disable, and delete behavior.
- Utility states and providers: `EmptyState`, `ErrorState`, `LoadingSkeleton`, `ToastProvider`, and copy/export/alert toast flows.

Keep percentages as a health signal, not the goal. A useful test plan should name the untested components, providers, routes, or library entities it closes.

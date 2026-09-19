# Cross-Cutting: Contract Testing and Rollout

## Goal

Prove user-visible behavior and prevent future drift between MiLog API and MiLog UI.

## Contract tests

- Add fixtures for actual Laravel offset and cursor resource responses.
- Verify normalization of `meta.next_cursor`, `links.next`, nullable totals, and end-of-feed responses.
- Verify opaque cursor values are forwarded byte-for-byte.
- Verify every supported filter serializes to the agreed API parameter.
- Verify `401`, `403`, `409`, `422`, and `5xx` responses retain useful status and messages through UI route handlers.
- Generate or validate TypeScript contract types against `docs/public-api.oas.yaml` in CI.

## Product behavior tests

- `TimelinePage`: initial load, load more, end of feed, refresh, auto-refresh, filter changes, selection, and duplicate prevention.
- `FilterPanel`: supported controls, clear behavior, validation, debounce, URL updates, and localStorage persistence.
- Exports: multiple cursor pages, selected metadata fields, repeated-cursor protection, and partial failure.
- Alerts: canonical filters, checkpointing, enable/disable, delete, polling failures, and no duplicate trigger.
- Sharing: payload versioning, invalid tokens, legacy tokens, authentication policy, and cursor exclusion.
- Event details: structured fields, nullable values, copy behavior, and raw metadata.
- Authentication: login, session restore, expiration, logout, tenant association, and upstream failures.

## Rollout checks

- Run lint, typecheck, unit/integration tests, and production build.
- Test against the updated API rather than fixtures alone.
- Seed enough events to require at least three cursor pages, including identical timestamps.
- Insert new events between page requests and confirm no existing event is skipped or duplicated.
- Exercise old saved filters, alert rules, share tokens, and session cookies.
- Verify browser and server logs do not contain secrets or full authorization headers.

## Suggested delivery slices

1. Cursor types, proxy behavior, normalizer, and contract tests.
2. Filter-contract implementation and persistence migration.
3. Event-model expansion and details UI.
4. Export, alert, and sharing migration.
5. Authentication stabilization.
6. Deployment configuration and production smoke testing.

## Completion criteria

- All P0 and P1 acceptance criteria are covered by automated tests.
- The UI passes `npm run check`.
- An integration run against the updated API passes.
- OpenAPI-to-UI contract drift is checked automatically.
- Deployment and rollback procedures are documented and exercised in a non-production environment.


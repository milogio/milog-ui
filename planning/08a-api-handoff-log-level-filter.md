# API Handoff: Display Log-Level Timeline Filter

Status: **Completed by MiLog API 2026-10-03** — 34 tests and 198 assertions passing.

## Request for the MiLog API project

Add a tenant-scoped, cursor-safe log-level filter to `GET /api/v1/timeline` for MiLog UI quick-filter buttons.

## Required contract

- Accept an optional comma-separated `log_level` query parameter containing these viewer-facing values only:
  - `debug`
  - `info`
  - `success`
  - `warning`
  - `error`
- Example: `GET /api/v1/timeline?pagination=cursor&log_level=warning,error`.
- Trim, deduplicate, and validate values. Return the existing Laravel `422` validation response for an unknown value, an empty item, or more than five distinct values.
- Selected levels use OR semantics with each other and AND semantics with `target_id`, `actor_id`, and `type`.
- Preserve tenant scoping before adding the level condition.
- Preserve the existing deterministic order and both cursor and offset pagination behavior.
- Preserve `log_level` in generated pagination links.

## Viewer-facing to stored-value mapping

Apply the same normalization used by MiLog UI badges:

- `debug` matches raw `trace` or `debug`.
- `info` matches raw `info`; also include `NULL` or legacy unknown values if those records are returned as Info by the API/UI contract.
- `success` matches legacy raw `success` values if they can exist in stored data.
- `warning` matches raw `warn` or legacy `warning`.
- `error` matches raw `error` or `fatal`.

Centralize this mapping in one API-domain helper or value object so validation, query behavior, tests, and documentation cannot silently diverge. Do not make the UI expand display levels into raw database values.

## Implementation locations

- Add validation and normalization in `app/Http/Requests/TimelineIndexRequest.php`.
- Add a grouped `whereIn('log_level', ...)` condition in `app/Http/Controllers/Api/V1/TimelineController.php` or a dedicated query scope.
- If Info includes `NULL`, group `whereIn` and `orWhereNull` inside one nested condition so it cannot weaken tenant or other filter constraints.
- Update `docs/public-api.oas.yaml` with an optional `log_level` string parameter, its comma-separated format, allowed display values, OR/AND semantics, and examples.
- Update API documentation explaining that ingestion continues to accept raw canonical values while timeline filtering uses viewer-facing normalized levels.

## Required API tests

- Each display level returns every mapped raw level and excludes unrelated levels.
- `debug,error` returns the union of `trace`, `debug`, `error`, and `fatal`.
- Level filtering remains tenant-isolated for both API-key and tenant-bound bearer authentication.
- Level filtering combines correctly with `actor_id`, `target_id`, and `type`.
- Unknown, empty, deduplication, and oversized-list behavior matches the documented contract.
- Cursor pagination across at least three pages produces no duplicate or skipped events with a level filter active.
- Identical timestamps retain the `occurred_at`, `created_at`, and `id` tie-break ordering.
- Pagination links retain the complete `log_level` value.
- Offset pagination remains backward compatible.

## Completion handoff to MiLog UI

Provide MiLog UI with:

- The updated `docs/public-api.oas.yaml`.
- The exact released parameter format and normalization mapping.
- Feature-test results for API-key and bearer-token access.
- Confirmation of how `NULL`, `success`, and other legacy raw values are treated.

Once received, MiLog UI should refresh its checked-in contract snapshot, regenerate TypeScript definitions, and implement [the UI plan](./08-p1-log-level-quick-filters.md).

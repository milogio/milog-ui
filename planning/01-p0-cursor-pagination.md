# P0: Correct Timeline Pagination

Status: Implemented on 2026-09-18.

## Goal

Adopt the API's stable cursor pagination without treating offset page numbers as opaque cursors.

## Problem

The API now supports `pagination=cursor` and returns opaque cursor tokens. MiLog UI currently derives `nextCursor` from `meta.current_page` and `meta.last_page`. A subsequent request can therefore send a value such as `cursor=2`, which switches the API into cursor mode with an invalid token.

Cursor state is also part of `TimelineFilters`, allowing transport state to leak into URLs, localStorage, alerts, and share links.

## Implementation

- Extend the API response types in `lib/types.ts` to support cursor metadata:
  - `next_cursor`
  - `prev_cursor`
  - `per_page`
  - offset metadata where backward compatibility remains useful
- Update `normalizeTimelineResponse` in `lib/milogApi.ts`:
  - Prefer `meta.next_cursor`.
  - Optionally parse the cursor from `links.next` as a defensive fallback.
  - Retain offset normalization only for explicit compatibility responses.
- Update `getTimelineServer` in `lib/milogServer.ts`:
  - Send `pagination=cursor` on the first and every subsequent timeline request.
  - Forward opaque cursors unchanged.
  - Remove conversion of numeric cursors into `page` parameters.
- Separate pagination transport state from user-selected filters.
- Update `TimelinePage` so:
  - The first request has no cursor.
  - `getNextPageParam` uses only the normalized opaque cursor.
  - Filter changes start a fresh cursor chain.
  - Manual and automatic refresh restart from the first page.
- Add duplicate-event protection by event ID when pages are combined, guarding against refresh races.

## Affected files

- `lib/types.ts`
- `lib/milogApi.ts`
- `lib/milogServer.ts`
- `components/TimelinePage.tsx`
- `tests/milog-api.test.ts`
- New or existing timeline integration tests

## Acceptance criteria

- The first timeline request includes `pagination=cursor` and no `cursor` value.
- Load-more requests send the exact opaque token returned by the API.
- Offset page numbers are never sent as cursor tokens.
- Cursor values are absent from browser URLs, localStorage, alert rules, and share tokens.
- Changing filters or refreshing cannot reuse a stale cursor.
- Loading all pages produces no duplicate events and stops when `next_cursor` is null.

## Dependencies and risks

- Confirm the final cursor response shape in `docs/public-api.oas.yaml`; its cursor schema should match Laravel's actual resource response.
- Cursor tokens must be treated as opaque and must not be decoded or synthesized in the UI.

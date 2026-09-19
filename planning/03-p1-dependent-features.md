# P1: Preserve Exports, Alerts, and Sharing

## Goal

Make exports, alert polling, and shared timeline views correct under the final filter contract and cursor pagination model.

## Export implementation

- Walk cursor pages using opaque `nextCursor` values.
- Track previously seen cursors and stop with an error if the API repeats one.
- Deduplicate events by ID while preserving API order.
- Define a safe maximum export size or move large exports to a backend job.
- Surface partial failures instead of downloading an incomplete file as a successful export.
- Preserve structured event fields in CSV and JSON after the event-model work is complete.

## Alert implementation

- Store only canonical, server-supported filters in alert rules.
- Never store cursor or page state in an alert.
- Start each polling request from the newest first page.
- Use a stable event identifier as the alert checkpoint in addition to time, because multiple events can share a timestamp.
- Define behavior for legacy alerts whose filters can no longer be represented.
- Continue isolating alert polling failures from the main timeline while exposing a diagnostic state in the alert manager.

## Sharing implementation

- Exclude cursor and other transient state from encoded share data.
- Version the share payload so future filter migrations can be handled explicitly.
- Decide whether shared timelines are public or authenticated.
- If public sharing is required, replace client-only encoded filters with a scoped, expiring server-side share token.
- Never include a tenant API key, bearer token, tenant secret, or raw session in a URL.

## Affected files

- `components/TimelinePage.tsx`
- `components/ShareModal.tsx`
- `components/AlertsModal.tsx`
- `lib/export.ts`
- `lib/alerts.ts`
- `lib/shareState.ts`
- `app/share/[shareId]/page.tsx`
- Relevant export, alert, and sharing tests

## Acceptance criteria

- Multi-page exports contain every matching event exactly once and terminate safely.
- Alerts poll from a fresh first page and do not retrigger the same event.
- Alert rules and share links contain no cursor state.
- Shared views follow a documented authentication policy and work accordingly.
- Legacy alert and share data fails safely or migrates deterministically.

## Dependencies and risks

- Depends on completion of cursor pagination and the filter-contract decision.
- Public sharing requires new API/server behavior and a security review.
- Very large client-side exports can create memory and request-volume problems.


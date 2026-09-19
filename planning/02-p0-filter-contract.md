# P0: Reconcile the Timeline Filter Contract

Status: Implemented on 2026-09-19 using the current public API fields `target_id`, `actor_id`, and `type`.

## Goal

Ensure every filter shown by MiLog UI is executed correctly by the API and never silently ignored.

## Problem

MiLog UI currently exposes date range, log-level, actor display text, message, metadata, and page-size filters. The public timeline API currently accepts only `target_id`, `actor_id`, `type`, and pagination parameters. Laravel request validation returns only recognized fields, so unsupported UI filters can be discarded without an error.

Client-side filtering is not a valid substitute because it can only inspect the cursor pages already loaded.

## Required product decision

Choose one contract before implementation:

1. Extend MiLog API to support the existing UI filters; this best preserves the current product surface.
2. Reduce and rename the UI filters to the API's current `target_id`, `actor_id`, and `type` fields.

The recommended direction is to preserve useful UI filters by adding explicit server support, while also exposing target and type filters. If API expansion is deferred, unsupported controls should be removed or clearly disabled rather than appearing functional.

## Implementation

- Define one canonical `TimelineQuery` type matching the agreed public API parameters.
- Keep UI-only presentation state and pagination state outside that type.
- Update URL serialization and parsing in `lib/urlState.ts` to allowlist only supported, shareable filters.
- Update `FilterPanel` labels and controls to match API semantics exactly.
- Update `getTimelineServer` to serialize only contract-supported parameters.
- Validate and normalize incoming query values at the UI route boundary.
- Define behavior for invalid values returned by old bookmarks or shared links.
- Version saved filter data if field names or semantics change.
- Update the API OpenAPI document and UI fixtures together when the contract changes.

## Affected files

- `lib/types.ts`
- `lib/urlState.ts`
- `lib/milogServer.ts`
- `components/FilterPanel.tsx`
- `components/TimelinePage.tsx`
- `lib/shareState.ts`
- `lib/alerts.ts`
- Related route, filter, alert, and share tests

## Data migration

- Read legacy localStorage filters defensively.
- Map fields only where semantics are equivalent; do not guess that `actor` equals `actor_id`.
- Drop unsupported legacy fields with a one-time user-visible notice if they cannot be migrated.
- Decode old share tokens safely and identify them as legacy when fields are no longer supported.

## Acceptance criteria

- Every active filter changes the outgoing API request and the returned dataset.
- No visible filter is silently discarded.
- Invalid filters receive actionable validation feedback.
- URL, saved-filter, alert, and share serialization all use the same canonical field definitions.
- Changing any filter resets pagination to the first cursor page.

## Dependencies and risks

- Requires agreement with the API team on supported filters and parameter names.
- Metadata searching needs explicit backend semantics for nested values, types, and partial matching.
- Date filters need a documented timezone and inclusive/exclusive boundary policy.

# P1: Expand the UI Event Model

## Goal

Preserve the API's structured event data while continuing to provide friendly display fields.

This work should follow the event-context UX plan so the normalized model supports the actor → action → target presentation consistently.

## Problem

The API returns structured fields including actor, action, target, occurrence time, and creation time. The UI currently collapses much of that information into `actor` and `message`, making precise filtering, event inspection, and lossless export difficult.

## Implementation

- Expand `ApiTimelineEvent` to match the OpenAPI `TimelineEvent` schema.
- Expand the normalized UI event model with:
  - `actor_type`
  - `actor_id`
  - `action`
  - `target_type`
  - `target_id`
  - `occurred_at`
  - `created_at`
- Keep derived display values such as a friendly actor label and formatted message separate from canonical fields.
- Define null handling for timestamps and log levels according to the API schema.
- Retain log-level normalization for UI presentation while preserving the raw API value when needed for export or diagnostics.
- Show structured fields in `TimelineDetailsPanel`.
- Include stable structured columns in JSON and CSV exports.
- Consider target and action columns or metadata chips without overcrowding the primary timeline row.

## Affected files

- `lib/types.ts`
- `lib/milogApi.ts`
- `components/TimelineItem.tsx`
- `components/TimelineDetailsPanel.tsx`
- `lib/export.ts`
- Timeline, normalization, details, and export tests

## Acceptance criteria

- Normalization does not discard any documented event field.
- Event details show actor, action, target, occurrence time, creation time, tenant, and event ID.
- Missing nullable fields render safely without invented timestamps.
- JSON exports retain canonical field names and values.
- CSV exports have documented stable columns plus selected metadata columns.

## Dependencies and risks

- Coordinate naming with the API OpenAPI schema.
- Avoid silently replacing a missing API timestamp with the browser's current time; doing so creates false event history.
- Any display-level log normalization must not alter the underlying event contract.

# P2: Precise timestamps and copy actions

Status: **Completed — 2026-10-05**

## Goal

Make event timing precise and clipboard actions match their labels.

## Dependencies and baseline

14 — Event scanning and density.

Follow the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are planned changes from the 2026-10-04 review, not completed implementation. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

`TimelineItem`, `TimelineDetailsPanel`, timestamp formatting, and toast flows.

## Planned changes

1. Offer exact event timestamps with timezone alongside relative time; choose the presentation and timezone policy in the guideline.
2. Make exact time accessible with keyboard and touch rather than only a native title attribute.
3. Rename the existing clipboard action Copy metadata and preserve its metadata payload.
4. Provide accurate success and failure feedback for clipboard operations.

## Acceptance criteria

- [x] Exact time and timezone can be obtained with pointer, keyboard, and touch.
- [x] Relative and exact times refer to the same event instant; existing formatter behavior remains consistent.
- [x] Copy metadata writes the expected payload, and rejected clipboard operations never report success.

## Validation

Verify timezone/date boundary cases affected by the chosen presentation. Test clipboard content and rejection feedback and check timestamp access without hover.

## Completion record

- Adopted UTC as the canonical event timezone. `formatExactTimestamp` now returns the deterministic `YYYY-MM-DD HH:mm:ss UTC` form and safely handles missing or invalid values.
- Displayed exact UTC time directly beneath every relative row time and retained the exact occurred/created times in details. Each visible value uses a semantic `time` element with the source ISO instant in `datetime`; the row's accessible name also includes the exact UTC instant. Native hover titles are no longer required.
- Widened the desktop time scan column and realigned metadata beneath event context so the added timestamp does not overlap severity or actions.
- Renamed both row and details metadata actions to `Copy metadata`. Actor ID and Target ID actions retain their payload-specific names.
- Added a guarded clipboard helper. Event copy actions now report success only after `writeText` resolves and show a specific error toast when the API is unavailable or rejects the write.
- Added tests for equivalent UTC/offset instants across a date boundary, relative-time equivalence, missing and invalid timestamps, visible semantic time, exact-time accessibility, copy payloads, success feedback, and rejected actor, target, and metadata writes.
- Browser review passed at 1280 × 800 and 390 × 760. Exact UTC times and copy labels remained readable, row actions fit at 390px without horizontal overflow, and successful metadata copy showed the expected toast.
- Passed contract drift checking, lint, typecheck, all 131 tests, and the Webpack production build.
- No design-token changes were required. Cross-component accessibility completion remains stage 16 work.

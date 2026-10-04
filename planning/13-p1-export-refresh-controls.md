# P1: Export and refresh controls

Status: **Completed — 2026-10-04**

## Goal

Make export scope and refresh state clear on every viewport.

## Dependencies and baseline

12 — Readable filter states.

Follow the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are planned changes from the 2026-10-04 review, not completed implementation. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

`TopNav`, `ExportMenu`, and `TimelinePage` export/refresh flows.

## Planned changes

1. Confirm the screenshot/build discrepancy: inspected source shows the extra download control only on mobile.
2. Provide one labeled Export menu with CSV and JSON on desktop and mobile.
3. Label auto-refresh On/Off and expose its state; retain a separate manual refresh action.
4. Keep concise update status and access to exact update time; preserve export progress and error feedback.

## Acceptance criteria

- [x] Both export formats are accessible using keyboard and touch at every supported width.
- [x] Exports include the full filtered result set and preserve existing selected-metadata behavior.
- [x] Auto-refresh state is visible and announced; manual refresh, polling, loading, and failure states behave correctly.
- [x] Shared read-only views preserve existing action restrictions.

## Validation

Test menu open/close and focus return, download side effects, export failures, and refresh state. Verify full-query export and pagination behavior with existing tests and targeted additions.

## Completion record

- Replaced the desktop CSV/JSON pair and mobile CSV-only icon with one labeled Export menu. The menu focuses its first item, supports arrow-key movement and Escape, closes on outside interaction or selection, and returns focus after selection or Escape.
- Connected the toolbar to query activity so manual refresh disables and announces progress without conflating it with pagination. Automatic refresh now shows `Auto-refresh: On/Off` or the narrow `Auto: On/Off` label with matching pressed state.
- Kept the exact update time visible to seconds in a polite status region. Timezone presentation remains intentionally assigned to stage 15.
- Preserved full-query pagination and deduplication in `fetchTimelineForExport`; added orchestration coverage for filtered CSV and JSON downloads, selected metadata columns, success, failures, loading, and shared read-only restrictions.
- Verified at 1280 × 720 and 390 × 720 in the browser. Both export choices fit inside the narrow viewport, focus enters the menu and returns on Escape, refresh exposes its loading state, auto-refresh visibly changes to Off, and the 390px page has no horizontal overflow.
- Passed contract drift checking, lint, typecheck, all 121 tests, and the Webpack production build. The default Turbopack build reached its sandbox-only internal worker port restriction; the application compiled, typechecked, generated all routes, and completed with Next's supported Webpack path.
- No new or changed design tokens were required. Narrow event-row composition remains stage 14 work.

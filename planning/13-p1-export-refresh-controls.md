# P1: Export and refresh controls

Status: **Planned**

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

- [ ] Both export formats are accessible using keyboard and touch at every supported width.
- [ ] Exports include the full filtered result set and preserve existing selected-metadata behavior.
- [ ] Auto-refresh state is visible and announced; manual refresh, polling, loading, and failure states behave correctly.
- [ ] Shared read-only views preserve existing action restrictions.

## Validation

Test menu open/close and focus return, download side effects, export failures, and refresh state. Verify full-query export and pagination behavior with existing tests and targeted additions.

## Completion record

- Implemented changes: pending.
- Checks and browser evidence: pending.
- Accepted guideline decisions and remaining issues: pending.

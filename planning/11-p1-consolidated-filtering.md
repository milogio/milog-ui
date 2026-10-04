# P1: Consolidated filtering

Status: **Planned**

## Goal

Present query composition as one coherent system.

## Dependencies and baseline

10 — Timeline hierarchy.

Follow the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are planned changes from the 2026-10-04 review, not completed implementation. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

`TopNav`, `QueryFilterBar`, `LogLevelQuickFilters`, `FilterPanel`, and `TimelinePage`.

## Planned changes

1. Group active query chips and quick level filters; rename the detailed drawer entry to Advanced filters.
2. Keep remove and clear-all actions discoverable, with a concise query summary.
3. Show a loaded event count without claiming an unavailable total.
4. Preserve server-side filtering, OR within levels, AND across other groups, and no restriction when all levels are cleared.

## Acceptance criteria

- [ ] Users can understand active restrictions and reach advanced controls from the same query area.
- [ ] URL state, debounce, localStorage, and clear-all stay consistent with visible filters.
- [ ] Changing a filter resets pagination without mixing stale results; exports, alerts, and shares preserve query semantics.

## Validation

Verify query/drawer state and loaded counts. Use focused behavior tests for changed persistence, serialization, clear-all, and pagination paths; retain existing contract coverage.

## Completion record

- Implemented changes: pending.
- Checks and browser evidence: pending.
- Accepted guideline decisions and remaining issues: pending.

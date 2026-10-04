# P1: Consolidated filtering

Status: **Completed 2026-10-04**

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

- [x] Users can understand active restrictions and reach advanced controls from the same query area.
- [x] URL state, debounce, localStorage, and clear-all stay consistent with visible filters.
- [x] Changing a filter resets pagination without mixing stale results; exports, alerts, and shares preserve query semantics.

## Validation

Verify query/drawer state and loaded counts. Use focused behavior tests for changed persistence, serialization, clear-all, and pagination paths; retain existing contract coverage.

## Completion record

- Implemented changes: placed exact-filter chips, add-filter editing, quick log-level toggles, a concise OR/AND summary, loaded-event count, clear-all, and `Advanced filters` inside one query surface. Renamed the drawer and labeled its controls as exact-match fields. The secondary header row now contains only metadata, export, and refresh controls.
- Query semantics: selected levels continue to match any selected level, exact fields must all match, and the two groups combine. Clearing from either the query surface or advanced drawer removes both groups. The displayed count uses the deduplicated events already loaded and explicitly avoids claiming a server total.
- Persistence and pagination: focused tests verify debounced URL/localStorage updates and clearing, plus the canonical React Query key changing from the active filter object back to an empty query. Existing cursor, export, alert, and share tests continue to pass without changing their serialized filter contract.
- Browser evidence: reviewed the populated and cleared query at 648 × 840 and in a 390 × 720 narrow frame. Active chips, selected levels, semantics, loaded count, clear action, and advanced access remain in one bounded region without page overflow. The narrow full-height drawer exposes its title, exact fields, explanatory copy, clear action, and close control.
- Checks: ESLint, TypeScript, 109 Vitest tests, the Webpack production build, and `git diff --check` passed after implementation.
- Accepted guideline decisions: use `Advanced filters`, `Exact-match fields`, `Clear query`, `Clear all`, and `n events loaded`; do not display a total until the API supplies a trustworthy total.
- Remaining issue: the secondary metadata/export/refresh row still wraps at intermediate widths. Priority 13 owns consolidating those controls, while priority 12 owns the selected and unselected quick-filter treatment.

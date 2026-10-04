# P1: Log-Level Quick Filters

Status: **Completed 2026-10-03**

## Goal

Let viewers toggle one or more visible log levels directly above the timeline while preserving the meaning and appearance of the badges already shown on each event.

## Product behavior

- Show a compact `Log level` quick-filter group near the existing query controls.
- Render one toggle for each UI display level: `Debug`, `Info`, `Success`, `Warning`, and `Error`.
- Reuse `LogLevelBadge` inside each toggle so filter labels and timeline rows share the same colors, dot, typography, and terminology.
- Make every toggle a real button with `aria-pressed="true|false"` and an unambiguous focus state.
- Use a clearly muted visual state when off and the existing badge treatment when on. Do not rely on color alone: pressed state, contrast, and accessible text must also communicate the state.
- Allow multiple active levels. Selected levels match with **OR** semantics; log-level selection combines with actor, target, and type filters using **AND** semantics.
- Treat all levels off as no log-level restriction. Clicking the last active level turns the filter off rather than producing an empty timeline.
- Keep the canonical display order `debug`, `info`, `success`, `warning`, `error` regardless of click order so URLs, query keys, shares, and alert rules remain stable.
- Reset cursor pagination whenever the selected levels change. The existing query-key change should load a fresh first page.
- Include active levels in exports, shared views, alerts, saved filters, and the clear-all action. Read-only shared timelines may display the toggles but must not expose mutation-only actions.

## Display-level contract

The UI currently normalizes raw API values before rendering them. Quick filters must use the same viewer-facing semantics:

| UI level | Raw stored values matched by the API |
| --- | --- |
| `debug` | `trace`, `debug` |
| `info` | `info`, and legacy/null values that render as Info |
| `success` | `success` for legacy-compatible data |
| `warning` | `warn`, `warning` |
| `error` | `error`, `fatal` |

The API query parameter should therefore accept UI display levels, not raw storage values. This prevents two identical-looking “Debug” or “Error” toggles and guarantees the filter matches what a viewer sees.

## Recommended URL and API shape

- Add `log_level?: LogLevel[]` to `TimelineFilters`.
- Serialize selected values as one stable comma-separated query value, for example:
  - `log_level=warning,error`
- Reject unknown or empty values and deduplicate repeated values at the API boundary.
- Normalize selection order before URL serialization and React Query key construction.
- Never include the cursor in persisted filter state, shares, or alert definitions.

## UI implementation steps

1. Extend the OpenAPI snapshot and generated type only after the API project publishes the new parameter.
2. Change `TimelineFilters` to include the display-level array and add a shared canonical level-order constant.
3. Extend `sanitizeTimelineFilters`, `filtersToSearchParams`, `searchParamsToFilters`, and filter validation to parse, deduplicate, validate, and canonically order the level list.
4. Extend `buildTimelineApiSearchParams` so the BFF forwards the exact canonical `log_level` value.
5. Add an optional active/inactive presentation to `LogLevelBadge`, with the existing timeline appearance remaining the default.
6. Create a small `LogLevelQuickFilters` component whose buttons wrap `LogLevelBadge` and expose `aria-pressed`.
7. Place the component in `TopNav` below or alongside the query bar without crowding the existing filter input and action row.
8. Feed changes through `TimelinePage`'s existing debounced filter state. Confirm cursor reset, selection behavior, refresh, persistence, and URL replacement.
9. Include the new field in alert matching/migration, share-state version handling, export requests, active-filter summaries, and clear-all behavior.
10. Keep old URLs, saved filters, alerts, and version-2 share tokens valid when `log_level` is absent.

## UI tests

- `LogLevelBadge` keeps its current row appearance and renders a distinguishable inactive state when requested.
- Every quick filter reports the correct accessible name and `aria-pressed` state.
- A level toggles on and off; several levels can be selected; the final selected level can be cleared.
- Values serialize in canonical order and invalid/duplicate URL values are removed.
- Actor/target/type filters remain present when a level is toggled.
- Changing levels starts pagination from the first page and prevents stale-page mixing.
- Local storage, shared links, alert rules, and exports preserve the selected levels.
- Legacy state without levels continues to load.
- API errors for invalid levels remain visible through the timeline route handler.

## Acceptance criteria

- Viewers can identify on/off state without depending only on color.
- Toggle labels and timeline badges use the same component and normalized terminology.
- Multi-select semantics are OR within log levels and AND with every other filter.
- Refresh, pagination, exports, alerts, sharing, and saved state all use the same selected levels.
- The browser never performs client-side filtering of a partially loaded timeline.
- Automated tests cover component state, serialization, persistence, pagination reset, and dependent features.
- The UI OpenAPI snapshot and generated types match the released API contract.

## Dependency

The API addition described in [API handoff: display log-level timeline filter](./08a-api-handoff-log-level-filter.md) is complete. MiLog UI now uses the published server-side filter rather than filtering partially loaded cursor pages in the browser.

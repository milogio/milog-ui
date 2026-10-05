# P2: Event scanning and density

Status: **Completed — 2026-10-05**

## Goal

Reduce repetitive event presentation while retaining useful investigation detail.

## Dependencies and baseline

13 — Export and refresh controls.

Follow the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are planned changes from the 2026-10-04 review, not completed implementation. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

`TimelineFeed`, `TimelineItem`, `EventContext`, `MetadataChips`, and details presentation.

## Planned changes

1. Keep actor/action/target aligned; reduce repeated role labels where headers provide adequate context.
2. Define conservative handling of redundant messages and retain complete messages in event details.
3. Provide compact and comfortable density choices and decide whether the preference persists.
4. Preserve row selection, metadata chips, JSON expansion, and keyboard/touch access to actions.
5. Adapt narrow-screen rows to avoid squeezing identities into unusable columns.

## Acceptance criteria

- [x] Both densities improve scanning without losing essential information or usable control targets.
- [x] Long and missing values render predictably; meaningful messages are not discarded.
- [x] Row selection, details, and JSON expansion work without conflicting actions.
- [x] Narrow layouts avoid unintended page overflow and preserve access to full identities.

## Validation

Review long identifiers, missing fields, varied messages, selected rows, multiple metadata chips, and expanded JSON. Test changed selection/expansion behavior and density persistence if introduced.

## Completion record

- Added an Event stream header with Comfortable and Compact pressed-state controls. Comfortable is the default; changes persist under `milog.timeline-density` and apply on the next render.
- Retained desktop time, level, and actor/action/target scan columns while removing repeated desktop Actor and Target labels. Narrow rows hide the column header and stack labeled actor/action/target values at full width so long identifiers wrap rather than squeeze into narrow columns.
- Replaced the `display: contents` selection control with a real button and visible focus box. Selection uses `aria-pressed`; Copy and JSON remain sibling controls, and JSON now exposes expanded state and its controlled panel.
- Suppress a message preview only when it exactly repeats all five normalized canonical context values. Meaningful messages remain visible, empty messages use an explicit fallback, Comfortable allows two preview lines, Compact uses one, and details retain the complete message.
- Made metadata chips width-safe so long values wrap within the row. Density changes do not reduce Copy or JSON control size.
- Added tests for density state and persistence, exact-only message suppression, long and missing values, selected state, JSON expansion, metadata copying, and isolation from row selection.
- Browser review passed at 1280 × 720 and 390 × 720 using long identities, four metadata chips, missing values, selected rows, both densities, keyboard focus, and expanded JSON. The narrow document remained exactly 390px wide with no horizontal overflow.
- Passed contract drift checking, lint, typecheck, all 126 tests, and the Webpack production build.
- No design-token changes were required. Exact timestamp access and clipboard labels/failure feedback remain stage 15 work.

# P1: Timeline hierarchy

Status: **Completed 2026-10-04**

## Goal

Give event results priority over introductory content and configuration.

## Dependencies and baseline

09 — Design-token foundations.

Follow the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are planned changes from the 2026-10-04 review, not completed implementation. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

`TopNav`, `TimelinePage`, `MetadataColumnSelector`, and the sticky header.

## Planned changes

1. Place compact Timeline and tenant context above the query; remove the large routine-workspace introduction.
2. Collapse metadata configuration behind a labeled control displaying the selected count.
3. Reduce persistent header height and keep metadata configuration, selected keys, and state persistence accessible.
4. Review desktop and narrow-screen layouts before settling spacing and placement.

## Acceptance criteria

- [x] At the documented desktop viewport and zoom, the results frame begins in the upper third and the first event follows immediately without reducing readable type. Consolidated filtering in stage 11 can reduce the remaining query height.
- [x] Metadata options remain discoverable; the selected count and persisted keys match.
- [x] Sticky content does not obscure results, focused controls, or drawer content.

## Validation

Record viewport dimensions and before/after renders. Verify metadata selection and persistence and check loading, empty, and error layouts.

## Completion record

- Implemented changes: moved tenant and page-title context into `TopNav`, moved desktop update status into that context row, removed the repeated Timeline introduction, placed metadata selection in a compact count-bearing disclosure, reduced header spacing, disabled sticky positioning below `md`, and made drawers cover the full viewport above the header.
- State and accessibility: metadata choices retain the existing `milog.metadata-columns` persistence contract; each option exposes its show/hide name and pressed state; the disclosure reports its selected count.
- Browser evidence: reviewed at 1280 × 720 and 648 × 840 desktop/tablet viewports at 100% zoom plus a 390 × 680 narrow frame. The results frame reaches the upper third at the recorded desktop sizes. At 390 px, controls wrap within the viewport, the selected-count label compacts, and the header scrolls out with content. A rendered left drawer began at the viewport top and covered the sticky header without clipping its heading or close control.
- Checks: lint, typecheck, the full Vitest suite, a Webpack production build, and `git diff --check` passed after implementation.
- Accepted guideline decisions: the application header owns routine page context; metadata remains on demand; sticky behavior starts at `md`; drawers overlay the header instead of depending on a fixed offset.
- Remaining issue: narrow Timeline rows still crowd actor/action/target content and actions. That pre-existing layout work remains explicitly assigned to stage 14 rather than expanding this hierarchy stage.

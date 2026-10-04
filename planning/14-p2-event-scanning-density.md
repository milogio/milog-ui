# P2: Event scanning and density

Status: **Planned**

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

- [ ] Both densities improve scanning without losing essential information or usable control targets.
- [ ] Long and missing values render predictably; meaningful messages are not discarded.
- [ ] Row selection, details, and JSON expansion work without conflicting actions.
- [ ] Narrow layouts avoid unintended page overflow and preserve access to full identities.

## Validation

Review long identifiers, missing fields, varied messages, selected rows, multiple metadata chips, and expanded JSON. Test changed selection/expansion behavior and density persistence if introduced.

## Completion record

- Implemented changes: pending.
- Checks and browser evidence: pending.
- Accepted guideline decisions and remaining issues: pending.

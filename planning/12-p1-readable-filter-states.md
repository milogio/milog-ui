# P1: Readable filter states

Status: **Planned**

## Goal

Make unselected filters visibly available and selected filters unambiguous.

## Dependencies and baseline

11 — Consolidated filtering.

Follow the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are planned changes from the 2026-10-04 review, not completed implementation. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

`LogLevelBadge`, `LogLevelQuickFilters`, and `MetadataColumnSelector`.

## Planned changes

1. Replace disabled-looking opacity/grayscale on unselected quick filters with readable neutral treatment.
2. Use a checkmark and selected surface in addition to color.
3. Expose selection through aria-pressed on metadata and log-level toggle buttons.
4. Keep severity terminology and selected badge colors consistent with event rows, using the accepted tokens.

## Acceptance criteria

- [ ] Available, selected, focused, and actually disabled controls are distinguishable.
- [ ] State is understandable without color alone and announced correctly.
- [ ] Multi-select and clearing the final active level retain existing behavior.

## Validation

Compare rendered states and measure contrast. Verify keyboard toggling, accessible state, multi-selection, and removal of the final level.

## Completion record

- Implemented changes: pending.
- Checks and browser evidence: pending.
- Accepted guideline decisions and remaining issues: pending.

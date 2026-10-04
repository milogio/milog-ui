# P1: Readable filter states

Status: **Completed 2026-10-04**

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

- [x] Available, selected, focused, and actually disabled controls are distinguishable.
- [x] State is understandable without color alone and announced correctly.
- [x] Multi-select and clearing the final active level retain existing behavior.

## Validation

Compare rendered states and measure contrast. Verify keyboard toggling, accessible state, multi-selection, and removal of the final level.

## Completion record

- Implemented changes: removed opacity and grayscale from available log-level filters; retained each severity dot on a neutral, stronger boundary; added checkmarks and stronger severity surfaces to selected levels; and added checkmarks plus brand/interactive treatment to selected metadata fields. Log-level controls now support a native disabled state with a blocked cursor and reduced opacity.
- Semantics and interaction: log-level and metadata buttons retain `aria-pressed`; native buttons toggle with Space and Enter; selected state no longer depends on color; and removing the final selected level still removes `log_level` without disturbing exact filters.
- Browser evidence: reviewed available and selected levels, metadata options, and visible keyboard focus at 648 × 840 and in a 390 × 720 narrow frame. A mobile stacking defect found during review was fixed by giving the non-sticky header a positioned stacking context, preventing event actions from painting over the metadata popover while keeping drawers above the header.
- Contrast evidence: available secondary text is 6.54:1 against the canvas and its strong control boundary is 3.01:1. Selected severity text against its 10% tinted surface ranges from 4.84:1 for Error to 8.91:1 for Warning. Selected metadata text is 14.88:1 and its brand checkmark is 3.92:1 against the interactive surface.
- Checks: ESLint, TypeScript, 112 Vitest tests, the Webpack production build, and `git diff --check` passed after implementation.
- Accepted guideline decisions: available filters use full-opacity neutral treatment with their severity dot; selected filters add a checkmark and stronger surface; event-row severity badges retain the dot presentation; only actually unavailable controls use disabled styling.
- Remaining issue: filter sizing and label typography remain compact by design. Priority 16 will perform the final cross-component accessibility review after the remaining control and event stages.

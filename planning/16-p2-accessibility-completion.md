# P2: Accessibility completion

Status: **Planned**

## Goal

Close interaction and accessibility gaps across the complete redesigned Timeline.

## Dependencies and baseline

15 — Precise timestamps and copy actions. Accessible behavior is required throughout earlier stages.

Follow the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are planned changes from the 2026-10-04 review, not completed implementation. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

Timeline rows, menus, drawers, metadata controls, refresh controls, and global focus styles.

## Planned changes

1. Audit focus visibility and order across the page, menus, and drawers, including close and focus return.
2. Confirm metadata and auto-refresh state exposure and aria-expanded/controlled-region semantics for JSON.
3. Evaluate the display: contents row-selection button and implement reliable semantics and a visible focus target.
4. Measure rendered text, control, and focus contrast; check reduced motion, zoom, narrow widths, and non-hover interaction.

## Acceptance criteria

- [ ] Every available action is keyboard-operable with visible focus and an accurate accessible name/state.
- [ ] Menus and drawers manage focus predictably; row selection and child actions do not conflict.
- [ ] Contrast findings and any remaining limitations are recorded with affected controls.
- [ ] Shared read-only views and utility states remain understandable and operable.

## Validation

Complete a keyboard walkthrough and inspect the accessibility tree; use available accessibility tooling as support. Add tests for interaction/state gaps, not visual markup snapshots.

## Completion record

- Implemented changes: pending.
- Checks and browser evidence: pending.
- Accepted guideline decisions and remaining issues: pending.

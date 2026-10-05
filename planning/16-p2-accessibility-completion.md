# P2: Accessibility completion

Status: **Completed — 2026-10-05**

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

- [x] Every available action is keyboard-operable with visible focus and an accurate accessible name/state.
- [x] Menus and drawers manage focus predictably; row selection and child actions do not conflict.
- [x] Contrast findings and any remaining limitations are recorded with affected controls.
- [x] Shared read-only views and utility states remain understandable and operable.

## Validation

Complete a keyboard walkthrough and inspect the accessibility tree; use available accessibility tooling as support. Add tests for interaction/state gaps, not visual markup snapshots.

## Completion record

- Added shared dialog focus management to both drawers and the Share and Alerts modals. Each surface now has a labelled modal-dialog relationship, initial close-button focus, contained Tab/Shift+Tab movement, Escape dismissal, body scroll lock, and focus return to its trigger.
- Removed the drawer backdrop from keyboard and accessibility-tree navigation while retaining pointer dismissal. Drawer close actions now include the drawer title in their accessible name.
- Linked the metadata disclosure trigger to its panel, exposed its expanded state, closed it on outside interaction or Escape, and returned focus after keyboard dismissal. Existing metadata buttons retain pressed state and payload-specific names.
- Preserved the real event-row button and its pressed state, sibling Copy metadata and JSON actions, and JSON controlled-region semantics. Browser interaction confirmed that expanding JSON does not open the details drawer and selecting a row focuses the details close control.
- Added live semantics to success/error toasts and loading, empty, and error utility states. Toast dismissal is now a named keyboard action, decorative icons are hidden, and shared views visibly identify themselves as read-only even when a tenant name is present.
- Extended reduced-motion handling to collapse every CSS animation to one effectively instantaneous iteration. Refresh progress remains available through its text and accessible name.
- Raised `--border-control` from 40% to 42% lightness after the browser-rounded 40% value measured 2.99:1. The rendered control boundary now measures 3.23:1 against the canvas; muted text measures 6.53:1, secondary-control text 17.97:1, and the focus indicator 4.73:1.
- Browser review passed at 1280 × 800 and 390 × 760. A 640 CSS-pixel viewport, equivalent to reflow at 200% on a 1280-pixel viewport, retained every action without horizontal overflow. Keyboard review covered drawers, the metadata disclosure, inline JSON, event selection, and the Share modal; the accessibility tree exposed selected and expanded states. Browser logs contained no warnings or errors.
- Added interaction tests for focus containment and return, Escape behavior, disclosure state, toast announcements and dismissal, utility-state announcements, modal labelling, and shared read-only investigation. Contract checking, lint, typecheck, all 137 tests, and the Webpack production build passed.
- Remaining validation boundary: the in-app browser did not expose a browser-zoom override, so stage 17 should repeat the 200% check in a browser with a native zoom control and include assistive-technology testing beyond the inspected accessibility tree.

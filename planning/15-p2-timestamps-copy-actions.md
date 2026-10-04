# P2: Precise timestamps and copy actions

Status: **Planned**

## Goal

Make event timing precise and clipboard actions match their labels.

## Dependencies and baseline

14 — Event scanning and density.

Follow the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are planned changes from the 2026-10-04 review, not completed implementation. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

`TimelineItem`, `TimelineDetailsPanel`, timestamp formatting, and toast flows.

## Planned changes

1. Offer exact event timestamps with timezone alongside relative time; choose the presentation and timezone policy in the guideline.
2. Make exact time accessible with keyboard and touch rather than only a native title attribute.
3. Rename the existing clipboard action Copy metadata and preserve its metadata payload.
4. Provide accurate success and failure feedback for clipboard operations.

## Acceptance criteria

- [ ] Exact time and timezone can be obtained with pointer, keyboard, and touch.
- [ ] Relative and exact times refer to the same event instant; existing formatter behavior remains consistent.
- [ ] Copy metadata writes the expected payload, and rejected clipboard operations never report success.

## Validation

Verify timezone/date boundary cases affected by the chosen presentation. Test clipboard content and rejection feedback and check timestamp access without hover.

## Completion record

- Implemented changes: pending.
- Checks and browser evidence: pending.
- Accepted guideline decisions and remaining issues: pending.

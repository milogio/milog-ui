# P1: Timeline hierarchy

Status: **Planned**

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

- [ ] At the documented desktop viewport and zoom, the first event aims to appear within the upper third without reducing readability.
- [ ] Metadata options remain discoverable; the selected count and persisted keys match.
- [ ] Sticky content does not obscure results, focused controls, or drawer content.

## Validation

Record viewport dimensions and before/after renders. Verify metadata selection and persistence and check loading, empty, and error layouts.

## Completion record

- Implemented changes: pending.
- Checks and browser evidence: pending.
- Accepted guideline decisions and remaining issues: pending.

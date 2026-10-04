# P1: Working navigation and conversion paths

Status: **Planned**

## Goal

Make every navigation item and CTA lead to the action its label promises.

## Dependencies and baseline

18 — Confirm offer/action intent; preserve the existing Timeline design work.

Follow the marketing section of the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are proposals from the 2026-10-04 screenshot/source review, not implemented changes. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

`Nav`, `Hero`, `CodeSection`, `Pricing`, `FinalCTA`, and `Footer`.

## Planned changes

1. Inventory every link and record the intended and actual destination. Current GitHub goes to github.com, API anchors point to the footer, footer entries use #, and Contact sales opens login.
2. Replace placeholders with verified destinations; remove unavailable entries or relabel them accurately. Do not invent repository, sales, docs, legal, or status URLs.
3. Align free/trial/start labels with the confirmed onboarding flow; preserve a distinct, working sign-in path.
4. Provide mobile navigation with the important desktop destinations and sign-in access; include expanded state, keyboard operation, and focus return.
5. Apply anchor offsets for sticky navigation and choose a working secondary hero action, such as the demo or verified docs.

## Acceptance criteria

- [ ] No displayed navigation or CTA silently routes to an unrelated placeholder destination.
- [ ] Contact, signup/trial, sign-in, and documentation labels accurately describe their destinations.
- [ ] Mobile users can reach key sections and sign in without relying on hidden desktop controls.
- [ ] Keyboard users can operate and close navigation; anchor targets are not obscured.

## Validation

Follow every link and CTA; record destination verification. Check mobile/desktop navigation, keyboard focus and dismissal, and sticky anchor positioning. Add behavior tests for new navigation interactions.

## Completion record

- Implemented changes: pending.
- Checks and browser evidence: pending.
- Accepted guideline decisions and remaining issues: pending.

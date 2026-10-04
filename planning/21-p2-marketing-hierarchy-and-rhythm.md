# P2: Home-page hierarchy and rhythm

Status: **Planned**

## Goal

Build a shorter, clearer path from product promise to useful evidence and a next step.

## Dependencies and baseline

20 — Marketing readability and tokens; use verified content from 18.

Follow the marketing section of the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are proposals from the 2026-10-04 screenshot/source review, not implemented changes. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

`app/page.tsx`, `Hero`, `TrustedBy`, `Features`, `CodeSection`, `InteractiveDemo`, `Pricing`, and `FinalCTA`.

## Planned changes

1. Retain the recognizable dark aesthetic and headline/preview pairing, but review viewport-height hero sizing and repeated section padding for excessive empty bands.
2. Evaluate the proposed order: hero, verified proof if available, interactive product example, focused benefits, SDK integration, pricing, final CTA, useful footer.
3. Give the hero preview and full demo distinct purposes; connect benefits to verified user outcomes rather than equal-weight capability claims.
4. Use consistent section spacing with intentional variation; reduce unnecessary separators and investigate screenshot horizontal lines in a fresh render before changing layout.
5. Use the visible hero headline as the meaningful page h1 and maintain a clear heading hierarchy.

## Acceptance criteria

- [ ] The first screen explains audience, purpose, and next action with readable product evidence.
- [ ] The page reaches a useful product demonstration without unnecessary repeated introductions.
- [ ] Benefits, SDK, pricing, and conversion sections form a coherent narrative with deliberate spacing.
- [ ] Desktop and mobile section order, hero height, and heading hierarchy remain understandable.

## Validation

Compare full-page rhythm and normal-scale sections at recorded viewport sizes. Check mobile stacking, long copy, heading structure, and unchanged working anchors; record the accepted order in the guideline.

## Completion record

- Implemented changes: pending.
- Checks and browser evidence: pending.
- Accepted guideline decisions and remaining issues: pending.

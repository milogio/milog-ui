# P2: Home-page hierarchy and rhythm

Status: **Completed 2026-10-05**

## Goal

Build a shorter, clearer path from product promise to useful evidence and a next step.

## Dependencies and baseline

20 — Marketing readability and tokens; use verified content from 18.

Follow the marketing section of the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are proposals from the 2026-10-04 screenshot/source review, not implemented changes. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

`app/page.tsx`, `Hero`, `TrustedBy`, `Features`, `CodeSection`, `InteractiveDemo`, `Pricing`, and `FinalCTA`.

## Planned changes

1. Retain the recognizable dark aesthetic and headline/preview pairing, but review viewport-height hero sizing and repeated section padding for excessive empty bands.
2. Evaluate the proposed order: hero, verified proof if available, interactive product example, focused benefits, API integration, access terms, final CTA, useful footer.
3. Give the hero preview and full demo distinct purposes; connect benefits to verified user outcomes rather than equal-weight capability claims.
4. Use consistent section spacing with intentional variation; reduce unnecessary separators and investigate screenshot horizontal lines in a fresh render before changing layout.
5. Use the visible hero headline as the meaningful page h1 and maintain a clear heading hierarchy.

## Acceptance criteria

- [x] The first screen explains audience, purpose, and next action with readable product evidence.
- [x] The page reaches a useful product demonstration without unnecessary repeated introductions.
- [x] Benefits, API integration, access terms, and conversion sections form a coherent narrative with deliberate spacing.
- [x] Desktop and mobile section order, hero height, and heading hierarchy remain understandable.

## Validation

Compare full-page rhythm and normal-scale sections at recorded viewport sizes. Check mobile stacking, long copy, heading structure, and unchanged working anchors; record the accepted order in the guideline.

## Completion record

### Implemented changes

- Adopted the page order: hero → verified capability strip → interactive sample → focused benefits → API example → access terms → final CTA → footer. Header and footer link order now follows the same path.
- Removed the viewport-height minimum from the hero. Its visible headline is now the sole page `h1`, and the copy identifies the developer audience, product purpose, and two next actions.
- Moved the usable sample directly after the compact proof strip and rewrote its introduction as a short task: choose a severity, open an event, and inspect its generated payload.
- Consolidated six equal-weight feature cards into three verified investigation outcomes: find the relevant event, reconstruct what happened, and carry the result forward.
- Removed bottom borders from every major content section. Alternating subtle surfaces now group benefits and access, while the proof strip and footer retain structural boundaries.
- Added semantic hierarchy tests for the single visible `h1`, section order, and the three outcome groups; updated claim guardrails to reflect the outcome framing.

### Checks and browser evidence

- At 1280 × 720, the hero is 591px after the 57px header, the proof strip is 120px, and the sample starts at page position 768px. The first viewport shows the full promise, actions, preview, and start of verified proof.
- At 768 × 800, the hero stacks to 765px with its preview visible in the first screen; the proof and sample retain the same order. At 390 × 760, the hero is 873px, the proof strip is 140px, and the sample begins at 1070px without horizontal overflow.
- The rendered accessibility tree contains one `h1`, subordinate `h2`/`h3` headings, and each major section exactly once. All Stage 19 anchors remain valid and browser warnings/errors were empty.
- A stitched full-page capture duplicated moving sections even though measured DOM geometry and the accessibility tree contained one copy. Normal viewport captures were stable; Stage 22 owns JavaScript motion and capture stabilization.
- `npm run contract:check`, `npm run lint`, `npm run typecheck`, 153 Vitest tests with coverage, and `npm run build -- --webpack` pass.

### Accepted guideline decisions and remaining issues

- The accepted section order is recorded above and should remain aligned across the page, header, and footer.
- Keep the hero preview as immediate product-shaped evidence and the larger sample as a guided investigation surface.
- Retain the Stage 20 80/112px content spacing, using compact proof/footer bands and alternating surfaces for variation. Stage 22 may change the demo's internal height or motion without changing the narrative order.

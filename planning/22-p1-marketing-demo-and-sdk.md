# P1: Demo and SDK experience

Status: **Completed 2026-10-06**

## Goal

Make product proof honest, useful, accessible, and stable while visitors inspect it.

## Dependencies and baseline

21 — Page hierarchy; use verified product claims and SDK facts from 18 and tokens from 20.

Follow the marketing section of the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are proposals from the 2026-10-04 screenshot/source review, not implemented changes. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

`TimelinePreview`, `InteractiveDemo`, `CodeSection`, and landing sample data.

## Planned changes

1. Label simulated playback and sample events clearly. Reconcile warn/trace/service-filter vocabulary with the actual Timeline or explicitly identify a different raw-log example.
2. Remove unsupported same-UI, scrub, frame-by-frame, and full-trace promises unless the corresponding behavior exists. The current trace link only returns to #demo.
3. Provide a short supported task, filter reset, helpful empty state, and an obvious event-details affordance.
4. Provide pause/static behavior for the hero and demo; honor reduced motion in JavaScript and avoid updates displacing inspected content. Bound sample-stream work and limit updates when hidden/offscreen.
5. Expose selected filter/speed and expanded-row states. Adapt fixed-column rows at narrow widths and keep code/JSON scrolling within panels.
6. Give SDK selectors appropriate accessible semantics, active-panel association, and keyboard behavior. Verify supported package/API examples and include necessary imports/context or label excerpts.
7. Copy the active snippet with accurate success and failure feedback; preserve selection while inspecting/copying code.

## Acceptance criteria

- [x] Every advertised demo interaction works, and sample data is clearly distinguished from production connectivity.
- [x] Visitors can filter, reset, pause, and inspect an event using keyboard and touch without losing the inspected content.
- [x] Reduced-motion preference stops unsolicited motion/stream changes as designed; continuous playback does not accumulate unnecessary work.
- [x] Log messages, controls, and code remain accessible on narrow screens without page overflow.
- [x] The retained HTTP example matches the checked-in public API contract, and clipboard failure is accessible and accurate. SDK tabs remain withheld until supported packages are verified.

## Validation

Test demo filtering/reset/empty results, speed/pause, expansion stability, reduced motion, and hidden/offscreen behavior. Test SDK selection, copied payload, and rejected clipboard writes. Review sample terminology and narrow-screen renders.

## Completion record

- Implemented changes: both simulated streams now have explicit pause/play controls, reduced-motion defaults, visibility and viewport suspension, bounded event buffers, and fixed preview height. The guided demo exposes pressed and expanded states, sample-specific vocabulary, filter reset and empty recovery, stable inspection, disclosure dismissal, and responsive rows. The API example reports clipboard success or failure through visible button state and an announced message.
- Checks and browser evidence: contract check, lint, typecheck, 160 tests with coverage, and the Webpack production build passed. The default Turbopack build was also attempted but the execution environment blocked its internal CSS helper from binding a port. In-app browser review at 648 × 838 exercised severity filtering, service disclosure, event expansion, inspection pause, and horizontal-overflow measurement; body and root widths remained 648px, the expanded row stayed within the 614px demo panel, and browser logs contained no application errors. Automated coverage exercises reduced motion, offscreen suspension, reset/empty behavior, selected states, expansion stability, and both clipboard outcomes.
- Accepted guideline decisions and remaining issues: the marketing stream is an explicitly simulated sample, so its raw-style `warn`, `trace`, and service vocabulary may differ from the normalized authenticated Timeline. Keep the single contract-backed HTTP request until supported SDK packages and examples are product-verified. Native 390px and broader assistive-technology checks remain useful pre-production manual coverage; responsive behavior is also protected by stacked narrow-row CSS and overflow-contained code/JSON panels.

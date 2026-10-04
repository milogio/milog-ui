# P1: Demo and SDK experience

Status: **Planned**

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

- [ ] Every advertised demo interaction works, and sample data is clearly distinguished from production connectivity.
- [ ] Visitors can filter, reset, pause, and inspect an event using keyboard and touch without losing the inspected content.
- [ ] Reduced-motion preference stops unsolicited motion/stream changes as designed; continuous playback does not accumulate unnecessary work.
- [ ] Log messages, controls, and code remain accessible on narrow screens without page overflow.
- [ ] SDK examples match verified supported interfaces; selected tabs/panels and clipboard failure are accessible and accurate.

## Validation

Test demo filtering/reset/empty results, speed/pause, expansion stability, reduced motion, and hidden/offscreen behavior. Test SDK selection, copied payload, and rejected clipboard writes. Review sample terminology and narrow-screen renders.

## Completion record

- Implemented changes: pending.
- Checks and browser evidence: pending.
- Accepted guideline decisions and remaining issues: pending.

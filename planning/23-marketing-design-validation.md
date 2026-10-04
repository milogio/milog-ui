# Cross-cutting: Marketing design validation

Status: **Planned**

## Goal

Confirm the combined marketing page is coherent, truthful, and usable across devices.

## Dependencies and baseline

18–22 implemented and individually verified; production rollout gates remain separate.

Follow the marketing section of the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are proposals from the 2026-10-04 screenshot/source review, not implemented changes. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

All landing components, shared token consumers, navigation destinations, and relevant tests.

## Planned changes

1. Review normal-scale desktop, tablet, and mobile captures plus full-page composition; record viewport, zoom, and browser.
2. Validate links and CTA destinations, confirmed offer/claim evidence, readable pricing comparisons, and page headings.
3. Perform keyboard/touch walkthroughs of mobile navigation, anchors, demo controls/details, SDK selectors, and copy feedback.
4. Measure rendered contrast and review zoom/reduced-motion behavior. Verify Timeline and login whenever shared tokens changed.
5. Name the product surfaces and failure paths closed by tests, run required repository checks appropriate to changes, and record real results.
6. Update plan statuses and the guideline decision log; do not mark unresolved claims, broken paths, or validation failures complete.

## Acceptance criteria

- [ ] Offer and capability statements have recorded evidence or are removed from publishable content.
- [ ] All displayed destinations and interactive affordances work and match their labels.
- [ ] Recorded browser evidence covers hierarchy, readability, mobile layout, keyboard access, and motion settings.
- [ ] Required checks pass and affected shared product surfaces have no unresolved design regressions.
- [ ] The guideline records accepted final decisions separately from deferred work.

## Validation

Run applicable lint, typecheck, behavioral tests, and build checks, plus contract checks if API examples/contracts changed. Record browser and destination checks separately. Existing non-production rollout gates still apply before release.

## Completion record

- Implemented changes: pending.
- Checks and browser evidence: pending.
- Accepted guideline decisions and remaining issues: pending.

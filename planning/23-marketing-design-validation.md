# Cross-cutting: Marketing design validation

Status: **Completed 2026-10-06**

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

- [x] Offer and capability statements have recorded evidence or are removed from publishable content.
- [x] All displayed destinations and interactive affordances work and match their labels.
- [x] Recorded browser evidence covers hierarchy, readability, mobile layout, keyboard access, and motion settings.
- [x] Required checks pass and affected shared product surfaces have no unresolved design regressions.
- [x] The guideline records accepted final decisions separately from deferred work.

## Validation

Run applicable lint, typecheck, behavioral tests, and build checks, plus contract checks if API examples/contracts changed. Record browser and destination checks separately. Existing non-production rollout gates still apply before release.

## Completion record

- Implemented changes: no further product-code or token changes were required. The combined Stage 18–22 result retains one evidence-backed existing-account offer, one contract-backed HTTP example, working in-page destinations, one primary heading, explicit simulated-sample language, accessible mobile navigation and demo controls, and overflow-contained event/code panels. The planning index and living guideline now record the accepted marketing baseline.
- Checks and browser evidence: Codex in-app browser review passed at 1280 × 800 desktop, 768 × 800 tablet, 640 × 720 effective high-magnification reflow, and 390 × 760 mobile. Full-page captures showed coherent section order and rhythm. Body/root widths matched every viewport. Mobile navigation opened by touch/click, closed on Escape, and returned focus; Sample demo landed 72px below the sticky header. Demo selection and expansion states worked, opening details paused playback, clipboard success was announced, and `/login` remained readable at 390px. DOM review found one `h1`, one of each anchored section, and no displayed link without a real route or section target. Fonts loaded and browser warning/error logs were empty. Reduced-motion defaults, offscreen suspension, empty/reset behavior, and rejected clipboard writes are covered by behavioral tests. Contract check, lint, typecheck, all 160 tests with coverage, and the Webpack production build passed.
- Accepted guideline decisions and remaining issues: accept the Stage 18–22 marketing home as the final design baseline. Retain the Stage 20 measured contrast values because no shared or marketing token changed: primary text 17.97:1, secondary text 6.53:1 on canvas and 6.35:1 on panels, essential control boundaries 3.23:1 and 3.14:1, and focus 4.71:1 and 4.58:1. Login was rechecked; the Timeline keeps the separately validated Stage 17 baseline and was not affected by Stage 22–23 shared-token changes because there were none. Product-owned commercial terms, approved customer proof, supported SDK packages, branded fonts, and verified public repository/docs/status/legal/sales destinations remain deferred and absent from publishable claims. Environment-dependent Stage 07 release gates and broader native assistive-technology/browser coverage still apply before production release.

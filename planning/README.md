# MiLog UI Implementation Plans

This directory tracks the UI work required to align MiLog UI with the updated MiLog API contract and production architecture.

It also tracks the ordered Timeline and marketing-home design improvements below. Existing API alignment and rollout statuses remain independent of design-plan completion.

## Implementation order

- [x] [P0: Correct timeline pagination](./01-p0-cursor-pagination.md) — completed 2026-09-18
- [x] [P0: Reconcile the filter contract](./02-p0-filter-contract.md) — completed 2026-09-19
- [x] [P0 follow-up: Clarify event context and filter UX](./02a-p0-event-context-filter-ux.md) — completed 2026-09-21
- [x] [P1: Preserve exports, alerts, and sharing](./03-p1-dependent-features.md) — completed 2026-09-21
- [x] [P1: Expand the event model](./04-p1-event-model.md) — completed 2026-09-21
- [x] [P1: Stabilize authentication](./05-p1-authentication.md) — completed 2026-10-02
- [x] [P2: Update deployment configuration](./06-p2-deployment.md) — completed 2026-10-02
- [ ] [Cross-cutting: Complete contract and product testing](./07-testing-and-rollout.md) — implementation complete; non-production rollout gates pending

Progress: **7 of 8 stages complete.**

## Planned enhancements

- [x] [P1: Add log-level quick filters](./08-p1-log-level-quick-filters.md) — completed 2026-10-03
  - [API project handoff instructions](./08a-api-handoff-log-level-filter.md)

## Delivery guidance

- All P0 contract and filter-clarity work is complete.
- Complete the Stage 8 non-production smoke, data-integrity, log-safety, and rollback gates.
- The API-backed display-level quick filters are complete.
- Keep API keys and bearer tokens server-side.
- Treat the API OpenAPI document as the source of truth and add automated contract-drift detection.

## Timeline design execution order

Design baseline: [Design guideline](../docs/DESIGN-GUIDELINE.md). These plans began with the 2026-10-04 screenshot and source review. Stages 09–17 are implemented and validated in order; priority labels describe impact, while numbering captures dependencies.

- [x] [09 — P1: Design-token foundations](./09-p1-design-token-foundations.md) — completed 2026-10-04
- [x] [10 — P1: Timeline hierarchy](./10-p1-timeline-hierarchy.md) — completed 2026-10-04
- [x] [11 — P1: Consolidated filtering](./11-p1-consolidated-filtering.md) — completed 2026-10-04
- [x] [12 — P1: Readable filter states](./12-p1-readable-filter-states.md) — completed 2026-10-04
- [x] [13 — P1: Export and refresh controls](./13-p1-export-refresh-controls.md) — completed 2026-10-04
- [x] [14 — P2: Event scanning and density](./14-p2-event-scanning-density.md) — completed 2026-10-05
- [x] [15 — P2: Precise timestamps and copy actions](./15-p2-timestamps-copy-actions.md) — completed 2026-10-05
- [x] [16 — P2: Accessibility completion](./16-p2-accessibility-completion.md) — completed 2026-10-05
- [x] [17 — Cross-cutting: Design validation](./17-timeline-design-validation.md) — completed 2026-10-05

Implement accessible behavior within each stage; stage 16 closes cross-component gaps. After each stage, review the rendered result, record validation in that plan, and update the guideline with accepted decisions. Complete existing rollout gates before production release.

## Marketing home design execution order

Continue with 18–23 after the existing design sequence. These priorities come from the 2026-10-04 home-page screenshot and source review. Stage 18 establishes the evidence boundary for later marketing work; shared-token work uses stage 09. Missing product facts stay explicitly unresolved until product-owned evidence is available.

- [x] [18 — P1: Credible offer and product claims](./18-p1-marketing-offer-and-claims.md) — completed 2026-10-05
- [x] [19 — P1: Working navigation and conversion paths](./19-p1-marketing-navigation-and-conversion.md) — completed 2026-10-05
- [x] [20 — P1: Marketing readability and tokens](./20-p1-marketing-readability-and-tokens.md) — completed 2026-10-05
- [x] [21 — P2: Home-page hierarchy and rhythm](./21-p2-marketing-hierarchy-and-rhythm.md) — completed 2026-10-05
- [x] [22 — P1: Demo and SDK experience](./22-p1-marketing-demo-and-sdk.md) — completed 2026-10-06
- [x] [23 — Cross-cutting: Marketing design validation](./23-marketing-design-validation.md) — completed 2026-10-06

Follow the marketing section of the [design guideline](../docs/DESIGN-GUIDELINE.md). Priority expresses impact; execution order also accounts for content and layout dependencies. Preserve the Timeline baseline and record accepted marketing decisions and browser evidence as each plan is completed.

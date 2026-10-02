# MiLog UI API Alignment Plan

This directory tracks the UI work required to align MiLog UI with the updated MiLog API contract and production architecture.

## Implementation order

- [x] [P0: Correct timeline pagination](./01-p0-cursor-pagination.md) — completed 2026-09-18
- [x] [P0: Reconcile the filter contract](./02-p0-filter-contract.md) — completed 2026-09-19
- [x] [P0 follow-up: Clarify event context and filter UX](./02a-p0-event-context-filter-ux.md) — completed 2026-09-21
- [x] [P1: Preserve exports, alerts, and sharing](./03-p1-dependent-features.md) — completed 2026-09-21
- [x] [P1: Expand the event model](./04-p1-event-model.md) — completed 2026-09-21
- [x] [P1: Stabilize authentication](./05-p1-authentication.md) — completed 2026-10-02
- [x] [P2: Update deployment configuration](./06-p2-deployment.md) — completed 2026-10-02
- [ ] [Cross-cutting: Complete contract and product testing](./07-testing-and-rollout.md)

Progress: **7 of 8 stages complete.**

## Delivery guidance

- All P0 contract and filter-clarity work is complete.
- Continue with cross-cutting contract and product testing.
- Keep API keys and bearer tokens server-side.
- Treat the API OpenAPI document as the source of truth and add automated contract-drift detection.

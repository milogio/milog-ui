# MiLog UI API Alignment Plan

This directory tracks the UI work required to align MiLog UI with the updated MiLog API contract and production architecture.

## Implementation order

1. [P0: Correct timeline pagination](./01-p0-cursor-pagination.md)
2. [P0: Reconcile the filter contract](./02-p0-filter-contract.md)
3. [P0 follow-up: Clarify event context and filter UX](./02a-p0-event-context-filter-ux.md)
4. [P1: Preserve exports, alerts, and sharing](./03-p1-dependent-features.md)
5. [P1: Expand the event model](./04-p1-event-model.md)
6. [P1: Stabilize authentication](./05-p1-authentication.md)
7. [P2: Update deployment configuration](./06-p2-deployment.md)
8. [Cross-cutting: Complete contract and product testing](./07-testing-and-rollout.md)

## Delivery guidance

- Complete the two P0 items before changing dependent timeline features.
- Resolve the filter-contract decision before migrating saved filters, alerts, or share links.
- Coordinate authentication changes with the API team before Passport endpoints are retired.
- Keep API keys and bearer tokens server-side.
- Treat the API OpenAPI document as the source of truth and add automated contract-drift detection.

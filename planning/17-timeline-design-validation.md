# Cross-cutting: Timeline design validation

Status: **Planned**

## Goal

Confirm the combined design works across real product flows and document the accepted baseline.

## Dependencies and baseline

09–16 implemented and individually verified. Existing rollout gates remain separate.

Follow the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are planned changes from the 2026-10-04 review, not completed implementation. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

All changed Timeline components, relevant providers/utilities, shared views, and affected shared-token consumers.

## Planned changes

1. Review desktop and narrow-screen renders at recorded viewport sizes, including loading, empty, error, selected, and expanded states.
2. Exercise filters, clear-all, URL/localStorage persistence, pagination, manual/automatic refresh, and metadata persistence.
3. Exercise CSV/JSON export, clipboard success/failure, shares, alerts, and shared read-only restrictions.
4. Name changed or untested entities and close meaningful behavioral gaps under AGENTS.md testing guidance.
5. Run required repository checks appropriate to the implementation and record results; update each plan status, the planning index, and accepted guideline decisions.

## Acceptance criteria

- [ ] The combined UI meets the accepted hierarchy, interaction, and token decisions with recorded browser evidence.
- [ ] Required checks pass, or unresolved failures and their impact are explicitly recorded without marking the stage complete.
- [ ] No API filtering, persistence, export, share, alert, pagination, or read-only regressions remain from the design work.
- [ ] The guideline reflects implemented decisions and distinguishes any deferred proposals.

## Validation

Run the applicable contract, lint, typecheck, behavioral test, and build checks. Complete browser review and affected workflow checks. Production release still requires the pending gates in 07-testing-and-rollout.md.

## Completion record

- Implemented changes: pending.
- Checks and browser evidence: pending.
- Accepted guideline decisions and remaining issues: pending.

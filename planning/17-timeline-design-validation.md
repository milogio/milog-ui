# Cross-cutting: Timeline design validation

Status: **Completed 2026-10-05**

## Goal

Confirm the combined design works across real product flows and document the accepted baseline.

## Dependencies and baseline

09–16 implemented and individually verified. Existing rollout gates remain separate.

Follow the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

All changed Timeline components, relevant providers/utilities, shared views, and affected shared-token consumers.

## Planned changes

1. Review desktop and narrow-screen renders at recorded viewport sizes, including loading, empty, error, selected, and expanded states.
2. Exercise filters, clear-all, URL/localStorage persistence, pagination, manual/automatic refresh, and metadata persistence.
3. Exercise CSV/JSON export, clipboard success/failure, shares, alerts, and shared read-only restrictions.
4. Name changed or untested entities and close meaningful behavioral gaps under AGENTS.md testing guidance.
5. Run required repository checks appropriate to the implementation and record results; update each plan status, the planning index, and accepted guideline decisions.

## Acceptance criteria

- [x] The combined UI meets the accepted hierarchy, interaction, and token decisions with recorded browser evidence.
- [x] Required checks pass, or unresolved failures and their impact are explicitly recorded without marking the stage complete.
- [x] No API filtering, persistence, export, share, alert, pagination, or read-only regressions remain from the design work.
- [x] The guideline reflects implemented decisions and distinguishes any deferred proposals.

## Validation

Run the applicable contract, lint, typecheck, behavioral test, and build checks. Complete browser review and affected workflow checks. Production release still requires the pending gates in 07-testing-and-rollout.md.

## Completion record

- Implemented changes:
  - Shared read-only views now start from the encoded shared filters alone and never merge, persist, or write the signed-in operator's private filter state.
  - Alert polling preserves disabled rules while checkpointing enabled rules, records polling failures without dropping other rules, and does not repeat a notification for the same event.
  - Share-link copy uses the common clipboard result path and reports rejected writes as errors instead of claiming success.
  - Applying, cancelling, removing, or clearing exact filters returns focus to the resulting filter chip or Add filter control.
  - Final-page loading moves focus to an explicit `End of timeline` status, and successful error recovery moves focus to the Event stream heading.
  - Saved alert rows stack on narrow screens, wrap long filter JSON, and keep the dialog vertically scrollable when the rule list grows.
- Checks and browser evidence:
  - Reviewed the combined Timeline at 1280 × 800 and 390 × 760. Desktop coverage included populated, loading, empty, error/retry, export, refresh, auto-refresh, filtering, and pagination states. Narrow coverage included long identifiers, selected rows, details, expanded JSON, share generation, alert create/disable/enable/delete, read-only restrictions, and invalid share tokens.
  - The 390px review measured no page overflow; the saved-alert dialog overflow found during review was removed and remeasured at equal client and scroll widths. Browser console review reported no warnings or errors.
  - `npm run contract:check`, `npm run lint`, `npm run typecheck`, 144 Vitest tests with coverage, and `npm run build -- --webpack` pass.
- Accepted guideline decisions and remaining issues:
  - Stages 09–17 form the accepted Timeline design baseline. Marketing-home recommendations remain planned work in stages 18–23.
  - Production release still depends on the non-production smoke, cursor-integrity, migration, log-safety, and rollback gates in [07-testing-and-rollout.md](./07-testing-and-rollout.md).

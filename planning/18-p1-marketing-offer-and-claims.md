# P1: Credible offer and product claims

Status: **Planned**

## Goal

Give visitors a consistent offer and credible reasons to trust the product.

## Dependencies and baseline

Continue after 17 in the ordered backlog; no new business terms may be inferred from the screenshot.

Follow the marketing section of the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are proposals from the 2026-10-04 screenshot/source review, not implemented changes. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

`Hero`, `TrustedBy`, `Features`, `Pricing`, `FinalCTA`, `Footer`, and demo/SDK copy.

## Planned changes

1. Inventory pricing and free/trial statements: $9 Starter with 1M events conflicts with the final promise of 1M free events monthly; Growth advertises a 14-day trial.
2. Confirm the actual offer, currency, billing period, allowances, retention, limits, and onboarding terms from product-owned information. Record unresolved facts rather than choosing new commercial terms.
3. Audit customer names, SDK availability, performance promises, MQL, integrations, trace correlation, anomaly detection, SSO, and plan features against evidence. UI code alone does not prove backend support.
4. Unify confirmed offer wording across all CTAs and pricing. Remove or qualify unverified claims, customer references, and hardcoded live operational status.
5. Use a documented rationale for a recommended plan; keep inclusion rows aligned and give check/minus icons accessible meanings.

## Acceptance criteria

- [ ] Hero, navigation, pricing, and final CTA describe the same verified offer.
- [ ] Customer references and material capability/performance claims have evidence or are removed from publishable copy.
- [ ] Pricing clearly states confirmed terms and does not leave free versus paid access ambiguous.
- [ ] Operational status is sourced or omitted; no static text implies verified live health.

## Validation

Review all offer/claim surfaces against a recorded evidence inventory. Validate pricing at normal scale and narrow widths; do not mark unresolved business facts as verified.

## Completion record

- Implemented changes: pending.
- Checks and browser evidence: pending.
- Accepted guideline decisions and remaining issues: pending.

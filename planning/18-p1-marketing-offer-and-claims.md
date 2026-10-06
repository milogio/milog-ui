# P1: Credible offer and product claims

Status: **Completed 2026-10-05**

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
5. If verified plans are supplied later, use a documented rationale for any recommended plan, keep inclusion rows aligned, and give check/minus icons accessible meanings. Until then, withhold the comparison rather than inventing terms.

## Evidence inventory

| Claim area | Accepted evidence | Stage 18 disposition |
| --- | --- | --- |
| Structured event ingestion | `contracts/public-api.oas.yaml` documents `POST /api/v1/events`, API-key authentication, required actor/action/target fields, metadata, and idempotency | Replaced speculative SDK tabs with one contract-shaped cURL example using an environment-provided base URL. |
| Tenant timeline and filters | Public/UI OpenAPI contracts plus the implemented Timeline cover tenant scoping, stable cursor pagination, exact actor/target/type/level filters, details, export, filtered sharing, and locally saved matching alerts | Rewrote the hero, capability strip, and feature cards around these implemented behaviors. |
| Pricing and onboarding offer | The repository contains login for existing accounts, but no product-owned price, currency, trial, allowance, retention, seat, overage, or support policy | Removed the three invented plan cards and every free/trial claim. The access section now states that public terms are unavailable and offers sign-in to existing account holders only. |
| Customer proof | No approval or product-owned evidence supports the named customer strip | Removed all named organizations and replaced the strip with implemented product capabilities. |
| Performance and advanced capabilities | No authoritative evidence supports sub-second ingest, backpressure handling, MQL, million-event latency, automatic trace correlation, anomaly detection, Slack/PagerDuty routing, SSO/SAML, or published SDK packages | Removed these claims from publishable copy. Trace-shaped fixture data remains only inside the explicitly labelled simulated sample. |
| Operational status and release version | `/api/health` is implemented, but the landing page has no verified public status source or release feed | Removed the hardcoded operational-status and version statement. |

## Acceptance criteria

- [x] Hero, navigation, pricing, and final CTA describe the same verified offer.
- [x] Customer references and material capability/performance claims have evidence or are removed from publishable copy.
- [x] Pricing clearly states confirmed terms and does not leave free versus paid access ambiguous.
- [x] Operational status is sourced or omitted; no static text implies verified live health.

## Validation

Review all offer/claim surfaces against a recorded evidence inventory. Validate pricing at normal scale and narrow widths; do not mark unresolved business facts as verified.

## Completion record

- Implemented changes:
  - Unified the navigation, hero, access section, and final CTA around the only verified onboarding path: sign-in for an existing MiLog account.
  - Replaced the invented plan matrix with a direct disclosure that public prices, trials, allowances, retention, seats, and support terms are not available yet.
  - Replaced named customer proof and speculative feature language with implemented Timeline capabilities.
  - Replaced unverified multi-language SDK examples with the checked-in public ingestion contract and labelled all moving landing data as simulated sample content.
  - Removed the hardcoded live-status/version statement and customer-like fixture domain.
  - Added claim-guardrail tests for unpublished commercial terms, the public API example, and the absence of customer/speculative capability claims.
- Checks and browser evidence:
  - Reviewed the hero, access disclosure, API example, final CTA, and semantic output at 1280 × 720 and 390 × 760. The narrow page stayed within 390px; the wider cURL payload remained contained by its own horizontal scroller.
  - Browser console review reported no warnings or errors.
  - `npm run contract:check`, `npm run lint`, `npm run typecheck`, 147 Vitest tests with coverage, and `npm run build -- --webpack` pass.
- Accepted guideline decisions and remaining issues:
  - Existing-account sign-in is the sole publishable access offer until product-owned commercial terms are supplied.
  - Repository/docs/status/legal/sales destinations remain Stage 19 work. Public pricing, supported SDK packages, customer proof, and advanced capability claims remain unresolved product decisions and must not be reintroduced without evidence.

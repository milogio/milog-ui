# P1: Signup, evaluation, and API credentials

Status: **UI implementation complete 2026-10-08; non-production integration and launch gates pending**

## Goal and source of truth

Integrate the API-owned signup, email verification, entitlement, and API-key flows into MiLog UI without moving account or credential ownership into the UI. Implement against the API project's [UI handover](../../milog-api/docs/milog-ui-handover.md) and [UI OpenAPI contract](../../milog-api/docs/ui-api.oas.yaml). The API base path is `/api/v1`.

This stage extends the completed tenant-bound backend-for-frontend authentication flow in [stage 05](./05-p1-authentication.md). Checkout, billing webhooks, paid upgrades, and business ownership verification are outside this stage because the API handover does not provide them.

## Current UI baseline

- `lib/milogServer.ts` already keeps access and refresh tokens in an encrypted HTTP-only session cookie and calls the API with a tenant-bound bearer token.
- `contracts/ui-api.oas.yaml` and `lib/generated/ui-api.ts` cover login and session endpoints but do not yet include signup, entitlement, or API keys.
- The API login contract includes `tenant.role`, but `sessionFromTokenPayload` and `validateSessionServer` currently drop it. The client auth state therefore cannot distinguish an owner/admin from a member.
- `upstreamError` currently loses Laravel field errors, `error.code`, and `Retry-After`. Its generic `401` classification also cannot distinguish an expired UI session from an incorrect key-creation step-up password.
- Marketing and login offer existing-account sign-in only. No signup, verification, account, or key-management route exists. The [marketing guideline](../docs/DESIGN-GUIDELINE.md) withholds public trial claims until product-owned onboarding terms are confirmed.

## Implementation sequence

### 1. Contract and server boundary

1. Sync `contracts/ui-api.oas.yaml` from the API's current `docs/ui-api.oas.yaml`, regenerate `lib/generated/ui-api.ts`, and use its generated request/response types for the new operations. Keep the contract drift check in `npm run check`.
2. Add typed entitlement, API-key metadata, and tenant-role models. Preserve the role through login, refresh, `/auth/me` validation, the encrypted session, `/api/auth/session`, and `AuthProvider`. Treat the API's authorization decision as final even when the UI hides controls by role.
3. Extend the server error model and UI route responses to retain HTTP status, safe API error code, Laravel `errors`, and `Retry-After`. Preserve tenant-selection details for login. Avoid returning internal diagnostics, bearer tokens, passwords, or raw upstream bodies to the browser.
4. Add same-origin UI route handlers for signup, resend, verification, entitlement, key list, key creation, and key revocation. These call `/api/v1` server-side with JSON headers and `cache: "no-store"`. Authenticated handlers read and validate/refresh the UI session, then forward only `Authorization: Bearer` to the API. Never use producer `X-API-Key` for management calls.
5. Return `Cache-Control: no-store` on credential and account responses, especially the one-time key-creation response. Treat API `204` as an empty success response. Clear a failed or revoked UI session only for genuine session failures, not for `invalid_credentials` on the step-up password.

### 2. Signup and verification

1. Add `/signup` with owner name, organization name, email, password, confirmation, and required terms acceptance. Enforce the documented 12-character password minimum and confirmation in the form while displaying API `422` field errors. Submit `terms_accepted: true` only when checked.
2. After every successful `202`, show the same generic check-email state. Do not infer or display whether the email belongs to a new, pending, or existing account. Provide a resend form with the same generic success state and `429` retry guidance.
3. Add `/verify-email` for the emailed `?token=` link. Read the token only for the verification request, remove it from browser history promptly, apply a no-referrer policy on this route, and exclude third-party scripts or analytics there. Show success with a sign-in action, or an invalid/expired state with resend. Do not place the token in storage, client logs, toast text, or follow-on URLs.
4. Keep login's `401` message generic. Show a verification reminder only when the visitor comes from the signup flow; verification does not create a UI session, so the user signs in through the existing login flow afterward.

### 3. Entitlement and API keys

1. Add a signed-in account/credentials screen reachable from the timeline. Fetch `GET /entitlement` after session restoration and on account entry; show the API-provided state and dates. Use `can_create_temporary_key` for eligibility instead of calculating trial policy from dates or hard-coded limits.
2. For owner/admin sessions, fetch `GET /api-keys` and show metadata: name, prefix, kind, status, creation, expiry, revocation, and last use. Include `legacy` keys in the list but never offer legacy issuance or raw-value recovery. Members may see account status but not key controls; the API still enforces the role.
3. During evaluation, create `kind: "temporary"` only when eligible. Require a name and the current password. Clear the password immediately after the request settles. Display `api_key` only in the immediate success view with copy/download guidance and a clear warning that it cannot be retrieved again. Keep it out of persistence, query caches, telemetry, and later list responses; remove it from component state when the view closes.
4. Confirm revocation with a warning that it takes effect on the next API request. Refresh the list and entitlement after creation or revocation. Explain `invalid_credentials`, `forbidden`, `entitlement_required`, `key_limit_reached`, validation, and rate-limit responses with distinct actions. Revocation does not restore the lifetime temporary-key issuance allowance.
5. Do not add a working paid checkout or promise paid-key issuance. A later billing stage may expose paid-key creation only after trusted subscription state and the API's `can_create_paid_key` eligibility support it.

### 4. Entry points and product copy

1. Add a signup link from login when approved terms are configured, and an account/credentials entry from the authenticated timeline. Preserve the current login and shared-view behavior.
2. Update marketing navigation and access CTAs only when public signup is approved and the required terms destination is available. Describe the evaluation accurately without presenting the example 14-day/7-day/two-key values as permanent plan terms; those values are API configuration, not UI policy.
3. Keep pricing and paid-upgrade language consistent with the absence of checkout. Update `README.md`, `.env.example`, deployment notes, and the [design guideline](../docs/DESIGN-GUIDELINE.md) when the new destinations and public claims are accepted.

## Suggested file map

| Area | Likely files |
| --- | --- |
| Contract and models | `contracts/ui-api.oas.yaml`, `lib/generated/ui-api.ts`, `lib/apiContract.ts`, `lib/types.ts` |
| API integration | `lib/milogServer.ts`, new `app/api/signup/**`, `app/api/entitlement/route.ts`, `app/api/api-keys/**`, existing auth route handlers |
| Onboarding UI | new `app/signup/page.tsx`, `app/verify-email/page.tsx`, signup/verification components, `components/LoginForm.tsx` |
| Account UI | new account route and key-management components, `providers/auth-provider.tsx`, `components/TopNav.tsx` |
| Published paths | `components/landing/*`, `README.md`, `.env.example`, deployment configuration, `docs/DESIGN-GUIDELINE.md` |

Read the relevant installed Next.js 16.3.8 guides in `node_modules/next/dist/docs/` before writing framework-dependent code, as required by `AGENTS.md`.

## Acceptance criteria

- [x] Signup submits the documented fields, renders field validation, and displays the same check-email result for every `202`.
- [x] Verification consumes the email token without retaining it in browser history or sending it to analytics/third parties; invalid and expired links offer resend.
- [ ] Pending users cannot gain a UI session. Verified users sign in through the existing tenant-bound flow, and role survives login, refresh, and session restoration.
- [x] Entitlement drives account status and temporary-key eligibility without copied policy math.
- [ ] Only owners/admins see key controls; the API denies unauthorized key operations. Lists show metadata only, including legacy keys. Live API authorization and legacy-key inventory remain to verify.
- [x] Key creation requires a current password; the password is cleared after submission, the raw key appears once, and the response is not cached.
- [ ] Revocation is confirmed and reflected in the list. Session expiry, step-up failure, `403`, `409`, `422`, and `429` produce the intended distinct UI states. Complete the live API pass before closing this criterion.
- [x] No functional paid checkout or unsupported commercial promise is published.

## Verification plan

- Add route-handler and `lib/milogServer.ts` tests for request bodies and headers, session validation/refresh, role propagation, API error normalization, `Retry-After`, no-store responses, and `204` handling.
- Add behavior tests for signup, generic check-email and resend states, token removal, verification outcomes, login reminder scoping, entitlement visibility, role-gated controls, one-time key display, password clearing, and revocation confirmation. Prefer these user-visible and failure paths over markup snapshots.
- Run `npm run contract:check`, `npm run lint`, `npm run typecheck`, `npm run test:run`, and `npm run build`.
- In non-production, exercise new signup through verification, login, entitlement, temporary-key creation, key use, revocation, and session restoration against the updated API. Inspect browser/network/server logs and cache behavior for tokens, passwords, and raw keys. Recheck timeline and read-only shared views.

## Launch gates and dependencies

- [ ] Deploy the API contract and configure `MILOG_UI_URL` to the actual UI origin before enabling signup. Configure production SMTP credentials/from address and SPF, DKIM, and DMARC.
- [ ] Redact the verification `token` query parameter from UI proxy, access, error, and analytics logs before enabling signup; its initial email-link request necessarily reaches the web server before browser history can be cleaned.
- [ ] Have the product/legal owner approve the completed public `/terms` and `/privacy` pages, sourced from `docs/MiLog_Terms_of_Service.docx` and `docs/MiLog_Privacy_Policy.docx`. Both documents now identify 1435529 B.C. LTD. as the legal operating entity and show October 8, 2026 as the effective date. Terms lists legal@milog.ca; Privacy lists privacy@milog.ca. After approval, the UI operator sets `MILOG_TERMS_URL=/terms` (or another approved HTTPS destination); this is not an API approval setting. Until then, do not publish a public signup CTA or new trial claims.
- [ ] Confirm the API-side `MILOG_*` trial and key policies for the launch environment; present actual eligibility from `GET /entitlement` in the UI.
- [ ] Inventory existing CLI-issued `legacy` keys before any later paid-entitlement enforcement.
- [ ] Complete the existing non-production smoke, log-safety, and rollback gates in [stage 07](./07-testing-and-rollout.md), including a rollback rehearsal for the UI release.
- [ ] Treat payment processor selection, verified webhooks, subscription projection, recovery, billing portal, and paid-key UI as a separate future stage.

## Implementation record

- Added public Terms of Service and Privacy Policy routes from the two Word documents, preserving their text and showing the effective date as October 8, 2026. The legal operating entity and contact addresses are filled in both source documents and pages. Footer and signup links reach the pages; the signup gate remains closed until `MILOG_TERMS_URL` is explicitly configured after approval.
- Synced the checked-in UI OpenAPI snapshot and generated types. The BFF now preserves the API tenant role through login, refresh, and session restoration; management routes use only the bearer token from the encrypted UI session.
- Added server-side signup, resend, verification, entitlement, list/create/revoke routes. Errors retain field validation, API codes, and `Retry-After`; account responses use `no-store`. A step-up `invalid_credentials` response leaves the UI session intact. Key-list metadata is explicitly projected so an unexpected raw key in an upstream list response cannot pass through.
- Added signup and verification screens, a generic check-email result, resend recovery, and an account screen with entitlement and key metadata. New raw keys appear in an immediate one-time view with copy/download actions. Password state is cleared after key creation requests, and revocation requires confirmation.
- Gated the signup form and login signup link behind an approved `MILOG_TERMS_URL`; the signup POST route enforces the same gate. The verification page has `Referrer-Policy: no-referrer` and removes the token from browser history before posting. Marketing CTAs retain existing-account sign-in while the product terms remain unresolved.
- Added focused tests for server forwarding and error normalization, generic signup, verification-token cleanup, session entitlement loading, role-gated controls, one-time key handling, and revocation. Contract check, lint, typecheck, the full test suite, and the Webpack production build pass. The default Turbopack build is blocked in this execution environment by an internal port-binding restriction.
- Reviewed the gated signup, missing-token verification, and login routes in the in-app browser. They rendered without browser warnings or errors. A live signup-to-key run awaits an approved terms URL, production-style mail setup, and non-production API credentials.

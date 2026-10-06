# P1: Working navigation and conversion paths

Status: **Completed 2026-10-05**

## Goal

Make every navigation item and CTA lead to the action its label promises.

## Dependencies and baseline

18 — Confirm offer/action intent; preserve the existing Timeline design work.

Follow the marketing section of the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are proposals from the 2026-10-04 screenshot/source review, not implemented changes. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

`Nav`, `Hero`, `CodeSection`, `Pricing`, `FinalCTA`, and `Footer`.

## Planned changes

1. Inventory every link and record the intended and actual destination. Current GitHub goes to github.com, API anchors point to the footer, footer entries use #, and Contact sales opens login.
2. Replace placeholders with verified destinations; remove unavailable entries or relabel them accurately. Do not invent repository, sales, docs, legal, or status URLs.
3. Align free/trial/start labels with the confirmed onboarding flow; preserve a distinct, working sign-in path.
4. Provide mobile navigation with the important desktop destinations and sign-in access; include expanded state, keyboard operation, and focus return.
5. Apply anchor offsets for sticky navigation and choose a working secondary hero action, such as the demo or verified docs.

## Acceptance criteria

- [x] No displayed navigation or CTA silently routes to an unrelated placeholder destination.
- [x] Contact, signup/trial, sign-in, and documentation labels accurately describe their destinations.
- [x] Mobile users can reach key sections and sign in without relying on hidden desktop controls.
- [x] Keyboard users can operate and close navigation; anchor targets are not obscured.

## Validation

Follow every link and CTA; record destination verification. Check mobile/desktop navigation, keyboard focus and dismissal, and sticky anchor positioning. Add behavior tests for new navigation interactions.

## Completion record

### Destination inventory

| Surface | Prior destination | Stage 19 destination |
| --- | --- | --- |
| Desktop and mobile section navigation | Features and Demo were valid; Pricing, Docs, and API Reference were misleading or pointed to the footer | `#features`, `#api-example`, `#demo`, and `#access`, labelled to match each section |
| Account actions | `/login` | `/login`, consistently labelled `Sign in` or `Sign in to MiLog` |
| Hero secondary action | Generic `https://github.com` | `#demo`, labelled `Explore the sample` |
| Access and final CTA | `/login` and `#demo` | Retained with accurate existing-account and sample labels |
| Footer | Sixteen `#` placeholders for product, developer, company, and legal pages | Only the four implemented page sections and `/login`; unavailable repository, docs, status, legal, sales, and company destinations are withheld |

### Implemented changes

- Added a mobile navigation disclosure with the same important section destinations and sign-in action as the desktop header.
- Added explicit expanded state, a stable controlled-menu relationship, a close control, outside-pointer dismissal, Escape dismissal, and focus return to the trigger.
- Replaced the generic GitHub CTA and every placeholder footer link with destinations that exist in this project.
- Renamed the code and access anchors to `#api-example` and `#access` so their labels do not imply unpublished documentation or pricing.
- Added a 4.5rem document scroll offset so sticky navigation does not cover anchored sections.
- Added behavior tests covering every published destination, placeholder removal, mobile disclosure state, selection dismissal, Escape dismissal, and focus recovery.

### Checks and browser evidence

- Reviewed the desktop header and hero at 1280 × 720 and the closed/expanded mobile header at 390 × 760. Both layouts remained within the viewport and browser warnings/errors were empty.
- Followed the API example header link; the URL changed to `#api-example` and the target landed 72px below the viewport top, matching the sticky-header offset.
- Exercised mobile expansion and Escape dismissal in-browser; accessibility state changed from expanded to collapsed and focus returned to the menu trigger.
- `npm run contract:check`, `npm run lint`, `npm run typecheck`, 150 Vitest tests with coverage, and `npm run build -- --webpack` pass.

### Accepted guideline decisions and remaining issues

- Publish only destinations implemented by this project. Add repository, documentation, status, legal, sales, or company links after verified URLs exist.
- Use the sample demo as the hero secondary action and existing-account sign-in as the sole conversion path.
- Stage 20 will review the readability and token treatment of these controls; Stage 23 retains broader zoom and assistive-technology release review.

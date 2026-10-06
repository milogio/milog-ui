# P1: Marketing readability and tokens

Status: **Completed 2026-10-05**

## Goal

Improve supporting-content readability while keeping the shared MiLog identity.

## Dependencies and baseline

19 — Navigation paths; reuse 09 — Design-token foundations.

Follow the marketing section of the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are proposals from the 2026-10-04 screenshot/source review, not implemented changes. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

`app/globals.css`, landing typography, pricing details, navigation, code panels, and CTA styles.

## Planned changes

1. Measure current rendering at normal browser zoom. The full-page image is heavily downscaled and cannot establish CSS font sizes or contrast compliance.
2. Define marketing display, heading, prose, caption, content-width, and section-spacing roles alongside shared palette, radius, focus, and control tokens.
3. Compare readable prose and secondary-copy sizes; use the guideline targets as proposals, not fixed conclusions. Limit tiny uppercase mono labels to genuinely secondary information.
4. Check composited muted text and gradient text/button contrast across backgrounds, hover, and focus; adjust tokens or treatment based on measurements.
5. Reserve glow for primary emphasis and preserve landing trace-token consumers until their vocabulary is intentionally reconciled.

## Acceptance criteria

- [x] Core proposition, navigation, pricing details, and offer terms remain readable at desktop/mobile sizes and browser zoom.
- [x] Marketing token roles and accepted values are documented in the guideline.
- [x] Text, essential control boundaries, and focus indicators have recorded contrast measurements.
- [x] Shared token changes preserve Timeline, login, and landing severity rendering.

## Validation

Capture normal-scale sections and measure actual colors including opacity/gradients. Check wrapping, zoom, font loading, and affected product pages. Avoid tests that snapshot visual class names.

## Completion record

### Implemented changes

- Added marketing roles for display text, section headings, prose, hero ledes, captions, readable copy width, section spacing, and essential control boundaries.
- Applied the roles to the hero, feature introduction, API example, sample demo, access disclosure, and final CTA while retaining 14px supporting copy in cards, navigation, and the footer.
- Removed the extra opacity from the capability strip so secondary text renders directly from the shared text token.
- Reused the shared strong boundary value through a marketing control role. This local rule is necessary because the existing unlayered universal border declaration overrides Tailwind border-color utilities; changing that global cascade would alter the accepted Timeline baseline.
- Kept strong glow on the hero primary action only and retained every landing severity token, including trace.

### Accepted marketing roles

Typography values are font size / line height.

| Role | Mobile | `sm` | `lg` / shared value |
| --- | --- | --- | --- |
| Display | 48px / 48px | 60px / 60px | 72px / 72px |
| Section heading | 30px / 34.5px | 36px / 41.4px | 36px / 41.4px |
| Hero lede | 18px / 32px | same | same |
| Prose | 16px / 28px | same | same |
| Caption | 12px / 18px | same | same |
| Copy width | up to 42rem | same | same |
| Section spacing | 80px per edge | same | 112px per edge |

### Checks and browser evidence

- Reviewed the hero, access terms, card copy, CTA controls, focus ring, and login at 1280 × 720, 640 × 720 effective high-magnification reflow, and 390 × 760. Page width matched each viewport and the system font stack reported loaded.
- Recorded rendered contrast: primary text 17.97:1 on canvas; secondary text 6.53:1 on canvas and 6.35:1 on panels; essential control boundaries 3.23:1 and 3.14:1; focus 4.71:1 and 4.58:1; gradient text 4.71:1–11.18:1 on canvas; primary-button text at least 4.71:1 normally and 4.02:1 through hover opacity.
- Landing severity contrast on panels remains info 8.36:1, warning 10.53:1, error 5.34:1, trace 6.12:1, and debug 8.04:1.
- Browser warnings/errors were empty. `npm run contract:check`, `npm run lint`, `npm run typecheck`, 150 Vitest tests with coverage, and `npm run build -- --webpack` pass.

### Accepted guideline decisions and remaining issues

- Keep shared palette, radius, focus, severity, and elevation foundations unchanged; marketing roles control only landing typography, width, spacing, and essential boundaries.
- Continue using the zero-request system stacks until branded webfonts are selected and measured.
- Native browser zoom and broader assistive-technology coverage remain part of the final Stage 23 release review; the 640px CSS viewport validates the responsive reflow expected from a 1280px layout at 200% magnification.

# P1: Marketing readability and tokens

Status: **Planned**

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

- [ ] Core proposition, navigation, pricing details, and offer terms remain readable at desktop/mobile sizes and browser zoom.
- [ ] Marketing token roles and accepted values are documented in the guideline.
- [ ] Text, essential control boundaries, and focus indicators have recorded contrast measurements.
- [ ] Shared token changes preserve Timeline, login, and landing severity rendering.

## Validation

Capture normal-scale sections and measure actual colors including opacity/gradients. Check wrapping, zoom, font loading, and affected product pages. Avoid tests that snapshot visual class names.

## Completion record

- Implemented changes: pending.
- Checks and browser evidence: pending.
- Accepted guideline decisions and remaining issues: pending.

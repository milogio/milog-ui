# P1: Design-token foundations

Status: **Completed 2026-10-04**

## Goal

Establish consistent semantic tokens before changing the Timeline layout.

## Dependencies and baseline

None within the design sequence.

Follow the [living design guideline](../docs/DESIGN-GUIDELINE.md) and repository `AGENTS.md`. These are planned changes from the 2026-10-04 review, not completed implementation. Read relevant installed Next.js documentation before writing framework-dependent code.

## Primary surfaces

`app/globals.css`, shared controls, and token consumers across the app.

## Planned changes

1. Audit token consumers, including muted text/surface aliases, primary versus brand roles, radius utilities, and duplicated shadows.
2. Define semantic text, surface, action, severity, focus, radius, typography, and elevation roles. Avoid silently changing the meaning of existing utilities.
3. Choose intentional font loading or documented system fallbacks. Make debug visually distinct from success and reconcile trace tokens with supported display levels.
4. Introduce shared focus styling and preserve reduced-motion handling. Record accepted values in the guideline.

## Acceptance criteria

- [x] Token roles and migrated consumers are documented; essential controls and text have measured rendered contrast.
- [x] Font rendering is intentional and consistent, and focus is visible on shared controls.
- [x] Timeline, login, landing, dialogs, and shared-view samples show no unintended regressions from global token changes.

## Validation

Inspect rendered typography, composited colors, focus, and representative shared surfaces. Add behavioral tests only if interaction changes.

## Completion record

- Implemented changes: added compatible semantic surface/text/action/focus/border tokens; separated muted surface from secondary text; made debug neutral and success green; mapped radius and elevation roles; added universal focus-visible treatment; selected explicit system font stacks; strengthened control boundaries; changed gradient actions to a dark foreground; and broadened reduced-motion transition handling. Updated the landing preview dots to use secondary text now that `muted` correctly represents a surface.
- Checks and browser evidence: `npm run lint`, `npm run typecheck`, and all 102 Vitest tests pass. `npx next build --webpack` passes. The default Turbopack build could not create its internal loopback process in the managed environment and failed before CSS parsing; Webpack verified the production CSS and all routes. Browser review covered the home hero/preview, visible keyboard focus, login form, and invalid shared-view error. Existing component tests cover Timeline, modal, drawer, login, severity, and shared behavior affected by the compatible aliases.
- Accepted guideline decisions and remaining issues: system fonts remain the intentional zero-request baseline; trace stays available for landing raw-log samples; control borders meet 3.01:1 against the canvas, secondary text 6.54:1, focus/action 4.74:1, and severity labels at least 5.47:1 against the canvas. Later component stages own label sizing, filter selected states, and JavaScript-driven reduced motion.

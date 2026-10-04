# MiLog Design Guideline

Status: Living design baseline — accepted decisions and planned improvements.
Last updated: 2026-10-04.

## Purpose and maintenance

Use this document to guide implementation and review as the final design develops. Scope includes the Timeline page and its supporting controls, drawers, and states, plus the marketing home page. Timeline density recommendations apply to the working product; marketing recommendations prioritize understanding, credible product evidence, and clear next steps. Authentication is outside the redesign scope except for shared-token regression checks.

The baseline comes from the supplied Timeline and marketing-home screenshots and repository inspection. The marketing image is a 2842 × 9898 full-page capture, displayed here at reduced scale; apparent text size is not a reliable CSS measurement. A screenshot cannot establish responsive behavior, keyboard usability, or measured contrast. Confirm those in the browser.

Update this document when a design decision is accepted. Record the rationale, affected surfaces, and validation evidence in the decision log. Keep proposed values distinct from implemented values. Track execution and completion in the [planning index](../planning/README.md).

## Timeline design principles

- Prioritize reading and investigating events. Query setup and configuration should leave useful space for results.
- Preserve the restrained dark palette and structured data presentation.
- Use consistent hierarchy: page context, query, results toolbar, event feed, then details on demand.
- Make control availability, selection, focus, loading, and failure understandable without relying only on color.
- Preserve API filtering, cursor pagination, persistence, sharing, alerts, and export semantics during visual changes.

## Page hierarchy

- Keep the compact Timeline heading and tenant context in the application header above the query. The desktop update timestamp shares this context row so it does not force the results toolbar onto another line.
- Do not repeat the page title or introductory product description in the routine Timeline workspace.
- Keep metadata configuration in a labeled `Metadata` disclosure with the selected count. Show the full `n selected` wording when space permits and the numeric count at narrow widths; retain persisted selection.
- Aim to show the first event within the upper third of a typical desktop viewport. This is a layout target, not a reason to shrink readable text. Validate at an agreed viewport and browser zoom.
- Keep the compact header sticky from the medium breakpoint upward. Let it scroll normally on narrow screens so wrapped controls do not consume the viewport while reading events.
- Drawers cover the full viewport above the sticky header. Do not maintain a brittle fixed top offset tied to header height.
- Show a loaded event count without implying an API total that is not available.

## Query and filter behavior

- Keep exact-filter chips, the add-filter control, quick log-level filters, query summary, loaded-event count, clear-all action, and `Advanced filters` entry inside one bordered query area.
- Use `Advanced filters` for the detailed drawer. Label its field group `Exact-match fields` and keep the drawer-level `Clear query` action explicit.
- Keep per-chip removal and `Clear all` easy to find. `Clear all` and `Clear query` both remove exact fields and selected levels so the visible query, URL, and persisted state remain aligned.
- Report the number of unique events currently loaded. Label it as loaded data and never present it as the total number of matching events.
- Preserve OR semantics within log levels and AND semantics across other filter groups. No selected levels means no log-level restriction.
- Unselected log-level pills use full-opacity secondary text, a strong neutral boundary, and the level-colored dot. Do not grayscale or fade available controls into a disabled appearance.
- Selected log-level pills replace the dot with a checkmark and use a stronger level-colored boundary and tinted surface. Metadata selections use the same checkmark pattern with the brand boundary and interactive surface.
- Expose selected log levels and metadata with `aria-pressed`. Use the native `disabled` attribute plus reduced opacity and a blocked cursor only for controls that cannot currently be changed.
- Use the supported display levels: Debug, Info, Success, Warning, Error. Preserve raw API normalization.

## Toolbar, export, and refresh

- Offer a single labeled Export menu with CSV and JSON on desktop and mobile.
- Preserve full-query export scope and selected metadata behavior. Disable the menu and label it `Exporting…` while work is in progress; report success and failure through the existing toast system.
- Open the export menu on its first item, support arrow-key movement and Escape, and return focus to the trigger after choosing a format or dismissing with Escape.
- Show `Auto-refresh: On/Off` on wider screens and `Auto: On/Off` at narrow widths. Expose the same state with `aria-pressed` and an explicit accessible name.
- Keep manual refresh separate. Disable it and announce `Refreshing timeline` while the active query refreshes; pagination loading remains independent.
- Keep the latest exact update time visible to seconds and announce changes politely. Add timezone presentation during stage 15 with the event timestamp work.
- Hide export and refresh actions at the `TimelinePage` boundary for shared read-only views as well as in the toolbar presentation.
- The screenshot's apparent duplicate control came from separate responsive branches: desktop had CSV and JSON buttons while mobile had a CSV-only icon. The shared export menu replaces both branches.

## Events and details

- Keep actor, action, and target aligned and understandable without repeating their labels on every row where headers provide sufficient context.
- Retain a message preview when it adds information. Any suppression of redundant messages must be conservative; complete content remains available in details.
- Provide compact and comfortable density choices without shrinking essential text or hit targets below usable sizes.
- Preserve selected metadata chips, row selection, the details drawer, and inline JSON expansion.
- Keep actions available to keyboard and touch users; do not depend exclusively on hover.
- Label the existing metadata clipboard operation `Copy metadata`.
- Offer exact timestamps with timezone alongside relative time, using a keyboard- and touch-accessible presentation rather than relying only on a native hover title.
- Adapt rows at narrow widths so identities, actions, and essential controls remain useful without clipping or unintended page overflow.

## Token audit and intended direction

The current source is [`app/globals.css`](../app/globals.css), with HSL custom properties mapped through Tailwind's inline theme. The table describes the reviewed source and proposed direction, not completed changes.

| Area | Accepted foundation | Follow-up direction |
| --- | --- | --- |
| Surfaces | Canvas `230 25% 5%`, panel `230 22% 7%`, subtle `230 18% 12%`, interactive `230 18% 14%`; subtle and control borders are separate | Preserve the palette and use strong control borders only where boundary recognition matters. |
| Muted roles | `muted` is a surface and `muted-foreground` is secondary text; legacy aliases resolve to explicit semantic roles | Migrate new work toward semantic canvas/surface/text utilities while retaining compatible legacy utilities. |
| Brand and actions | Brand identity, action, focus, and decorative gradient roles are separate; CTA foreground is dark across the blue/cyan gradient | Review action states during component stages and avoid using gradients for routine controls. |
| Severity | Debug is neutral blue-gray; success remains green; trace stays purple for the landing raw-log samples | Reconcile landing raw levels with product display levels during stage 22; retain trace until that decision is implemented. |
| Radius | Control `0.375rem`, panel `0.75rem`, frame `1rem`, pill fully rounded; common Tailwind radii map to these roles | Migrate exceptional hardcoded radii only when the owning component is revised. |
| Typography | Deliberate zero-request system stacks: UI system sans and native monospace | Revisit `next/font` only when actual font files/families are selected; use monospace mainly for identifiers, timestamps, and JSON. |
| Type sizes | Several labels use 10–11px | Establish UI, data, and label sizes; reduce tiny uppercase, widely spaced labels. |
| Focus | Shared 2px action-color outline with 2px offset covers links, controls, summaries, and explicit tab stops | Component stages must preserve the shared indicator and add state semantics where needed. |
| Elevation | Panel and emphasis shadows are the two shared roles used by existing soft/glow utilities | Use emphasis sparingly and review whether routine data surfaces need elevation. |
| Motion | Row/pulse animations stop for reduced motion; global transitions become effectively immediate | Stage 22 must also stop JavaScript-driven landing streams for reduced motion. |

Before introducing a token, identify its role and consumers. Prefer semantic tokens to new isolated color values. Keep shared token changes under review for effects on login, landing, dialogs, alerts, and shared views. Exact replacement values remain open until rendered comparison and contrast checks.

Foundation contrast checks use the implemented HSL values against the dark canvas/panel. Secondary text measures 6.54:1/6.34:1, action and focus 4.74:1/4.59:1, and severity text ranges from 5.31:1 to 10.84:1. Dark CTA text measures at least 4.74:1 across the current blue-to-cyan gradient endpoints. Control borders use a stronger role that measures 3.01:1 against the canvas; panel borders remain intentionally subtle and do not communicate interactive state alone. Recheck composited opacity and component-specific states in the browser as each stage changes them.

## Accessibility and interaction

- Provide visible keyboard focus for buttons, links, inputs, menus, and drawer controls.
- Expose metadata and auto-refresh selection state; expose inline JSON expansion state and its controlled region.
- Review the row-selection button using `display: contents` for dependable semantics and visible focus. Choose the replacement based on browser and assistive-technology behavior.
- Maintain accessible names, predictable focus order, drawer/menu focus return, and touch access.
- Measure rendered text, control, and focus contrast including opacity and compositing; do not infer compliance from token values alone.
- Preserve clear loading, empty, error, export, and copy feedback and shared read-only restrictions.

## Validation and completion

- Review desktop and narrow-screen browser renders, including long identifiers and multiple metadata selections.
- Exercise keyboard-only navigation, focus visibility, menus, drawers, and expansion controls.
- Verify URL filters, debounce, localStorage, clear-all, pagination, refresh, metadata persistence, exports, shares, alerts, and read-only views where affected.
- Follow repository testing guidance: prioritize user-visible behavior, state persistence, API normalization, and failure handling; avoid markup snapshots and tests that merely mirror styling.
- Read the relevant installed Next.js guide before implementation involving Next.js APIs or conventions, as required by `AGENTS.md`.
- Record actual checks and remaining issues in each execution plan. Documentation alone does not satisfy acceptance criteria.

## Marketing home page: assessment and direction

### What to retain

- The dark developer-tool identity, restrained blue/cyan accent, and consistent rounded panels.
- A strong headline paired with product evidence, rather than an abstract illustration.
- The SDK example and interactive demonstration as tangible ways to understand the product.
- A clearly emphasized recommended pricing tier and a final next-step section.

### Findings and evidence boundaries

| Finding | Evidence | Design consequence |
| --- | --- | --- |
| Free offer is inconsistent | Hero/nav promise free access; Starter is $9/month with 1M events; Growth offers a 14-day trial; final CTA promises 1M free events every month | Resolve the actual offer before polishing conversion copy. |
| Navigation promises exceed destinations | GitHub links to the generic GitHub home; API links target the footer; footer links use `#`; Contact sales routes to login | Make labels and destinations match the action users expect. |
| Trust and capability claims need substantiation | Customer names, performance claims, SDK support, MQL, anomaly detection, SSO, and operational status are hardcoded in landing components | Treat these as unverified claims, not proof of current product capabilities or customer relationships. |
| Page rhythm is repetitive | Screenshot shows long dark bands, repeated separators and card treatments; source uses a viewport-height hero and repeated 80/112px section padding | Establish deliberate spacing and a shorter route from promise to product proof. |
| Supporting content appears visually quiet | Screenshot shows subdued feature copy, navigation, pricing details, and footer; source uses small mono labels and additional opacity in places | Verify actual CSS size and contrast at normal browser zoom before choosing adjustments. |
| Demo is distinct from the working Timeline | Separate data/components use warn/trace, service filters, and playback controls; copy calls it the same UI and promises scrubbing | Label the sample honestly and reconcile vocabulary or explain the distinction. |
| Responsive/accessibility gaps are visible in source | Nav links disappear below md without a replacement menu; active tabs/filters and expansion lack explicit state semantics; hero preview auto-updates without a pause control | Plan explicit mobile navigation and interaction states, then verify in a live browser. |

### Offer, proof, and conversion language

- Establish one documented offer covering free access versus trial, price, currency, billing period, event allowance, retention, and what happens at limits. Do not invent commercial terms during a visual redesign.
- Make hero, navigation, pricing, and final CTA language agree with that offer and with the actual onboarding destination.
- Use an action label that accurately describes the next screen. If signup or a sales path does not exist, resolve the destination or change the label; do not silently funnel every action to login.
- Retain customer names only when the relationship and use of the reference are confirmed. If evidence is unavailable, remove the trust strip or replace it with verified product evidence; do not create testimonials or numbers.
- Verify SDK/package availability, API examples, performance promises, integrations, trace support, MQL, and plan features against authoritative project/product information. The inspected UI alone cannot establish backend capability.
- Do not show hardcoded operational status as a live health signal. Link to a verified status source or omit the claim.
- Keep pricing comparisons aligned and readable, with accessible Included/Not included meanings for icons. Prefer a useful recommendation rationale over an unsupported Best value claim.

### Information hierarchy and page rhythm

- Keep one clear primary CTA and use a working demo or documentation destination as the secondary action. Retain GitHub only with a verified repository destination.
- Pair the headline with a concise audience/problem/outcome statement and a readable preview. Do not force the hero to fill the viewport if it creates excessive empty space.
- Evaluate this proposed sequence: hero → verified proof, if available → interactive product example → focused benefits → SDK integration → pricing → final CTA → useful footer.
- Give the hero preview and full demo different jobs: an immediate visual explanation versus a guided investigation. Avoid two undifferentiated moving log tables.
- Replace the equal-weight feature inventory with a few prioritized, verified outcomes and supporting details. Retain the grid only if the resulting content benefits from it.
- Use consistent section spacing with intentional variation around major transitions. Reduce empty bands and redundant separators without compressing paragraphs or control targets.
- Check the conspicuous horizontal lines in the capture against a fresh browser render before treating them as real layout defects; full-page capture artifacts remain possible.

### Marketing typography and shared tokens

- Share palette, focus, severity, radius, and control tokens with the product, but define separate marketing display, section-heading, body, caption, content-width, and section-spacing roles.
- Use readable body copy and keep line lengths controlled. Initial comparison targets are 16–18px prose and 14px secondary copy; these are proposed CSS values to validate, not measured defects in the screenshot.
- Use monospace for code and log data; avoid making key navigation, offer conditions, and pricing comparisons depend on tiny uppercase labels.
- Make important links and text readable against actual surfaces. Gradient text and white text over blue/cyan CTA gradients require checks across the entire gradient, including hover and focus states.
- Reserve strong gradients and glow for primary emphasis. Maintain distinguishable secondary actions and calm comparison surfaces.
- Preserve landing severity consumers during token cleanup: `TimelinePreview` and `InteractiveDemo` currently use `--level-trace`. Do not remove trace merely because it is absent from the product display-level map.

### Demo and SDK experience

- Identify generated events as sample data and make it clear when playback is simulated. Do not imply a connection to real production traffic.
- Give visitors a short supported task, such as filtering errors and opening an event payload, with a clear reset path and helpful empty state.
- Remove unsupported scrub/frame-by-frame/full-trace promises unless those interactions actually exist. The current View full trace link loops back to the demo section.
- Align with the product's normalized level names when representing the actual Timeline. If a raw-log example is intentionally different, label it and remove the same-UI claim.
- Provide a pause/static option for the hero preview and demo, respect reduced motion in JavaScript as well as CSS, and avoid moving content while it is being inspected. Limit ongoing work when the sample is offscreen or hidden.
- Present SDK tabs as an accessible selection control with an associated code panel. Copy the active snippet and report clipboard failure as well as success.
- Verify examples against the supported SDK/API contract. Include required imports/context or clearly mark excerpts; the inspected snippets reference context such as `req`, `trace_id`, and `os` without supplying it consistently.
- Keep code and data scrolling inside their panels. Adapt narrow-screen event rows so message content remains available rather than squeezed out by fixed columns.

### Navigation and accessibility

- Provide a mobile navigation alternative with access to the same important destinations and sign-in action.
- Replace placeholder links with verified destinations or remove unavailable entries. Label a code example as an example rather than full API documentation.
- Use the visible hero headline as the page's meaningful primary heading and keep subsequent headings hierarchical.
- Provide visible focus, selected and expanded states, logical tab order, and reliable menu focus return. Avoid hover-only access to essential content.
- Account for sticky navigation in in-page anchor offsets. Keep focused headings and controls visible at narrow widths and browser zoom.
- Expose pricing inclusion icons with text equivalents; keep decorative icons and backgrounds out of the accessibility tree where appropriate.

### Marketing acceptance review

- Check desktop, tablet, and mobile widths at recorded browser zoom; inspect normal-scale section captures as well as the whole page.
- Follow every navigation, CTA, repository, documentation, pricing, and footer link and record the real destination.
- Verify demo filtering, reset, playback, empty states, expansion, reduced motion, and SDK tab/copy success and failure behavior.
- Measure actual text/control/focus contrast, check keyboard and touch operation, and review the page heading structure.
- Confirm offer wording and claims from available product evidence; leave unresolved business facts explicitly open rather than inventing answers.
- Review the Timeline and login for regressions whenever shared tokens or controls change. Execute the [marketing backlog](../planning/README.md#marketing-home-design-execution-order) and record accepted decisions here.

## Working model recommendation

Use GPT-6 Sol with High reasoning in Codex for the scoped implementation priorities. Use GPT-6 Astra with High reasoning when a later stage needs broad product synthesis across screenshots, source, and business constraints. Provide the screenshot, this guideline, and the current execution plan, and review browser renders after visual changes. Recheck availability when revisiting the choice. Reference: [official OpenAI model guidance](https://developers.openai.com/api/docs/models), consulted 2026-10-04.

## Decision log

| Date | Decision | Status / evidence |
| --- | --- | --- |
| 2026-10-04 | Establish Timeline recommendations and an ordered execution backlog | Documentation baseline only; visual and interaction implementation pending. |
| 2026-10-04 | Add marketing-home assessment, guidelines, and priorities after screenshot/source review | Documentation baseline only; offer, claim verification, and browser validation pending. |
| 2026-10-04 | Adopt semantic surface/text/action tokens, neutral debug, dark gradient-action text, shared focus, system font stacks, radius roles, and two elevation roles | Implemented in stage 09; lint, typecheck, 102 tests, Webpack production build, contrast calculation, and browser review passed. |
| 2026-10-04 | Put Timeline and tenant context in the compact header, remove the repeated workspace introduction, use a count-bearing metadata disclosure, keep the header non-sticky below `md`, and let drawers cover it | Implemented in stage 10; reviewed at 1280 × 720, 648 × 840, and a 390 × 680 narrow frame. Metadata persistence is covered by component and orchestration tests. Narrow event-row density remains stage 14 work. |
| 2026-10-04 | Use GPT-6 Sol with High reasoning for scoped execution priorities | Accepted for stage 10 implementation; retain Astra High for later work needing wider product synthesis. |
| 2026-10-04 | Consolidate exact filters, log levels, query semantics, loaded count, clearing, and advanced access into one query area | Implemented in stage 11; reviewed at 648 × 840 and in a 390 × 720 narrow frame. URL/localStorage clearing, canonical query keys, deduplicated counts, drawer access, and OR/AND semantics are covered by the 109-test suite. |
| 2026-10-04 | Distinguish available, selected, focused, and disabled filter states with neutral boundaries, severity cues, checkmarks, pressed semantics, and native disabling | Implemented in stage 12; reviewed at 648 × 840 and in a 390 × 720 narrow frame with keyboard focus. Available text measures 6.54:1, its boundary 3.01:1, selected severity text 4.84:1–8.91:1, selected metadata text 14.88:1, and its checkmark 3.92:1 against the rendered role surfaces. |
| 2026-10-04 | Use one accessible Export menu at every width, separate manual refresh from explicit automatic-refresh state, and surface active refresh progress | Implemented in stage 13; reviewed at 1280 × 720 and 390 × 720. The menu fits the narrow viewport, opens with focused items, returns focus on Escape, and the page has no horizontal overflow. Full-query CSV/JSON downloads, selected metadata, errors, polling, and read-only restrictions are covered by the 121-test suite. No new design tokens were required. |

## Open decisions

- Branded webfont selection, if the system stacks are later replaced.
- Default row density and whether the density preference persists.
- Exact-time presentation and timezone preference.
- Narrow-screen event-row layout; the compact metadata disclosure presentation was accepted in stage 10.
- Verified free/trial offer, billing terms, plan capabilities, and onboarding/sales destinations.
- Approved customer proof, product capability evidence, repository/docs/status URLs, and supported SDK examples.
- Final marketing section order, typography/spacing roles, and whether the sample demo adopts the working Timeline vocabulary.

Resolve these during the relevant stage using rendered evidence and record the accepted choice above.

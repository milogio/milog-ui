# P0 Follow-up: Clarify Event Context and Filter UX

Status: Implemented on 2026-09-21.

## Goal

Make every timeline event understandable as a structured statement:

> An actor performed an action on a target.

Users should be able to see and filter each part of that statement without needing to know the API's field names.

## Confirmed diagnosis

- The database contains an event whose `actor_type` is `user` and whose `actor_id` is `user-42`.
- A direct timeline API request with `actor_id=user-42` returns that event for the configured tenant.
- The prominent top-bar input currently writes to the API's `type` parameter.
- Entering `user-42` in that input therefore requests `type=user-42`, which cannot match an event whose types are `user` and `invoice`.
- The drawer's filters combine with AND, but the UI does not keep active filters visible after the drawer closes. A stale type or target filter can therefore hide a valid actor match without explaining why.

This is a UI semantics and affordance problem, not an API filtering defect.

## Product language

Use consistent plain-language concepts throughout the UI:

- **Actor**: the entity that initiated or performed the event.
- **Action**: what the actor did.
- **Target**: the entity affected by the action.
- **Entity type**: the category of an actor or target, such as `user`, `service`, `invoice`, or `workspace`.
- **Identifier**: the exact system value for a specific entity, such as `user-42` or `invoice-1001`.

Avoid describing `actor_id` as an actor name. The API stores identifiers, not human-readable names. State that identifier matching is exact and case-sensitive.

## Phase 1: Fix the misleading quick filter

- Remove the generic search framing from the top navigation.
- Replace it with one of these UI-only designs:
  1. A role selector with `Actor ID`, `Target ID`, and `Entity type`, followed by one value input.
  2. Preferably, remove the quick input and show active-filter chips plus a clear “Filter timeline” button.
- Recommended: use the role selector on wider screens and active-filter chips everywhere.
- Default the role selector to `Actor ID`; entering `user-42` must serialize as `actor_id=user-42`.
- Use contextual placeholders:
  - Actor ID: `user-42`
  - Target ID: `invoice-1001`
  - Entity type: `user` or `invoice`
- Rename `Actor or target type` to `Entity type` and add helper text: “Matches either the actor type or target type.”
- Never label any exact-identifier control as generic “Search.”

## Phase 2: Make active query state visible

- Render active filters as persistent labeled chips above the timeline:
  - `Actor ID: user-42`
  - `Target ID: invoice-1001`
  - `Entity type: invoice`
- Give each chip an accessible remove action.
- Provide one visible “Clear all filters” action.
- Keep chips synchronized with the URL, localStorage, share state, alerts, and the filter drawer.
- Show that filters are combined with AND when more than one is active.
- On an empty result, repeat the active filters and suggest removing the most recently added filter.

## Phase 3: Present event context explicitly

- Change the primary timeline row from an actor badge plus formatted message into structured context:
  - Actor: type and identifier
  - Action
  - Target: type and identifier
- Suggested compact row:

  `user · user-42` → `created` → `invoice · invoice-1001`

- Keep the formatted API message as secondary text, not the only explanation of the event.
- Add distinct visual treatment for actor and target so their roles cannot be confused.
- Make actor and target identifiers copyable.
- Consider clickable actor and target tokens that apply the corresponding exact filter.
- Do not overload metadata chips with core actor/target context.

## Phase 4: Improve event details

- Add a “Context” section to the details drawer with a left-to-right actor → action → target layout.
- Show each type and identifier separately with explicit labels.
- Add brief help text or tooltips defining actor and target.
- Show the formatted message under “Summary.”
- Keep tenant, event ID, occurrence time, creation time, level, and metadata in separate sections.
- Never synthesize a missing timestamp or identity value.

## Phase 5: Preserve API limitations honestly

- Keep `actor_id` and `target_id` as separate exact filters.
- The API's `type` field matches either `actor_type` or `target_type`; represent it as a single “Entity type” filter.
- Do not create separate actor-type and target-type controls because the API cannot currently enforce those scopes independently.
- Do not client-filter already loaded pages to simulate unsupported server behavior.
- If users need separate actor-type and target-type filters later, record that as an API contract request rather than disguising it in the UI.

## Affected UI files

- `components/TopNav.tsx`
- `components/FilterPanel.tsx`
- `components/TimelinePage.tsx`
- `components/TimelineFeed.tsx`
- `components/TimelineItem.tsx`
- `components/TimelineDetailsPanel.tsx`
- `components/ActorBadge.tsx`
- New active-filter chip and event-context components
- `lib/types.ts`
- `lib/milogApi.ts`
- `lib/urlState.ts`
- `lib/export.ts`
- Filter, timeline, details, sharing, alert, and export tests

## Testing plan

- Regression: entering `user-42` with the `Actor ID` role requests `actor_id=user-42` and displays the known event.
- Regression: entering `user-42` must never populate `type` unless the user explicitly selects `Entity type`.
- Verify target identifiers serialize only as `target_id`.
- Verify entity type serializes only as `type` and is described as matching either role.
- Verify multiple active filters are all visible and explained as an AND query.
- Verify removing a chip updates the URL, request, localStorage, alerts, and share state.
- Verify timeline rows and details render actor type/ID, action, and target type/ID without relying on the formatted message.
- Verify keyboard and screen-reader labels distinguish actor, action, target, filter role, and filter value.
- Verify empty states list active filters and provide clear recovery actions.

## Acceptance criteria

- A user who enters `user-42` as an actor identifier receives the matching event.
- The top-level filtering experience never presents a type-only field as generic search.
- Users can explain the difference between actor and target from the timeline without opening raw JSON.
- Every event row identifies who acted, what happened, and what was affected.
- Active filters remain visible after the filter drawer closes.
- Combined filters and exact-match behavior are explicit.
- No UI control implies unsupported fuzzy, name-based, actor-type-only, or target-type-only filtering.

## Out of scope

- Changes to MiLog API query parameters or database behavior.
- Fuzzy identifier matching.
- Human-readable identity lookup or directory search.
- Separate `actor_type` and `target_type` API filters.

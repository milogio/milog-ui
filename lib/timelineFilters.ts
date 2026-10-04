export type TimelineFilterKey = "actor_id" | "target_id" | "type";

export const TIMELINE_FILTERS: Array<{
  key: TimelineFilterKey;
  label: string;
  placeholder: string;
  help: string;
}> = [
  {
    key: "actor_id",
    label: "Actor ID",
    placeholder: "user-42",
    help: "The exact identifier of the entity that performed the action.",
  },
  {
    key: "target_id",
    label: "Target ID",
    placeholder: "invoice-1001",
    help: "The exact identifier of the entity affected by the action.",
  },
  {
    key: "type",
    label: "Entity type",
    placeholder: "user or invoice",
    help: "Matches either the actor type or the target type.",
  },
];

export function timelineFilterDefinition(key: TimelineFilterKey) {
  return TIMELINE_FILTERS.find((filter) => filter.key === key)!;
}

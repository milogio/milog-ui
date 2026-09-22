import type { TimelineEvent } from "@/lib/types";

function escapeCsv(value: unknown) {
  const serialized =
    typeof value === "string" ? value : value === undefined || value === null ? "" : JSON.stringify(value);
  return `"${serialized.replaceAll('"', '""')}"`;
}

export function timelineToCsv(events: TimelineEvent[], metadataColumns: string[]) {
  const headers = [
    "id",
    "tenant_id",
    "occurred_at",
    "created_at",
    "log_level",
    "raw_log_level",
    "actor_type",
    "actor_id",
    "action",
    "target_type",
    "target_id",
    "message",
    ...metadataColumns,
  ];
  const rows = events.map((event) =>
    [
      event.id,
      event.tenant_id,
      event.occurred_at,
      event.created_at,
      event.log_level,
      event.raw_log_level,
      event.actor_type,
      event.actor_id,
      event.action,
      event.target_type,
      event.target_id,
      event.message,
      ...metadataColumns.map((key) => event.metadata[key]),
    ]
      .map(escapeCsv)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

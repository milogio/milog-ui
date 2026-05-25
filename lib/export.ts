import type { TimelineEvent } from "@/lib/types";

function escapeCsv(value: unknown) {
  const serialized =
    typeof value === "string" ? value : value === undefined || value === null ? "" : JSON.stringify(value);
  return `"${serialized.replaceAll('"', '""')}"`;
}

export function timelineToCsv(events: TimelineEvent[], metadataColumns: string[]) {
  const headers = [
    "id",
    "occurrence_date",
    "log_level",
    "actor",
    "message",
    ...metadataColumns,
  ];
  const rows = events.map((event) =>
    [
      event.id,
      event.occurrence_date,
      event.log_level,
      event.actor,
      event.message,
      ...metadataColumns.map((key) => event.metadata[key]),
    ]
      .map(escapeCsv)
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

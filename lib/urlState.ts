import type { TimelineFilters } from "@/lib/types";

const FILTER_KEYS = [
  "start_date",
  "end_date",
  "actor",
  "message",
  "metadata_key",
  "metadata_value",
  "limit",
] as const;

export function filtersToSearchParams(filters: TimelineFilters) {
  const params = new URLSearchParams();

  for (const key of FILTER_KEYS) {
    const value = filters[key];
    if (typeof value === "string" && value.trim()) params.set(key, value);
    if (typeof value === "number") params.set(key, String(value));
  }

  if (filters.log_level?.length) {
    params.set("log_level", filters.log_level.join(","));
  }

  return params;
}

export function searchParamsToFilters(
  input: URLSearchParams | Record<string, string | string[] | undefined>,
): TimelineFilters {
  const read = (key: string) => {
    if (input instanceof URLSearchParams) return input.get(key) ?? undefined;
    const value = input[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const logLevel = read("log_level");
  const limit = read("limit");

  return {
    start_date: read("start_date"),
    end_date: read("end_date"),
    log_level: logLevel ? (logLevel.split(",").filter(Boolean) as TimelineFilters["log_level"]) : undefined,
    actor: read("actor"),
    message: read("message"),
    metadata_key: read("metadata_key"),
    metadata_value: read("metadata_value"),
    limit: limit ? Number(limit) : undefined,
  };
}

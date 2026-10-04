import type { TimelineFilters } from "@/lib/types";
import { canonicalizeLogLevels, LOG_LEVELS } from "@/lib/logLevels";

const FILTER_KEYS = ["target_id", "actor_id", "type"] as const;

export const LEGACY_FILTER_KEYS = [
  "start_date",
  "end_date",
  "actor",
  "message",
  "metadata_key",
  "metadata_value",
  "limit",
] as const;

const MAX_FILTER_LENGTH = 255;

function normalizedFilterValue(value: unknown) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized && normalized.length <= MAX_FILTER_LENGTH ? normalized : undefined;
}

export function sanitizeTimelineFilters(input: unknown): TimelineFilters {
  if (!input || typeof input !== "object") return {};
  const source = input as Record<string, unknown>;
  const filters = Object.fromEntries(
    FILTER_KEYS.flatMap((key) => {
      const value = normalizedFilterValue(source[key]);
      return value ? [[key, value]] : [];
    }),
  ) as TimelineFilters;
  const logLevels = canonicalizeLogLevels(source.log_level);
  return logLevels ? { ...filters, log_level: logLevels } : filters;
}

export function hasLegacyTimelineFilters(input: unknown) {
  if (!input || typeof input !== "object") return false;
  const source = input as Record<string, unknown>;
  return LEGACY_FILTER_KEYS.some((key) => source[key] !== undefined && source[key] !== null && source[key] !== "");
}

export function timelineFilterValidationMessage(input: URLSearchParams) {
  for (const key of FILTER_KEYS) {
    const value = input.get(key);
    if (value && value.trim().length > MAX_FILTER_LENGTH) {
      return `${key} must be 255 characters or fewer.`;
    }
  }
  const rawLogLevel = input.get("log_level");
  if (rawLogLevel !== null) {
    const values = rawLogLevel.split(",").map((value) => value.trim().toLowerCase());
    if (
      values.some((value) => !value || !LOG_LEVELS.includes(value as (typeof LOG_LEVELS)[number])) ||
      new Set(values).size > LOG_LEVELS.length
    ) {
      return "log_level must contain only debug, info, success, warning, or error values.";
    }
  }
  return undefined;
}

export function filtersToSearchParams(filters: TimelineFilters) {
  const params = new URLSearchParams();

  for (const key of FILTER_KEYS) {
    const value = normalizedFilterValue(filters[key]);
    if (value) params.set(key, value);
  }
  const logLevels = canonicalizeLogLevels(filters.log_level);
  if (logLevels) params.set("log_level", logLevels.join(","));

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

  return sanitizeTimelineFilters({
    ...Object.fromEntries(FILTER_KEYS.map((key) => [key, read(key)])),
    log_level: read("log_level"),
  });
}

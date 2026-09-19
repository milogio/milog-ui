import type { TimelineFilters } from "@/lib/types";

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
  return Object.fromEntries(
    FILTER_KEYS.flatMap((key) => {
      const value = normalizedFilterValue(source[key]);
      return value ? [[key, value]] : [];
    }),
  ) as TimelineFilters;
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
  return undefined;
}

export function filtersToSearchParams(filters: TimelineFilters) {
  const params = new URLSearchParams();

  for (const key of FILTER_KEYS) {
    const value = normalizedFilterValue(filters[key]);
    if (value) params.set(key, value);
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

  return sanitizeTimelineFilters(Object.fromEntries(FILTER_KEYS.map((key) => [key, read(key)])));
}

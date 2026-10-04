import type { AlertRule, TimelineEvent, TimelineFilters } from "@/lib/types";
import { hasLegacyTimelineFilters, sanitizeTimelineFilters } from "@/lib/urlState";
import { createRuntimeId } from "@/lib/utils";

export const ALERTS_STORAGE_KEY = "milog.alerts";

export function migrateAlertRules(input: unknown) {
  if (!Array.isArray(input)) return { alerts: [] as AlertRule[], migrated: false };

  let migrated = false;
  const alerts = input.flatMap((value) => {
    if (!value || typeof value !== "object") {
      migrated = true;
      return [];
    }

    const candidate = value as Partial<AlertRule> & { filters?: unknown };
    const filters = sanitizeTimelineFilters(candidate.filters);
    const hadLegacyFilters = hasLegacyTimelineFilters(candidate.filters);
    if (hadLegacyFilters) migrated = true;
    if (hadLegacyFilters && Object.keys(filters).length === 0) return [];
    if (
      typeof candidate.id !== "string" ||
      typeof candidate.name !== "string" ||
      typeof candidate.enabled !== "boolean" ||
      typeof candidate.created_at !== "string"
    ) {
      migrated = true;
      return [];
    }

    return [{ ...candidate, filters } as AlertRule];
  });

  return { alerts, migrated };
}

export function buildAlertRule(name: string, filters: TimelineFilters): AlertRule {
  return {
    id: createRuntimeId(),
    name,
    enabled: true,
    filters: sanitizeTimelineFilters(filters),
    created_at: new Date().toISOString(),
  };
}

export function matchesAlert(rule: AlertRule, event: TimelineEvent) {
  const { filters } = rule;
  if (filters.actor_id && event.actor_id !== filters.actor_id) return false;
  if (filters.target_id && event.target_id !== filters.target_id) return false;
  if (filters.type && event.actor_type !== filters.type && event.target_type !== filters.type) return false;
  if (filters.log_level?.length && !filters.log_level.includes(event.log_level)) return false;
  return true;
}

function compareTimestamp(left?: string | null, right?: string | null) {
  if (!left && !right) return 0;
  if (!left) return -1;
  if (!right) return 1;
  return new Date(left).getTime() - new Date(right).getTime();
}

export function isEventAfterAlertCheckpoint(rule: AlertRule, event: TimelineEvent) {
  if (!event.occurred_at) return false;
  if (!rule.last_triggered_at) return true;

  const occurrenceOrder = compareTimestamp(event.occurred_at, rule.last_triggered_at);
  if (occurrenceOrder !== 0) return occurrenceOrder > 0;

  const creationOrder = compareTimestamp(event.created_at, rule.last_triggered_created_at);
  if (creationOrder !== 0) return creationOrder > 0;

  if (!rule.last_triggered_event_id) return false;
  return event.id.localeCompare(rule.last_triggered_event_id) > 0;
}

export function checkpointAlert(rule: AlertRule, event: TimelineEvent): AlertRule {
  return {
    ...rule,
    last_triggered_at: event.occurred_at ?? undefined,
    last_triggered_created_at: event.created_at ?? undefined,
    last_triggered_event_id: event.id,
    last_checked_at: new Date().toISOString(),
    last_error: undefined,
  };
}

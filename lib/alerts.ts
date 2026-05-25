import type { AlertRule, TimelineEvent, TimelineFilters } from "@/lib/types";
import { normalizeLogLevel } from "@/lib/utils";

export const ALERTS_STORAGE_KEY = "milog.alerts";

export function buildAlertRule(name: string, filters: TimelineFilters): AlertRule {
  return {
    id: crypto.randomUUID(),
    name,
    enabled: true,
    filters,
    created_at: new Date().toISOString(),
  };
}

export function matchesAlert(rule: AlertRule, event: TimelineEvent) {
  const { filters } = rule;
  if (filters.actor && !event.actor.toLowerCase().includes(filters.actor.toLowerCase())) return false;
  if (filters.message && !event.message.toLowerCase().includes(filters.message.toLowerCase())) return false;
  if (filters.metadata_key) {
    const metadataValue = event.metadata[filters.metadata_key];
    if (metadataValue === undefined) return false;
    if (filters.metadata_value) {
      const normalizedValue = String(metadataValue).toLowerCase();
      if (!normalizedValue.includes(filters.metadata_value.toLowerCase())) return false;
    }
  }
  if (filters.log_level?.length) {
    const normalized = normalizeLogLevel(event.log_level);
    if (!filters.log_level.includes(normalized)) return false;
  }
  return true;
}

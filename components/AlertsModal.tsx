"use client";

import { Bell, BellOff, Trash2 } from "lucide-react";
import type { AlertRule, TimelineFilters } from "@/lib/types";
import { buildAlertRule, migrateAlertRules } from "@/lib/alerts";
import { safeJsonParse } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const STORAGE_KEY = "milog.alerts";

export function readAlerts() {
  if (typeof window === "undefined") return [] as AlertRule[];
  const stored = safeJsonParse<unknown>(window.localStorage.getItem(STORAGE_KEY), []);
  const result = migrateAlertRules(stored);
  if (result.migrated) writeAlerts(result.alerts);
  return result.alerts;
}

export function writeAlerts(alerts: AlertRule[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

export function AlertsModal({
  open,
  onClose,
  currentFilters,
}: {
  open: boolean;
  onClose: () => void;
  currentFilters: TimelineFilters;
}) {
  const { pushToast } = useToast();
  const alerts = readAlerts();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-lg border border-border bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Alerts</h3>
            <p className="mt-2 text-sm text-muted-foreground">Get notified when new events match this filter shape.</p>
          </div>
          <button className="font-mono text-xs text-muted-foreground hover:text-foreground" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-5 rounded-lg border border-border bg-background p-4">
          <h4 className="text-sm font-medium text-foreground">Create alert from current filters</h4>
          <div className="mt-3 flex gap-3">
            <button
              className="btn btn-primary"
              onClick={() => {
                const name = currentFilters.type || currentFilters.target_id || currentFilters.actor_id || "MiLog alert";
                const next = [...alerts, buildAlertRule(name, currentFilters)];
                writeAlerts(next);
                pushToast({ title: "Alert saved locally.", tone: "success" });
                onClose();
              }}
            >
              <Bell className="size-4" />
              Create alert
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {alerts.length ? (
            alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                <div>
                  <h4 className="text-sm font-medium text-foreground">{alert.name}</h4>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{JSON.stringify(alert.filters)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-secondary px-3 py-2 text-xs"
                    onClick={() => {
                      const next = alerts.map((item) =>
                        item.id === alert.id ? { ...item, enabled: !item.enabled } : item,
                      );
                      writeAlerts(next);
                      pushToast({
                        title: alert.enabled ? "Alert paused." : "Alert enabled.",
                        tone: "success",
                      });
                      onClose();
                    }}
                  >
                    {alert.enabled ? <BellOff className="size-3.5" /> : <Bell className="size-3.5" />}
                    {alert.enabled ? "Disable" : "Enable"}
                  </button>
                  <button
                    className="btn btn-secondary px-3 py-2 text-xs text-red-200"
                    onClick={() => {
                      writeAlerts(alerts.filter((item) => item.id !== alert.id));
                      pushToast({ title: "Alert deleted.", tone: "success" });
                      onClose();
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No alerts saved yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

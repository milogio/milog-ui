"use client";

import { useId, useRef } from "react";
import { Bell, BellOff, Trash2 } from "lucide-react";
import type { AlertRule, TimelineFilters } from "@/lib/types";
import { buildAlertRule, migrateAlertRules } from "@/lib/alerts";
import { safeJsonParse } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { useDialogFocus } from "@/hooks/use-dialog-focus";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useDialogFocus({ open, dialogRef, onClose });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 py-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-soft outline-none"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold">Alerts</h2>
            <p className="mt-2 text-sm text-muted-foreground">Get notified when new events match this filter shape.</p>
          </div>
          <button
            type="button"
            className="font-mono text-xs text-muted-foreground hover:text-foreground"
            onClick={onClose}
            data-dialog-initial-focus
          >
            Close
          </button>
        </div>

        <div className="mt-5 rounded-lg border border-border bg-background p-4">
          <h4 className="text-sm font-medium text-foreground">Create alert from current filters</h4>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const name = currentFilters.type || currentFilters.target_id || currentFilters.actor_id || currentFilters.log_level?.join(", ") || "MiLog alert";
                const next = [...alerts, buildAlertRule(name, currentFilters)];
                writeAlerts(next);
                pushToast({ title: "Alert saved locally.", tone: "success" });
                onClose();
              }}
            >
              <Bell className="size-4" aria-hidden="true" />
              Create alert
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {alerts.length ? (
            alerts.map((alert) => (
              <div key={alert.id} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-foreground">{alert.name}</h4>
                  <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{JSON.stringify(alert.filters)}</p>
                  {alert.last_triggered_at ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Last matched {new Date(alert.last_triggered_at).toLocaleString()}
                      {alert.last_triggered_event_id ? ` · ${alert.last_triggered_event_id}` : ""}
                    </p>
                  ) : null}
                  {alert.last_error ? (
                    <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs text-destructive-foreground">
                      Polling error: {alert.last_error}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:flex-none">
                  <button
                    type="button"
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
                    {alert.enabled ? <BellOff className="size-3.5" aria-hidden="true" /> : <Bell className="size-3.5" aria-hidden="true" />}
                    {alert.enabled ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary px-3 py-2 text-xs text-red-200"
                    onClick={() => {
                      writeAlerts(alerts.filter((item) => item.id !== alert.id));
                      pushToast({ title: "Alert deleted.", tone: "success" });
                      onClose();
                    }}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
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

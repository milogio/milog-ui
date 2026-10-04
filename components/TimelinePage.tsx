"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import type { AlertRule, TimelineEvent, TimelineFilters } from "@/lib/types";
import { getTimeline, MiLogClientError } from "@/lib/milogApi";
import {
  checkpointAlert,
  isEventAfterAlertCheckpoint,
  matchesAlert,
  migrateAlertRules,
} from "@/lib/alerts";
import { timelineToCsv } from "@/lib/export";
import { fetchTimelineForExport } from "@/lib/timelineExport";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { compactDateTime, downloadTextFile, formatDownloadDate, safeJsonParse } from "@/lib/utils";
import {
  filtersToSearchParams,
  hasLegacyTimelineFilters,
  sanitizeTimelineFilters,
} from "@/lib/urlState";
import { AlertsModal } from "@/components/AlertsModal";
import { Drawer } from "@/components/Drawer";
import { ErrorState } from "@/components/ErrorState";
import { FilterPanel } from "@/components/FilterPanel";
import { MetadataColumnSelector } from "@/components/MetadataColumnSelector";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ShareModal } from "@/components/ShareModal";
import { TimelineDetailsPanel } from "@/components/TimelineDetailsPanel";
import { TimelineFeed } from "@/components/TimelineFeed";
import { TopNav } from "@/components/TopNav";

const FILTERS_STORAGE_KEY = "milog.filters";
const METADATA_COLUMNS_STORAGE_KEY = "milog.metadata-columns";
const DEFAULT_METADATA_KEYS = ["source", "campaign", "status", "lead_score"];
const ALERTS_STORAGE_KEY = "milog.alerts";

function loadStoredFilters(initialFilters: TimelineFilters) {
  if (typeof window === "undefined") return { filters: sanitizeTimelineFilters(initialFilters), hadLegacy: false };
  const stored = safeJsonParse<unknown>(window.localStorage.getItem(FILTERS_STORAGE_KEY), {});
  const urlState = Object.fromEntries(new URLSearchParams(window.location.search));
  return {
    filters: {
      ...sanitizeTimelineFilters(stored),
      ...sanitizeTimelineFilters(initialFilters),
    },
    hadLegacy: hasLegacyTimelineFilters(stored) || hasLegacyTimelineFilters(urlState),
  };
}

function loadMetadataKeys() {
  if (typeof window === "undefined") return DEFAULT_METADATA_KEYS;
  return safeJsonParse<string[]>(window.localStorage.getItem(METADATA_COLUMNS_STORAGE_KEY), DEFAULT_METADATA_KEYS);
}

function readAlerts() {
  if (typeof window === "undefined") return [] as AlertRule[];
  const stored = safeJsonParse<unknown>(window.localStorage.getItem(ALERTS_STORAGE_KEY), []);
  const result = migrateAlertRules(stored);
  if (result.migrated) writeAlerts(result.alerts);
  return result.alerts;
}

function writeAlerts(alerts: AlertRule[]) {
  window.localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
}

export function TimelinePage({
  initialFilters,
  readOnly = false,
  title = "Tenant event timeline",
  subtitle,
}: {
  initialFilters: TimelineFilters;
  readOnly?: boolean;
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { tenant, logout } = useAuth();
  const { pushToast } = useToast();
  const [storedFilterState] = useState(() => loadStoredFilters(initialFilters));
  const [draftFilters, setDraftFilters] = useState<TimelineFilters>(storedFilterState.filters);
  const [selectedEventId, setSelectedEventId] = useState<string>();
  const [visibleMetadataKeys, setVisibleMetadataKeys] = useState<string[]>(() => loadMetadataKeys());
  const [queryDrawerOpen, setQueryDrawerOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  const debouncedFilters = useDebounce(draftFilters, 350);
  const timelineQueryKey = useMemo(() => ["timeline", debouncedFilters] as const, [debouncedFilters]);

  useEffect(() => {
    if (!storedFilterState.hadLegacy) return;
    pushToast({
      title: "Unsupported legacy timeline filters were removed.",
      tone: "info",
    });
  }, [pushToast, storedFilterState.hadLegacy]);

  useEffect(() => {
    window.localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(debouncedFilters));
    const params = filtersToSearchParams(debouncedFilters).toString();
    router.replace(params ? `${pathname}?${params}` : pathname, { scroll: false });
  }, [debouncedFilters, pathname, router]);

  useEffect(() => {
    window.localStorage.setItem(METADATA_COLUMNS_STORAGE_KEY, JSON.stringify(visibleMetadataKeys));
  }, [visibleMetadataKeys]);

  const query = useInfiniteQuery({
    queryKey: timelineQueryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      getTimeline(debouncedFilters, typeof pageParam === "string" ? pageParam : undefined),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    if (!(query.error instanceof MiLogClientError) || query.error.status !== 401) return;
    void logout().finally(() => {
      const next = encodeURIComponent(`${pathname}${window.location.search}`);
      router.replace(`/login?reason=session_expired&next=${next}`);
    });
  }, [logout, pathname, query.error, router]);

  useEffect(() => {
    if (readOnly || !autoRefresh) return;
    const interval = window.setInterval(() => {
      void queryClient.resetQueries({ queryKey: timelineQueryKey, exact: true });
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [autoRefresh, queryClient, readOnly, timelineQueryKey]);

  const events = useMemo(() => {
    const uniqueEvents = new Map<string, TimelineEvent>();
    for (const page of query.data?.pages ?? []) {
      for (const event of page.events) {
        if (!uniqueEvents.has(event.id)) uniqueEvents.set(event.id, event);
      }
    }
    return [...uniqueEvents.values()];
  }, [query.data?.pages]);

  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? null;

  const lastUpdated = useMemo(
    () => (query.dataUpdatedAt ? compactDateTime(new Date(query.dataUpdatedAt).toISOString()) : undefined),
    [query.dataUpdatedAt],
  );

  const availableMetadataKeys = useMemo(() => {
    const keys = new Set(DEFAULT_METADATA_KEYS);
    for (const event of events) {
      Object.keys(event.metadata).forEach((key) => keys.add(key));
    }
    return [...keys];
  }, [events]);

  useEffect(() => {
    if (readOnly) return;
    const interval = window.setInterval(async () => {
      const alerts = readAlerts().filter((alert) => alert.enabled);
      if (!alerts.length) return;

      let mutated = false;
      const nextAlerts = [...alerts];

      await Promise.all(
        nextAlerts.map(async (alert, index) => {
          try {
            const page = await getTimeline(alert.filters);
            const match = page.events.find((event) => {
              if (!matchesAlert(alert, event)) return false;
              return isEventAfterAlertCheckpoint(alert, event);
            });

            if (match) {
              nextAlerts[index] = checkpointAlert(alert, match);
              mutated = true;
              pushToast({
                title: `Alert triggered: ${alert.name} matched "${match.message}"`,
                tone: "success",
              });
            } else if (alert.last_error) {
              nextAlerts[index] = {
                ...alert,
                last_checked_at: new Date().toISOString(),
                last_error: undefined,
              };
              mutated = true;
            }
          } catch (error) {
            nextAlerts[index] = {
              ...alert,
              last_checked_at: new Date().toISOString(),
              last_error: error instanceof Error ? error.message : "Alert polling failed.",
            };
            mutated = true;
          }
        }),
      );

      if (mutated) {
        writeAlerts(nextAlerts);
      }
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [pushToast, readOnly]);

  async function handleExport(kind: "csv" | "json") {
    setExportLoading(true);
    try {
      const allEvents = await fetchTimelineForExport(debouncedFilters);
      const date = formatDownloadDate();

      if (kind === "csv") {
        downloadTextFile(
          `milog-timeline-${date}.csv`,
          timelineToCsv(allEvents, visibleMetadataKeys),
          "text/csv;charset=utf-8",
        );
      } else {
        downloadTextFile(
          `milog-timeline-${date}.json`,
          JSON.stringify(allEvents, null, 2),
          "application/json;charset=utf-8",
        );
      }

      pushToast({ title: `Exported ${kind.toUpperCase()} successfully.`, tone: "success" });
    } catch (error) {
      pushToast({
        title: error instanceof Error ? error.message : "Export failed.",
        tone: "error",
      });
    } finally {
      setExportLoading(false);
    }
  }

  const content = (
    <>
      <div className="min-h-screen">
        <TopNav
          title={title}
          tenantName={tenant?.name ?? subtitle}
          metadataControl={
            <MetadataColumnSelector
              availableKeys={availableMetadataKeys}
              selectedKeys={visibleMetadataKeys}
              onChange={setVisibleMetadataKeys}
            />
          }
          filters={draftFilters}
          onFiltersChange={setDraftFilters}
          onFiltersToggle={() => setQueryDrawerOpen(true)}
          onRefresh={() => void queryClient.resetQueries({ queryKey: timelineQueryKey, exact: true })}
          autoRefresh={autoRefresh}
          onAutoRefreshChange={() => setAutoRefresh((value) => !value)}
          onShare={!readOnly ? () => setShareOpen(true) : undefined}
          onAlerts={!readOnly ? () => setAlertsOpen(true) : undefined}
          onExportCsv={!readOnly ? () => void handleExport("csv") : undefined}
          onExportJson={!readOnly ? () => void handleExport("json") : undefined}
          exportLoading={exportLoading}
          onLogout={!readOnly ? async () => {
            await logout();
            router.push("/login");
          } : undefined}
          lastUpdated={lastUpdated}
          loadedEventCount={query.isLoading ? undefined : events.length}
          readOnly={readOnly}
        />

        <div className="mx-auto max-w-7xl px-4 pt-2 md:px-6">
          <div className="pb-6">
            {query.isError ? (
              <ErrorState
                description={query.error instanceof Error ? query.error.message : "Unable to load timeline."}
                onRetry={() => void query.refetch()}
              />
            ) : (
              <TimelineFeed
                events={events}
                selectedEventId={selectedEvent?.id}
                onSelect={(event) => {
                  setSelectedEventId(event.id);
                  setDetailsDrawerOpen(true);
                }}
                visibleMetadataKeys={visibleMetadataKeys}
                hasNextPage={query.hasNextPage}
                onLoadMore={() => void query.fetchNextPage()}
                isLoading={query.isLoading}
                isFetchingNextPage={query.isFetchingNextPage}
                readOnly={readOnly}
                filters={draftFilters}
              />
            )}
          </div>
        </div>

        <Drawer
          open={queryDrawerOpen}
          side="left"
          eyebrow="Query"
          title="Advanced filters"
          onClose={() => setQueryDrawerOpen(false)}
        >
          <FilterPanel
            filters={draftFilters}
            onChange={setDraftFilters}
            onClear={() => setDraftFilters({})}
            compact
          />
        </Drawer>

        {selectedEvent ? (
          <Drawer
            open={detailsDrawerOpen}
            side="right"
            eyebrow="Event"
            title="Event details"
            onClose={() => setDetailsDrawerOpen(false)}
          >
            <TimelineDetailsPanel event={selectedEvent} />
          </Drawer>
        ) : null}

        {!readOnly ? <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} filters={debouncedFilters} /> : null}
        {!readOnly ? (
          <AlertsModal open={alertsOpen} onClose={() => setAlertsOpen(false)} currentFilters={debouncedFilters} />
        ) : null}
      </div>
    </>
  );

  return readOnly ? content : <ProtectedRoute>{content}</ProtectedRoute>;
}

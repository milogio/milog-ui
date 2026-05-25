"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import type { AlertRule, TimelineEvent, TimelineFilters } from "@/lib/types";
import { getTimeline } from "@/lib/milogApi";
import { matchesAlert } from "@/lib/alerts";
import { timelineToCsv } from "@/lib/export";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { compactDateTime, downloadTextFile, formatDownloadDate, safeJsonParse } from "@/lib/utils";
import { filtersToSearchParams } from "@/lib/urlState";
import { AlertsModal } from "@/components/AlertsModal";
import { DashboardLayout } from "@/components/DashboardLayout";
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
  if (typeof window === "undefined") return initialFilters;
  const stored = safeJsonParse<TimelineFilters>(window.localStorage.getItem(FILTERS_STORAGE_KEY), {});
  return {
    limit: 25,
    ...stored,
    ...initialFilters,
  };
}

function loadMetadataKeys() {
  if (typeof window === "undefined") return DEFAULT_METADATA_KEYS;
  return safeJsonParse<string[]>(window.localStorage.getItem(METADATA_COLUMNS_STORAGE_KEY), DEFAULT_METADATA_KEYS);
}

function readAlerts() {
  if (typeof window === "undefined") return [] as AlertRule[];
  return safeJsonParse<AlertRule[]>(window.localStorage.getItem(ALERTS_STORAGE_KEY), []);
}

function writeAlerts(alerts: AlertRule[]) {
  window.localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
}

export function TimelinePage({
  initialFilters,
  readOnly = false,
  title = "Timeline",
  subtitle,
}: {
  initialFilters: TimelineFilters;
  readOnly?: boolean;
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { tenant, logout } = useAuth();
  const { pushToast } = useToast();
  const [draftFilters, setDraftFilters] = useState<TimelineFilters>(() => loadStoredFilters(initialFilters));
  const [selectedEventId, setSelectedEventId] = useState<string>();
  const [visibleMetadataKeys, setVisibleMetadataKeys] = useState<string[]>(() => loadMetadataKeys());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  const debouncedFilters = useDebounce(draftFilters, 350);

  useEffect(() => {
    window.localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(debouncedFilters));
    const params = filtersToSearchParams(debouncedFilters).toString();
    router.replace(params ? `${pathname}?${params}` : pathname, { scroll: false });
  }, [debouncedFilters, pathname, router]);

  useEffect(() => {
    window.localStorage.setItem(METADATA_COLUMNS_STORAGE_KEY, JSON.stringify(visibleMetadataKeys));
  }, [visibleMetadataKeys]);

  const query = useInfiniteQuery({
    queryKey: ["timeline", debouncedFilters],
    initialPageParam: debouncedFilters.cursor,
    queryFn: ({ pageParam }) =>
      getTimeline({
        ...debouncedFilters,
        cursor: typeof pageParam === "string" ? pageParam : undefined,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchInterval: !readOnly && autoRefresh ? 30_000 : false,
  });

  const events = useMemo(
    () => query.data?.pages.flatMap((page) => page.events) ?? [],
    [query.data?.pages],
  );

  const selectedEvent =
    events.find((event) => event.id === selectedEventId) ?? events[0] ?? null;

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
            const page = await getTimeline({ ...alert.filters, limit: 10 });
            const match = page.events.find((event) => {
              if (!matchesAlert(alert, event)) return false;
              if (!alert.last_triggered_at) return true;
              return new Date(event.occurrence_date) > new Date(alert.last_triggered_at);
            });

            if (match) {
              nextAlerts[index] = { ...alert, last_triggered_at: match.occurrence_date };
              mutated = true;
              pushToast({
                title: `Alert triggered: ${alert.name} matched "${match.message}"`,
                tone: "success",
              });
            }
          } catch {
            // Ignore alert polling failures so the timeline stays responsive.
          }
        }),
      );

      if (mutated) {
        writeAlerts(nextAlerts);
      }
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [pushToast, readOnly]);

  async function fetchAllEvents() {
    const allEvents: TimelineEvent[] = [];
    let cursor: string | undefined;

    do {
      const page = await getTimeline({ ...debouncedFilters, cursor, limit: debouncedFilters.limit ?? 100 });
      allEvents.push(...page.events);
      cursor = page.nextCursor;
    } while (cursor);

    return allEvents;
  }

  async function handleExport(kind: "csv" | "json") {
    setExportLoading(true);
    try {
      const allEvents = await fetchAllEvents();
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
          tenantName={tenant?.name ?? subtitle}
          message={draftFilters.message ?? ""}
          onMessageChange={(message) => setDraftFilters((current) => ({ ...current, message: message || undefined }))}
          onFiltersToggle={!readOnly ? () => setFiltersOpen((value) => !value) : undefined}
          onRefresh={() => void query.refetch()}
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
          readOnly={readOnly}
        />

        <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">{title}</p>
            <h2 className="mt-2 text-3xl font-semibold text-foreground">
              {readOnly ? "Shared MiLog Timeline" : "Tenant event timeline"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {readOnly
                ? "Read-only view of the selected MiLog filter state. Sign in if you need to export or create alerts."
                : "Search, export, and share the moments that matter across your tenant timeline."}
            </p>
          </div>

          {!readOnly && filtersOpen ? (
            <div className="mb-4 lg:hidden">
              <FilterPanel filters={draftFilters} onChange={setDraftFilters} onClear={() => setDraftFilters({ limit: 25 })} compact />
            </div>
          ) : null}

          <DashboardLayout
            filters={
              <FilterPanel
                filters={draftFilters}
                onChange={setDraftFilters}
                onClear={() => setDraftFilters({ limit: 25 })}
              />
            }
            main={
              <div className="space-y-4">
                <MetadataColumnSelector
                  availableKeys={availableMetadataKeys}
                  selectedKeys={visibleMetadataKeys}
                  onChange={setVisibleMetadataKeys}
                />

                {query.isError ? (
                  <ErrorState
                    description={query.error instanceof Error ? query.error.message : "Unable to load timeline."}
                    onRetry={() => void query.refetch()}
                  />
                ) : (
                  <TimelineFeed
                    events={events}
                    selectedEventId={selectedEvent?.id}
                    onSelect={(event) => setSelectedEventId(event.id)}
                    visibleMetadataKeys={visibleMetadataKeys}
                    hasNextPage={query.hasNextPage}
                    onLoadMore={() => void query.fetchNextPage()}
                    isLoading={query.isLoading}
                    isFetchingNextPage={query.isFetchingNextPage}
                    readOnly={readOnly}
                  />
                )}
              </div>
            }
            details={<TimelineDetailsPanel event={selectedEvent} />}
          />
        </div>

        {!readOnly ? <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} filters={debouncedFilters} /> : null}
        {!readOnly ? (
          <AlertsModal open={alertsOpen} onClose={() => setAlertsOpen(false)} currentFilters={debouncedFilters} />
        ) : null}
      </div>
    </>
  );

  return readOnly ? content : <ProtectedRoute>{content}</ProtectedRoute>;
}

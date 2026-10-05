import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { AlertRule, TimelineEvent, TimelineFilters, TimelinePage as TimelinePageData } from "@/lib/types";

const mocks = vi.hoisted(() => ({
  fetchNextPage: vi.fn(),
  refetch: vi.fn(),
  resetQueries: vi.fn(),
  replace: vi.fn(),
  push: vi.fn(),
  pushToast: vi.fn(),
  logout: vi.fn(),
  getTimeline: vi.fn(),
  fetchTimelineForExport: vi.fn(),
  timelineToCsv: vi.fn(),
  downloadTextFile: vi.fn(),
  queryOptions: undefined as { queryKey: readonly unknown[] } | undefined,
  query: {
    data: undefined as { pages: TimelinePageData[] } | undefined,
    dataUpdatedAt: 0,
    error: null as Error | null,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isFetching: false,
    isLoading: false,
    refetch: vi.fn(),
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: (options: { queryKey: readonly unknown[] }) => {
    mocks.queryOptions = options;
    return mocks.query;
  },
  useQueryClient: () => ({ resetQueries: mocks.resetQueries }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/timeline",
  useRouter: () => ({ replace: mocks.replace, push: mocks.push }),
}));

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ tenant: { id: "tenant-1", name: "Callender" }, logout: mocks.logout }),
}));

vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({ pushToast: mocks.pushToast }),
}));

vi.mock("@/lib/timelineExport", () => ({
  fetchTimelineForExport: mocks.fetchTimelineForExport,
}));

vi.mock("@/lib/milogApi", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/milogApi")>(),
  getTimeline: mocks.getTimeline,
}));

vi.mock("@/lib/export", () => ({
  timelineToCsv: mocks.timelineToCsv,
}));

vi.mock("@/lib/utils", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/utils")>(),
  downloadTextFile: mocks.downloadTextFile,
  formatDownloadDate: () => "2026-10-04",
}));

vi.mock("@/components/ProtectedRoute", () => ({
  ProtectedRoute: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/TopNav", () => ({
  TopNav: ({
    onFiltersChange,
    onRefresh,
    onAutoRefreshChange,
    metadataControl,
    onFiltersToggle,
    loadedEventCount,
    onExportCsv,
    onExportJson,
    exportLoading,
  }: {
    onFiltersChange: (filters: TimelineFilters) => void;
    onRefresh?: () => void;
    onAutoRefreshChange?: () => void;
    metadataControl?: ReactNode;
    onFiltersToggle?: () => void;
    loadedEventCount?: number;
    onExportCsv?: () => void;
    onExportJson?: () => void;
    exportLoading?: boolean;
  }) => (
    <nav>
      <button onClick={() => onFiltersChange({ actor_id: "user-42" })}>Set actor filter</button>
      <button onClick={() => onFiltersChange({})}>Clear all filters</button>
      <button onClick={onFiltersToggle}>Advanced filters</button>
      {onRefresh ? <button onClick={onRefresh}>Refresh</button> : null}
      {onAutoRefreshChange ? <button onClick={onAutoRefreshChange}>Toggle auto refresh</button> : null}
      {onExportCsv ? <button onClick={onExportCsv}>Export CSV</button> : null}
      {onExportJson ? <button onClick={onExportJson}>Export JSON</button> : null}
      <output data-testid="export-loading">{String(exportLoading)}</output>
      <output data-testid="loaded-event-count">{loadedEventCount}</output>
      {metadataControl}
    </nav>
  ),
}));

vi.mock("@/components/TimelineFeed", () => ({
  TimelineFeed: ({
    events,
    onSelect,
    onLoadMore,
    hasNextPage,
    isLoading,
  }: {
    events: TimelineEvent[];
    onSelect: (event: TimelineEvent) => void;
    onLoadMore: () => void;
    hasNextPage: boolean;
    isLoading: boolean;
  }) => (
    <section>
      <output data-testid="loading">{String(isLoading)}</output>
      {events.map((event) => (
        <button key={event.id} onClick={() => onSelect(event)}>{event.id}</button>
      ))}
      {hasNextPage ? <button onClick={onLoadMore}>Load more</button> : <p>End of feed</p>}
    </section>
  ),
}));

vi.mock("@/components/TimelineDetailsPanel", () => ({
  TimelineDetailsPanel: ({ event }: { event: TimelineEvent }) => <p>Details {event.id}</p>,
}));

vi.mock("@/components/Drawer", () => ({
  Drawer: ({ open, title, children }: { open: boolean; title: string; children: ReactNode }) => open ? <aside><h2>{title}</h2>{children}</aside> : null,
}));

vi.mock("@/components/MetadataColumnSelector", () => ({
  MetadataColumnSelector: ({
    selectedKeys,
    onChange,
  }: {
    selectedKeys: string[];
    onChange: (keys: string[]) => void;
  }) => (
    <div>
      <output data-testid="metadata-keys">{selectedKeys.join(",")}</output>
      <button onClick={() => onChange([...selectedKeys, "status"])}>Add status metadata</button>
    </div>
  ),
}));
vi.mock("@/components/ShareModal", () => ({ ShareModal: () => null }));
vi.mock("@/components/AlertsModal", () => ({ AlertsModal: () => null }));
vi.mock("@/components/FilterPanel", () => ({ FilterPanel: () => null }));

import { TimelinePage } from "@/components/TimelinePage";

function event(id: string): TimelineEvent {
  return {
    id,
    tenant_id: "tenant-1",
    occurred_at: "2026-10-03T17:00:00Z",
    created_at: "2026-10-03T17:00:01Z",
    raw_log_level: "info",
    log_level: "info",
    actor: "user user-42",
    actor_type: "user",
    actor_id: "user-42",
    action: "viewed",
    target_type: "invoice",
    target_id: "invoice-1001",
    message: `Event ${id}`,
    metadata: {},
  };
}

describe("TimelinePage orchestration", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mocks.resetQueries.mockReset();
    mocks.replace.mockReset();
    mocks.query.data = undefined;
    mocks.query.dataUpdatedAt = 0;
    mocks.query.error = null;
    mocks.query.fetchNextPage = vi.fn();
    mocks.query.hasNextPage = false;
    mocks.query.isError = false;
    mocks.query.isFetchingNextPage = false;
    mocks.query.isFetching = false;
    mocks.query.isLoading = false;
    mocks.query.refetch = vi.fn();
    mocks.queryOptions = undefined;
    mocks.fetchTimelineForExport.mockReset();
    mocks.getTimeline.mockReset();
    mocks.timelineToCsv.mockReset();
    mocks.downloadTextFile.mockReset();
    mocks.pushToast.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("passes initial loading state through to the timeline feed", () => {
    mocks.query.isLoading = true;

    render(<TimelinePage initialFilters={{}} />);

    expect(screen.getByTestId("loading")).toHaveTextContent("true");
  });

  it("deduplicates cursor pages, loads the next page, selects details, and shows the end state", () => {
    mocks.query.data = {
      pages: [
        { events: [event("evt-3"), event("evt-2")], nextCursor: "opaque-next" },
        { events: [event("evt-2"), event("evt-1")] },
      ],
    };
    mocks.query.hasNextPage = true;

    const { rerender } = render(<TimelinePage initialFilters={{}} />);

    expect(screen.getAllByRole("button", { name: /^evt-/ })).toHaveLength(3);
    expect(screen.getByTestId("loaded-event-count")).toHaveTextContent("3");
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(mocks.query.fetchNextPage).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "evt-2" }));
    expect(screen.getByText("Details evt-2")).toBeInTheDocument();

    mocks.query.hasNextPage = false;
    rerender(<TimelinePage initialFilters={{}} />);
    expect(screen.getByText("End of feed")).toBeInTheDocument();
  });

  it("opens the advanced filter drawer from the consolidated query area", () => {
    render(<TimelinePage initialFilters={{}} />);

    fireEvent.click(screen.getByRole("button", { name: "Advanced filters" }));
    expect(screen.getByRole("heading", { name: "Advanced filters" })).toBeInTheDocument();
  });

  it("refreshes manually and on the 30-second interval until auto-refresh is disabled", () => {
    vi.useFakeTimers();
    render(<TimelinePage initialFilters={{}} />);

    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(mocks.resetQueries).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(30_000));
    expect(mocks.resetQueries).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("button", { name: "Toggle auto refresh" }));
    act(() => vi.advanceTimersByTime(30_000));
    expect(mocks.resetQueries).toHaveBeenCalledTimes(2);
  });

  it("debounces filter changes into local storage and the URL", () => {
    vi.useFakeTimers();
    render(<TimelinePage initialFilters={{}} />);

    fireEvent.click(screen.getByRole("button", { name: "Set actor filter" }));
    act(() => vi.advanceTimersByTime(350));

    expect(window.localStorage.getItem("milog.filters")).toBe(JSON.stringify({ actor_id: "user-42" }));
    expect(mocks.replace).toHaveBeenLastCalledWith("/timeline?actor_id=user-42", { scroll: false });
    expect(mocks.queryOptions?.queryKey).toEqual(["timeline", { actor_id: "user-42" }]);

    fireEvent.click(screen.getByRole("button", { name: "Clear all filters" }));
    act(() => vi.advanceTimersByTime(350));

    expect(window.localStorage.getItem("milog.filters")).toBe("{}");
    expect(mocks.replace).toHaveBeenLastCalledWith("/timeline", { scroll: false });
    expect(mocks.queryOptions?.queryKey).toEqual(["timeline", {}]);
  });

  it("loads and persists the selected metadata columns from the compact header control", () => {
    window.localStorage.setItem("milog.metadata-columns", JSON.stringify(["source"]));

    render(<TimelinePage initialFilters={{}} />);

    expect(screen.getByTestId("metadata-keys")).toHaveTextContent("source");
    fireEvent.click(screen.getByRole("button", { name: "Add status metadata" }));
    expect(window.localStorage.getItem("milog.metadata-columns")).toBe(JSON.stringify(["source", "status"]));
  });

  it("exports every filtered event to CSV with the selected metadata columns", async () => {
    const exportedEvents = [event("evt-2"), event("evt-1")];
    window.localStorage.setItem("milog.metadata-columns", JSON.stringify(["source"]));
    mocks.fetchTimelineForExport.mockResolvedValue(exportedEvents);
    mocks.timelineToCsv.mockReturnValue("csv-output");

    render(<TimelinePage initialFilters={{ actor_id: "user-42" }} />);
    fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));

    expect(screen.getByTestId("export-loading")).toHaveTextContent("true");
    await waitFor(() => expect(mocks.downloadTextFile).toHaveBeenCalledWith(
      "milog-timeline-2026-10-04.csv",
      "csv-output",
      "text/csv;charset=utf-8",
    ));
    expect(mocks.fetchTimelineForExport).toHaveBeenCalledWith({ actor_id: "user-42" });
    expect(mocks.timelineToCsv).toHaveBeenCalledWith(exportedEvents, ["source"]);
    expect(mocks.pushToast).toHaveBeenCalledWith({ title: "Exported CSV successfully.", tone: "success" });
    expect(screen.getByTestId("export-loading")).toHaveTextContent("false");
  });

  it("reports export failures without starting a download", async () => {
    mocks.fetchTimelineForExport.mockRejectedValue(new Error("Second page unavailable."));

    render(<TimelinePage initialFilters={{}} />);
    fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));

    await waitFor(() => expect(mocks.pushToast).toHaveBeenCalledWith({
      title: "Second page unavailable.",
      tone: "error",
    }));
    expect(mocks.downloadTextFile).not.toHaveBeenCalled();
    expect(screen.getByTestId("export-loading")).toHaveTextContent("false");
  });

  it("downloads the full result set as formatted JSON", async () => {
    const exportedEvents = [event("evt-1")];
    mocks.fetchTimelineForExport.mockResolvedValue(exportedEvents);

    render(<TimelinePage initialFilters={{ log_level: ["error"] }} />);
    fireEvent.click(screen.getByRole("button", { name: "Export JSON" }));

    await waitFor(() => expect(mocks.downloadTextFile).toHaveBeenCalledWith(
      "milog-timeline-2026-10-04.json",
      JSON.stringify(exportedEvents, null, 2),
      "application/json;charset=utf-8",
    ));
    expect(mocks.fetchTimelineForExport).toHaveBeenCalledWith({ log_level: ["error"] });
    expect(mocks.pushToast).toHaveBeenCalledWith({ title: "Exported JSON successfully.", tone: "success" });
  });

  it("does not expose export or refresh actions in a shared read-only view", () => {
    render(<TimelinePage initialFilters={{}} readOnly />);

    expect(screen.queryByRole("button", { name: "Export CSV" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Export JSON" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Refresh" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Toggle auto refresh" })).not.toBeInTheDocument();
  });

  it("uses only shared filters without overwriting the operator's saved query", () => {
    window.localStorage.setItem("milog.filters", JSON.stringify({ actor_id: "private-actor" }));

    render(<TimelinePage initialFilters={{ type: "invoice" }} readOnly />);

    expect(mocks.queryOptions?.queryKey).toEqual(["timeline", { type: "invoice" }]);
    expect(window.localStorage.getItem("milog.filters")).toBe(JSON.stringify({ actor_id: "private-actor" }));
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("checkpoints enabled alerts without deleting disabled rules or retriggering the same event", async () => {
    vi.useFakeTimers();
    const alerts: AlertRule[] = [
      {
        id: "enabled-alert",
        name: "Invoice activity",
        enabled: true,
        filters: { type: "invoice" },
        created_at: "2026-10-03T16:00:00Z",
      },
      {
        id: "disabled-alert",
        name: "Paused actor activity",
        enabled: false,
        filters: { actor_id: "user-42" },
        created_at: "2026-10-03T16:00:00Z",
      },
    ];
    window.localStorage.setItem("milog.alerts", JSON.stringify(alerts));
    mocks.getTimeline.mockResolvedValue({ events: [event("evt-new")] });
    render(<TimelinePage initialFilters={{}} />);

    await act(async () => vi.advanceTimersByTimeAsync(60_000));

    const stored = JSON.parse(window.localStorage.getItem("milog.alerts") ?? "[]") as AlertRule[];
    expect(stored.map(({ id }) => id)).toEqual(["enabled-alert", "disabled-alert"]);
    expect(stored[0]).toEqual(expect.objectContaining({
      last_triggered_event_id: "evt-new",
      last_triggered_at: "2026-10-03T17:00:00Z",
    }));
    expect(stored[1]).toEqual(alerts[1]);
    expect(mocks.pushToast).toHaveBeenCalledTimes(1);
    expect(mocks.pushToast).toHaveBeenCalledWith({
      title: 'Alert triggered: Invoice activity matched "Event evt-new"',
      tone: "success",
    });

    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    expect(mocks.pushToast).toHaveBeenCalledTimes(1);
  });

  it("records alert polling failures while preserving disabled rules", async () => {
    vi.useFakeTimers();
    const alerts: AlertRule[] = [
      {
        id: "enabled-alert",
        name: "Invoice activity",
        enabled: true,
        filters: { type: "invoice" },
        created_at: "2026-10-03T16:00:00Z",
      },
      {
        id: "disabled-alert",
        name: "Paused activity",
        enabled: false,
        filters: {},
        created_at: "2026-10-03T16:00:00Z",
      },
    ];
    window.localStorage.setItem("milog.alerts", JSON.stringify(alerts));
    mocks.getTimeline.mockRejectedValue(new Error("Alert API unavailable."));
    render(<TimelinePage initialFilters={{}} />);

    await act(async () => vi.advanceTimersByTimeAsync(60_000));

    const stored = JSON.parse(window.localStorage.getItem("milog.alerts") ?? "[]") as AlertRule[];
    expect(stored).toHaveLength(2);
    expect(stored[0]).toEqual(expect.objectContaining({ last_error: "Alert API unavailable." }));
    expect(stored[1]).toEqual(alerts[1]);
  });
});

import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import type { TimelineEvent, TimelineFilters, TimelinePage as TimelinePageData } from "@/lib/types";

const mocks = vi.hoisted(() => ({
  fetchNextPage: vi.fn(),
  refetch: vi.fn(),
  resetQueries: vi.fn(),
  replace: vi.fn(),
  push: vi.fn(),
  pushToast: vi.fn(),
  logout: vi.fn(),
  query: {
    data: undefined as { pages: TimelinePageData[] } | undefined,
    dataUpdatedAt: 0,
    error: null as Error | null,
    fetchNextPage: vi.fn(),
    hasNextPage: false,
    isError: false,
    isFetchingNextPage: false,
    isLoading: false,
    refetch: vi.fn(),
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: () => mocks.query,
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

vi.mock("@/components/ProtectedRoute", () => ({
  ProtectedRoute: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/TopNav", () => ({
  TopNav: ({
    onFiltersChange,
    onRefresh,
    onAutoRefreshChange,
    metadataControl,
  }: {
    onFiltersChange: (filters: TimelineFilters) => void;
    onRefresh: () => void;
    onAutoRefreshChange: () => void;
    metadataControl?: ReactNode;
  }) => (
    <nav>
      <button onClick={() => onFiltersChange({ actor_id: "user-42" })}>Set actor filter</button>
      <button onClick={onRefresh}>Refresh</button>
      <button onClick={onAutoRefreshChange}>Toggle auto refresh</button>
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
  Drawer: ({ open, children }: { open: boolean; children: ReactNode }) => open ? <aside>{children}</aside> : null,
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
    mocks.query.isLoading = false;
    mocks.query.refetch = vi.fn();
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
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(mocks.query.fetchNextPage).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "evt-2" }));
    expect(screen.getByText("Details evt-2")).toBeInTheDocument();

    mocks.query.hasNextPage = false;
    rerender(<TimelinePage initialFilters={{}} />);
    expect(screen.getByText("End of feed")).toBeInTheDocument();
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
  });

  it("loads and persists the selected metadata columns from the compact header control", () => {
    window.localStorage.setItem("milog.metadata-columns", JSON.stringify(["source"]));

    render(<TimelinePage initialFilters={{}} />);

    expect(screen.getByTestId("metadata-keys")).toHaveTextContent("source");
    fireEvent.click(screen.getByRole("button", { name: "Add status metadata" }));
    expect(window.localStorage.getItem("milog.metadata-columns")).toBe(JSON.stringify(["source", "status"]));
  });
});

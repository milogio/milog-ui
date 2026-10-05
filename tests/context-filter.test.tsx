import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { TopNav } from "@/components/TopNav";
import type { TimelineFilters } from "@/lib/types";

function QuickFilterHarness() {
  const [filters, setFilters] = useState<TimelineFilters>({});

  return (
    <>
      <TopNav
        filters={filters}
        onFiltersChange={setFilters}
        readOnly
      />
      <output data-testid="filters">{JSON.stringify(filters)}</output>
    </>
  );
}

describe("timeline context filters", () => {
  it("places the tenant context and page title before the query controls", () => {
    render(
      <TopNav
        title="Shared timeline"
        tenantName="Callender"
        filters={{}}
        onFiltersChange={() => undefined}
        readOnly
      />,
    );

    expect(screen.getByText("Callender · Read-only")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Shared timeline" })).toBeInTheDocument();
    expect(screen.getByLabelText("Timeline query")).toBeInTheDocument();
  });

  it("labels manual refresh, export, update time, and the current auto-refresh state", async () => {
    const user = userEvent.setup();
    const onRefresh = vi.fn();
    const onAutoRefreshChange = vi.fn();

    render(
      <TopNav
        filters={{}}
        onFiltersChange={() => undefined}
        onRefresh={onRefresh}
        autoRefresh
        onAutoRefreshChange={onAutoRefreshChange}
        onExportCsv={() => undefined}
        onExportJson={() => undefined}
        lastUpdated="Oct 4, 2026 09:45:49"
      />,
    );

    expect(screen.getByRole("button", { name: "Export" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Refresh timeline now" })).toBeEnabled();
    const autoRefresh = screen.getByRole("button", { name: "Auto-refresh is on. Toggle auto-refresh" });
    expect(autoRefresh).toHaveAttribute("aria-pressed", "true");
    expect(autoRefresh).toHaveTextContent("On");
    expect(screen.getAllByLabelText("Timeline last updated Oct 4, 2026 09:45:49")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Refresh timeline now" }));
    await user.click(autoRefresh);
    expect(onRefresh).toHaveBeenCalledOnce();
    expect(onAutoRefreshChange).toHaveBeenCalledOnce();
  });

  it("disables manual refresh and announces progress while a query refreshes", () => {
    render(
      <TopNav
        filters={{}}
        onFiltersChange={() => undefined}
        onRefresh={() => undefined}
        refreshing
      />,
    );

    const refresh = screen.getByRole("button", { name: "Refreshing timeline" });
    expect(refresh).toBeDisabled();
    expect(refresh).toHaveTextContent("Refreshing…");
  });

  it("adds a structured actor ID token instead of an ambiguous text query", async () => {
    const user = userEvent.setup();
    render(<QuickFilterHarness />);

    await user.selectOptions(screen.getByLabelText("Add filter"), "actor_id");
    await user.type(screen.getByLabelText("Actor ID filter value"), "user-42");
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("filters")).toHaveTextContent('{"actor_id":"user-42"}');
    expect(screen.getByTestId("filters")).not.toHaveTextContent('"type"');
    expect(screen.getByRole("button", { name: "Edit Actor ID filter" })).toHaveTextContent("Actor ID:user-42");
    expect(screen.getByRole("button", { name: "Edit Actor ID filter" })).toHaveFocus();
  });

  it("only maps a value to type after Entity type is selected", async () => {
    const user = userEvent.setup();
    render(<QuickFilterHarness />);

    await user.selectOptions(screen.getByLabelText("Add filter"), "type");
    await user.type(screen.getByLabelText("Entity type filter value"), "invoice");
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("filters")).toHaveTextContent('{"type":"invoice"}');
  });

  it("keeps exact filters, quick levels, the loaded count, and advanced controls in one query area", async () => {
    const user = userEvent.setup();
    const onAdvancedFilters = vi.fn();

    function ConsolidatedQueryHarness() {
      const [filters, setFilters] = useState<TimelineFilters>({
        actor_id: "user-42",
        log_level: ["warning", "error"],
      });
      return (
        <>
          <TopNav
            filters={filters}
            onFiltersChange={setFilters}
            onFiltersToggle={onAdvancedFilters}
            loadedEventCount={17}
            readOnly
          />
          <output data-testid="consolidated-filters">{JSON.stringify(filters)}</output>
        </>
      );
    }

    render(<ConsolidatedQueryHarness />);

    const query = screen.getByLabelText("Timeline query");
    expect(within(query).getByRole("button", { name: "Edit Actor ID filter" })).toBeInTheDocument();
    expect(within(query).getByRole("button", { name: "Filter by warning log level" })).toHaveAttribute("aria-pressed", "true");
    expect(within(query).getByRole("button", { name: "Filter by error log level" })).toHaveAttribute("aria-pressed", "true");
    expect(within(query).getByText("1 exact filter must match · 2 levels match any")).toBeInTheDocument();
    expect(within(query).getByText("17 events loaded")).toHaveAttribute(
      "title",
      "Count of events currently loaded, not the total number of matches",
    );

    await user.click(within(query).getByRole("button", { name: "Advanced filters" }));
    expect(onAdvancedFilters).toHaveBeenCalledOnce();
    await user.click(within(query).getByRole("button", { name: "Clear all" }));
    expect(screen.getByTestId("consolidated-filters")).toHaveTextContent("{}");
    expect(within(query).getByText("No restrictions")).toBeInTheDocument();
    expect(within(query).getByLabelText("Add filter")).toHaveFocus();
  });

  it("edits and removes a filter token without changing its role", async () => {
    const user = userEvent.setup();
    render(<QuickFilterHarness />);

    await user.selectOptions(screen.getByLabelText("Add filter"), "target_id");
    await user.type(screen.getByLabelText("Target ID filter value"), "invoice-1001{Enter}");
    await user.click(screen.getByRole("button", { name: "Edit Target ID filter" }));
    await user.clear(screen.getByLabelText("Target ID filter value"));
    await user.type(screen.getByLabelText("Target ID filter value"), "invoice-2002{Enter}");

    expect(screen.getByTestId("filters")).toHaveTextContent('{"target_id":"invoice-2002"}');
    await user.click(screen.getByRole("button", { name: "Remove Target ID filter" }));
    expect(screen.getByTestId("filters")).toHaveTextContent("{}");
    expect(screen.getByLabelText("Add filter")).toHaveFocus();
  });

  it("shows every active AND filter and supports removing one", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(
      <ActiveFilterChips
        filters={{ actor_id: "user-42", target_id: "invoice-1001" }}
        onRemove={onRemove}
        onClear={() => undefined}
      />,
    );

    expect(screen.getByText("All filters must match")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove Actor ID filter" }));
    expect(onRemove).toHaveBeenCalledWith("actor_id");
  });
});

import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import { TopNav } from "@/components/TopNav";
import type { TimelineFilters } from "@/lib/types";
import type { TimelineFilterKey } from "@/lib/timelineFilters";

function QuickFilterHarness() {
  const [key, setKey] = useState<TimelineFilterKey>("actor_id");
  const [filters, setFilters] = useState<TimelineFilters>({});

  return (
    <>
      <TopNav
        quickFilterKey={key}
        quickFilterValue={filters[key] ?? ""}
        onQuickFilterKeyChange={setKey}
        onQuickFilterValueChange={(value) => setFilters((current) => ({ ...current, [key]: value || undefined }))}
        readOnly
      />
      <output data-testid="filters">{JSON.stringify(filters)}</output>
    </>
  );
}

describe("timeline context filters", () => {
  it("maps the default quick filter to actor_id, not entity type", async () => {
    const user = userEvent.setup();
    render(<QuickFilterHarness />);

    await user.type(screen.getByLabelText("Actor ID filter value"), "user-42");

    expect(screen.getByTestId("filters")).toHaveTextContent('{"actor_id":"user-42"}');
    expect(screen.getByTestId("filters")).not.toHaveTextContent('"type"');
  });

  it("only maps a value to type after Entity type is selected", async () => {
    const user = userEvent.setup();
    render(<QuickFilterHarness />);

    await user.selectOptions(screen.getByLabelText("Filter role"), "type");
    await user.type(screen.getByLabelText("Entity type filter value"), "invoice");

    expect(screen.getByTestId("filters")).toHaveTextContent('{"type":"invoice"}');
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

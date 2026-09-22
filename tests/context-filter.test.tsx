import { useState } from "react";
import { render, screen } from "@testing-library/react";
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
  it("adds a structured actor ID token instead of an ambiguous text query", async () => {
    const user = userEvent.setup();
    render(<QuickFilterHarness />);

    await user.selectOptions(screen.getByLabelText("Add filter"), "actor_id");
    await user.type(screen.getByLabelText("Actor ID filter value"), "user-42");
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("filters")).toHaveTextContent('{"actor_id":"user-42"}');
    expect(screen.getByTestId("filters")).not.toHaveTextContent('"type"');
    expect(screen.getByRole("button", { name: "Edit Actor ID filter" })).toHaveTextContent("Actor ID:user-42");
  });

  it("only maps a value to type after Entity type is selected", async () => {
    const user = userEvent.setup();
    render(<QuickFilterHarness />);

    await user.selectOptions(screen.getByLabelText("Add filter"), "type");
    await user.type(screen.getByLabelText("Entity type filter value"), "invoice");
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("filters")).toHaveTextContent('{"type":"invoice"}');
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

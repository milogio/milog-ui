import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterPanel } from "@/components/FilterPanel";
import type { TimelineFilters } from "@/lib/types";

function FilterHarness({ onClear }: { onClear: () => void }) {
  const [filters, setFilters] = useState<TimelineFilters>({});
  return <FilterPanel filters={filters} onChange={setFilters} onClear={onClear} />;
}

describe("FilterPanel", () => {
  it("renders only filters supported by the public timeline API", () => {
    render(<FilterPanel filters={{}} onChange={() => undefined} onClear={() => undefined} />);

    expect(screen.getByLabelText("Actor ID")).toBeInTheDocument();
    expect(screen.getByLabelText("Target ID")).toBeInTheDocument();
    expect(screen.getByLabelText("Actor or target type")).toBeInTheDocument();
    expect(screen.queryByText("Start date")).not.toBeInTheDocument();
    expect(screen.queryByText("Log levels")).not.toBeInTheDocument();
    expect(screen.queryByText("Message contains")).not.toBeInTheDocument();
  });

  it("updates each canonical filter and clears the query", async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();

    render(<FilterHarness onClear={onClear} />);

    await user.type(screen.getByLabelText("Actor ID"), "actor-42");
    await user.type(screen.getByLabelText("Target ID"), "invoice-1");
    await user.type(screen.getByLabelText("Actor or target type"), "invoice");
    await user.click(screen.getByRole("button", { name: "Clear" }));

    expect(screen.getByLabelText("Actor ID")).toHaveValue("actor-42");
    expect(screen.getByLabelText("Target ID")).toHaveValue("invoice-1");
    expect(screen.getByLabelText("Actor or target type")).toHaveValue("invoice");
    expect(onClear).toHaveBeenCalledOnce();
  });
});

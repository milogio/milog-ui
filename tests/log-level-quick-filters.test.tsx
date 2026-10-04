import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogLevelQuickFilters } from "@/components/LogLevelQuickFilters";
import type { TimelineFilters } from "@/lib/types";

function Harness() {
  const [filters, setFilters] = useState<TimelineFilters>({ actor_id: "user-42" });
  return (
    <>
      <LogLevelQuickFilters filters={filters} onChange={setFilters} />
      <output data-testid="filters">{JSON.stringify(filters)}</output>
    </>
  );
}

describe("LogLevelQuickFilters", () => {
  it("renders accessible off-state toggles using the timeline badge presentation", () => {
    render(<Harness />);

    for (const level of ["debug", "info", "success", "warning", "error"]) {
      expect(screen.getByRole("button", { name: `Filter by ${level} log level` })).toHaveAttribute("aria-pressed", "false");
    }
    expect(screen.getByText("error")).toHaveClass("opacity-55");
  });

  it("toggles multiple levels in canonical order without removing other filters", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const error = screen.getByRole("button", { name: "Filter by error log level" });
    const debug = screen.getByRole("button", { name: "Filter by debug log level" });
    await user.click(error);
    await user.click(debug);

    expect(debug).toHaveAttribute("aria-pressed", "true");
    expect(error).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("filters")).toHaveTextContent(
      '{"actor_id":"user-42","log_level":["debug","error"]}',
    );

    await user.click(debug);
    await user.click(error);
    expect(screen.getByTestId("filters")).toHaveTextContent('{"actor_id":"user-42"}');
  });
});

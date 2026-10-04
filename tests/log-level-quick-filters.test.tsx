import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogLevelQuickFilters } from "@/components/LogLevelQuickFilters";
import type { TimelineFilters } from "@/lib/types";

function Harness({ disabled = false }: { disabled?: boolean }) {
  const [filters, setFilters] = useState<TimelineFilters>({ actor_id: "user-42" });
  return (
    <>
      <LogLevelQuickFilters filters={filters} onChange={setFilters} disabled={disabled} />
      <output data-testid="filters">{JSON.stringify(filters)}</output>
    </>
  );
}

describe("LogLevelQuickFilters", () => {
  it("renders readable available toggles with accessible off state", () => {
    render(<Harness />);

    for (const level of ["debug", "info", "success", "warning", "error"]) {
      expect(screen.getByRole("button", { name: `Filter by ${level} log level` })).toHaveAttribute("aria-pressed", "false");
    }
    expect(screen.getByText("error")).toHaveClass("border-border-strong/70", "text-muted-foreground");
    expect(screen.getByText("error")).not.toHaveClass("opacity-55", "grayscale");
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

  it("toggles the focused level with the keyboard and exposes a non-color selected marker", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.tab();
    const debug = screen.getByRole("button", { name: "Filter by debug log level" });
    expect(debug).toHaveFocus();
    await user.keyboard(" ");

    expect(debug).toHaveAttribute("aria-pressed", "true");
    expect(debug.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByText("debug")).toHaveClass("border-level-debug/60");

    await user.keyboard("{Enter}");
    expect(debug).toHaveAttribute("aria-pressed", "false");
    expect(debug.querySelector("svg")).not.toBeInTheDocument();
  });

  it("uses a real disabled state that cannot change the query", async () => {
    const user = userEvent.setup();
    render(<Harness disabled />);

    const error = screen.getByRole("button", { name: "Filter by error log level" });
    expect(error).toBeDisabled();
    expect(error).toHaveClass("disabled:cursor-not-allowed", "disabled:opacity-40");
    await user.click(error);
    expect(screen.getByTestId("filters")).toHaveTextContent('{"actor_id":"user-42"}');
  });
});

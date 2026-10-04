import { render, screen } from "@testing-library/react";
import { LogLevelBadge } from "@/components/LogLevelBadge";
import type { LogLevel } from "@/lib/types";

describe("LogLevelBadge", () => {
  it.each([
    ["info", "text-level-info"],
    ["warning", "text-level-warn"],
    ["error", "text-level-error"],
    ["debug", "text-level-debug"],
    ["success", "text-success"],
  ] satisfies [LogLevel, string][])("renders %s with the MiLog level color", (level, colorClass) => {
    render(<LogLevelBadge level={level} />);

    expect(screen.getByText(level)).toHaveClass(colorClass);
  });

  it("renders an available neutral state while retaining the severity cue", () => {
    const { container } = render(<LogLevelBadge level="error" active={false} />);

    expect(screen.getByText("error")).toHaveClass("border-border-strong/70", "bg-background", "text-muted-foreground");
    expect(screen.getByText("error")).not.toHaveClass("opacity-55", "grayscale");
    expect(container.querySelector(".bg-level-error")).toBeInTheDocument();
  });

  it("adds a checkmark and stronger level border only for selected filters", () => {
    const { container } = render(<LogLevelBadge level="warning" selected />);

    expect(screen.getByText("warning")).toHaveClass("border-level-warn/60");
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});

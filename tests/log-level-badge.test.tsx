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

  it("renders a visibly muted inactive state without changing its label", () => {
    render(<LogLevelBadge level="error" active={false} />);

    expect(screen.getByText("error")).toHaveClass("opacity-55", "grayscale");
  });
});

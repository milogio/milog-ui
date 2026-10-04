import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MetadataColumnSelector } from "@/components/MetadataColumnSelector";

describe("MetadataColumnSelector", () => {
  it("shows a selected count and keeps options collapsed until requested", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <MetadataColumnSelector
        availableKeys={["source", "status"]}
        selectedKeys={["source"]}
        onChange={onChange}
      />,
    );

    const disclosure = container.querySelector("details");
    const summary = screen.getByText("Metadata").closest("summary");
    expect(disclosure).not.toHaveAttribute("open");
    expect(summary).toHaveTextContent("1 selected");

    await user.click(screen.getByText("Metadata"));
    expect(disclosure).toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Hide source metadata" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Show status metadata" })).toHaveAttribute("aria-pressed", "false");

    await user.click(screen.getByRole("button", { name: "Hide source metadata" }));
    expect(onChange).toHaveBeenCalledWith([]);
    await user.click(screen.getByRole("button", { name: "Show status metadata" }));
    expect(onChange).toHaveBeenCalledWith(["source", "status"]);
  });

  it("explains when no metadata fields are available", async () => {
    const user = userEvent.setup();
    render(<MetadataColumnSelector availableKeys={[]} selectedKeys={[]} onChange={() => undefined} />);

    expect(screen.getByText("Metadata").closest("summary")).toHaveTextContent("0 selected");
    await user.click(screen.getByText("Metadata"));
    expect(screen.getByText("No metadata fields are available.")).toBeInTheDocument();
  });
});

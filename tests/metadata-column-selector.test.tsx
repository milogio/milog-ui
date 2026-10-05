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
    expect(summary).toHaveAttribute("aria-expanded", "true");
    const source = screen.getByRole("button", { name: "Hide source metadata" });
    const status = screen.getByRole("button", { name: "Show status metadata" });
    expect(source).toHaveAttribute("aria-pressed", "true");
    expect(source).toHaveClass("border-brand/70", "bg-accent");
    expect(source.querySelector("svg")).toBeInTheDocument();
    expect(status).toHaveAttribute("aria-pressed", "false");
    expect(status).toHaveClass("border-border-strong/70", "bg-background");
    expect(status.querySelector("svg")).not.toBeInTheDocument();

    await user.click(source);
    expect(onChange).toHaveBeenCalledWith([]);
    await user.click(status);
    expect(onChange).toHaveBeenCalledWith(["source", "status"]);

    await user.keyboard("{Escape}");
    expect(disclosure).not.toHaveAttribute("open");
    expect(summary).toHaveAttribute("aria-expanded", "false");
    expect(summary).toHaveFocus();
  });

  it("explains when no metadata fields are available", async () => {
    const user = userEvent.setup();
    render(<MetadataColumnSelector availableKeys={[]} selectedKeys={[]} onChange={() => undefined} />);

    expect(screen.getByText("Metadata").closest("summary")).toHaveTextContent("0 selected");
    await user.click(screen.getByText("Metadata"));
    expect(screen.getByText("No metadata fields are available.")).toBeInTheDocument();
  });
});

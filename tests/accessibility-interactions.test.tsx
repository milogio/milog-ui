import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Drawer } from "@/components/Drawer";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ToastProvider, useToast } from "@/providers/toast-provider";

function DrawerHarness() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Advanced filters</button>
      <Drawer open={open} side="left" title="Advanced filters" onClose={() => setOpen(false)}>
        <button type="button">First filter action</button>
        <button type="button">Last filter action</button>
      </Drawer>
    </>
  );
}

function ToastHarness() {
  const { pushToast } = useToast();

  return (
    <>
      <button type="button" onClick={() => pushToast({ title: "Export complete.", tone: "success" })}>
        Show success
      </button>
      <button type="button" onClick={() => pushToast({ title: "Export failed.", tone: "error" })}>
        Show error
      </button>
    </>
  );
}

describe("accessibility interactions", () => {
  it("traps drawer focus, closes on Escape, and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<DrawerHarness />);

    const trigger = screen.getByRole("button", { name: "Advanced filters" });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Advanced filters" });
    const close = screen.getByRole("button", { name: "Close Advanced filters" });
    expect(dialog).toBeInTheDocument();
    expect(close).toHaveFocus();
    expect(document.body).toHaveStyle({ overflow: "hidden" });

    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Last filter action" })).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Advanced filters" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body).not.toHaveStyle({ overflow: "hidden" });
  });

  it("announces success and error feedback and provides a named dismiss action", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastHarness />
      </ToastProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Show success" }));
    expect(screen.getByRole("status")).toHaveTextContent("Export complete.");
    await user.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(screen.queryByText("Export complete.")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show error" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Export failed.");
  });

  it("announces loading, empty, and error utility states", () => {
    const { rerender } = render(<LoadingSkeleton variant="page" />);
    expect(screen.getByRole("status", { name: "Loading timeline" })).toHaveAttribute("aria-busy", "true");

    rerender(<EmptyState title="No events" description="Clear the query." />);
    expect(screen.getByRole("status")).toHaveTextContent("No events");

    rerender(<ErrorState description="Unable to load timeline." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Unable to load timeline.");
  });
});

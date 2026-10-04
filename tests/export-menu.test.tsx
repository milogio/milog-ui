import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportMenu } from "@/components/ExportMenu";

describe("ExportMenu", () => {
  it("offers both export formats and returns focus after a selection", async () => {
    const user = userEvent.setup();
    const onExportCsv = vi.fn();
    const onExportJson = vi.fn();
    render(<ExportMenu onExportCsv={onExportCsv} onExportJson={onExportJson} loading={false} />);

    const trigger = screen.getByRole("button", { name: "Export" });
    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu", { name: "Export format" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Export CSV" })).toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "Export JSON" }));

    expect(onExportJson).toHaveBeenCalledOnce();
    expect(onExportCsv).not.toHaveBeenCalled();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("supports arrow-key entry and Escape with focus return", async () => {
    const user = userEvent.setup();
    render(<ExportMenu onExportCsv={() => undefined} onExportJson={() => undefined} loading={false} />);
    const trigger = screen.getByRole("button", { name: "Export" });

    trigger.focus();
    await user.keyboard("{ArrowUp}");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Export JSON" })).toHaveFocus());
    await user.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Export CSV" })).toHaveFocus();
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("communicates export progress and prevents another export", () => {
    render(<ExportMenu onExportCsv={() => undefined} onExportJson={() => undefined} loading />);

    expect(screen.getByRole("button", { name: "Exporting…" })).toBeDisabled();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

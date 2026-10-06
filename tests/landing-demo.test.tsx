import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeSection } from "@/components/landing/CodeSection";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { TimelinePreview } from "@/components/landing/TimelinePreview";

function setReducedMotion(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("marketing sample interactions", () => {
  beforeEach(() => setReducedMotion(false));

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("exposes selected filters, a helpful empty state, and a complete reset", async () => {
    const user = userEvent.setup();
    render(<InteractiveDemo />);

    const errorFilter = screen.getByRole("button", { name: "Show error sample events" });
    expect(errorFilter).toHaveAttribute("aria-pressed", "false");
    await user.click(errorFilter);
    expect(errorFilter).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByText("5/5 sample services"));
    await user.click(screen.getByRole("checkbox", { name: "checkout" }));
    await user.click(screen.getByRole("checkbox", { name: "worker" }));

    expect(screen.getByText("No sample events match these filters.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset sample filters" }));

    expect(screen.getByRole("button", { name: "Show all sample severities" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getAllByRole("button", { name: /^Inspect sample event:/ })).toHaveLength(12);
  });

  it("pauses playback while expanded event details remain available", async () => {
    const user = userEvent.setup();
    render(<InteractiveDemo />);

    const event = screen.getByRole("button", { name: "Inspect sample event: GET /v1/invoices 200" });
    expect(event).toHaveAttribute("aria-expanded", "false");
    await user.click(event);

    expect(event).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("tr_8f1c2a")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play simulated playback" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Playback paused while event details are open.",
    );
  });

  it("makes playback speed and pause state explicit", async () => {
    const user = userEvent.setup();
    render(<InteractiveDemo />);

    const fourTimes = screen.getByRole("button", { name: "4× playback speed" });
    await user.click(fourTimes);
    expect(fourTimes).toHaveAttribute("aria-pressed", "true");

    const pause = screen.getByRole("button", { name: "Pause simulated playback" });
    await user.click(pause);
    expect(screen.getByRole("button", { name: "Play simulated playback" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("starts both sample streams paused for reduced-motion visitors", () => {
    setReducedMotion(true);
    render(
      <>
        <TimelinePreview />
        <InteractiveDemo />
      </>,
    );

    expect(screen.getByRole("button", { name: "Play sample preview" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "Play simulated playback" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("does not append sample events while the demo is offscreen", () => {
    vi.useFakeTimers();
    class MockIntersectionObserver {
      constructor(private readonly callback: IntersectionObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [{ isIntersecting: false, target } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      }
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return [];
      }
      root = null;
      rootMargin = "0px";
      thresholds = [0.05];
    }
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    render(<InteractiveDemo />);
    act(() => vi.advanceTimersByTime(6000));

    expect(screen.getAllByRole("button", { name: /^Inspect sample event:/ })).toHaveLength(12);
    vi.unstubAllGlobals();
  });
});

describe("marketing API example clipboard feedback", () => {
  afterEach(() => vi.restoreAllMocks());

  it("announces a successful copy", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<CodeSection />);

    await userEvent.setup().click(screen.getByRole("button", { name: "Copy" }));

    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("API example copied to the clipboard.");
  });

  it("reports rejected clipboard writes without claiming success", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new DOMException("Not allowed", "NotAllowedError"),
    );
    render(<CodeSection />);

    await userEvent.setup().click(screen.getByRole("button", { name: "Copy" }));

    expect(screen.getByRole("button", { name: "Copy failed" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "The API example could not be copied. Select the code and copy it manually.",
    );
    expect(screen.queryByText("Copied")).not.toBeInTheDocument();
  });
});

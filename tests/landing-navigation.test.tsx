import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CodeSection } from "@/components/landing/CodeSection";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { Nav } from "@/components/landing/Nav";
import { Pricing } from "@/components/landing/Pricing";

describe("marketing navigation", () => {
  it("uses working in-page destinations and the existing-account sign-in route", () => {
    const { container } = render(
      <>
        <Nav />
        <Hero />
        <CodeSection />
        <Pricing />
        <Footer />
      </>,
    );

    for (const link of screen.getAllByRole("link", { name: "Features" })) {
      expect(link).toHaveAttribute("href", "#features");
    }
    for (const link of screen.getAllByRole("link", { name: "API example" })) {
      expect(link).toHaveAttribute("href", "#api-example");
    }
    for (const link of screen.getAllByRole("link", { name: "Sample demo" })) {
      expect(link).toHaveAttribute("href", "#demo");
    }
    for (const link of screen.getAllByRole("link", { name: "Access" })) {
      expect(link).toHaveAttribute("href", "#access");
    }
    for (const link of screen.getAllByRole("link", { name: /sign in/i })) {
      expect(link).toHaveAttribute("href", "/login");
    }
    for (const link of screen.getAllByRole("link", { name: "Explore the sample" })) {
      expect(link).toHaveAttribute("href", "#demo");
    }
    expect(container.querySelector("#api-example")).toBeInTheDocument();
    expect(container.querySelector("#access")).toBeInTheDocument();
    expect(container.querySelector('a[href="#"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href="https://github.com"]')).not.toBeInTheDocument();
  });

  it("opens and closes the mobile navigation with keyboard focus recovery", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    const trigger = screen.getByRole("button", { name: "Open navigation" });
    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.getByRole("button", { name: "Open navigation" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByRole("navigation", { name: "Mobile" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes the mobile menu after an in-page destination is chosen", async () => {
    const user = userEvent.setup();
    render(<Nav />);

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    const mobileNav = screen.getByRole("navigation", { name: "Mobile" });
    await user.click(within(mobileNav).getByRole("link", { name: "Sample demo" }));

    expect(screen.queryByRole("navigation", { name: "Mobile" })).not.toBeInTheDocument();
  });
});

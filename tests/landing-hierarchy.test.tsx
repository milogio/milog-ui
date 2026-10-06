import { render, screen } from "@testing-library/react";
import Page from "@/app/page";

describe("marketing page hierarchy", () => {
  it("uses one visible primary heading and keeps later headings subordinate", () => {
    render(<Page />);

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: "The timeline your logs deserve." }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { level: 2, name: "Explore a simulated event stream." })).toBeVisible();
    expect(
      screen.getByRole("heading", { level: 2, name: "Move from event history to an explanation." }),
    ).toBeVisible();
  });

  it("puts interactive product evidence before focused benefits and integration details", () => {
    const { container } = render(<Page />);
    const demo = container.querySelector("#demo");
    const features = container.querySelector("#features");
    const apiExample = container.querySelector("#api-example");
    const access = container.querySelector("#access");

    expect(demo).toBeInTheDocument();
    expect(features).toBeInTheDocument();
    expect(apiExample).toBeInTheDocument();
    expect(access).toBeInTheDocument();
    expect((demo as Element).compareDocumentPosition(features as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect((features as Element).compareDocumentPosition(apiExample as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect((apiExample as Element).compareDocumentPosition(access as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("presents three outcome-focused benefit groups", () => {
    render(<Page />);

    expect(screen.getByRole("heading", { level: 3, name: "Find the event that matters" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 3, name: "Reconstruct what happened" })).toBeVisible();
    expect(screen.getByRole("heading", { level: 3, name: "Carry the result forward" })).toBeVisible();
  });
});

import { render, screen, within } from "@testing-library/react";
import { LegalDocument } from "@/components/LegalDocument";
import { Footer } from "@/components/landing/Footer";
import documents from "@/lib/legalDocuments.json";

describe("public legal pages", () => {
  it.each([
    ["terms", "MiLog Terms of Service", 14, "legal@milog.ca"],
    ["privacy", "MiLog Privacy Policy", 10, "privacy@milog.ca"],
  ] as const)("shows the full %s document, effective date, and contact details", (name, title, sectionCount, contactEmail) => {
    const document = documents[name];
    render(<LegalDocument document={document} />);

    expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText("October 8, 2026")).toHaveAttribute("datetime", "2026-10-08");
    const article = screen.getByRole("article", { name: title });
    expect(article).toHaveTextContent(document.intro);
    expect(within(article).getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)).toEqual(
      document.sections.map((section) => section.heading),
    );
    expect(document.sections).toHaveLength(sectionCount);
    for (const section of document.sections) {
      for (const paragraph of section.paragraphs) {
        expect(article).toHaveTextContent(paragraph);
      }
    }
    expect(article).toHaveTextContent("1435529 B.C. LTD.");
    expect(article).toHaveTextContent(contactEmail);
    expect(article.textContent).not.toMatch(/\[[^\]]+\]/);
    expect(screen.queryByRole("complementary", { name: "Information to complete" })).not.toBeInTheDocument();
  });

  it("links to both public pages from the marketing footer", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Terms of Service" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
  });
});

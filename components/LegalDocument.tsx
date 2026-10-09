import Link from "next/link";
import { Logo } from "@/components/landing/Logo";

type LegalContent = {
  title: string;
  intro: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
};

const EFFECTIVE_DATE = "October 8, 2026";
export function LegalDocument({ document }: { document: LegalContent }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
          <Link href="/" aria-label="MiLog home" className="inline-flex"><Logo /></Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-20 pt-12 md:px-6 md:pt-16">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">MiLog legal</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{document.title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">Effective date: <time dateTime="2026-10-08">{EFFECTIVE_DATE}</time></p>
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-16">
          <article aria-label={document.title} className="max-w-3xl text-base leading-7">
            <p className="text-foreground">{document.intro}</p>
            {document.sections.map((section, index) => (
              <section key={section.heading} id={`section-${index + 1}`} className="scroll-mt-8 pt-10">
                <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex} className="mt-4 text-foreground/90">{paragraph}</p>
                ))}
              </section>
            ))}
          </article>

          <nav aria-label="On this page" className="lg:sticky lg:top-8 lg:self-start">
            <h2 className="text-sm font-semibold">On this page</h2>
            <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
              {document.sections.map((section, index) => (
                <li key={section.heading}>
                  <a href={`#section-${index + 1}`} className="hover:text-foreground hover:underline">{section.heading}</a>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        <div className="mt-16 flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-6 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
          <Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link>
        </div>
      </div>
    </main>
  );
}

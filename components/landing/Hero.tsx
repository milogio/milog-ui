import Link from "next/link";
import { Code2 } from "lucide-react";
import { TimelinePreview } from "@/components/landing/TimelinePreview";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-radial-glow" />
      <div className="container relative grid min-h-[calc(100vh-3.5rem)] items-center gap-12 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:py-20">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full border border-border bg-card/70 px-3 py-1 font-mono text-xs text-muted-foreground">
            v2.0 - Real-time streaming is here
          </div>
          <h2 className="mt-6 text-5xl font-semibold tracking-normal text-foreground sm:text-6xl lg:text-7xl">
            The timeline your <span className="text-gradient-brand">logs deserve.</span>
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            MiLog is a developer-first logging platform. Stream structured events, correlate traces,
            and replay incidents on a beautiful, queryable timeline.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-md bg-gradient-brand px-5 text-sm font-medium text-brand-foreground shadow-glow hover:opacity-90"
            >
              Get started - it&apos;s free
            </Link>
            <a
              href="https://github.com"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground hover:bg-accent"
            >
              <Code2 className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
          <div className="mt-5 font-mono text-sm text-muted-foreground">$ npm i @milog/sdk</div>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-gradient-brand opacity-20 blur-3xl" />
          <TimelinePreview />
        </div>
      </div>
    </section>
  );
}

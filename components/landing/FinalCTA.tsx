import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="border-b border-border">
      <div className="container py-20">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 text-center shadow-soft sm:p-16">
          <div className="absolute inset-0 bg-grid" />
          <div className="absolute inset-0 bg-radial-glow" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-normal sm:text-5xl">
              Ship with <span className="text-gradient-brand">confidence.</span>
            </h2>
            <p className="mt-5 text-muted-foreground">
              Spin up MiLog in under a minute. Free for the first million events, every month. No
              credit card required.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex h-11 items-center rounded-md bg-gradient-brand px-5 text-sm font-medium text-brand-foreground hover:opacity-90"
              >
                Start free
              </Link>
              <Link
                href="#docs"
                className="inline-flex h-11 items-center rounded-md border border-border bg-background px-5 text-sm font-medium hover:bg-accent"
              >
                Read the docs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

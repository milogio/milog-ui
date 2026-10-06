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
              Return to your <span className="text-gradient-brand">timeline.</span>
            </h2>
            <p className="mt-5 text-muted-foreground">
              Existing account holders can sign in to review and filter tenant-scoped event history,
              export results, and share filtered views.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex h-11 items-center rounded-md bg-gradient-brand px-5 text-sm font-medium text-brand-foreground hover:opacity-90"
              >
                Sign in
              </Link>
              <Link
                href="#demo"
                className="inline-flex h-11 items-center rounded-md border border-border bg-background px-5 text-sm font-medium hover:bg-accent"
              >
                Explore the sample
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

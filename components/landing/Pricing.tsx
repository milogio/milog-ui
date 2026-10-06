import Link from "next/link";

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-border">
      <div className="container py-20 lg:py-28">
        <div className="max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gradient-brand">Access</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
            Public plans are not available yet.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pricing, trial availability, event allowances, retention, team limits, and support terms
            are not published yet. Existing account holders can continue to their tenant timeline.
          </p>
        </div>
        <div className="mt-10 max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <h3 className="text-lg font-semibold">Already have access?</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Sign in with your existing MiLog account. Plan comparisons will appear here after the
            commercial terms and included capabilities are confirmed.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-gradient-brand px-4 text-sm font-medium text-brand-foreground"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}

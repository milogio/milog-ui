import Link from "next/link";

export function FinalCTA({ signupAvailable = false }: { signupAvailable?: boolean }) {
  return (
    <section>
      <div className="container py-20">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-10 text-center shadow-soft sm:p-16">
          <div className="absolute inset-0 bg-grid" />
          <div className="absolute inset-0 bg-radial-glow" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-normal sm:text-5xl">
              {signupAvailable ? "Make it your " : "Return to your "}<span className="text-gradient-brand">timeline.</span>
            </h2>
            <p className="marketing-prose mt-5">
              {signupAvailable
                ? "Create an account, verify your email, and start reviewing tenant-scoped event history."
                : "Existing account holders can sign in to review and filter tenant-scoped event history, export results, and share filtered views."}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href={signupAvailable ? "/signup" : "/login"}
                className="inline-flex h-11 items-center rounded-md bg-gradient-brand px-5 text-sm font-medium text-brand-foreground hover:opacity-90"
              >
                {signupAvailable ? "Create account" : "Sign in"}
              </Link>
              <Link
                href="#demo"
                className="marketing-control inline-flex h-11 items-center rounded-md border bg-background px-5 text-sm font-medium hover:bg-accent"
              >
                Explore the sample
              </Link>
            </div>
            {signupAvailable ? <p className="mt-4 text-sm text-muted-foreground">Already have an account? <Link href="/login" className="text-brand underline">Sign in</Link>.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

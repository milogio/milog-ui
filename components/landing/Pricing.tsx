import Link from "next/link";

export function Pricing({ signupAvailable = false }: { signupAvailable?: boolean }) {
  return (
    <section id="access" className="bg-card/30">
      <div className="container marketing-section">
        <div className="marketing-copy">
          <p className="marketing-section-label text-gradient-brand">Access</p>
          <h2 className="marketing-heading mt-3 font-semibold">{signupAvailable ? "Create your MiLog account." : "Public plans are not available yet."}</h2>
          <p className="marketing-prose mt-4">{signupAvailable
            ? "Create an account and verify your email to see your available access. Public pricing and paid checkout are not available yet."
            : "Pricing, trial availability, event allowances, retention, team limits, and support terms are not published yet. Existing account holders can continue to their tenant timeline."}</p>
        </div>
        <div className="mt-10 max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <h3 className="text-lg font-semibold">{signupAvailable ? "Get started with MiLog" : "Already have access?"}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {signupAvailable
              ? "After email verification, sign in to view your tenant timeline and current account eligibility."
              : "Sign in with your existing MiLog account. Plan comparisons will appear here after the commercial terms and included capabilities are confirmed."}
          </p>
          <Link
            href={signupAvailable ? "/signup" : "/login"}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-gradient-brand px-4 text-sm font-medium text-brand-foreground"
          >
            {signupAvailable ? "Create account" : "Sign in"}
          </Link>
          {signupAvailable ? <p className="mt-4 text-sm text-muted-foreground">Already have an account? <Link href="/login" className="text-brand underline">Sign in</Link>.</p> : null}
        </div>
      </div>
    </section>
  );
}

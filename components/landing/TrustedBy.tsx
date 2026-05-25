const names = ["acme", "vercel", "linear", "stripe", "plaid", "supabase"];

export function TrustedBy() {
  return (
    <section className="border-b border-border">
      <div className="container flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Trusted by engineering teams at
        </p>
        <p className="font-mono text-sm text-muted-foreground opacity-70">
          {names.join(" · ")}
        </p>
      </div>
    </section>
  );
}

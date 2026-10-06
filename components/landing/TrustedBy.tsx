const capabilities = ["structured events", "exact filters", "event details", "CSV + JSON export"];

export function TrustedBy() {
  return (
    <section className="border-b border-border">
      <div className="container flex flex-col items-center gap-4 py-8 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Built for event investigation
        </p>
        <p className="font-mono text-sm text-muted-foreground opacity-70">
          {capabilities.join(" · ")}
        </p>
      </div>
    </section>
  );
}

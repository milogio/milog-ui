const capabilities = ["structured events", "exact filters", "event details", "CSV + JSON export"];

export function TrustedBy() {
  return (
    <section className="border-b border-border">
      <div className="container flex flex-col items-center gap-4 py-8 text-center">
        <p className="marketing-section-label font-medium text-muted-foreground">
          Built for event investigation
        </p>
        <p className="font-mono text-sm text-muted-foreground">
          {capabilities.join(" · ")}
        </p>
      </div>
    </section>
  );
}

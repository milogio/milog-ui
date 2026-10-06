import { BellRing, FileJson2, Search } from "lucide-react";

const benefits = [
  {
    icon: Search,
    title: "Find the event that matters",
    description:
      "Use tenant scope, exact actor, target, type, and level filters, stable ordering, and cursor pagination to narrow long histories.",
  },
  {
    icon: FileJson2,
    title: "Reconstruct what happened",
    description:
      "Read actor, action, target, severity, and time together, then open details and inspect metadata JSON without leaving the timeline.",
  },
  {
    icon: BellRing,
    title: "Carry the result forward",
    description:
      "Export filtered results, share filter state with an authenticated tenant recipient, or save a browser rule for new matching events.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-card/30">
      <div className="container marketing-section">
        <div className="marketing-copy">
          <p className="marketing-section-label text-gradient-brand">Benefits</p>
          <h2 className="marketing-heading mt-3 font-semibold">
            Move from event history to an explanation.
          </h2>
          <p className="marketing-prose mt-4">
            MiLog keeps the steps of an investigation together, from narrowing a tenant timeline to
            sharing a useful result.
          </p>
        </div>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-border lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="bg-card p-6 sm:p-8">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background">
                  <Icon className="h-4 w-4 text-brand" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { Activity, BellRing, Boxes, Download, FileJson2, Search } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Tenant timelines",
    description:
      "Review events for the signed-in tenant in stable occurrence order, with cursor pagination for longer histories.",
  },
  {
    icon: Boxes,
    title: "Structured event context",
    description:
      "Keep actor, action, target, severity, timestamps, and metadata together in one inspectable event record.",
  },
  {
    icon: Search,
    title: "Exact filters",
    description:
      "Filter by actor ID, target ID, entity type, and normalized log levels while keeping the URL and saved query aligned.",
  },
  {
    icon: FileJson2,
    title: "Event investigation",
    description:
      "Open a focused details view, copy identifiers, and inspect the event metadata JSON without leaving the timeline.",
  },
  {
    icon: BellRing,
    title: "Saved matching alerts",
    description:
      "Save filter-based rules in the browser and receive an in-app notice when a new matching event appears while the timeline is open.",
  },
  {
    icon: Download,
    title: "Export and filtered sharing",
    description:
      "Export the filtered result as CSV or JSON, or create a filter-only link for authenticated recipients in the same tenant.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-b border-border">
      <div className="container py-20 lg:py-28">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gradient-brand">Features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
            Investigate the event history you have.
          </h2>
          <p className="mt-4 text-muted-foreground">
            MiLog keeps structured context, query controls, and investigation actions together in one
            tenant-scoped timeline.
          </p>
        </div>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl bg-border md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-card p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background">
                  <Icon className="h-4 w-4 text-brand" />
                </div>
                <h3 className="mt-5 text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

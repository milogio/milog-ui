import { Activity, BellRing, Boxes, Code2, GitBranch, Search } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Real-time streaming",
    description:
      "Sub-second ingest. Watch events land on the timeline as they happen, with backpressure handled for you.",
  },
  {
    icon: Boxes,
    title: "Structured events",
    description:
      "First-class JSON. Index any field, attach metadata, and stop grepping unstructured text forever.",
  },
  {
    icon: Search,
    title: "Powerful query language",
    description:
      "MQL - a typed, expressive query language. Filter, aggregate, and pivot millions of events in milliseconds.",
  },
  {
    icon: GitBranch,
    title: "Trace correlation",
    description:
      "Stitch logs to traces and spans automatically. Follow a request from edge to database without context-switching.",
  },
  {
    icon: BellRing,
    title: "Smart alerting",
    description:
      "Anomaly detection on any metric, routed to Slack, PagerDuty, or webhooks. Quiet, actionable, and tunable.",
  },
  {
    icon: Code2,
    title: "SDKs for every stack",
    description:
      "Drop-in libraries for Node, Python, Go, Rust, and Ruby. Or just POST JSON - your call.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-b border-border">
      <div className="container py-20 lg:py-28">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gradient-brand">Features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
            Everything you need to debug production.
          </h2>
          <p className="mt-4 text-muted-foreground">
            A single platform for logs, traces, and events - designed by developers who got tired of
            duct-taping observability tools together.
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

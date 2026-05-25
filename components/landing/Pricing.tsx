import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "$9",
    tagline: "For side projects and prototypes.",
    cta: "Start free",
    highlighted: false,
    features: ["1M events / month", "7 days retention", "3 team seats", "Basic alerting", false, false, "Community support"],
  },
  {
    name: "Growth",
    price: "$29",
    tagline: "For growing teams shipping fast.",
    cta: "Start 14-day trial",
    highlighted: true,
    features: ["10M events / month", "30 days retention", "10 team seats", "Advanced alerting", true, false, "Email support"],
  },
  {
    name: "Pro",
    price: "$79",
    tagline: "For production-critical workloads.",
    cta: "Contact sales",
    highlighted: false,
    features: [
      "50M events / month",
      "90 days retention",
      "Unlimited team seats",
      "Advanced + on-call alerting",
      true,
      true,
      "Priority + Slack support",
    ],
  },
];

const featureLabels = [
  "Events / month",
  "Retention",
  "Team seats",
  "Alerting",
  "Trace correlation",
  "SSO / SAML",
  "Support",
];

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-border">
      <div className="container py-20 lg:py-28">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gradient-brand">Pricing</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">Simple, predictable pricing.</h2>
          <p className="mt-4 text-muted-foreground">
            Start on a generous free trial. Scale linearly. No surprise overage bills.
          </p>
        </div>
        <div className="mt-12 grid items-stretch gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-2xl border border-border bg-card p-6 shadow-soft",
                plan.highlighted && "border-transparent ring-gradient-brand shadow-glow lg:-mt-4",
              )}
            >
              {plan.highlighted ? (
                <div className="absolute right-5 top-5 rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[11px] text-gradient-brand">
                  Best value
                </div>
              ) : null}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-semibold">{plan.price}</span>
                <span className="text-muted-foreground">/ month</span>
              </div>
              <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">{plan.tagline}</p>
              <Link
                href="/login"
                className={cn(
                  "mt-6 inline-flex h-10 w-full items-center justify-center rounded-md text-sm font-medium",
                  plan.highlighted
                    ? "bg-gradient-brand text-brand-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent",
                )}
              >
                {plan.cta}
              </Link>
              <div className="mt-6 space-y-3">
                {featureLabels.map((label, index) => {
                  const value = plan.features[index];
                  return (
                    <div key={label} className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="flex items-center text-right text-foreground">
                        {value === true ? <Check className="h-4 w-4 text-level-info" /> : null}
                        {value === false ? <Minus className="h-4 w-4 text-muted-foreground/60" /> : null}
                        {typeof value === "string" ? value : null}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

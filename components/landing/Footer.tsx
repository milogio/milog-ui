import Link from "next/link";
import { Logo } from "@/components/landing/Logo";

const columns = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Developers: ["API Reference", "Documentation", "Status", "SDKs"],
  Company: ["About", "Customers", "Blog", "Careers"],
  Legal: ["Privacy", "Terms", "Security", "DPA"],
};

export function Footer() {
  return (
    <footer id="api">
      <div className="container grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
            The timeline your logs deserve. Built for developers who actually read their logs.
          </p>
        </div>
        {Object.entries(columns).map(([title, links]) => (
          <div key={title}>
            <h3 className="text-sm font-semibold">{title}</h3>
            <ul className="mt-4 space-y-3">
              {links.map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container flex flex-col gap-3 py-5 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>© 2026 MiLog, Inc. All rights reserved.</span>
          <span className="font-mono">all systems operational · v2.0.4</span>
        </div>
      </div>
    </footer>
  );
}

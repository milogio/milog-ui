import Link from "next/link";
import { Logo } from "@/components/landing/Logo";

const links = [
  ["Features", "#features"],
  ["API example", "#api-example"],
  ["Sample demo", "#demo"],
  ["Access", "#access"],
  ["Sign in", "/login"],
] as const;

export function Footer() {
  return (
    <footer>
      <div className="container grid gap-10 py-12 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <Link href="/" aria-label="MiLog home" className="inline-flex">
            <Logo />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Structured, tenant-scoped event history for authenticated MiLog accounts.
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold">Explore MiLog</h2>
          <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {links.map(([label, href]) => (
              <li key={label}>
                <Link href={href} className="text-sm text-muted-foreground hover:text-foreground">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="container py-5 text-sm text-muted-foreground">© 2026 MiLog.</div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Logo } from "@/components/landing/Logo";

const links = [
  ["Features", "#features"],
  ["Demo", "#demo"],
  ["Pricing", "#pricing"],
  ["Docs", "#docs"],
  ["API Reference", "#api"],
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" aria-label="MiLog home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          {links.map(([label, href]) => (
            <Link key={label} href={href} className="hover:text-foreground">
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden h-9 items-center rounded-md px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="inline-flex h-9 items-center rounded-md bg-gradient-brand px-3 text-sm font-medium text-brand-foreground hover:opacity-90"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/landing/Logo";

const links = [
  ["Sample demo", "#demo"],
  ["Features", "#features"],
  ["API example", "#api-example"],
  ["Access", "#access"],
] as const;

export function Nav({ signupAvailable = false }: { signupAvailable?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    };
    const closeOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div ref={containerRef} className="container relative">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" aria-label="MiLog home">
            <Logo />
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            {links.map(([label, href]) => (
              <Link key={label} href={href} className="hover:text-foreground">
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            {signupAvailable ? <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link> : null}
            <Link
              href={signupAvailable ? "/signup" : "/login"}
              className="inline-flex h-9 items-center rounded-md bg-gradient-brand px-3 text-sm font-medium text-brand-foreground hover:opacity-90"
            >
              {signupAvailable ? "Create account" : "Sign in"}
            </Link>
          </div>

          <button
            ref={triggerRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            className="marketing-control inline-flex h-10 w-10 items-center justify-center rounded-md border bg-background text-foreground hover:bg-accent md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>

        {menuOpen ? (
          <nav
            id="mobile-navigation"
            aria-label="Mobile"
            className="absolute left-0 right-0 top-14 rounded-b-xl border border-t-0 border-border bg-background p-3 shadow-soft md:hidden"
          >
            <ul className="space-y-1">
              {links.map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="flex min-h-11 items-center rounded-md px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    onClick={() => setMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href={signupAvailable ? "/signup" : "/login"}
                  className="flex min-h-11 items-center justify-center rounded-md bg-gradient-brand px-3 text-sm font-medium text-brand-foreground hover:opacity-90"
                  onClick={() => setMenuOpen(false)}
                >
                  {signupAvailable ? "Create account" : "Sign in"}
                </Link>
              </li>
              {signupAvailable ? <li><Link href="/login" className="flex min-h-11 items-center justify-center rounded-md px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground" onClick={() => setMenuOpen(false)}>Sign in</Link></li> : null}
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}

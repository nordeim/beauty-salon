"use client";

// Site chrome — fixed header with transparent→glass scroll transition and the
// full-screen mobile drawer. The drawer's spacing contract is pinned by
// tests/e2e/mobile-navigation.spec.ts:
//   * links column: flex gap-2 (8px) — NOT space-y. The v3 reference's engine
//     would override a child's mt-* inside space-y; v4's :where() rewrite
//     resurrects it (Tailwind-V4-Validation-Report trap 4). Using flex gap +
//     the reference's mt-10 CTA wrapper renders identically on both engines:
//     computed 8px gap + 40px margin = 48px before the CTA.
//   * drawer: fixed inset-0 z-[60] bg-background; closes on link click or the
//     round close button (the reference has no scroll lock; Escape is added
//     as an a11y enhancement that does not change the visual surface).

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusPill } from "@/components/StatusPill";

const NAV_ITEMS = [
  { label: "Treatments", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Atelier", href: "/team" },
  { label: "Story", href: "/about" },
  { label: "Visit", href: "/contact" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-500",
          scrolled ? "glass border-b border-foreground/5" : "bg-transparent",
        )}
      >
        <div className="max-w-[1400px] mx-auto px-3 md:px-6 h-20 flex items-center justify-between">
          <Link className="font-serif text-xl md:text-2xl" href="/">
            Maison Luminaire
          </Link>

          <nav className="hidden lg:flex items-center gap-10" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                className="relative text-[11px] uppercase tracking-editorial transition-colors text-foreground/60 hover:text-foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:inline-flex">
              <StatusPill />
            </div>
            <Link className="inline-block" href="/book">
              <span className="inline-flex items-center justify-center rounded-full font-sans uppercase tracking-editorial transition-colors duration-500 select-none text-[10px] px-5 py-2.5 bg-foreground text-background hover:bg-secondary">
                Book Now
              </span>
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-full border border-foreground/20"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] bg-background">
          <div className="absolute top-0 inset-x-0 h-20 flex items-center justify-between px-3 md:px-6">
            <Link className="font-serif text-xl" href="/" onClick={() => setOpen(false)}>
              Maison Luminaire
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              className="h-10 w-10 flex items-center justify-center rounded-full border border-foreground/20"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          </div>
          <div className="h-full flex flex-col lg:flex-row">
            <div className="flex-1 flex flex-col justify-center px-8 md:px-20 gap-2">
              {NAV_ITEMS.map((item, i) => (
                <div key={item.href} style={{ transitionDelay: `${i * 60}ms` }}>
                  <Link
                    className="block font-serif text-5xl md:text-7xl tracking-tight hover:italic transition-all"
                    href={item.href}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
              <div className="mt-10">
                <Link className="inline-block" href="/book" onClick={() => setOpen(false)}>
                  <span className="inline-flex items-center justify-center rounded-full font-sans uppercase tracking-editorial transition-colors duration-500 select-none text-xs px-9 py-4 bg-foreground text-background hover:bg-secondary">
                    Book an appointment
                  </span>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block w-[45%] relative overflow-hidden bg-muted">
              <div className="absolute inset-0 flex items-end p-10 text-foreground/40 text-[11px] uppercase tracking-editorial">
                Hover to preview
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

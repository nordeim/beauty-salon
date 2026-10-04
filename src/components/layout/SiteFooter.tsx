// Site footer — dark (bg-foreground) with the big serif statement, Visit
// links, hours list, contact column, and the legal bottom bar.
import Link from "next/link";
import { HOURS, formatDayHoursCompact, statusForDay } from "@/lib/hours";

const VISIT_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Team", href: "/team" },
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Book", href: "/book" },
] as const;

const LEGAL_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Refund", href: "/refund" },
] as const;

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-24 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          <div className="md:col-span-5">
            <h3 className="font-serif text-4xl md:text-5xl leading-[0.95] text-balance">
              Begin your
              <br />
              transformation.
            </h3>
            <div className="mt-8">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-editorial text-background/70">
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60 breathe" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </span>
                <span suppressHydrationWarning>
                  <FooterStatus />
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[10px] uppercase tracking-editorial text-background/50 mb-4">
              Visit
            </h4>
            <ul className="space-y-2 text-sm text-background/80">
              {VISIT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link className="hover:text-background transition" href={l.href}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-[10px] uppercase tracking-editorial text-background/50 mb-4">
              Hours
            </h4>
            <ul className="space-y-1.5 text-sm text-background/80">
              {HOURS.map((d) => (
                <li key={d.label} className="flex justify-between max-w-[220px]">
                  <span>{d.label}</span>
                  <span className="text-background/60">{formatDayHoursCompact(d)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[10px] uppercase tracking-editorial text-background/50 mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-background/80">
              <li>
                <a href="tel:123-456-7890" className="inline-flex items-center gap-2 hover:text-background">
                  123-456-7890
                </a>
              </li>
              <li>
                <a href="mailto:info@mysite.com" className="inline-flex items-center gap-2 hover:text-background">
                  info@mysite.com
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 hover:text-background"
                >
                  Instagram
                </a>
              </li>
              <li className="text-background/60 text-xs leading-relaxed pt-2">
                500 Terry Francine Street San Francisco, CA 94158
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-background/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-[10px] uppercase tracking-editorial text-background/50">
          <div>© 2026 Maison Luminaire. Built on Base44.</div>
          <div className="flex gap-8">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} className="hover:text-background" href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterStatus() {
  // Server component — computed at request time (dynamic render). The
  // reference SPA computes the day in the browser; the header's StatusPill
  // island covers the live behavior, and this request-time computation keeps
  // the footer in sync for dynamic responses.
  return <>{statusForDay(new Date().getDay())}</>;
}

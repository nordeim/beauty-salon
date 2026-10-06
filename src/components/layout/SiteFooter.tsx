// Site footer — dark (bg-foreground) with the big serif statement, Visit
// links, hours list, contact column, and the legal bottom bar.
import Link from "next/link";
import { Instagram, Mail, Phone } from "lucide-react";
import { StatusPill } from "@/components/StatusPill";
import { HOURS, formatDayHoursCompact } from "@/lib/hours";

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
              {/* The live pill island (session 20, F20-B): the reference's
                  footer pill is client-side and identical to its header pill
                  at every measured probe — the server-side day-only
                  computation this replaced baked the prerender-time state
                  into static pages. The className carries the reference's own
                  redundant text-background/80 + /70 pair — its /80 wins in
                  both engines (F20-H; computed rgba(250, 248, 245, 0.8)). */}
              <StatusPill className="text-background/80 text-background/70" />
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[10px] uppercase tracking-editorial text-background/50 mb-4">
              Visit
            </h4>
            <ul className="space-y-2 text-sm text-background/80">
              {VISIT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link className="hover:text-background transition" href={l.href} scroll={false}>
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
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                  123-456-7890
                </a>
              </li>
              <li>
                <a href="mailto:info@mysite.com" className="inline-flex items-center gap-2 hover:text-background">
                  <Mail className="h-3.5 w-3.5" aria-hidden />
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
                  <Instagram className="h-3.5 w-3.5" aria-hidden />
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
              <Link key={l.href} className="hover:text-background" href={l.href} scroll={false}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

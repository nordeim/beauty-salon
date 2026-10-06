import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Flower2 } from "lucide-react";
import { BookHeader } from "@/components/layout/BookHeader";
import { buildIcs, icsDataUri } from "@/lib/ics";

export const metadata: Metadata = {
  title: "Reservation received",
  description: "Your transformation begins soon.",
};

function formatLongDate(iso: string): string {
  // "2026-10-21" → "Wednesday, October 21" (en-US long form, no year)
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; date?: string; time?: string; service?: string }>;
}) {
  const { name = "", date = "", time = "", service = "" } = await searchParams;
  const firstName = name.split(" ")[0] || name;

  // The receipt is a pure function of the query string — the reference does
  // NOT resolve the service for the ICS: its download carries a fixed
  // 90-minute event block regardless of the service's advertised duration
  // (live-measured session 8), so no DB read is needed here. The
  // no/partial-params fallbacks (now-stamps + the "Appointment"/"you"
  // texts) live in the lib — live-measured session 17 (F05c).
  const ics = buildIcs({
    date,
    time,
    name,
    service,
    uid: String(Date.now()),
  });
  const icsHref = icsDataUri(ics);

  return (
    <>
      <BookHeader />
      <main className="flex-1">
        <section className="min-h-screen pt-28 pb-20 prism-gradient relative overflow-hidden">
          {/* The reference's decorative watermark — lucide flower2, class-sized
              (responsive 256/384px) with stroke-width 0.5, settling at sage/30.
              The settled inline styles on the circle below replicate the
              reference's animation-framework rest state (live-measured,
              session 10): the ring is INVISIBLE at rest (opacity 0 — only a
              wasted scale loop runs beneath it on the reference). */}
          <div
            className="absolute top-28 left-1/2 -translate-x-1/2 text-secondary/30"
            aria-hidden
          >
            <Flower2 strokeWidth={0.5} className="h-64 w-64 md:h-96 md:w-96" />
          </div>
          <div
            className="absolute top-28 left-1/2 -translate-x-1/2 h-64 w-64 md:h-96 md:w-96 rounded-full border border-secondary/30"
            style={{ opacity: 0 }}
            aria-hidden
          />

          <div className="relative max-w-[800px] mx-auto px-6 md:px-10 text-center pt-20">
            <div>
              <div className="text-[11px] uppercase tracking-editorial text-foreground/60 mb-6">
                — Reservation received
              </div>
              <h1 className="font-serif text-5xl md:text-7xl leading-[0.95]">
                Your transformation
                <br />
                <span className="italic text-secondary">begins soon.</span>
              </h1>
              <p className="mt-8 text-foreground/70 leading-[1.7] max-w-md mx-auto">
                {/* The no-name branch renders "Thank you." — NO comma-period
                    artifact (live-measured session 17, F05c: the bare
                    /book/confirmation reads "Thank you. We've received your
                    request…"). */}
                {name ? `Thank you, ${firstName}.` : "Thank you."} We&apos;ve received your
                request and a member of our concierge will confirm within 2 business hours.
              </p>
            </div>

            {/* The receipt card renders ONLY when a date is present — the
                live omits the whole glass card on the bare/partial routes
                (live-measured session 17; the card is not an empty-lines
                shell). The time and service lines render iff their params
                are present. */}
            {date && (
              <div className="mt-12 glass border border-foreground/10 rounded-sm p-8 max-w-md mx-auto text-left">
                <div className="text-[10px] uppercase tracking-editorial text-foreground/50">
                  Reserved for
                </div>
                <div className="mt-3 font-serif text-3xl">{formatLongDate(date)}</div>
                {time && <div className="mt-1 text-foreground/70">{time}</div>}
                {service && (
                  <div className="mt-4 text-[11px] uppercase tracking-editorial text-secondary">
                    {service}
                  </div>
                )}
              </div>
            )}

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={icsHref}
                download="maison-luminaire-appointment.ics"
                className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-4 text-[11px] uppercase tracking-editorial hover:bg-secondary transition"
              >
                <Calendar className="h-4 w-4" aria-hidden />
                Add to calendar
              </a>
              <Link className="inline-block" href="/" scroll={false}>
                <span className="inline-flex items-center justify-center rounded-full font-sans uppercase tracking-editorial transition-colors duration-500 select-none text-[11px] px-7 py-3.5 bg-transparent text-foreground border border-foreground/30 hover:border-foreground hover:bg-foreground hover:text-background">
                  Return home
                </span>
              </Link>
            </div>

            <div className="mt-16 pt-10 border-t border-foreground/10 max-w-lg mx-auto text-left">
              <div className="text-[10px] uppercase tracking-editorial text-foreground/50 mb-3">
                Cancellation policy
              </div>
              <p className="text-sm text-foreground/70 leading-[1.7]">
                We kindly ask for at least 24 hours&apos; notice for cancellations or
                rescheduling. Late cancellations may be subject to a 50% service fee, and no-shows
                will be charged in full. You can reach us at{" "}
                {/* The reference's policy link is a ROUTE link to /contact —
                    not a mailto — with the trailing arrow-right at h-3 w-3
                    (live-measured session 10). */}
                <a
                  href="/contact"
                  className="underline hover:text-foreground inline-flex items-center gap-1"
                >
                  concierge@maisonluminaire.com{" "}
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

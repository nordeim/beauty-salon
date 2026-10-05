import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Phone, Mail, Instagram } from "lucide-react";
import { HOURS, formatDayHours } from "@/lib/hours";
import { StatusPill } from "@/components/StatusPill";

export const metadata: Metadata = {
  title: "Contact",
  description: "Find us in the light — visit Maison Luminaire in lower Manhattan.",
};

const MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3023.0!2d-74.006!3d40.7128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sNew%20York!5e0!3m2!1sen!2sus!4v1700000000000";

export default function ContactPage() {
  return (
    <>
      <section className="pt-40 md:pt-52 pb-12 px-3 md:px-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="mt-6 font-serif text-6xl md:text-[8.5rem] leading-[0.92] tracking-tight text-balance">
            Find us in the <span className="italic text-secondary">light.</span>
          </h1>
        </div>
      </section>

      <section className="pb-28 px-3 md:px-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-10">
            <div>
              <div className="text-[10px] uppercase tracking-editorial text-foreground/50 mb-3">
                Address
              </div>
              <div className="font-serif text-2xl leading-snug">
                500 Terry Francine Street San Francisco, CA 94158
              </div>
              <a
                href="https://maps.google.com/?q=500%20Terry%20Francine%20Street%20San%20Francisco%2C%20CA%2094158"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-[11px] uppercase tracking-editorial text-foreground/70 hover:text-foreground"
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden /> {"Get directions"}
              </a>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-editorial text-foreground/50 mb-3">
                Reach us
              </div>
              <div className="space-y-2">
                <a
                  href="tel:123-456-7890"
                  className="flex items-center gap-3 font-serif text-xl hover:text-secondary transition"
                >
                  <Phone className="h-4 w-4 text-foreground/60" aria-hidden />
                  123-456-7890
                </a>
                <a
                  href="mailto:info@mysite.com"
                  className="flex items-center gap-3 font-serif text-xl hover:text-secondary transition"
                >
                  <Mail className="h-4 w-4 text-foreground/60" aria-hidden />
                  info@mysite.com
                </a>
                <a
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 font-serif text-xl hover:text-secondary transition"
                >
                  <Instagram className="h-4 w-4 text-foreground/60" aria-hidden />
                  @maisonluminaire
                </a>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] uppercase tracking-editorial text-foreground/50">
                  Hours
                </div>
                <StatusPill />
              </div>
              <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
                {HOURS.map((d) => (
                  <li key={d.label} className="flex items-center justify-between py-3 text-sm">
                    <span>{d.label}</span>
                    <span className="text-foreground/60">{formatDayHours(d)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6">
              <Link className="inline-block" href="/book" scroll={false}>
                <span className="inline-flex items-center justify-center rounded-full font-sans uppercase tracking-editorial transition-colors duration-500 select-none text-xs px-9 py-4 bg-foreground text-background hover:bg-secondary">
                  Reserve an appointment
                </span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="aspect-[4/5] md:aspect-[5/6] overflow-hidden rounded-sm border border-foreground/10 bg-muted">
              <iframe
                title="Map"
                src={MAP_EMBED}
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0, filter: "grayscale(0.2) contrast(1.05)" }}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

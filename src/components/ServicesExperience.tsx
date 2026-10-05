"use client";

// Services page experience — category pills filter the grid in place
// (the reference filters client-side; the deep links /services?category=hair
// preselect a pill via the initial prop).
import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, type ServiceDto } from "@/lib/content";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "hair", label: "Hair" },
  { key: "skin", label: "Skin" },
  { key: "nails", label: "Nails" },
] as const;

export function ServicesExperience({
  services,
  initialCategory = "all",
}: {
  services: ServiceDto[];
  initialCategory?: string;
}) {
  const [category, setCategory] = React.useState<string>(
    CATEGORIES.some((c) => c.key === initialCategory) ? initialCategory : "all",
  );
  const filtered = category === "all" ? services : services.filter((s) => s.category === category);

  return (
    <>
      <section className="pt-40 md:pt-52 pb-20 px-3 md:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div>
            <h1 className="mt-6 font-serif text-6xl md:text-[8rem] leading-[0.92] tracking-tight text-balance">
              Our Signature
              <br />
              <span className="italic text-secondary">Treatments</span>
            </h1>
          </div>
          <div className="mt-10 max-w-xl text-foreground/70 leading-[1.7]">
            Unveil the potential of your beauty through our curated treatments
          </div>
          <div className="mt-16 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                className={cn(
                  "text-[11px] uppercase tracking-editorial rounded-full px-5 py-2.5 border transition",
                  category === c.key
                    ? "bg-foreground text-background border-foreground"
                    : "border-foreground/20 hover:border-foreground/60",
                )}
                onClick={() => setCategory(c.key)}
                aria-pressed={category === c.key}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-28 px-3 md:px-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-px bg-foreground/10 border-y border-foreground/10">
          {filtered.map((s) => (
            <div key={s.slug} className="bg-background">
              <Link
                className="group block p-8 md:p-12 hover:bg-accent/30 transition-colors duration-500 h-full"
                href={`/services/${s.slug}`}
                scroll={false}
              >
                <div className="flex items-start justify-between gap-6 mb-8">
                  <div>
                    <div className="text-[10px] uppercase tracking-editorial text-foreground/50 mb-3">
                      {s.category}
                    </div>
                    <h3 className="font-serif text-3xl md:text-4xl">{s.name}</h3>
                    <div className="italic text-foreground/70 mt-2">{s.tagline}</div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-foreground/40 group-hover:rotate-45 group-hover:text-foreground transition-all duration-500" aria-hidden />
                </div>
                <p className="text-sm text-foreground/70 leading-[1.7] truncate">{s.description}</p>
                <div className="mt-8 pt-6 border-t border-foreground/10 flex items-center justify-between text-[11px] uppercase tracking-editorial text-foreground/60">
                  <span>
                    Starting at <span className="text-foreground">{formatPrice(s.priceCents)}</span>
                  </span>
                  <span>{s.durationMin} min</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
        {/* The reference's bottom CTA (live-measured session 11 — the
            links census found the section carries a SECOND child after the
            grid). The span omits the reference's own trailing-space class
            artifact and its settled transform: none (computed-identical
            to default — the session-10 settled-state rule). */}
        <div className="mt-20 text-center">
          <Link className="inline-block" href="/book" scroll={false}>
            <span className="inline-flex items-center justify-center rounded-full font-sans uppercase tracking-editorial transition-colors duration-500 select-none text-xs px-9 py-4 bg-foreground text-background hover:bg-secondary">
              Book an appointment
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}

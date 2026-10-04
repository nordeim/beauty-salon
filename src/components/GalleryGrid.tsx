"use client";

// Gallery page experience — category pills filter in place (SPA behavior);
// tiles open the fixed z-[70] lightbox with prev/next + keyboard support.
import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryDto } from "@/lib/content";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "color", label: "Color" },
  { key: "cuts", label: "Cuts" },
  { key: "bridal", label: "Bridal" },
  { key: "nails", label: "Nails" },
  { key: "skin", label: "Skin" },
] as const;

export function GalleryExperience({ items }: { items: GalleryDto[] }) {
  const [category, setCategory] = React.useState<string>("all");
  const [lightbox, setLightbox] = React.useState<number | null>(null);

  const filtered = React.useMemo(
    () => (category === "all" ? items : items.filter((i) => i.category === category)),
    [category, items],
  );

  React.useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight")
        setLightbox((i) => (i === null ? null : (i + 1) % filtered.length));
      if (e.key === "ArrowLeft")
        setLightbox((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, filtered.length]);

  const active = lightbox !== null ? filtered[lightbox] : null;

  return (
    <>
      <section className="pt-40 md:pt-52 pb-16 px-3 md:px-6">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="mt-6 font-serif text-6xl md:text-[8.5rem] leading-[0.92] tracking-tight text-balance">
            Transformations
            <br />
            <span className="italic text-secondary">in lived-in light.</span>
          </h1>
          <div className="mt-12 flex flex-wrap gap-2">
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
                onClick={() => {
                  setCategory(c.key);
                  setLightbox(null);
                }}
                aria-pressed={category === c.key}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-28 px-3 md:px-6">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {filtered.map((item, i) => (
            <button
              key={`${item.title}-${i}`}
              type="button"
              className="relative overflow-hidden group aspect-square"
              onClick={() => setLightbox(i)}
              aria-label={`${item.title} — ${item.category}`}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-left">
                <div className="text-[10px] uppercase tracking-editorial text-background/70">
                  {item.category}
                </div>
                <div className="font-serif text-xl mt-1">{item.title}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {active && (
        <div className="fixed inset-0 z-[70] bg-foreground/95 flex items-center justify-center p-6">
          <button
            type="button"
            aria-label="Close"
            className="absolute top-6 right-6 h-10 w-10 rounded-full border border-background/30 flex items-center justify-center text-background"
            onClick={() => setLightbox(null)}
          >
            <X size={16} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Previous"
            className="absolute left-6 md:left-10 h-12 w-12 rounded-full border border-background/30 text-background flex items-center justify-center hover:bg-background hover:text-foreground transition"
            onClick={() =>
              setLightbox(
                (i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length),
              )
            }
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next"
            className="absolute right-6 md:right-10 h-12 w-12 rounded-full border border-background/30 text-background flex items-center justify-center hover:bg-background hover:text-foreground transition"
            onClick={() => setLightbox((i) => (i === null ? null : (i + 1) % filtered.length))}
          >
            <ChevronRight size={20} aria-hidden />
          </button>
          <div className="max-w-[90vw] max-h-[85vh]">
            <img
              src={active.fullImage}
              alt={active.title}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="mt-4 text-background/80 text-center">
              <div className="text-[10px] uppercase tracking-editorial text-background/50 mb-1">
                {active.category}
              </div>
              <div className="font-serif text-2xl">{active.title}</div>
              <div className="text-background/70 text-sm mt-1 max-w-md mx-auto">
                {active.description}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

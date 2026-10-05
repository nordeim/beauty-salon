"use client";

// Testimonial carousel — 4 quotes rotating with a slide-up/out transition,
// 5-star row, uppercase attribution, prev/next + dot controls (active dot
// stretches to w-10). Mirrors the reference's bg-secondary/5 section.
import * as React from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TestimonialDto } from "@/lib/content";

export function TestimonialCarousel({ items }: { items: TestimonialDto[] }) {
  const [index, setIndex] = React.useState(0);
  const [phase, setPhase] = React.useState<"in" | "out">("in");
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = React.useCallback(
    (next: number) => {
      if (next === index) return;
      setPhase("out");
      timer.current = setTimeout(() => {
        setIndex((next + items.length) % items.length);
        setPhase("in");
      }, 350);
    },
    [index, items.length],
  );

  React.useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  if (items.length === 0) return null;
  const active = items[index]!;

  return (
    <div className="max-w-[1200px] mx-auto px-6 md:px-10">
      <div className="text-center" />
      <div className="relative mt-12 min-h-[340px] md:min-h-[280px]">
        <div
          className={cn(
            "text-center max-w-3xl mx-auto transition-all duration-500 ease-out",
            phase === "out" ? "opacity-0 -translate-y-7" : "opacity-100 translate-y-0",
          )}
        >
          <div className="flex justify-center gap-1 mb-8" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-secondary text-secondary" aria-hidden />
            ))}
          </div>
          <blockquote className="font-serif text-3xl md:text-5xl leading-[1.15] text-balance italic">
            &ldquo;{active.quote}&rdquo;
          </blockquote>
          <div className="mt-10 text-[11px] uppercase tracking-editorial text-foreground/60">
            {active.attribution}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-6 mt-12">
        <button
          type="button"
          aria-label="Previous"
          className="h-10 w-10 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-foreground hover:text-background transition"
          onClick={() => goTo(index - 1)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <div className="flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Testimonial ${i + 1}`}
              className={cn(
                "h-1 transition-all duration-500",
                i === index ? "w-10 bg-foreground" : "w-4 bg-foreground/30",
              )}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Next"
          className="h-10 w-10 rounded-full border border-foreground/20 flex items-center justify-center hover:bg-foreground hover:text-background transition"
          onClick={() => goTo(index + 1)}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

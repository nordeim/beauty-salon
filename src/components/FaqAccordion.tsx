"use client";

// The service detail page's "Frequently asked." accordion — mirrors the
// reference's exclusive-open disclosure (live-measured session 7):
// - item 0 is open by default; opening an item closes the others;
//   clicking the open item collapses it
// - collapsed items render NO answer wrapper (the reference unmounts it)
// - the open wrapper settles at height:auto/opacity:1 (inline, like the
//   reference) and enters via the faq-open keyframes (globals.css) — a
//   dependency-free approximation of the reference's ~660ms height 0→auto
//   animation; answers measure <100px so the 320px ceiling never clips
// - the chevron rotates 180° while open (transition-transform duration-500)
import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/lib/content";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  // Index of the open item; -1 = all collapsed. Initial 0 is the
  // reference's default (the first question stands open on load) — a
  // constant initializer, so server and client render identically.
  const [openIndex, setOpenIndex] = React.useState(0);

  if (items.length === 0) return null;

  return (
    <div className="mt-16 divide-y divide-foreground/10 border-y border-foreground/10">
      {items.map((item, i) => {
        const open = i === openIndex;
        return (
          <div className="py-2" key={item.q}>
            <button
              className="w-full flex items-center justify-between gap-6 py-6 text-left"
              onClick={() => setOpenIndex(open ? -1 : i)}
              type="button"
            >
              <span className="font-serif text-2xl md:text-3xl">{item.q}</span>
              <ChevronDown
                aria-hidden
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform duration-500",
                  open && "rotate-180",
                )}
              />
            </button>
            {open && (
              <div
                className="overflow-hidden faq-open"
                style={{ height: "auto", opacity: 1 }}
              >
                <p className="pb-8 text-foreground/75 leading-[1.7] max-w-xl">{item.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

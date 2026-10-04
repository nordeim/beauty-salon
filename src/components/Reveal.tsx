"use client";

// Scroll-reveal wrapper — mirrors the reference's IntersectionObserver
// entrance (opacity/blur/translate → visible). `variant` maps to the
// reference's three translateY distances (24/40/50px).
import * as React from "react";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  variant = "default",
  className,
  delay,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  variant?: "default" | "lg" | "xl";
  className?: string;
  delay?: number;
  as?: "div" | "section" | "span" | "li";
}) {
  const ref = React.useRef<HTMLElement | null>(null);
  // Initial state is ALWAYS false — identical on server and client, so the
  // hydration pass matches (the previous `typeof IntersectionObserver ===
  // "undefined"` initializer evaluated differently per environment and
  // produced an attribute mismatch). No-IO environments reveal via the
  // async fallback below; no-JS users are covered by the <noscript> style
  // override in the root layout.
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      // Async fallback (setState inside a timer callback, not sync in the
      // effect body): environments without IO render the visible state.
      const t = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <Tag
      ref={(el: HTMLElement | null) => {
        ref.current = el;
      }}
      className={cn(
        "reveal-hidden",
        !visible && "reveal-hidden",
        visible && "reveal-visible",
        className,
      )}
      data-variant={variant}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

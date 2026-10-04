"use client";

// "Open today / Closed today" status with the breathing amber dot.
// The day is computed at RENDER time (like the reference SPA, which reads the
// browser clock) — suppressHydrationWarning on the text node absorbs the
// rare server/client timezone boundary mismatch, the same pattern
// next-themes uses.
import { statusForDay } from "@/lib/hours";

export function StatusPill() {
  return (
    <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-editorial text-foreground/70">
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60 breathe" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
      </span>
      <span suppressHydrationWarning>{statusForDay(new Date().getDay())}</span>
    </div>
  );
}

"use client";

// The time-aware status pill with the breathing amber dot (live-measured
// session 20 — docs/remediation-plan-session-20.md F20-A). The reference's
// pill is a FOUR-STATE machine keyed on the day's opening window:
// "Opens today at 10:00" before opening, "Open · closes 19:00" during
// opening hours (the U+00B7 middle dot), "Closed for the day" at/after
// close, "Closed today" on closed days — and it re-evaluates LIVE at
// minute granularity (both boundary flips measured with a stepped virtual
// clock on the reference).
//
// The store pattern (the NotFoundBody precedent — the repo's established
// idiom for "a client value the static shell cannot know"):
//   - the CLIENT snapshot computes the status from the live browser clock
//     (the reference SPA's own stance — its CSR shell carries no pill text
//     at all before JS runs);
//   - the SERVER snapshot is the stable "" constant, so the static shell
//     renders the empty pill text and the hydration render matches it
//     exactly (no mismatch, no suppression needed);
//   - React's post-hydration store check then adopts the client-clock
//     state immediately (the same mechanism that fills the 404's attempted
//     path post-hydration), and the 60-second subscription tick re-reads
//     the snapshot so the boundary flips land within the minute they cross
//     (the reference's measured live granularity).
//
// Client island (the LoginCardBody pattern): the interval is browser-only.
import { useSyncExternalStore } from "react";
import { statusForNow } from "@/lib/hours";

// Plain concatenation, NOT cn(): tailwind-merge's conflict resolution would
// collapse the reference's own redundant "text-background/80
// text-background/70" pair down to its last entry — the pair must survive
// byte-identical (the /80 wins the cascade in both engines).
const PILL_BASE = "inline-flex items-center gap-2 text-[11px] uppercase tracking-editorial";

// The minute-tick store: every 60s React re-reads the client snapshot, so
// a boundary crossing flips the text within the minute (the reference's
// measured granularity — both the open and the close boundary).
function subscribeToMinuteTicks(onStoreChange: () => void) {
  const id = setInterval(onStoreChange, 60_000);
  return () => clearInterval(id);
}

// The CLIENT snapshot: the status for the live browser clock.
const readClientStatus = () => statusForNow(new Date());

// The SERVER snapshot: the stable "" constant — the static shell renders
// the empty pill text (the reference's own pre-JS state carries none), and
// the hydration render matches it exactly.
const readServerStatus = () => "";

export function StatusPill({
  className,
}: {
  /** The text-color variant, REPLACING the default: the header/contact
   * default ("text-foreground/70", ink on cream) or the footer's
   * cream-on-ink pair "text-background/80 text-background/70". The
   * reference's own footer pill carries that redundant pair — its v3
   * engine resolves the /80 winner (computed rgba(250, 248, 245, 0.8));
   * Tailwind v4 emits same-utility opacity modifiers in ascending order, so
   * the replicated pair resolves the same winner (verified against the
   * compiled CSS). Keep the pair byte-identical — do not collapse it. */
  className?: string;
}) {
  const status = useSyncExternalStore(
    subscribeToMinuteTicks,
    readClientStatus,
    readServerStatus,
  );

  return (
    <div className={`${PILL_BASE} ${className ?? "text-foreground/70"}`}>
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60 breathe" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
      </span>
      <span>{status}</span>
    </div>
  );
}

// Opening-hours model — mirrors the reference app's footer + contact hours
// and drives the time-aware status pill. Pure and unit-tested
// (tests/hours.test.ts).

export interface DayHours {
  /** 0 = Sunday … 6 = Saturday */
  day: number;
  label: string;
  /** null = closed */
  open: string | null;
  close: string | null;
}

export const HOURS: readonly DayHours[] = [
  { day: 0, label: "Sunday", open: null, close: null },
  { day: 1, label: "Monday", open: null, close: null },
  { day: 2, label: "Tuesday", open: "10:00", close: "19:00" },
  { day: 3, label: "Wednesday", open: "10:00", close: "19:00" },
  { day: 4, label: "Thursday", open: "10:00", close: "20:00" },
  { day: 5, label: "Friday", open: "10:00", close: "20:00" },
  { day: 6, label: "Saturday", open: "09:00", close: "18:00" },
] as const;

export function hoursForDay(day: number): DayHours {
  return HOURS[Math.min(Math.max(day, 0), 6)]!;
}

export function formatDayHours(d: DayHours): string {
  return d.open && d.close ? `${d.open} – ${d.close}` : "Closed";
}

/** The footer renders "10:00–19:00" (en-dash, no spaces). */
export function formatDayHoursCompact(d: DayHours): string {
  return d.open && d.close ? `${d.open}–${d.close}` : "Closed";
}

/**
 * The pill's time-aware status (live-measured session 20, controlled clock:
 * 22 probes — docs/remediation-plan-session-20.md F20-A). The reference's
 * StatusPill is a four-state machine keyed on the day's opening window:
 *
 *   before open    → "Opens today at {open}"   (the day's own open time)
 *   during open    → "Open · closes {close}"   (U+00B7 middle dot)
 *   at/after close → "Closed for the day"
 *   closed day     → "Closed today"
 *
 * Boundary semantics (live-verified at 10:00 and 19:00): the OPEN minute is
 * inclusive of the during state (t == open → "Open · closes …"); the CLOSE
 * minute is inclusive of the after-close state (t == close → "Closed for
 * the day"). The reference's pill re-evaluates live at minute granularity
 * (both boundary flips measured with a stepped virtual clock) — the
 * StatusPill island's 60s render ticker replicates that stance.
 */
export function statusForNow(now: Date): string {
  const d = hoursForDay(now.getDay());
  if (!d.open || !d.close) return "Closed today";
  const t = now.getHours() * 60 + now.getMinutes();
  const open = hhmmToMinutes(d.open);
  const close = hhmmToMinutes(d.close);
  if (t < open) return `Opens today at ${d.open}`;
  if (t < close) return `Open · closes ${d.close}`;
  return "Closed for the day";
}

function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

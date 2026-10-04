// Opening-hours model — mirrors the reference app's footer + contact hours
// and drives the "Open today / Closed today" status pill. Pure and unit-tested
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

export function statusForDay(day: number): "Open today" | "Closed today" {
  const d = hoursForDay(day);
  return d.open && d.close ? "Open today" : "Closed today";
}

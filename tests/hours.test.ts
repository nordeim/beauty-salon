import { describe, expect, it } from "vitest";
import { HOURS, formatDayHours, formatDayHoursCompact, statusForNow } from "@/lib/hours";

// A Date at a local wall-clock time (the pill reads the LOCAL clock —
// the reference SPA's stance; the e2e specs drive it with page.clock).
const at = (iso: string) => new Date(iso);

describe("hours model", () => {
  it("exposes seven days, Sunday-first", () => {
    expect(HOURS).toHaveLength(7);
    expect(HOURS.map((d) => d.day)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(HOURS[0]?.label).toBe("Sunday");
  });

  it("Sunday and Monday are closed; the rest carry the reference windows", () => {
    expect(HOURS[0]?.open).toBeNull();
    expect(HOURS[1]?.open).toBeNull();
    expect(HOURS[2]).toMatchObject({ open: "10:00", close: "19:00" });
    expect(HOURS[4]).toMatchObject({ open: "10:00", close: "20:00" });
    expect(HOURS[6]).toMatchObject({ open: "09:00", close: "18:00" });
  });

  it("formats the long (contact page) and compact (footer) forms", () => {
    expect(formatDayHours(HOURS[2]!)).toBe("10:00 – 19:00");
    expect(formatDayHours(HOURS[0]!)).toBe("Closed");
    // The footer's en-dash carries NO surrounding spaces.
    expect(formatDayHoursCompact(HOURS[2]!)).toBe("10:00–19:00");
    expect(formatDayHoursCompact(HOURS[4]!)).toBe("10:00–20:00");
  });

  it("derives the time-aware pill status: the four live-measured states (session 20)", () => {
    // The reference's StatusPill is a TIME-AWARE four-state machine
    // (live-measured 2026-10-06 with a controlled clock — see
    // docs/remediation-plan-session-20.md F20-A):
    //   before open  → "Opens today at {open}"  (the day's own open time)
    //   during open  → "Open · closes {close}"  (U+00B7 middle dot)
    //   at/after close → "Closed for the day"
    //   closed day   → "Closed today"
    // Boundary semantics (live-verified at 10:00 and 19:00): the open
    // minute is INCLUSIVE of the during state; the close minute is
    // INCLUSIVE of the after-close state.
    expect(statusForNow(at("2026-10-06T03:00:00"))).toBe("Opens today at 10:00");
    expect(statusForNow(at("2026-10-06T09:59:00"))).toBe("Opens today at 10:00");
    expect(statusForNow(at("2026-10-06T10:00:00"))).toBe("Open · closes 19:00");
    expect(statusForNow(at("2026-10-06T12:00:00"))).toBe("Open · closes 19:00");
    expect(statusForNow(at("2026-10-06T18:59:00"))).toBe("Open · closes 19:00");
    expect(statusForNow(at("2026-10-06T19:00:00"))).toBe("Closed for the day");
    expect(statusForNow(at("2026-10-06T21:00:00"))).toBe("Closed for the day");
    expect(statusForNow(at("2026-10-06T23:59:00"))).toBe("Closed for the day");
  });

  it("the per-day open/close times enter the pill text (Sat 09:00, Thu 20:00 — live-measured)", () => {
    // Saturday opens at 09:00 and closes at 18:00; Thursday closes at 20:00.
    expect(statusForNow(at("2026-10-03T08:00:00"))).toBe("Opens today at 09:00");
    expect(statusForNow(at("2026-10-03T10:00:00"))).toBe("Open · closes 18:00");
    expect(statusForNow(at("2026-10-08T15:00:00"))).toBe("Open · closes 20:00");
    expect(statusForNow(at("2026-10-08T20:30:00"))).toBe("Closed for the day");
  });

  it("closed days render 'Closed today' at any time of day", () => {
    expect(statusForNow(at("2026-10-05T03:00:00"))).toBe("Closed today"); // Monday small hours
    expect(statusForNow(at("2026-10-05T12:00:00"))).toBe("Closed today");
    expect(statusForNow(at("2026-10-05T23:00:00"))).toBe("Closed today");
    expect(statusForNow(at("2026-10-04T12:00:00"))).toBe("Closed today"); // Sunday
  });

  it("the midnight-adjacent early hours are before-open (the day's own window)", () => {
    // Live-measured: Wed 00:30 → "Opens today at 10:00" (the just-started
    // day's window, not the previous day's close).
    expect(statusForNow(at("2026-10-07T00:30:00"))).toBe("Opens today at 10:00");
    expect(statusForNow(at("2026-10-07T00:00:00"))).toBe("Opens today at 10:00");
  });

  it("the during-open separator is the U+00B7 middle dot (the reference's own glyph)", () => {
    const text = statusForNow(at("2026-10-06T12:00:00"));
    expect(text).toContain("\u00b7");
    expect(text.codePointAt(5)).toBe(0x00b7);
  });
});

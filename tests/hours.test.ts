import { describe, expect, it } from "vitest";
import { HOURS, formatDayHours, formatDayHoursCompact, statusForDay } from "@/lib/hours";

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

  it("derives the Open/Closed status per weekday", () => {
    expect(statusForDay(0)).toBe("Closed today");
    expect(statusForDay(1)).toBe("Closed today");
    for (const day of [2, 3, 4, 5, 6]) {
      expect(statusForDay(day)).toBe("Open today");
    }
  });
});

import { describe, expect, it } from "vitest";
import { buildIcs, icsDataUri } from "@/lib/ics";

describe("ICS generation", () => {
  const base = {
    date: "2026-10-21",
    time: "11:30",
    durationMin: 210,
    name: "Test Client",
    service: "balayage",
    uid: "1791152126744",
  };

  it("produces the reference's VCALENDAR envelope", () => {
    const ics = buildIcs(base);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics).toContain("PRODID:-//Maison Luminaire//EN");
    expect(ics.endsWith("END:VEVENT\r\nEND:VCALENDAR")).toBe(true);
  });

  it("carries the booking as UTC stamps with the service duration", () => {
    const ics = buildIcs(base);
    expect(ics).toContain("DTSTART:20261021T113000Z");
    // 210 minutes after 11:30 is 15:00 the same day.
    expect(ics).toContain("DTEND:20261021T150000Z");
  });

  it("rolls over midnight when the duration crosses it", () => {
    const ics = buildIcs({ ...base, time: "23:00", durationMin: 120 });
    expect(ics).toContain("DTSTART:20261021T230000Z");
    expect(ics).toContain("DTEND:20261022T010000Z");
  });

  it("quotes the client name and service in SUMMARY/DESCRIPTION", () => {
    const ics = buildIcs(base);
    expect(ics).toContain("SUMMARY:Maison Luminaire — balayage");
    expect(ics).toContain("DESCRIPTION:Reservation for Test Client. We will confirm within 2 business hours.");
    expect(ics).toContain("UID:1791152126744@maisonluminaire");
  });

  it("escapes the LOCATION commas per RFC 5545", () => {
    const ics = buildIcs(base);
    expect(ics).toContain("LOCATION:24 Rue Lumière\\, Suite 3\\, New York\\, NY 10013");
  });

  it("data-URI encodes for the Add to calendar link", () => {
    const uri = icsDataUri(buildIcs(base));
    expect(uri.startsWith("data:text/calendar;charset=utf-8,BEGIN%3AVCALENDAR")).toBe(true);
    expect(decodeURIComponent(uri.split(",", 2)[1]!)).toContain("END:VCALENDAR");
  });
});

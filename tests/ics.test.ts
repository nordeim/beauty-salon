import { describe, expect, it } from "vitest";
import { buildIcs, icsDataUri } from "@/lib/ics";

// The ICS contract is LIVE-MEASURED (session 8): three reference bookings
// whose advertised service durations are 210 / 60 / 180 minutes all produced
// exactly 90-minute events — the reference emits a FIXED 90-minute block and
// performs NO RFC 5545 comma escaping anywhere (a comma-bearing client name
// and the LOCATION address both pass through raw). The prior suite pinned the
// session-1 assumptions (service-duration DTEND + escaped LOCATION) — the
// session-6 lesson applied: every pinned value is read back against the
// measured contract.
describe("ICS generation", () => {
  const base = {
    date: "2026-10-21",
    time: "11:30",
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

  it("carries the booking as UTC stamps with the FIXED 90-minute block", () => {
    const ics = buildIcs(base);
    expect(ics).toContain("DTSTART:20261021T113000Z");
    // Live-measured: DTEND = DTSTART + 90 minutes regardless of the service's
    // advertised duration (balayage advertises 210 minutes; the reference's
    // download still ends 90 minutes after it starts). 11:30 → 13:00.
    expect(ics).toContain("DTEND:20261021T130000Z");
  });

  it("rolls over midnight under the fixed block", () => {
    const ics = buildIcs({ ...base, time: "23:30" });
    expect(ics).toContain("DTSTART:20261021T233000Z");
    // 23:30 + 90 minutes = 01:00 the next day.
    expect(ics).toContain("DTEND:20261022T010000Z");
  });

  it("rolls over the year boundary under the fixed block", () => {
    // Session-13 hardening pin (the session-12 log's second suggested
    // candidate): 23:30 on Dec 31 + 90 minutes = 01:00 on Jan 1 of the
    // NEXT year — the Date.UTC arithmetic already handles it; this pin
    // makes the contract explicit.
    const ics = buildIcs({ ...base, date: "2026-12-31", time: "23:30" });
    expect(ics).toContain("DTSTART:20261231T233000Z");
    expect(ics).toContain("DTEND:20270101T010000Z");
  });

  it("quotes the client name and service in SUMMARY/DESCRIPTION", () => {
    const ics = buildIcs(base);
    expect(ics).toContain("SUMMARY:Maison Luminaire — balayage");
    expect(ics).toContain(
      "DESCRIPTION:Reservation for Test Client. We will confirm within 2 business hours.",
    );
    expect(ics).toContain("UID:1791152126744@maisonluminaire");
  });

  it("passes a comma-bearing client name through RAW (no RFC 5545 escaping)", () => {
    // Live-measured session 8: a booking as "Anna Marx, Jr." produced
    // "DESCRIPTION:Reservation for Anna Marx, Jr.. We will confirm…" — the
    // reference escapes nothing; byte-parity of the download outranks RFC
    // correctness here (documented divergence).
    const ics = buildIcs({ ...base, name: "Anna Marx, Jr." });
    expect(ics).toContain("DESCRIPTION:Reservation for Anna Marx, Jr.. We will confirm");
    expect(ics).not.toContain("Anna Marx\\,");
  });

  it("carries the LOCATION with RAW commas (the reference escapes nothing)", () => {
    const ics = buildIcs(base);
    expect(ics).toContain("LOCATION:24 Rue Lumière, Suite 3, New York, NY 10013");
    expect(ics).not.toContain("\\,");
  });

  it("data-URI encodes for the Add to calendar link", () => {
    const uri = icsDataUri(buildIcs(base));
    expect(uri.startsWith("data:text/calendar;charset=utf-8,BEGIN%3AVCALENDAR")).toBe(true);
    expect(decodeURIComponent(uri.split(",", 2)[1]!)).toContain("END:VCALENDAR");
  });
});

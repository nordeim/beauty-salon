import { expect, test, type Page } from "@playwright/test";

// Confirmation-fallback parity — the no/partial-params contract for
// /book/confirmation (session 17, F05c). Every prior confirmation census
// (sessions 8/10/14) measured the WITH-params surface — the booking flow's
// happy path. The owner's gap analysis (F05) probed the route the other way
// ("confirmation is reachable without submitting a booking") — and that
// unmeasured edge diverged. Five live probes (agent-browser, logged in,
// 2026-10-06) define the contract this spec pins:
//
//   probe                        | paragraph        | card               | ICS
//   ----------------------------- | ---------------- | ------------------ | ----
//   bare                          | "Thank you."     | ABSENT             | DTSTART=DTSTAMP=now, DTEND=+90min, "— Appointment", "for you."
//   ?name=Test                    | "Thank you, Test." | ABSENT           | now-stamps, "— Appointment", "for Test."
//   ?date=2026-10-21              | "Thank you."     | date line ONLY     | now-stamps (date-only → fallback)
//   ?date=…&time=14:30            | "Thank you."     | date + time lines  | chosen stamps + the 90-min block, "— Appointment", "for you."
//   ?time=14:30                   | "Thank you."     | ABSENT (no date)   | now-stamps (time-only → fallback)
//
// Rules: the paragraph interpolates the first name iff name present; the
// Reserved-for glass card renders iff date present; the time/service lines
// render iff their params present; the ICS uses the chosen stamps iff BOTH
// date AND time present, with the "Appointment"/"you" textual fallbacks.
// The with-params full contract stays pinned by confirmation-parity.spec.ts
// and booking-parity.spec.ts (no duplication). If a change breaks this
// spec, the change is wrong — not the spec.

// The thank-you paragraph — the only <p> on the route carrying the
// concierge copy.
const THANKS = "p.mt-8";

// The glass receipt card (the only .glass element on the route).
const CARD = "div.glass";

function parseIcs(ics: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const line of ics.split("\r\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) fields[line.slice(0, idx)] = line.slice(idx + 1);
  }
  return fields;
}

async function readIcs(page: Page): Promise<Record<string, string>> {
  const href = await page
    .locator("a[href^='data:text/calendar']")
    .first()
    .getAttribute("href");
  expect(href, "the Add-to-calendar link must exist").toBeTruthy();
  const payload = href!.replace(/^data:text\/calendar;charset=utf-8,/, "");
  return parseIcs(decodeURIComponent(payload));
}

function stampMs(stamp: string): number {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(stamp);
  expect(m, `a well-formed UTC stamp, got: ${stamp}`).not.toBeNull();
  return Date.UTC(
    Number(m![1]),
    Number(m![2]) - 1,
    Number(m![3]),
    Number(m![4]),
    Number(m![5]),
    Number(m![6]),
  );
}

function expectNowFallback(ics: Record<string, string>) {
  // Either date or time is missing → the event lands at the generation
  // moment: DTSTART === DTSTAMP and DTEND = DTSTART + the fixed 90-minute
  // block (live-measured: 23:38:29 → 01:08:29 the next day).
  expect(ics["DTSTART"]).toBe(ics["DTSTAMP"]);
  expect(stampMs(ics["DTEND"]!) - stampMs(ics["DTSTART"]!)).toBe(90 * 60_000);
}

test.describe("confirmation-fallback parity (the no/partial-params census)", () => {
  test("CF1: the bare route renders \"Thank you.\", omits the card, and emits a now-stamped fallback ICS", async ({
    page,
  }) => {
    await page.goto("/book/confirmation");

    // The paragraph: "Thank you." — NO comma-period artifact for the
    // missing name (the live's rendering).
    const para = page.locator(THANKS);
    await expect(para).toContainText("Thank you. We've received your request");
    await expect(para).not.toContainText("Thank you, .");

    // The Reserved-for card is ABSENT without a date (the live renders no
    // empty-lines receipt) — but the Add-to-calendar link still exists.
    await expect(page.locator(CARD)).toHaveCount(0);
    await expect(page.locator("a[href^='data:text/calendar']")).toHaveCount(1);

    // The ICS: the now-stamp fallback + the "Appointment"/"you" texts.
    const ics = await readIcs(page);
    expectNowFallback(ics);
    expect(ics["SUMMARY"]).toBe("Maison Luminaire — Appointment");
    expect(ics["DESCRIPTION"]).toBe(
      "Reservation for you. We will confirm within 2 business hours.",
    );
  });

  test("CF2: name-only keeps the named paragraph and ICS description, still no card", async ({
    page,
  }) => {
    await page.goto("/book/confirmation?name=Test");

    await expect(page.locator(THANKS)).toContainText(
      "Thank you, Test. We've received your request",
    );
    await expect(page.locator(CARD)).toHaveCount(0);

    const ics = await readIcs(page);
    expectNowFallback(ics);
    expect(ics["SUMMARY"]).toBe("Maison Luminaire — Appointment");
    expect(ics["DESCRIPTION"]).toBe(
      "Reservation for Test. We will confirm within 2 business hours.",
    );
  });

  test("CF3: date-only renders the card with the date line ONLY; the ICS still falls back to now", async ({
    page,
  }) => {
    await page.goto("/book/confirmation?date=2026-10-21");

    const card = page.locator(CARD);
    await expect(card).toHaveCount(1);
    // innerText applies the label's uppercase transform; the normalized
    // text is exactly label + date — NO time line, NO service line.
    const cardText = (await card.innerText()).replace(/\s+/g, " ").trim();
    expect(cardText).toBe("RESERVED FOR Wednesday, October 21");

    await expect(page.locator(THANKS)).toContainText(
      "Thank you. We've received your request",
    );

    // A date WITHOUT a time still falls back to the now-stamps (the ICS
    // requires both — live-measured).
    const ics = await readIcs(page);
    expectNowFallback(ics);
    expect(ics["SUMMARY"]).toBe("Maison Luminaire — Appointment");
    expect(ics["DESCRIPTION"]).toBe(
      "Reservation for you. We will confirm within 2 business hours.",
    );
  });

  test("CF4: date+time renders both card lines and uses the chosen stamps with the textual fallbacks", async ({
    page,
  }) => {
    await page.goto("/book/confirmation?date=2026-10-21&time=14:30");

    const card = page.locator(CARD);
    await expect(card).toHaveCount(1);
    const cardText = (await card.innerText()).replace(/\s+/g, " ").trim();
    // No service param → NO service line.
    expect(cardText).toBe("RESERVED FOR Wednesday, October 21 14:30");

    await expect(page.locator(THANKS)).toContainText(
      "Thank you. We've received your request",
    );

    // Both present → the chosen stamps carry, with the fixed 90-minute
    // block, and the missing name/service fall back textually.
    const ics = await readIcs(page);
    expect(ics["DTSTART"]).toBe("20261021T143000Z");
    expect(ics["DTEND"]).toBe("20261021T160000Z");
    expect(ics["SUMMARY"]).toBe("Maison Luminaire — Appointment");
    expect(ics["DESCRIPTION"]).toBe(
      "Reservation for you. We will confirm within 2 business hours.",
    );
  });
});

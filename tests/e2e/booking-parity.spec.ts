import { expect, test } from "@playwright/test";

// Booking parity — the live-measured structural contract for the Seamless
// Scheduler form and the confirmation's ICS download (session 8). The values
// below were measured on the reference app with agent-browser (see
// docs/remediation-plan-session-8.md §5). If a styling change breaks this
// spec, the change is wrong — not the spec.
//
// Measured contract:
// - the <form> is a BLOCK-level glass card; its 7 field labels live inside a
//   NESTED div.grid.grid-cols-1.md:grid-cols-2.gap-5; the Notes label is a
//   direct form child with margin-top 20px (mt-5); the button row is a direct
//   form child with margin-top 40px (mt-10)
// - the Notes textarea carries the exact reference placeholder
// - the Add-to-calendar icon is lucide Calendar at 16px (h-4 w-4)
// - the ICS data-URI decodes to DTSTART + 90 minutes with raw-comma LOCATION

test.describe("booking parity (form structure, placeholder, icon, ICS contract)", () => {
  test("the form nests its fields in a grid and keeps Notes + button row outside it", async ({
    page,
  }) => {
    await page.goto("/book");
    await expect(page.getByRole("heading", { name: /Reserve your ritual/ })).toBeVisible();

    const form = page.locator("form");
    await expect(form).toHaveClass(
      /glass border border-foreground\/10 rounded-sm p-6 md:p-12 max-w-3xl mx-auto/,
    );
    // The form itself is NOT the grid (computed display: block).
    expect(await form.evaluate((f) => getComputedStyle(f).display)).toBe("block");

    // The nested grid holds exactly the 7 field labels.
    const grid = form.locator("> div.grid");
    await expect(grid).toHaveClass(/grid grid-cols-1 md:grid-cols-2 gap-5/);
    expect(await grid.locator("> label").count()).toBe(7);

    // The Notes label is a direct form child (not inside the grid) with the
    // reference's 20px top margin.
    const notesLabel = form.locator("> label", { hasText: "Notes" });
    await expect(notesLabel).toHaveClass(/^block mt-5$/);
    expect(await notesLabel.evaluate((l) => getComputedStyle(l).marginTop)).toBe("20px");

    // The button row is a direct form child with the reference's 40px margin.
    const buttonRow = form.locator("> div", {
      has: page.getByRole("button", { name: /Request appointment/ }),
    });
    await expect(buttonRow).toHaveClass(/^mt-10 /);
    expect(await buttonRow.evaluate((d) => getComputedStyle(d).marginTop)).toBe("40px");
  });

  test("the Notes textarea carries the reference's exact placeholder", async ({ page }) => {
    await page.goto("/book");
    const notes = page.getByLabel(/Notes/i);
    await expect(notes).toHaveAttribute(
      "placeholder",
      "Anything we should know — inspiration, allergies, previous treatments...",
    );
    await expect(notes).toHaveAttribute("rows", "4");
  });

  test("the Add to calendar link renders lucide Calendar at 16px", async ({ page }) => {
    await page.goto("/book/confirmation?name=Parity&date=2026-10-15&time=14:30&service=balayage");
    const link = page.getByRole("link", { name: "Add to calendar" });
    await expect(link).toBeVisible();

    const icon = link.locator("svg");
    await expect(icon).toHaveClass(/lucide-calendar( |$)/);
    await expect(icon).not.toHaveClass(/lucide-calendar-plus/);
    await expect(icon).toHaveClass(/h-4 w-4/);
    expect(await icon.evaluate((i) => getComputedStyle(i).width)).toBe("16px");
  });

  test("the ICS decodes to the fixed 90-minute block with raw commas", async ({ page }) => {
    await page.goto("/book/confirmation?name=Parity&date=2026-10-15&time=14:30&service=balayage");
    const link = page.getByRole("link", { name: "Add to calendar" });
    await expect(link).toBeVisible();

    const href = (await link.getAttribute("href")) ?? "";
    expect(href.startsWith("data:text/calendar;charset=utf-8,")).toBe(true);
    const ics = decodeURIComponent(href.split(",").slice(1).join(","));

    // DTSTART = the booking wall-time treated as UTC; DTEND = +90 minutes
    // (the reference's fixed appointment block — live-measured across
    // services whose advertised durations are 210/60/180 minutes; the live
    // booking at 14:30 produced exactly DTEND:20261015T160000Z).
    expect(ics).toContain("DTSTART:20261015T143000Z");
    expect(ics).toContain("DTEND:20261015T160000Z");
    expect(ics).not.toContain("DTEND:20261015T180000Z"); // the service-duration bug

    // The reference performs no RFC 5545 comma escaping anywhere.
    expect(ics).toContain("LOCATION:24 Rue Lumière, Suite 3, New York, NY 10013");
    expect(ics).toContain("SUMMARY:Maison Luminaire — balayage");
    expect(ics).toContain("DESCRIPTION:Reservation for Parity. We will confirm within 2 business hours.");
    expect(ics).not.toContain("\\,");
  });
});

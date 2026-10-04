import { expect, test } from "@playwright/test";

// Booking flow — the Seamless Scheduler end-to-end: preselection deep links,
// validation, submission, and the confirmation page's ICS contract.

test.describe("booking", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/book");
  });

  test("page chrome: back link, logo, headline, policy note", async ({ page }) => {
    await expect(page.getByRole("link", { name: "← Return to site" })).toHaveAttribute("href", "/");
    await expect(page.getByRole("link", { name: "Maison Luminaire", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Reserve your ritual/ })).toBeVisible();
    await expect(page.getByText(/24-hour cancellation policy/i)).toBeVisible();
  });

  test("all eight services and three stylists are offered", async ({ page }) => {
    const service = page.getByLabel(/Service/i);
    const options = service.locator("option");
    await expect(options).toHaveCount(9); // placeholder + 8
    await expect(options.filter({ hasText: "Signature Balayage · $285" })).toHaveCount(1);
    await expect(options.filter({ hasText: "Bridal Atelier · $750" })).toHaveCount(1);

    const stylist = page.getByLabel(/Stylist/i);
    await expect(stylist.locator("option")).toHaveCount(4); // no preference + 3
  });

  test("deep links preselect service and stylist", async ({ page }) => {
    await page.goto("/book?service=hydrafacial&stylist=julian-reyes");
    await expect(page.getByLabel(/Service/i)).toHaveValue("hydrafacial");
    await expect(page.getByLabel(/Stylist/i)).toHaveValue("julian-reyes");
  });

  test("submission persists the appointment and routes to the confirmation", async ({
    page,
  }) => {
    const stamp = Date.now();
    await page.getByLabel(/Full name/i).fill(`E2E Client ${stamp}`);
    await page.getByLabel(/Email/i).fill(`e2e-${stamp}@maisonluminaire.test`);
    await page.getByLabel(/Phone/i).fill("555-010-2030");
    await page.getByLabel(/Stylist/i).selectOption("amelia-voss");
    await page.getByLabel(/Service/i).selectOption("balayage");
    await page.getByLabel(/Preferred date/i).fill("2026-11-18");
    await page.getByLabel(/Preferred time/i).fill("14:30");
    await page.getByLabel(/Notes/i).fill("e2e booking spec");

    await page.getByRole("button", { name: /Request appointment/ }).click();

    await expect(page).toHaveURL(/\/book\/confirmation/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: /begins soon/ })).toBeVisible();
    await expect(page.getByText("Wednesday, November 18")).toBeVisible();
    await expect(page.getByText("14:30").first()).toBeVisible();
    await expect(page.getByText("balayage").first()).toBeVisible();
    await expect(page.getByText(/Thank you, E2E\./i)).toBeVisible();

    // The ICS download link carries the service slug + client name.
    const ics = page.getByRole("link", { name: "Add to calendar" });
    await expect(ics).toHaveAttribute(
      "href",
      /text\/calendar[\s\S]*BEGIN%3AVCALENDAR[\s\S]*balayage/,
    );
    await expect(page.getByRole("link", { name: "Return home" })).toHaveAttribute("href", "/");
    await expect(page.getByText(/24 hours' notice/i)).toBeVisible();
  });

  test("invalid submissions are rejected by the API", async ({ page }) => {
    const failing = page.request.post("/api/appointments", {
      data: { name: "", email: "nope", serviceSlug: "x", date: "bad", time: "99:99" },
    });
    const res = await failing;
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});

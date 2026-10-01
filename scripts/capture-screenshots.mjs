// Regenerate the docs/screenshots set from the DEV server (:3000).
// Mirrors the established 16-shot catalog (01–16).
import { chromium } from "/home/z/my-project/project-management/node_modules/@playwright/test/index.mjs";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "/home/z/my-project/project-management/docs/screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

// Sign in once (fresh server — the in-memory rate limiter is clear).
// Page-based login (the APIRequestContext is flaky under bun): fill the
// form, wait for the workspace, then read the session cookie from the
// context.
const loginCtx = await browser.newContext();
const lp = await loginCtx.newPage();
await lp.goto(BASE + "/login", { waitUntil: "networkidle" });
await lp.fill('input[id="email"]', "demo@orbital.app");
await lp.fill('input[id="password"]', "Demo1234!");
await lp.click('button[type="submit"]');
await lp.waitForURL(BASE + "/", { timeout: 20_000 });
const cookies = await loginCtx.cookies(BASE);
const session = cookies.find((c) => c.name === "orbital_session");
if (!session) throw new Error("no orbital_session cookie after login");
const cookie = `orbital_session=${session.value}`;
console.log("login: ok | cookie:", cookie.slice(0, 24) + "…");
await loginCtx.close();

async function shot(name, viewport, fn) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  await ctx.addCookies([{ name: cookie.split("=")[0], value: cookie.split("=").slice(1).join("="), url: BASE }]);
  const page = await ctx.newPage();
  await page.goto(BASE + fn.path, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);
  if (fn.run) await fn.run(page);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log("captured", name);
  await ctx.close();
}

const desktop = { width: 1440, height: 900 };
const mobile = { width: 390, height: 844 };
const tablet = { width: 768, height: 1024 };

await shot("01-dashboard", desktop, { path: "/" });
await shot("02-goals", desktop, { path: "/goals" });

// goal-detail: navigate into the first seeded goal
await shot("03-goal-detail", desktop, {
  path: "/goals",
  run: async (page) => {
    await page.getByRole("link", { name: /Product Onboarding Redesign/ }).first().click();
    await page.waitForTimeout(1200);
  },
});

// the v2.10 dialog generation — add-task open
await shot("04-task-dialog", desktop, {
  path: "/goals",
  run: async (page) => {
    await page.getByRole("link", { name: /Product Onboarding Redesign/ }).first().click();
    await page.waitForTimeout(900);
    await page.getByRole("button", { name: "Add Task", exact: true }).first().click();
    await page.waitForTimeout(700);
  },
});

await shot("07-my-tasks", desktop, { path: "/my-tasks" });
await shot("08-activity", desktop, { path: "/activity" });
await shot("09-team", desktop, { path: "/team" });
await shot("10-settings", desktop, { path: "/settings" });

await shot("11-mobile-goals", mobile, { path: "/goals" });

// the MORE sheet open (mobile navigation — the operator's focus)
await shot("12-mobile-menu", mobile, {
  path: "/",
  run: async (page) => {
    await page.getByRole("button", { name: "More" }).click();
    await page.waitForTimeout(700);
  },
});

await shot("13-mobile-dashboard", mobile, { path: "/" });

// logged-out login (restructured: 54px inputs, footer inside the form)
const loCtx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const loPage = await loCtx.newPage();
await loPage.goto(BASE + "/login", { waitUntil: "networkidle" });
await loPage.evaluate(() => document.fonts.ready);
await loPage.waitForTimeout(1000);
await loPage.screenshot({ path: `${OUT}/14-login.png` });
console.log("captured 14-login");
await loCtx.close();

await shot("15-tablet-dashboard", tablet, { path: "/" });
await shot("16-tasks", desktop, { path: "/tasks" });

await browser.close();
console.log("done");

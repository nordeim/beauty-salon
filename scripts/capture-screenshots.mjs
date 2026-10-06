// capture-screenshots — the canonical screenshot capture convention.
//
// Session 19's font-rendering census established WHY this script captures
// from the STANDALONE PRODUCTION server rather than the dev server:
//
//   - The dev server's renders are environment-dependent: next/font fetches
//     the Google fonts on demand in dev (the raster state differs per
//     font-download cache state), and the Next dev-tools indicator paints
//     an overlay into dev captures. Session 18 measured THREE distinct
//     deterministic-per-environment renderings (committed set / fresh dev /
//     standalone) of the same pinned computed styles.
//   - The standalone build self-hosts the fonts at BUILD time (baked into
//     .next/static) and paints no dev overlay — the capture is a pure
//     function of the build. The session-19 census verified the
//     byte-determinism empirically: two fresh-context passes over the same
//     build reproduce 14/15 captures byte-identically (the 15th, the
//     contact page, embeds the EXTERNAL Google Maps iframe — the one
//     documented noise class, equally non-deterministic on the live
//     reference), and a full rebuild reproduces the same hashes.
//
// Usage (from the repo root, after `bun run build`):
//   bun scripts/capture-screenshots.mjs [--out <dir>] [--port <port>]
//
// Defaults: --out docs/screenshots  --port 3200
//
// The server is booted through scripts/with-repo-db.ts (the repo .env's
// DATABASE_URL — the documented dev-DB source of truth, seeded by
// `bun run db:seed`), with NODE_ENV=production, and shut down after the
// capture. Every capture runs in a FRESH browser context (1280x900 desktop
// / 390x844 mobile, deviceScaleFactor 1) so no cookie or cache state
// leaks between shots.
import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");

// --- args ---
const argv = process.argv.slice(2);
function argValue(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : undefined;
}
const OUT = argValue("--out") ?? path.join(repoRoot, "docs", "screenshots");
const PORT = argValue("--port") ?? "3200";
const BASE = `http://localhost:${PORT}`;

const DESKTOP = { width: 1280, height: 900 };
const MOBILE = { width: 390, height: 844 };

// The 15 canonical captures (the committed convention: desktop set, the
// mobile trio, the lightbox, the with-params confirmation, the 404).
const SHOTS = [
  { name: "01-landing-desktop", url: "/", viewport: DESKTOP },
  { name: "02-services-desktop", url: "/services", viewport: DESKTOP, scrollBottom: true },
  { name: "03-service-detail-desktop", url: "/services/balayage", viewport: DESKTOP, fullPage: true },
  { name: "04-gallery-desktop", url: "/gallery", viewport: DESKTOP },
  { name: "05-team-desktop", url: "/team", viewport: DESKTOP },
  { name: "06-about-desktop", url: "/about", viewport: DESKTOP },
  { name: "07-contact-desktop", url: "/contact", viewport: DESKTOP, wait: 2500 },
  { name: "08-book-desktop", url: "/book", viewport: DESKTOP },
  { name: "09-login-desktop", url: "/login", viewport: DESKTOP },
  { name: "10-landing-mobile", url: "/", viewport: MOBILE, mobile: true },
  { name: "11-mobile-menu-open", url: "/", viewport: MOBILE, mobile: true, openMenu: true },
  { name: "12-book-mobile", url: "/book", viewport: MOBILE, mobile: true },
  { name: "13-gallery-lightbox", url: "/gallery", viewport: DESKTOP, openLightbox: true },
  {
    name: "14-confirmation-desktop",
    url: "/book/confirmation?name=Test%20Session&date=2026-10-21&time=14%3A30&service=Signature%20Balayage",
    viewport: DESKTOP,
  },
  { name: "15-not-found-desktop", url: "/this-page-does-not-exist", viewport: DESKTOP },
];

function startServer() {
  // detached: true puts the wrapper (and its server grandchild) in a NEW
  // process group so the whole tree can be killed together at shutdown —
  // killing only the wrapper orphans the standalone server on the port.
  const proc = spawn(
    "bun",
    ["scripts/with-repo-db.ts", "bun", ".next/standalone/server.js"],
    {
      cwd: repoRoot,
      env: { ...process.env, PORT, NODE_ENV: "production" },
      stdio: "pipe",
      detached: true,
    },
  );
  proc.stdout.on("data", () => {});
  proc.stderr.on("data", () => {});
  proc.unref();
  return proc;
}

function killTree(proc) {
  if (proc.pid == null) return;
  try {
    process.kill(-proc.pid, "SIGTERM"); // the whole process group
  } catch {
    /* already gone */
  }
  setTimeout(() => {
    try {
      process.kill(-proc.pid, "SIGKILL");
    } catch {
      /* already gone */
    }
  }, 1500);
}

async function waitForServer(timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/api/health`);
      if (res.ok) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function capturePass(browser) {
  mkdirSync(OUT, { recursive: true });
  for (const s of SHOTS) {
    const ctx = await browser.newContext({
      viewport: s.viewport,
      hasTouch: s.mobile === true,
      isMobile: s.mobile === true,
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.goto(BASE + s.url, { waitUntil: "networkidle" });
    await page.waitForTimeout(s.wait ?? 1200);

    if (s.scrollBottom) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(800);
    }
    if (s.openMenu) {
      await page.locator('button[aria-label="Open menu"]').first().click();
      await page.waitForTimeout(700);
    }
    if (s.openLightbox) {
      await page.locator("button.aspect-square").first().click();
      await page.waitForTimeout(900);
    }
    // animations: "disabled" — Playwright fast-forwards FINITE animations
    // (the reveal transitions) to their settled end state and freezes
    // INFINITE ones (the header status-pill's breathing dot) at their
    // deterministic initial phase. Without this, the dot's sampled frame
    // and the reveal-timing edges inject sub-60px noise per capture (the
    // session-19 census measured exactly that on 5 of 15 captures); with
    // it, the capture is a pure function of the build.
    await page.screenshot({
      path: path.join(OUT, `${s.name}.png`),
      fullPage: s.fullPage === true,
      animations: "disabled",
    });
    await ctx.close();
    console.log(`captured ${s.name}`);
  }
}

// --- main ---
const server = startServer();
const up = await waitForServer();
if (!up) {
  console.error(`capture-screenshots: standalone server never became healthy on :${PORT}`);
  console.error("prerequisite: bun run build (creates .next/standalone/server.js)");
  killTree(server);
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
try {
  await capturePass(browser);
  console.log(`ALL ${SHOTS.length} CAPTURED -> ${OUT}`);
} finally {
  await browser.close();
  killTree(server);
}
// Exit explicitly: the server tree's inherited pipes must not keep this
// process's event loop alive after the work is done.
process.exit(0);

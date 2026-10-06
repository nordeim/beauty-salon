// reference-drift-watch — the reference-side drift tripwire (session-21's
// suggested candidate 1, delivered session 22).
//
// Every parity census in this repo's history is a point-in-time measurement
// of the live reference, and the 244-test gate pins the CLONE against
// RECORDED reference values. If the reference's platform changes between
// sessions (a copy edit, a token change, another F20-A-class state-machine
// update), every existing instrument still passes while the clone silently
// diverges from the live app. This watch closes that gap: it walks the
// reference's PUBLIC parity surfaces with the browser clock pinned to the
// census instant (and the timezone pinned to UTC — the pill reads the
// visitor's LOCAL clock, the SP9/SP10 stance, so an unpinned context
// timezone would render a different day's state on a non-UTC machine),
// diffs every probe against the committed census record
// (docs/reference-census.json), and exits non-zero on drift.
//
// Probes (all read-only — GET navigation only, no form POSTs; the
// POST-bearing contracts [login error card, newsletter success, the ICS
// byte format] stay session-census activities):
//   P1  the pill's four-state text on the landing header (CSS-uppercased
//       rendering, matched line-wise) — the time-aware machine at the
//       pinned instant;
//   P2  the landing innerText census after the full-reveal scroll
//       convention (the reference's animation framework hides unrevealed
//       content from innerText — scroll to bottom, settle, back to top,
//       settle — the convention that makes the constant deterministic);
//   P3  the services innerText census + the time-aware formula re-derived
//       (services_base + 2 x len[pill text] — the pill renders twice,
//       header + footer);
//   P4  the mobile drawer's pinned computed styles at 390x844 (bg, z,
//       the 48px Cormorant link set, the nav gap, the CTA margin).
//
// Exit codes (the screenshot-diff convention):
//   0  GREEN — every probe matches the record;
//   1  DRIFT — at least one probe differs (expected/actual printed);
//   2  INSTRUMENT FAILURE — navigation timeout / probe exception ("the
//      probe failed" is not "drift was detected").
//
// This is an AD-HOC NETWORK INSTRUMENT, deliberately NOT part of the
// automated lint/typecheck/unit/build/e2e gate — the gate is hermetic and
// offline by design; this watch needs the live reference and belongs in a
// session census or an operator's periodic check.
//
// Usage (from the repo root):
//   bun scripts/reference-drift-watch.mjs [--record <path>] [--url <base>]
//
// Defaults: --record docs/reference-census.json  --url <the record's url>
// (the --url flag overrides the record's reference_url — e.g. to point at
// a staging copy; the --record flag exists for the RED validation: feed a
// corrupted copy and the watch must trip).
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");

// --- args ---
const argv = process.argv.slice(2);
function argValue(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : undefined;
}
const recordPath = argValue("--record") ?? path.join(repoRoot, "docs", "reference-census.json");

// --- the census record ---
let record;
try {
  record = JSON.parse(readFileSync(recordPath, "utf8"));
} catch (e) {
  console.error(`[reference-drift-watch] cannot read the census record (${recordPath}): ${e.message}`);
  process.exit(2);
}
const BASE = (argValue("--url") ?? record.reference_url ?? "").replace(/\/+$/, "");
if (!BASE) {
  console.error("[reference-drift-watch] no reference URL (record missing reference_url and no --url flag).");
  process.exit(2);
}
const INSTANT = new Date(record.census_instant);
if (Number.isNaN(INSTANT.getTime())) {
  console.error(`[reference-drift-watch] bad census_instant in the record: ${record.census_instant}`);
  process.exit(2);
}
const TZ = record.timezone ?? "UTC";

// The four-state pattern (the header renders it CSS-uppercased; the model
// strings are "Opens today at {open}" / "Open · closes {close}" /
// "Closed for the day" / "Closed today").
const PILL_RE = /^(OPENS TODAY AT |OPEN · CLOSES |CLOSED FOR THE DAY|CLOSED TODAY)/i;

const drift = [];
function report(name, expected, actual) {
  if (String(expected) === String(actual)) {
    console.log(`  PASS  ${name}: ${actual}`);
    return true;
  }
  drift.push(name);
  console.log(`  DRIFT ${name}: expected ${JSON.stringify(String(expected))}, got ${JSON.stringify(String(actual))}`);
  return false;
}

// The full-reveal scroll convention: the reference's animation framework
// keeps unrevealed content out of innerText (a pre-reveal read measures a
// transient deficit — 3 chars observed on the landing, session 22), so
// scroll through the page and let the reveals settle before measuring.
async function revealAndMeasure(page) {
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => setTimeout(r, 2000));
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 500));
  });
  return page.evaluate(() => document.body.innerText.length);
}

async function readPillLine(page) {
  return page.evaluate((re) => {
    const header = document.querySelector("header");
    const lines = (header?.innerText || "").split("\n");
    const line = lines.find((l) => new RegExp(re, "i").test(l.trim()));
    return line ? line.trim() : null;
  }, PILL_RE.source);
}

// Pill-present predicate: the four-state line somewhere in the header's
// innerText (line-wise — the pattern is start-anchored per trimmed line,
// and the header text is multi-line, so a whole-string test never matches).
async function waitForPill(page, timeout = 30000) {
  await page.waitForFunction(
    (re) =>
      (document.querySelector("header")?.innerText || "")
        .split("\n")
        .some((l) => new RegExp(re, "i").test(l.trim())),
    PILL_RE.source,
    { timeout },
  );
}

async function main() {
  console.log(
    `[reference-drift-watch] census ${record.census_instant} (${TZ}) -> ${BASE}\n` +
      `[reference-drift-watch] record ${path.relative(repoRoot, recordPath)} (last verified ${record.last_verified})`,
  );

  const browser = await chromium.launch();
  const context = await browser.newContext({ timezoneId: TZ, viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // --- P1: the pill's four-state text at the pinned instant ---
    await page.clock.install({ time: INSTANT });
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await waitForPill(page);
    const pill = await readPillLine(page);
    if (pill === null) {
      console.error("  FAIL  P1 pill text: the header carries no four-state line after 30s");
      process.exitCode = 2;
    } else {
      report("P1 pill text (header, pinned clock)", record.pill_text_header, pill);
    }

    // --- P2: the landing innerText census (full-reveal convention) ---
    const landingLen = await revealAndMeasure(page);
    report("P2 landing innerText length", record.landing_inner_text_length, landingLen);

    // --- P3: the services innerText census + the formula re-derived ---
    await page.goto(`${BASE}/services`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await waitForPill(page);
    const servicesLen = await revealAndMeasure(page);
    report("P3 services innerText length", record.services_inner_text_length, servicesLen);
    const servicesPill = await readPillLine(page);
    if (servicesPill === null) {
      console.error("  FAIL  P3 formula: the services header carries no four-state line");
      process.exitCode = 2;
    } else {
      const derived = record.services_base + 2 * servicesPill.length;
      report("P3 services formula (base + 2 x len[pill])", record.services_inner_text_length, derived);
    }

    // --- P4: the mobile drawer's pinned computed styles at 390x844 ---
    // (No pill wait here: at 390px the desktop nav that carries the header
    // pill is display:none — innerText excludes it — so the wait target is
    // the drawer toggle itself.)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForSelector('button[aria-label="Open menu"]', { timeout: 30000 });
    await page.click('button[aria-label="Open menu"]', { timeout: 15000 });
    await page.waitForTimeout(800);
    const drawer = await page.evaluate(() => {
      const fixed = Array.from(document.querySelectorAll("div")).filter((d) => {
        const c = getComputedStyle(d);
        return c.position === "fixed" && parseInt(c.zIndex || "0", 10) >= 60 && d.querySelectorAll("a").length >= 5;
      });
      if (fixed.length === 0) return null;
      const top = fixed.sort(
        (a, b) => parseInt(getComputedStyle(b).zIndex, 10) - parseInt(getComputedStyle(a).zIndex, 10),
      )[0];
      const dcs = getComputedStyle(top);
      const link = Array.from(top.querySelectorAll("a")).find((a) => a.textContent.trim() === "Treatments");
      if (!link) return { error: "the drawer carries no 'Treatments' link" };
      const cs = getComputedStyle(link);
      const cta = Array.from(top.querySelectorAll("a,button")).find((el) =>
        /^book an appointment$/i.test(el.textContent.trim()),
      );
      return {
        background_color: dcs.backgroundColor,
        z_index: dcs.zIndex,
        link_font_family: cs.fontFamily.split(",")[0].replace(/"/g, "").trim(),
        link_font_size: cs.fontSize,
        link_line_height: cs.lineHeight,
        link_letter_spacing: cs.letterSpacing,
        link_color: cs.color,
        nav_gap: getComputedStyle(link.parentElement.parentElement).gap,
        cta_margin_top: cta ? getComputedStyle(cta.parentElement).marginTop : null,
      };
    });
    if (drawer === null || drawer.error) {
      console.error(`  FAIL  P4 drawer: ${drawer?.error ?? "no fixed z>=60 overlay with 5+ links found"}`);
      process.exitCode = 2;
    } else {
      const pins = record.drawer;
      for (const key of Object.keys(pins)) {
        report(`P4 drawer ${key.replace(/_/g, " ")}`, pins[key], drawer[key]);
      }
    }
  } catch (e) {
    console.error(`[reference-drift-watch] INSTRUMENT FAILURE — ${e.message?.split("\n")[0] ?? e}`);
    await browser.close();
    process.exit(2);
  }

  await browser.close();

  if (process.exitCode === 2) {
    console.error("\n[reference-drift-watch] the probe itself failed — this is NOT drift evidence.");
    process.exit(2);
  }
  if (drift.length > 0) {
    console.error(`\n[reference-drift-watch] REFERENCE DRIFT DETECTED — ${drift.length} probe(s):`);
    for (const d of drift) console.error(`  - ${d}`);
    console.error(
      "\nIf the reference change is intentional: re-census the changed surface, " +
        "update docs/reference-census.json, review, and commit.",
    );
    process.exit(1);
  }
  console.log("\n[reference-drift-watch] GREEN — the reference matches the census record.");
}

main();

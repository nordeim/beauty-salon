// screenshot-diff — the visual-drift regression gate (session-19's suggested
// candidate 2, delivered session 20).
//
// The session-19 capture census established the byte-determinism signal:
// the canonical set (docs/screenshots/) reproduces 14/15 captures
// hash-identically across fresh-context passes AND full rebuilds when
// captured per the convention (the standalone server + animations:
// "disabled" — scripts/capture-screenshots.mjs). The one exception,
// 07-contact-desktop, embeds the EXTERNAL Google Maps iframe (the
// documented noise class — irreducible on any environment, equally
// non-deterministic on the live reference).
//
// This gate re-runs the canonical capture instrument into a TEMP directory
// and hash-diffs the fresh set against the committed canonical set:
//   - 14/15 files must be byte-identical (07 excluded by design);
//   - any drift fails the gate with the drifted file names.
//
// The tripwire complements the computed-style parity specs: a code change
// that alters pixels (a token edit, a layout shift, a copy change) trips
// this gate even when every computed-style assertion still passes. The
// remediation path for an INTENTIONAL pixel change: re-capture the
// canonical set (`bun scripts/capture-screenshots.mjs`), review the diff,
// and commit the new set.
//
// Usage (from the repo root, after `bun run build`):
//   bun scripts/screenshot-diff.mjs
//
// Environment discipline: the byte-determinism signal is environment-
// scoped (the font raster state is machine-specific) — run this gate on
// the same environment that captured the canonical set.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, statSync } from "node:fs";
import { mkdtempSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = path.resolve(import.meta.dirname, "..");
const canonicalDir = path.join(repoRoot, "docs", "screenshots");

// The one documented noise class: the external Google Maps iframe's tiles
// vary per capture (session 19's census — equally non-deterministic on the
// live reference). Excluded by design; never "fix" by stubbing the map.
const EXCLUDED = new Set(["07-contact-desktop.png"]);

function listPngs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".png"))
    .filter((f) => !EXCLUDED.has(f))
    .sort();
}

async function sha256(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

// 1) Re-run the canonical capture instrument into a temp dir.
const tmpDir = mkdtempSync(path.join(tmpdir(), "ml-screenshot-diff-"));
console.log(`[screenshot-diff] capturing into ${tmpDir} ...`);
const res = spawnSync(
  "bun",
  ["scripts/capture-screenshots.mjs", "--out", tmpDir],
  { cwd: repoRoot, stdio: "inherit" },
);
if (res.status !== 0) {
  rmSync(tmpDir, { recursive: true, force: true });
  console.error("[screenshot-diff] the capture run itself FAILED — see the output above.");
  process.exit(2);
}

// 2) Hash-diff the fresh set against the committed canonical set.
const canonical = listPngs(canonicalDir);
const fresh = listPngs(tmpDir);
const drift = [];
const problems = [];

if (canonical.length === 0) {
  problems.push("the canonical set (docs/screenshots/) is empty or missing");
}
const missingInFresh = canonical.filter((f) => !fresh.includes(f));
const extraInFresh = fresh.filter((f) => !canonical.includes(f));
for (const f of missingInFresh) problems.push(`missing from the fresh capture: ${f}`);
for (const f of extraInFresh) problems.push(`unexpected extra capture: ${f}`);

for (const file of canonical) {
  if (!fresh.includes(file)) continue;
  const a = await sha256(path.join(canonicalDir, file));
  const b = await sha256(path.join(tmpDir, file));
  if (a === b) {
    const kb = Math.round(statSync(path.join(canonicalDir, file)).size / 1024);
    console.log(`  PASS  ${file} (${kb} kB)`);
  } else {
    drift.push(file);
    console.log(`  DRIFT ${file}`);
  }
}
if (EXCLUDED.size) {
  console.log(`  SKIP  ${[...EXCLUDED].join(", ")} (the external-map noise class — excluded by design)`);
}

rmSync(tmpDir, { recursive: true, force: true });

// 3) The verdict.
if (problems.length > 0 || drift.length > 0) {
  console.error("\n[screenshot-diff] VISUAL DRIFT DETECTED — the gate FAILS.");
  for (const p of problems) console.error(`  - ${p}`);
  for (const d of drift) console.error(`  - pixel drift: ${d}`);
  console.error(
    "\nIf the change is intentional: re-capture the canonical set " +
      "(bun scripts/capture-screenshots.mjs), review the diff, and commit the new set.",
  );
  process.exit(1);
}
console.log(
  `\n[screenshot-diff] GREEN — ${canonical.length} captures byte-identical ` +
    `(${EXCLUDED.size} excluded as the documented noise class).`,
);

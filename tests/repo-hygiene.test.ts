import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// The repo-hygiene contract (docs/remediation-plan-session-4.md):
// the session-1 rebuild replaced the scaffold app wholesale, but 14
// pre-clone utility scripts survived in scripts/ — ten of them dereference
// the retired Prisma models (Goal/Task/ActivityLog) and would crash against
// the current schema. These specs pin the cleanup so scaffold relics cannot
// creep back: (1) no live code may reference the retired models,
// (2) every script path referenced by the docs must exist, and
// (3) every script referenced by package.json must exist.
// The skills/ folder is out of scope by instruction (excluded from code
// checking) — the scans root at the code directories only.

const repoRoot = path.resolve(__dirname, "..");

const CODE_SCAN_DIRS = ["scripts", "src", "prisma", "tests"] as const;

// Old-model delegate accessors — a Prisma client delegate call on one of the
// retired scaffold models (Goal, Task, ActivityLog), e.g. a `.count()` or
// `.findMany()` on those delegates via any common client variable name. The
// current schema has no such models, so any match is a relic of the
// pre-clone scaffold.
const RETIRED_MODEL_ACCESSOR =
  /\b(?:prisma|db|p)\s*\.\s*(?:goal|task|activityLog)\b/i;

function listFilesRecursive(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFilesRecursive(full, exts));
    } else if (exts.includes(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function scanCodeForRetiredModels(): string[] {
  const offenders: string[] = [];
  for (const dir of CODE_SCAN_DIRS) {
    const root = path.join(repoRoot, dir);
    const files = listFilesRecursive(root, [
      ".ts",
      ".tsx",
      ".mjs",
      ".js",
      ".cjs",
    ]);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      if (RETIRED_MODEL_ACCESSOR.test(text)) offenders.push(file);
    }
  }
  return offenders.map((f) => path.relative(repoRoot, f));
}

function docReferencedScripts(): Array<{ doc: string; script: string }> {
  const docsDir = path.join(repoRoot, "docs");
  const refs: Array<{ doc: string; script: string }> = [];
  // Operational docs must reference only scripts that exist. Historical
  // audit records (session logs, remediation plans) legitimately name the
  // artifacts they removed, so they are out of scope by convention.
  const HISTORICAL = /^(session_|remediation-plan-)/;
  for (const doc of readdirSync(docsDir)) {
    if (!doc.endsWith(".md") || HISTORICAL.test(doc)) continue;
    const text = readFileSync(path.join(docsDir, doc), "utf8");
    for (const match of text.matchAll(/\.?\.?\/?scripts\/([\w./-]+\.[\w]+)/g)) {
      refs.push({ doc: `docs/${doc}`, script: match[1] });
    }
  }
  return refs;
}

function packageReferencedScripts(): string[] {
  const pkg = JSON.parse(
    readFileSync(path.join(repoRoot, "package.json"), "utf8"),
  ) as { scripts: Record<string, string> };
  const refs = new Set<string>();
  for (const body of Object.values(pkg.scripts ?? {})) {
    for (const match of body.matchAll(/scripts\/([\w./-]+\.[\w]+)/g)) {
      refs.add(match[1]);
    }
  }
  return [...refs];
}

// Tracked-files secret scan (session-13 F1): a real AUTH_SECRET value must
// never live in a tracked file. The pattern requires a QUOTED value of at
// least 32 hex chars — `.env.example`'s documented empty default
// (`AUTH_SECRET=""`) and prose mentions of the variable NAME stay legal;
// only actual key material trips it. The scan runs over `git ls-files`
// output (tracked files only — the local `.env` is git-ignored and out of
// scope by design), excluding the binary-ish and lock file families where
// hex blobs are expected (images, lockfile integrity hashes).
const LIVE_AUTH_SECRET = /AUTH_SECRET\s*=\s*["'][0-9a-fA-F]{32,}["']/;

function gitTrackedTextFiles(): string[] {
  const listed = execSync("git ls-files", { cwd: repoRoot, encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    // binary + lockfile + font families: not prose, hex blobs expected
    .filter((f) => !/\.(png|jpg|jpeg|gif|webp|ico|svg|woff2?|ttf|otf|db|tgz|lock)$/.test(f));
  return listed;
}

describe("repo hygiene — scaffold relics", () => {
  it("live code never references the retired scaffold models", () => {
    const offenders = scanCodeForRetiredModels();
    expect(offenders).toEqual([]);
  });

  it("every script path referenced by the docs exists", () => {
    const refs = docReferencedScripts();
    // Vacuously green when the operational docs reference no script paths —
    // the guard exists to catch FUTURE stale references (a doc naming a
    // script that is absent from scripts/).
    const missing = refs.filter(
      (r) => !existsSync(path.join(repoRoot, "scripts", r.script)),
    );
    expect(missing).toEqual([]);
  });

  it("every script referenced by package.json exists", () => {
    const refs = packageReferencedScripts();
    expect(refs.length).toBeGreaterThan(0);
    const missing = refs.filter(
      (r) => !existsSync(path.join(repoRoot, "scripts", r)),
    );
    expect(missing).toEqual([]);
  });
});

describe("repo hygiene — secrets", () => {
  it("no tracked file carries a live AUTH_SECRET value", () => {
    const offenders: string[] = [];
    for (const file of gitTrackedTextFiles()) {
      const full = path.join(repoRoot, file);
      if (!existsSync(full)) continue;
      const text = readFileSync(full, "utf8");
      if (LIVE_AUTH_SECRET.test(text)) offenders.push(file);
    }
    expect(offenders).toEqual([]);
  });
});

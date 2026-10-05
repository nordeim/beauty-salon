import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { devDatabaseUrl, parseDotenvValue, resolveDatabaseUrl, standaloneRepoRoot } from "@/lib/db-path";

// The db-path contract (docs/parity-remediation-v2.3.md WS-1):
// a RELATIVE `file:` URL resolves against the first "anchor" directory that
// contains prisma/schema.prisma — exactly like the Prisma CLI resolves
// against the schema file — so `file:../db/custom.db` points at
// <anchor>/db/custom.db regardless of the process working directory.
// Absolute file: URLs (POSIX + Windows drive letters) and non-SQLite URLs
// pass through untouched; a missing/blank env value falls back to the
// documented default <anchor>/db/custom.db.

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

describe("resolveDatabaseUrl", () => {
  let repo: string;
  let other: string;

  beforeAll(() => {
    // A fake repo layout: <repo>/prisma/schema.prisma + <repo>/db/
    repo = mkdtempSync(path.join(tmpdir(), "dbpath-repo-"));
    mkdirSync(path.join(repo, "prisma"));
    writeFileSync(path.join(repo, "prisma", "schema.prisma"), "datasource db { provider = \"sqlite\" }");
    mkdirSync(path.join(repo, "db"));
    // A directory with no schema (e.g. a random CWD).
    other = mkdtempSync(path.join(tmpdir(), "dbpath-other-"));
  });

  afterAll(() => {
    rmSync(repo, { recursive: true, force: true });
    rmSync(other, { recursive: true, force: true });
  });

  it("resolves a relative file: URL against the schema anchor's prisma/ dir", () => {
    const out = resolveDatabaseUrl("file:../db/custom.db", [repo]);
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "db", "custom.db"))}`);
  });

  it("picks the FIRST anchor that contains prisma/schema.prisma", () => {
    const out = resolveDatabaseUrl("file:../db/custom.db", [other, repo]);
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "db", "custom.db"))}`);
  });

  it("falls back to the last anchor when no anchor carries a schema", () => {
    const out = resolveDatabaseUrl("file:../db/custom.db", [other]);
    // Behaves like today's CWD rule: resolve against <anchor>/prisma.
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(other, "prisma", "..", "db", "custom.db"))}`);
  });

  it("defaults to <anchor>/db/custom.db when the env value is missing", () => {
    const out = resolveDatabaseUrl(undefined, [repo]);
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "db", "custom.db"))}`);
  });

  it("defaults to <anchor>/db/custom.db when the env value is blank/whitespace", () => {
    expect(toPosix(resolveDatabaseUrl("   ", [repo]))).toBe(
      `file:${toPosix(path.join(repo, "db", "custom.db"))}`,
    );
  });

  it("passes absolute POSIX file: URLs through untouched", () => {
    expect(resolveDatabaseUrl("file:/var/data/prod.db", [repo])).toBe("file:/var/data/prod.db");
  });

  it("passes absolute Windows drive-letter file: URLs through untouched", () => {
    expect(resolveDatabaseUrl("file:C:\\data\\prod.db", [repo])).toBe("file:C:\\data\\prod.db");
  });

  it("passes non-SQLite URLs through untouched", () => {
    const pg = "postgresql://user:pass@localhost:5432/app";
    expect(resolveDatabaseUrl(pg, [repo])).toBe(pg);
  });

  it("trims surrounding whitespace from the env value", () => {
    const out = resolveDatabaseUrl("  file:../db/custom.db  ", [repo]);
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "db", "custom.db"))}`);
  });

  it("treats file:./dev.db as relative to the schema anchor's prisma/ dir", () => {
    const out = resolveDatabaseUrl("file:./dev.db", [repo]);
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "prisma", "dev.db"))}`);
  });
});

describe("standaloneRepoRoot (the Next standalone chdir trap)", () => {
  // The standalone server.js runs process.chdir(__dirname) into
  // <repo>/.next/standalone before any module executes, and the tracer
  // copies prisma/schema.prisma into that folder — the plain CWD rule would
  // resolve against the BUILD OUTPUT. The detector must recognize that
  // folder and return the real repo two levels up.
  let repo: string;
  let standalone: string;
  let deployed: string;

  beforeAll(() => {
    repo = mkdtempSync(path.join(tmpdir(), "dbpath-std-repo-"));
    mkdirSync(path.join(repo, "prisma"));
    writeFileSync(path.join(repo, "prisma", "schema.prisma"), "// x");
    standalone = path.join(repo, ".next", "standalone");
    mkdirSync(standalone, { recursive: true });
    writeFileSync(path.join(standalone, "server.js"), "// next standalone");
    mkdirSync(path.join(standalone, "prisma"));
    writeFileSync(path.join(standalone, "prisma", "schema.prisma"), "// traced copy");
    // A standalone copy deployed elsewhere: no repo above it.
    deployed = mkdtempSync(path.join(tmpdir(), "dbpath-deployed-"));
    mkdirSync(path.join(deployed, ".next", "standalone"), { recursive: true });
  });

  afterAll(() => {
    rmSync(repo, { recursive: true, force: true });
    rmSync(deployed, { recursive: true, force: true });
  });

  it("recognizes the in-repo standalone dir and returns the repo root", () => {
    expect(standaloneRepoRoot(standalone)).toBe(repo);
  });

  it("ignores a standalone dir with no repo above it (deployed copy)", () => {
    expect(standaloneRepoRoot(path.join(deployed, ".next", "standalone"))).toBeNull();
  });

  it("ignores plain directories that merely contain prisma/schema.prisma", () => {
    expect(standaloneRepoRoot(repo)).toBeNull();
    expect(standaloneRepoRoot("/tmp")).toBeNull();
  });

  it("resolution prefers the repo anchor over the standalone cwd copy", () => {
    // In the standalone context candidateRoots() yields the chunk-derived
    // anchor (no schema — skipped), then the detector's REPO root, then the
    // chdir'd standalone CWD. A relative URL resolved with the standalone
    // CWD would land in <standalone>/db (no such dir → SQLite error 14);
    // with this order it must land in <repo>/db.
    const out = resolveDatabaseUrl("file:../db/custom.db", [repo, standalone]);
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "db", "custom.db"))}`);
  });
});

describe("anchor validation", () => {
  it("the repo anchor layout used by the tests actually exists", () => {
    // Sanity for the fixture itself — guards against a broken test setup
    // silently testing the fallback path instead.
    const repo = mkdtempSync(path.join(tmpdir(), "dbpath-check-"));
    try {
      mkdirSync(path.join(repo, "prisma"));
      writeFileSync(path.join(repo, "prisma", "schema.prisma"), "// x");
      expect(existsSync(path.join(repo, "prisma", "schema.prisma"))).toBe(true);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});

// The dev-time resolution contract (docs/remediation-plan-session-2.md F1):
// sandboxed/managed environments may export an ambient DATABASE_URL whose
// absolute path points OUTSIDE the repo (platform noise). For the wrapped
// dev scripts the repo's own .env file is the source of truth, so its
// DATABASE_URL wins over the ambient process env; the winner then flows
// through the standard anchor resolution. The app runtime
// (resolveProcessDatabaseUrl) is NOT affected — production keeps the
// 12-factor env-var precedence.

describe("parseDotenvValue", () => {
  it("reads a plain unquoted value", () => {
    const content = ["# comment", 'DATABASE_URL=file:../db/custom.db', "OTHER=1"].join("\n");
    expect(parseDotenvValue(content, "DATABASE_URL")).toBe("file:../db/custom.db");
  });

  it("strips surrounding double quotes", () => {
    const content = 'DATABASE_URL="file:../db/custom.db"';
    expect(parseDotenvValue(content, "DATABASE_URL")).toBe("file:../db/custom.db");
  });

  it("strips surrounding single quotes", () => {
    const content = "DATABASE_URL='file:../db/custom.db'";
    expect(parseDotenvValue(content, "DATABASE_URL")).toBe("file:../db/custom.db");
  });

  it("ignores commented-out lines", () => {
    const content = ["# DATABASE_URL=file:../db/old.db", "DATABASE_URL=file:../db/new.db"].join("\n");
    expect(parseDotenvValue(content, "DATABASE_URL")).toBe("file:../db/new.db");
  });

  it("ignores keys where the name only shares a prefix", () => {
    const content = "DATABASE_URL_LEGACY=file:../db/legacy.db\nDATABASE_URL=file:../db/real.db";
    expect(parseDotenvValue(content, "DATABASE_URL")).toBe("file:../db/real.db");
  });

  it("returns undefined when the key is absent", () => {
    expect(parseDotenvValue("AUTH_SECRET=abc\n", "DATABASE_URL")).toBeUndefined();
  });

  it("returns undefined for empty content", () => {
    expect(parseDotenvValue("", "DATABASE_URL")).toBeUndefined();
  });

  it("trims whitespace around the value", () => {
    const content = "DATABASE_URL =  file:../db/custom.db  ";
    expect(parseDotenvValue(content, "DATABASE_URL")).toBe("file:../db/custom.db");
  });
});

describe("devDatabaseUrl (env-file-first precedence for dev scripts)", () => {
  let repo: string;

  beforeAll(() => {
    repo = mkdtempSync(path.join(tmpdir(), "dbpath-dev-repo-"));
    mkdirSync(path.join(repo, "prisma"));
    writeFileSync(path.join(repo, "prisma", "schema.prisma"), "// x");
  });

  afterAll(() => {
    rmSync(repo, { recursive: true, force: true });
  });

  it("the .env file value wins over an ambient absolute process URL (F1)", () => {
    // The platform-ambient case: .env says file:../db/custom.db, the process
    // env carries an absolute URL pointing outside the repo. The dev flows
    // must land INSIDE the repo.
    const out = devDatabaseUrl({
      envFileUrl: "file:../db/custom.db",
      processUrl: "file:/home/z/my-project/db/custom.db",
      anchors: [repo],
    });
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "db", "custom.db"))}`);
  });

  it("falls back to the process env when .env defines no DATABASE_URL", () => {
    const out = devDatabaseUrl({
      envFileUrl: undefined,
      processUrl: "file:../db/e2e.db",
      anchors: [repo],
    });
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "db", "e2e.db"))}`);
  });

  it("passes an absolute .env value through untouched (documented prod-style config)", () => {
    const out = devDatabaseUrl({
      envFileUrl: "file:/var/data/custom.db",
      processUrl: "file:/home/z/my-project/db/custom.db",
      anchors: [repo],
    });
    expect(out).toBe("file:/var/data/custom.db");
  });

  it("passes a postgres .env value through untouched (the swap story)", () => {
    const pg = "postgresql://user:pass@localhost:5432/app";
    const out = devDatabaseUrl({ envFileUrl: pg, processUrl: undefined, anchors: [repo] });
    expect(out).toBe(pg);
  });

  it("defaults to <repo>/db/custom.db when neither .env nor process env defines it", () => {
    const out = devDatabaseUrl({ envFileUrl: undefined, processUrl: undefined, anchors: [repo] });
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "db", "custom.db"))}`);
  });

  it("treats a blank .env value as absent (process env fallback)", () => {
    const out = devDatabaseUrl({ envFileUrl: "  ", processUrl: "file:../db/e2e.db", anchors: [repo] });
    expect(toPosix(out)).toBe(`file:${toPosix(path.join(repo, "db", "e2e.db"))}`);
  });
});

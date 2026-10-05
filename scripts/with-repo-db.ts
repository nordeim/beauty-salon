// with-repo-db — dev-time DATABASE_URL pinner (remediation-plan-session-2.md F1).
//
// Usage (from package.json scripts):
//   bun scripts/with-repo-db.ts <command> [args...]
//
// Why this exists: sandboxed/managed environments may export an ambient
// DATABASE_URL whose absolute path points OUTSIDE the repo. Process env
// beats .env files under the standard dotenv precedence, so dev flows
// (next dev / next build SSG / prisma db push / seed) would silently use a
// database outside the repository. This wrapper resolves the URL from the
// repo's OWN .env file first (the documented source of truth for local
// development), falls back to the process environment when the file defines
// no DATABASE_URL, and spawns the wrapped command with the resolved URL set
// EXPLICITLY in its environment — the same explicit-env pattern the e2e
// suite (playwright.config.ts webServer + global-setup.ts) has used all
// along.
//
// Scope: dev-time scripts only. The standalone production runtime keeps the
// 12-factor contract (src/lib/db.ts → resolveProcessDatabaseUrl); when no
// .env ships with a deployment this wrapper is a transparent passthrough.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { devDatabaseUrl, parseDotenvValue } from "../src/lib/db-path";

function main(): number {
  const command = process.argv.slice(2);
  if (command.length === 0) {
    console.error("usage: bun scripts/with-repo-db.ts <command> [args...]");
    return 1;
  }

  // The repo root is this script's parent directory (scripts/ → ..).
  const repoRoot = path.resolve(import.meta.dirname, "..");
  const envPath = path.join(repoRoot, ".env");
  const envFileUrl = existsSync(envPath)
    ? parseDotenvValue(readFileSync(envPath, "utf8"), "DATABASE_URL")
    : undefined;

  const resolved = devDatabaseUrl({
    envFileUrl,
    processUrl: process.env.DATABASE_URL,
    // Anchors mirror candidateRoots()'s intent for the dev context: the
    // repo first (this script's home), then the CWD as the compatibility
    // fallback — identical to resolveDatabaseUrl's existing rule.
    anchors: [repoRoot, process.cwd()],
  });

  const env = { ...process.env, DATABASE_URL: resolved };
  const result = spawnSync(command[0], command.slice(1), {
    env,
    stdio: "inherit",
  });
  if (result.error) {
    console.error(`with-repo-db: failed to spawn ${command[0]}: ${result.error.message}`);
    return 1;
  }
  return result.status ?? 1;
}

process.exit(main());

// Canonical origin resolution (docs/remediation-plan-session-4.md F2).
//
// NEXT_PUBLIC_SITE_URL is the documented canonical origin (.env.example,
// README, CLAUDE, docs/DEPLOYMENT.md §3); it resolves the root layout's
// `metadataBase` so metadata URLs (canonical, open-graph) are absolute.
// The helper NEVER throws: an unset/blank/malformed/non-absolute value
// falls back to the documented localhost default — a bad env var cannot
// be allowed to 500 the app at build or boot time.

const DEFAULT_SITE_URL = "http://localhost:3000";

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  try {
    const parsed = new URL(raw);
    // Only absolute origins are meaningful for metadataBase — a bare host
    // (no scheme) or a path-only value is rejected by the default.
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return DEFAULT_SITE_URL;
    }
    return parsed.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

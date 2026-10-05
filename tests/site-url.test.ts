import { afterEach, describe, expect, it } from "vitest";
import { siteUrl } from "@/lib/site";

// The canonical-origin contract (docs/remediation-plan-session-4.md F2):
// NEXT_PUBLIC_SITE_URL is documented in .env.example/README/CLAUDE/
// DEPLOYMENT.md as the app's canonical origin — it resolves the root
// layout's `metadataBase`. The helper must (a) fall back to the documented
// localhost default when unset/blank, (b) pass through well-formed absolute
// URLs, and (c) NEVER throw on malformed input (a bad env value cannot be
// allowed to 500 the app at build/boot time).

const DEFAULT = "http://localhost:3000";
const KEY = "NEXT_PUBLIC_SITE_URL";

afterEach(() => {
  delete process.env[KEY];
});

describe("siteUrl", () => {
  it("returns the localhost default when the env var is unset", () => {
    delete process.env[KEY];
    expect(siteUrl()).toBe(DEFAULT);
  });

  it("returns the localhost default when the env var is blank/whitespace", () => {
    process.env[KEY] = "   ";
    expect(siteUrl()).toBe(DEFAULT);
  });

  it("passes through a well-formed absolute URL", () => {
    process.env[KEY] = "https://maison-luminaire.example.com";
    expect(siteUrl()).toBe("https://maison-luminaire.example.com");
  });

  it("falls back to the default on a malformed URL instead of throwing", () => {
    process.env[KEY] = "not a url";
    expect(siteUrl()).toBe(DEFAULT);
  });

  it("falls back to the default on a non-absolute URL", () => {
    process.env[KEY] = "maison-luminaire.example.com";
    expect(siteUrl()).toBe(DEFAULT);
  });
});

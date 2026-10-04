import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Pin file tracing to this project so the standalone server always lands
  // at .next/standalone/server.js — even when the repo is cloned inside a
  // parent workspace that has its own lockfile.
  outputFileTracingRoot: path.join(import.meta.dirname, "."),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Next 16's dev-origin protection silently blocks dev chunks for the
  // 127.0.0.1 origin (symptom: unhydrated pages + native form GET fallbacks).
  // Both loopback origins must be allowed — see
  // docs/Tailwind-V4-Validation-Report.md §Appendix methodology (c).
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;

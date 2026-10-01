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
  // Path-based SPA routing: the reference app's views live at real paths
  // (/goals, /goals/<id>, /my-tasks, /activity, /team, /settings). We keep
  // ONE page (src/app/page.tsx) and rewrite those paths onto it; the client
  // store syncs view state with location.pathname (see src/lib/router.ts).
  async rewrites() {
    return [
      { source: "/goals", destination: "/" },
      { source: "/goals/:goalId", destination: "/" },
      { source: "/my-tasks", destination: "/" },
      { source: "/tasks", destination: "/" },
      { source: "/activity", destination: "/" },
      { source: "/team", destination: "/" },
      { source: "/settings", destination: "/" },
    ];
  },
};

export default nextConfig;

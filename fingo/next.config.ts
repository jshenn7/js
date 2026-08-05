import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Cloudflare quick tunnels (and similar) to load Next.js resources in dev.
  allowedDevOrigins: ["*.trycloudflare.com", "*.loca.lt"],
  // Native module — must not be bundled by webpack/turbopack.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Guides merged into Inspiration (2026-08-17) — keep old URLs alive. */
  redirects: async () => [
    { source: "/guides", destination: "/inspiration", permanent: true },
    { source: "/guides/:slug", destination: "/inspiration/:slug", permanent: true },
  ],
};

export default nextConfig;

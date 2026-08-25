import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Guides merged into Inspiration (2026-08-17) — keep old URLs alive. */
  redirects: async () => [
    { source: "/guides", destination: "/inspiration", permanent: true },
    { source: "/guides/:slug", destination: "/inspiration/:slug", permanent: true },

    /* The project's auto-assigned Vercel alias cannot be deleted, so it is
       sent to the canonical host instead. Matched by exact hostname: preview
       deployments live on ai-ui-resources-git-*.vercel.app and must keep
       serving themselves. */
    {
      source: "/:path*",
      has: [{ type: "host", value: "ai-ui-resources.vercel.app" }],
      destination: "https://scrimui.dev/:path*",
      permanent: true,
    },
  ],
};

export default nextConfig;

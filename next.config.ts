import type { NextConfig } from "next";

const SHOWCASE = ["src/showcase/**/*.tsx"];

/* Spelled out per directory rather than `templates/**`: that glob would also
   drag each template's node_modules into the deployed bundle. */
const TEMPLATE_FILES = [
  "templates/*/*.{ts,tsx,json,mjs,md}",
  "templates/*/.env.example",
  /* Dotfiles need naming individually — the brace glob above only matches
     files with one of those extensions, so .gitignore was listed on the
     template page and then missing from the zip the buyer downloaded. Only
     in production, because dev reads straight off the disk. */
  "templates/*/.gitignore",
  "templates/*/app/**/*.{ts,tsx,css}",
  "templates/*/components/**/*.tsx",
  "templates/*/lib/**/*.ts",
];

const nextConfig: NextConfig = {
  /* Both of these read component source with fs at REQUEST time, and Next's
     tracer cannot see through a dynamic path — without this the files are
     absent from the deployed bundle and every Pro unlock 500s in production
     while working perfectly in dev. (/r/[name] is exempt: it is prerendered,
     so its reads happen at build time.) */
  outputFileTracingIncludes: {
    "/api/pro/source": SHOWCASE,
    "/r/pro/[name]": [...SHOWCASE, ...TEMPLATE_FILES],
    "/api/pro/template": TEMPLATE_FILES,
    "/templates/[slug]": TEMPLATE_FILES,
  },

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

/**
 * The one place the site's own origin is written down.
 *
 * It used to be three: metadataBase in the root layout, BASE_URL in
 * sitemap.ts, and a hardcoded string in robots.ts. A sitemap that advertises
 * a different host than the canonical URLs is worse than no sitemap, and
 * three copies is how that happens.
 *
 * Overridable by env so previews and forks can point every absolute URL at
 * their own host without a code change. Vercel exposes the deployment host
 * as VERCEL_PROJECT_PRODUCTION_URL; set NEXT_PUBLIC_SITE_URL to that.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://scrimui.dev").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "Scrim UI";

/**
 * The public repository. Linked from the header and from the "report a
 * problem" affordance on icon pages, so it lives next to the origin rather
 * than being spelled out at each call site.
 */
export const SITE_REPO = "https://github.com/jackyrwj/scrim-ui";

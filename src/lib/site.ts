/**
 * The one place the site's own origin is written down.
 *
 * It used to be three: metadataBase in the root layout, BASE_URL in
 * sitemap.ts, and a hardcoded string in robots.ts. A sitemap that advertises
 * a different host than the canonical URLs is worse than no sitemap, and
 * three copies is how that happens.
 *
 * Overridable by env so the value can change without a deploy of new code —
 * which matters here, because the domain in the default is not registered
 * yet. Vercel exposes the deployment host as VERCEL_PROJECT_PRODUCTION_URL;
 * set NEXT_PUBLIC_SITE_URL to that (or to anything else) to point every
 * absolute URL somewhere else.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://scrimui.dev").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "Scrim UI";

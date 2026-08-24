import fs from "node:fs";
import path from "node:path";

/**
 * Which resources have a captured homepage screenshot in `public/previews/`.
 *
 * Captures come from `scripts/capture-previews.mjs` and are committed, so this
 * is a directory read rather than a fetch — the resource detail pages are all
 * statically generated. A resource whose capture failed (site down, bot wall)
 * simply has no file, and the page renders a placeholder instead of a broken
 * image.
 *
 * Read once per build in production, but re-read every call in development:
 * capturing previews while `next dev` is running is the normal workflow, and a
 * cached listing from process start would report every new file as missing.
 *
 * Server-only: `node:fs` cannot be imported into a client component.
 */
const previewDir = path.join(process.cwd(), "public", "previews");

function readCaptured(): ReadonlySet<string> {
  if (!fs.existsSync(previewDir)) return new Set();
  return new Set(
    fs
      .readdirSync(previewDir)
      .filter((file) => file.endsWith(".webp"))
      .map((file) => file.replace(/\.webp$/, "")),
  );
}

const cached = process.env.NODE_ENV === "production" ? readCaptured() : null;

export function previewPath(slug: string) {
  const captured = cached ?? readCaptured();
  return captured.has(slug) ? `/previews/${slug}.webp` : null;
}

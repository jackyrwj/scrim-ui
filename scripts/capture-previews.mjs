/**
 * Capture a homepage screenshot for every entry in src/lib/resources.ts.
 *
 * Why screenshots and not an iframe: most of the sites we link (colorhunt.co,
 * figma.com, openai.com, …) send `X-Frame-Options: DENY`, so an embed would be
 * a blank box on more than half the catalogue. uwarp.design — the reference for
 * these pages — ships static screenshots for the same reason.
 *
 * Output: public/previews/<slug>.webp at 1280x800 CSS px, deviceScaleFactor 2,
 * re-encoded to webp. Existing files are skipped unless --force is passed, so
 * re-running after adding a resource only captures the new one.
 *
 *   node scripts/capture-previews.mjs            # missing only
 *   node scripts/capture-previews.mjs --force    # everything
 *   node scripts/capture-previews.mjs figma      # slugs matching "figma"
 *
 * Failures are reported and skipped, never fatal: a site that is down or
 * blocks headless traffic simply has no preview, and the page falls back to a
 * placeholder. Run it again later.
 */
import { chromium } from "playwright";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public", "previews");

const WIDTH = 1280;
const HEIGHT = 800;
/** Time to let a site's hero/fonts/animations settle before the shutter. */
const SETTLE_MS = 2500;
const NAV_TIMEOUT_MS = 30_000;

/**
 * The resource list is TypeScript, so read it as text and pull out the
 * name/url pairs rather than pulling a TS loader into a one-off script.
 */
async function readResources() {
  const src = await readFile(path.join(root, "src", "lib", "resources.ts"), "utf8");
  const body = src.slice(src.indexOf("export const resources"));
  const entries = [];
  const re = /name:\s*"((?:[^"\\]|\\.)*)",\s*\n\s*url:\s*"([^"]+)"/g;
  for (const m of body.matchAll(re)) {
    entries.push({ name: m[1].replace(/\\"/g, '"'), url: m[2] });
  }
  return entries;
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/\+/g, "-plus")
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const filters = args.filter((a) => !a.startsWith("--"));

  const all = await readResources();
  const targets = all
    .map((e) => ({ ...e, slug: slugify(e.name) }))
    .filter((e) => filters.length === 0 || filters.some((f) => e.slug.includes(f)));

  await mkdir(outDir, { recursive: true });

  const queue = [];
  for (const entry of targets) {
    const file = path.join(outDir, `${entry.slug}.webp`);
    if (!force && (await exists(file))) continue;
    queue.push({ ...entry, file });
  }

  console.log(`${all.length} resources, ${targets.length} matched, ${queue.length} to capture`);
  if (queue.length === 0) return;

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 2,
    // Several sites serve a stripped page or a bot wall to the default
    // headless UA string; a normal desktop UA gets the real homepage.
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
      "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    locale: "en-US",
  });

  // A blank page that only runs the canvas webp encoder, reused for every shot.
  encoderPage = await context.newPage();

  let ok = 0;
  const failed = [];

  for (const [i, entry] of queue.entries()) {
    const label = `[${i + 1}/${queue.length}] ${entry.slug}`;
    const page = await context.newPage();
    try {
      await page.goto(entry.url, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });
      await page.waitForTimeout(SETTLE_MS);
      // Cookie banners cover the hero on most European-hosted sites. Try the
      // usual accept/close controls; ignore it when there is nothing to click.
      await dismissBanners(page);
      const buffer = await page.screenshot({ type: "png" });
      await writeFile(entry.file, await toWebp(buffer));
      ok += 1;
      console.log(`${label} ✓`);
    } catch (err) {
      failed.push({ slug: entry.slug, url: entry.url, reason: err.message.split("\n")[0] });
      console.log(`${label} ✗ ${err.message.split("\n")[0]}`);
    } finally {
      await page.close();
    }
  }

  await encoderPage.close();
  await browser.close();

  console.log(`\ncaptured ${ok}, failed ${failed.length}`);
  for (const f of failed) console.log(`  ${f.slug} — ${f.url} — ${f.reason}`);
}

/**
 * Click through the common consent overlays. Best-effort and quiet: the goal is
 * a screenshot of the site, not a legally meaningful consent choice, so we
 * prefer the *reject* control where one exists.
 */
async function dismissBanners(page) {
  const labels = [
    /reject all/i,
    /decline/i,
    /only necessary/i,
    /accept all/i,
    /^accept$/i,
    /^got it$/i,
    /^ok$/i,
  ];
  for (const label of labels) {
    try {
      const button = page.getByRole("button", { name: label }).first();
      if (await button.isVisible({ timeout: 300 })) {
        await button.click({ timeout: 1000 });
        await page.waitForTimeout(500);
        return;
      }
    } catch {
      // no such control on this page — try the next label
    }
  }
}

/** Re-encode a PNG buffer to webp using the browser's own canvas encoder. */
let encoderPage;
async function toWebp(png) {
  const dataUrl = `data:image/png;base64,${png.toString("base64")}`;
  const base64 = await encoderPage.evaluate(async (url) => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext("2d").drawImage(img, 0, 0);
    return canvas.toDataURL("image/webp", 0.82).split(",")[1];
  }, dataUrl);
  return Buffer.from(base64, "base64");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

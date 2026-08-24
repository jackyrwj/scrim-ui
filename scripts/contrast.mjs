/**
 * Measure WCAG contrast between the theme's colour tokens.
 *
 * The pair that matters most here is `--muted-foreground` on `--muted`: it is
 * the site's caption/chip combination, it appears at 11px (so the 4.5:1 normal
 * text floor applies, not the 3:1 large-text one), and it is easy to break by
 * nudging one token a shade. Run this after changing any colour in
 * `src/app/globals.css`.
 *
 *   node scripts/contrast.mjs
 *
 * Exits non-zero if any checked pair falls under its floor, so it can gate a
 * commit. Tokens are read from globals.css — no second copy to drift.
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Relative luminance, per WCAG 2.1. */
function luminance(hex) {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Flatten `over` under `hex` at the given alpha — for the `/50` tint utilities. */
function blend(hex, over, alpha) {
  const mix = (i) => {
    const f = parseInt(hex.slice(i, i + 2), 16);
    const b = parseInt(over.slice(i, i + 2), 16);
    return Math.round(f * alpha + b * (1 - alpha))
      .toString(16)
      .padStart(2, "0");
  };
  return `#${mix(1)}${mix(3)}${mix(5)}`;
}

/**
 * Pull the `:root` (light) and `.dark` token blocks out of globals.css.
 * Only hex values are read; anything else in the block is ignored.
 */
async function readTokens() {
  const css = await readFile(path.join(root, "src", "app", "globals.css"), "utf8");
  const block = (selector) => {
    const start = css.indexOf(selector);
    const open = css.indexOf("{", start);
    const body = css.slice(open, css.indexOf("}", open));
    return Object.fromEntries(
      [...body.matchAll(/(--[\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2]]),
    );
  };
  return { light: block(":root {"), dark: block(".dark {") };
}

/** [foreground token, background token, floor, note]. */
const PAIRS = [
  ["--muted-foreground", "--muted", 4.5, "chips and captions, 11px"],
  ["--muted-foreground", "--background", 4.5, "body captions"],
  ["--muted-foreground", "--card", 4.5, "captions on cards"],
  ["--foreground", "--background", 4.5, "body text"],
  ["--foreground", "--muted", 4.5, "text on muted panels"],
  ["--primary-muted-foreground", "--primary-muted", 4.5, "active chips"],
  ["--primary-foreground", "--primary", 4.5, "primary button label"],
];

const tokens = await readTokens();
let failures = 0;

for (const [appearance, palette] of Object.entries(tokens)) {
  console.log(`\n${appearance}`);
  for (const [fg, bg, floor, note] of PAIRS) {
    if (!palette[fg] || !palette[bg]) continue;
    const r = ratio(palette[fg], palette[bg]);
    const ok = r >= floor;
    if (!ok) failures += 1;
    console.log(
      `  ${ok ? "✓" : "✗"} ${r.toFixed(2).padStart(5)} : ${floor}  ${fg} on ${bg}  — ${note}`,
    );
  }
  // The /50 tints are common enough to be worth checking as their own surface.
  const tinted = blend(palette["--muted"], palette["--background"], 0.5);
  const r = ratio(palette["--muted-foreground"], tinted);
  const ok = r >= 4.5;
  if (!ok) failures += 1;
  console.log(
    `  ${ok ? "✓" : "✗"} ${r.toFixed(2).padStart(5)} : 4.5  --muted-foreground on --muted/50 (${tinted})`,
  );
}

console.log(failures === 0 ? "\nAll pairs pass." : `\n${failures} pair(s) under the floor.`);
process.exit(failures === 0 ? 0 : 1);

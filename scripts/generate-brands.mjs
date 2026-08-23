/**
 * Generates src/lib/brands.ts from the simple-icons package.
 *
 * Brand marks are trademarks of their owners; we render them at small sizes,
 * purely to identify the product being linked or discussed. Simple Icons ships
 * the official paths and colors under CC0.
 *
 * Run: node scripts/generate-brands.mjs
 */
import { writeFileSync } from "node:fs";
import * as si from "simple-icons";
import { hexToOklch, oklchToHex } from "./oklch.mjs";

/** simple-icons slugs we bundle. Keep alphabetical. */
const SLUGS = [
  "alibabacloud",
  "anthropic",
  "baseui",
  "chakraui",
  "cursor",
  "daisyui",
  "deepseek",
  "dify",
  "dovetail",
  "excalidraw",
  "figma",
  "framer",
  "github",
  "githubcopilot",
  "google",
  "googlefonts",
  "headlessui",
  "heroui",
  "huggingface",
  "iconify",
  "langchain",
  "langgraph",
  "lucide",
  "mantine",
  "maze",
  "meta",
  "miro",
  "mistralai",
  "nextdotjs",
  "notion",
  "ollama",
  "penpot",
  "perplexity",
  "phosphoricons",
  "qwen",
  "radixui",
  "react",
  "replit",
  "shadcnui",
  "simpleicons",
  "sketch",
  "smashingmagazine",
  "streamlit",
  "tailwindcss",
  "unsplash",
  "v0",
  "vercel",
  "webflow",
  "windsurf",
  "wix",
];

/**
 * Marks simple-icons does not carry. The OpenAI flower is from Wikimedia
 * Commons; the wide lockup was trimmed to the mark itself.
 */
const MANUAL = {
  openai: {
    title: "OpenAI",
    hex: "000000",
    // The source file was a wide lockup; this is just the flower mark, whose
    // path spans x 2.1-317.9 and y 0-320. A 320-square box centres it exactly —
    // the lockup's old crop cut 40 units off both the top and the bottom.
    viewBox: "0 0 320 320",
    body: "<path d=\"m297.06 130.97c7.26-21.79 4.76-45.66-6.85-65.48-17.46-30.4-52.56-46.04-86.84-38.68-15.25-17.18-37.16-26.95-60.13-26.81-35.04-.08-66.13 22.48-76.91 55.82-22.51 4.61-41.94 18.7-53.31 38.67-17.59 30.32-13.58 68.54 9.92 94.54-7.26 21.79-4.76 45.66 6.85 65.48 17.46 30.4 52.56 46.04 86.84 38.68 15.24 17.18 37.16 26.95 60.13 26.8 35.06.09 66.16-22.49 76.94-55.86 22.51-4.61 41.94-18.7 53.31-38.67 17.57-30.32 13.55-68.51-9.94-94.51zm-120.28 168.11c-14.03.02-27.62-4.89-38.39-13.88.49-.26 1.34-.73 1.89-1.07l63.72-36.8c3.26-1.85 5.26-5.32 5.24-9.07v-89.83l26.93 15.55c.29.14.48.42.52.74v74.39c-.04 33.08-26.83 59.9-59.91 59.97zm-128.84-55.03c-7.03-12.14-9.56-26.37-7.15-40.18.47.28 1.3.79 1.89 1.13l63.72 36.8c3.23 1.89 7.23 1.89 10.47 0l77.79-44.92v31.1c.02.32-.13.63-.38.83l-64.41 37.19c-28.69 16.52-65.33 6.7-81.92-21.95zm-16.77-139.09c7-12.16 18.05-21.46 31.21-26.29 0 .55-.03 1.52-.03 2.2v73.61c-.02 3.74 1.98 7.21 5.23 9.06l77.79 44.91-26.93 15.55c-.27.18-.61.21-.91.08l-64.42-37.22c-28.63-16.58-38.45-53.21-21.95-81.89zm221.26 51.49-77.79-44.92 26.93-15.54c.27-.18.61-.21.91-.08l64.42 37.19c28.68 16.57 38.51 53.26 21.94 81.94-7.01 12.14-18.05 21.44-31.2 26.28v-75.81c.03-3.74-1.96-7.2-5.2-9.06zm26.8-40.34c-.47-.29-1.3-.79-1.89-1.13l-63.72-36.8c-3.23-1.89-7.23-1.89-10.47 0l-77.79 44.92v-31.1c-.02-.32.13-.63.38-.83l64.41-37.16c28.69-16.55 65.37-6.7 81.91 22 6.99 12.12 9.52 26.31 7.15 40.1zm-168.51 55.43-26.94-15.55c-.29-.14-.48-.42-.52-.74v-74.39c.02-33.12 26.89-59.96 60.01-59.94 14.01 0 27.57 4.92 38.34 13.88-.49.26-1.33.73-1.89 1.07l-63.72 36.8c-3.26 1.85-5.26 5.31-5.24 9.06l-.04 89.79zm14.63-31.54 34.65-20.01 34.65 20v40.01l-34.65 20-34.65-20z\"/>",
  },
};

/**
 * Display names that should resolve to a mark, where normalising the name is
 * not enough — sub-brands, docs sites and products owned by another brand.
 */
const ALIASES = {
  "chatgpt": "openai",
  "gpt": "openai",
  "openai docs": "openai",
  "openai cookbook": "openai",
  "claude": "anthropic",
  "claude code": "anthropic",
  "anthropic engineering": "anthropic",
  "anthropic — claude docs & ux": "anthropic",
  "gemini": "google",
  "google ai studio": "google",
  "google people + ai guidebook": "google",
  "deepseek api docs": "deepseek",
  "deepseek-r1": "deepseek",
  "deepseek-v3": "deepseek",
  "llama": "meta",
  "qwen": "qwen",
  "tongyi qianwen": "qwen",
  "mistral": "mistralai",
  "hugging face docs": "huggingface",
  "hugging face nlp course": "huggingface",
  "vercel ai sdk": "vercel",
  "vercel ai engineering": "vercel",
  "geist": "vercel",
  "figma community": "figma",
  "figma make": "figma",
  "figjam": "figma",
  "replit agent": "replit",
  "notion ai": "notion",
  "framer ai": "framer",
  "webflow ai": "webflow",
  "wix studio": "wix",
  "tailwind": "tailwindcss",
  "next.js": "nextdotjs",
};

/**
 * Brands whose Simple Icons color is the black wordmark rather than the color
 * people actually recognise the product by.
 */
const COLOR_OVERRIDES = {
  // Simple Icons carries Anthropic's black wordmark; the coral is the mark
  // everyone associates with Claude.
  anthropic: "D97757",
};

/**
 * A brand color is chosen for the brand's own surfaces, not for ours, so it is
 * not automatically legible on either of our backgrounds: Vercel and Notion are
 * pure black and vanish on #09090b, while Hugging Face yellow washes out on
 * white. Derive one variant per appearance by moving ONLY lightness in OKLCH —
 * hue and chroma are what make the mark recognisable, so they are preserved and
 * most brands come through untouched in both modes.
 *
 * Achromatic marks (the black wordmarks) have no hue worth preserving, so they
 * become the theme's own foreground instead of a washed-out grey.
 */
const LIGHT_L_MAX = 0.7; // on #ffffff
const DARK_L_MIN = 0.62; // on #09090b
const ACHROMATIC_C = 0.03;

function appearances(hex) {
  const c = hexToOklch(`#${hex}`);
  if (c.C < ACHROMATIC_C) return { light: "#18181b", dark: "#fafafa" };
  return {
    light: oklchToHex({ ...c, L: Math.min(c.L, LIGHT_L_MAX) }),
    dark: oklchToHex({ ...c, L: Math.max(c.L, DARK_L_MIN) }),
  };
}

/**
 * Model name -> brand. Product names carry a version ("Claude Opus 5",
 * "Gemini 3", "GPT-4o"), so the exact-match lookup used for brand names cannot
 * resolve them; these match on a leading token instead. Longest prefix wins, so
 * a more specific entry can override a shorter one.
 */
const MODEL_PREFIXES = {
  chatgpt: "openai",
  gpt: "openai",
  o1: "openai",
  o3: "openai",
  o4: "openai",
  claude: "anthropic",
  opus: "anthropic",
  sonnet: "anthropic",
  haiku: "anthropic",
  fable: "anthropic",
  gemini: "google",
  gemma: "google",
  deepseek: "deepseek",
  llama: "meta",
  qwen: "qwen",
  mistral: "mistralai",
  mixtral: "mistralai",
  codestral: "mistralai",
};

const icons = Object.values(si).filter((i) => i && typeof i === "object" && i.slug);
const bySlug = new Map(icons.map((i) => [i.slug, i]));

const entries = [];
for (const slug of SLUGS) {
  const icon = bySlug.get(slug);
  if (!icon) throw new Error(`simple-icons has no slug "${slug}"`);
  // No <title> child: <BrandIcon> labels the <svg> itself, and a title element
  // would also leak the brand name into ancestor textContent.
  const hex = COLOR_OVERRIDES[slug] ?? icon.hex;
  entries.push([
    slug,
    { title: icon.title, viewBox: "0 0 24 24", body: `<path d="${icon.path}"/>`, ...appearances(hex) },
  ]);
}
for (const [key, data] of Object.entries(MANUAL)) {
  const { hex, ...rest } = data;
  entries.push([key, { ...rest, ...appearances(COLOR_OVERRIDES[key] ?? hex) }]);
}
entries.sort(([a], [b]) => a.localeCompare(b));

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** key + official title + aliases, all normalised, all pointing at a brand key. */
const lookup = {};
for (const [key, data] of entries) {
  lookup[normalize(key)] = key;
  lookup[normalize(data.title)] = key;
}
for (const [name, key] of Object.entries(ALIASES)) {
  if (!lookup[normalize(key)]) throw new Error(`alias "${name}" points at unknown brand "${key}"`);
  lookup[normalize(name)] = key;
}

const q = (s) => JSON.stringify(s);
const out = `/**
 * GENERATED FILE — do not edit by hand.
 * Run \`node scripts/generate-brands.mjs\` after changing that script.
 *
 * Brand marks for <BrandIcon>. Paths come from Simple Icons (CC0) plus a small
 * set of hand-added marks. Each carries a \`light\` and \`dark\` color derived
 * from the official brand color so the mark stays legible on both of our
 * backgrounds; <BrandIcon> picks the pair up through CSS custom properties.
 * Logos are trademarks of their respective owners and are used only to identify
 * the product being named. Names with no mark here fall back to a two-letter
 * avatar in <BrandIcon>.
 */
export type BrandData = {
  title: string;
  viewBox: string;
  body: string;
  /** Brand color adjusted to read on the light background. */
  light: string;
  /** Brand color adjusted to read on the dark background. */
  dark: string;
};

export const brandData: Record<string, BrandData> = {
${entries.map(([key, d]) => `  ${q(key)}: { title: ${q(d.title)}, viewBox: ${q(d.viewBox)}, light: ${q(d.light)}, dark: ${q(d.dark)}, body: ${q(d.body)} },`).join("\n")}
};

/** Normalised display name -> brand key. Covers keys, official titles and aliases. */
const brandLookup: Record<string, string> = {
${Object.entries(lookup).sort(([a], [b]) => a.localeCompare(b)).map(([n, key]) => `  ${q(n)}: ${q(key)},`).join("\n")}
};

/** Resolve a display name (e.g. "Vercel AI SDK", "Claude") to a brandData key. */
export function resolveBrand(name: string): string | undefined {
  return brandLookup[name.toLowerCase().replace(/[^a-z0-9]/g, "")];
}

/** Model name prefix -> brand key, longest first so specific entries win. */
const modelPrefixes: [string, string][] = [
${Object.entries(MODEL_PREFIXES)
  .sort(([a], [b]) => b.length - a.length || a.localeCompare(b))
  .map(([n, key]) => `  [${q(n)}, ${q(key)}],`)
  .join("\n")}
];

/**
 * Resolve a MODEL name to a brandData key, e.g. "Claude Opus 5" -> "anthropic",
 * "GPT-4o" -> "openai". Falls back to the plain brand lookup first, so an exact
 * provider name still works.
 */
export function resolveModelBrand(name: string): string | undefined {
  const exact = resolveBrand(name);
  if (exact) return exact;
  const n = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [prefix, key] of modelPrefixes) {
    if (n.startsWith(prefix)) return key;
  }
  // A provider may sit anywhere in a longer label, e.g. "Fast (Claude Haiku)".
  for (const [prefix, key] of modelPrefixes) {
    if (n.includes(prefix)) return key;
  }
  return undefined;
}

/** The brand's own name for a display string, e.g. "ChatGPT" -> "OpenAI". */
export function brandTitle(name: string): string | undefined {
  const key = resolveBrand(name);
  return key ? brandData[key].title : undefined;
}
`;

writeFileSync(new URL("../src/lib/brands.ts", import.meta.url), out);
console.log(`wrote src/lib/brands.ts — ${entries.length} marks, ${Object.keys(lookup).length} lookup keys`);

#!/usr/bin/env node
/**
 * Assembles the deployable demo: templates/ai-chat, with demo/ai-chat laid
 * over the top of it.
 *
 * The overlay exists because of one hard constraint. lib/template-files.server.ts
 * walks templates/<dir>/ and ships EVERY file it finds — into the zip a buyer
 * downloads, into the shadcn registry payload, and into the file list on the
 * template page. A demo-only file living in there would be sold as part of
 * the template, and a rate limiter keyed to my Upstash instance is not
 * something anyone paid for.
 *
 * So the template stays pristine and the differences live apart. The overlay
 * is currently five files; if it ever grows past a dozen, that is a signal
 * the demo has drifted into being a different app, which defeats the point of
 * having one.
 *
 * Usage:  node scripts/build-demo.mjs [outDir]     (default .demo-build)
 */

import * as fs from "node:fs";
import * as path from "node:path";

const root = process.cwd();
const source = path.join(root, "templates", "ai-chat");
const overlay = path.join(root, "demo", "ai-chat");
const out = path.resolve(root, process.argv[2] ?? ".demo-build");

const SKIP = new Set(["node_modules", ".next", ".git", ".turbo", "dist"]);
const SKIP_FILES = new Set([".DS_Store", "next-env.d.ts", "tsconfig.tsbuildinfo"]);

/* `base` is the destination ROOT, kept separate from `to` as the recursion
   descends — recording paths relative to the current directory would reduce
   every entry to its basename, and app/page.tsx and app/api/chat/route.ts
   would compare equal to any other page.tsx or route.ts. */
function copyTree(from, to, base, seen) {
  for (const item of fs.readdirSync(from, { withFileTypes: true })) {
    if (SKIP.has(item.name) || SKIP_FILES.has(item.name)) continue;
    const src = path.join(from, item.name);
    const dest = path.join(to, item.name);
    if (item.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      copyTree(src, dest, base, seen);
    } else if (item.isFile()) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
      seen.push(path.relative(base, dest));
    }
  }
}

if (!fs.existsSync(source)) {
  console.error(`No template at ${source}`);
  process.exit(1);
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const base = [];
copyTree(source, out, out, base);

const added = [];
copyTree(overlay, out, out, added);

/* Which overlay files REPLACED a template file and which are new. Printed
   because a typo in an overlay path fails silently otherwise — the file
   copies fine, nothing imports it, and the demo quietly runs the template's
   uncapped route instead. Anything listed as "new" that you expected to
   replace something is that bug. */
const baseSet = new Set(base);
const replaced = added.filter((f) => baseSet.has(f));
const fresh = added.filter((f) => !baseSet.has(f));

console.log(`\n  ${out}`);
console.log(`  ${base.length} files from templates/ai-chat\n`);
for (const f of replaced.sort()) console.log(`    replaced  ${f}`);
for (const f of fresh.sort()) console.log(`    new       ${f}`);

/* The template's .env.example is one of the replaced files, and the demo's
   version lists two more variables. Say so, because forgetting them is the
   failure mode that ends with an uncapped key in production — the route
   returns 503 rather than serving, but only if you notice. */
console.log(`
  Next:
    cd ${path.relative(root, out) || "."} && npm install
    cp .env.example .env.local     # AI_GATEWAY_API_KEY + the two UPSTASH ones
    npm run dev

  In production the chat route returns 503 unless both UPSTASH variables are
  set. That is the spend limit refusing to be optional.
`);

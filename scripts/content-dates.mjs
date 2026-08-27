/**
 * Real last-modified dates for the sitemap, read out of git history.
 *
 * The sitemap used to stamp `new Date()` on every URL, which told crawlers
 * that all ~200 pages changed on every deploy. A signal that is always true
 * carries no information, and once it is discounted the pages that genuinely
 * did change are recrawled no faster than the ones that did not.
 *
 * Git knows the real answer, but the build cannot ask it: Vercel clones
 * shallowly, so `git log` there would report one commit date for every file —
 * trading one uniform lie for another. So the dates are resolved here, from a
 * full clone, and committed as data the build only has to read.
 *
 * Run after changing content, before committing:
 *
 *     npm run content-dates
 *
 * A key with no committed history is omitted rather than guessed; the sitemap
 * falls back to the build date for those, which is correct for a page whose
 * first commit has not happened yet.
 */
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const OUT = path.join(ROOT, "src", "lib", "content-dates.json");

/**
 * Most recent commit date per tracked file, from a single pass over history.
 *
 * One `git log` per file would be ~200 subprocesses; walking the log once and
 * keeping the first date seen for each path is the same answer, because the
 * log arrives newest-first.
 */
function fileDates() {
  const log = execFileSync(
    "git",
    ["log", "--no-merges", "--date-order", "--pretty=format:%cI", "--name-only"],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );

  const dates = new Map();
  let current = null;
  for (const line of log.split("\n")) {
    if (line === "") continue;
    if (/^\d{4}-\d{2}-\d{2}T/.test(line)) {
      current = line;
    } else if (current && !dates.has(line)) {
      dates.set(line, current);
    }
  }
  return dates;
}

/** The newest date among tracked files under a repo-relative prefix. */
function dateFor(dates, prefix) {
  let newest = null;
  for (const [file, date] of dates) {
    if (file === prefix || file.startsWith(`${prefix}/`)) {
      if (newest === null || date > newest) newest = date;
    }
  }
  return newest;
}

/** Directory names under a repo-relative path, skipping loose files. */
function dirsIn(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

function main() {
  const dates = fileDates();
  const out = {};
  const missing = [];

  const keys = [
    /* Components and patterns: the showcase directory is where a component
       actually changes. A description edited in registry.ts does not bump it,
       which is the intended trade — registry.ts is touched by every component,
       so keying off it would move all thirty dates at once and put us back
       where we started. */
    ...dirsIn("src/showcase")
      .filter((d) => d !== "patterns")
      .map((d) => `src/showcase/${d}`),
    ...dirsIn("src/showcase/patterns").map((d) => `src/showcase/patterns/${d}`),
    ...dirsIn("templates").map((d) => `templates/${d}`),
    ...dirsIn("src/app/tools").map((d) => `src/app/tools/${d}`),

    /* Entries that live as records inside one file share that file's date.
       Coarse, but true: the file did change on that day. Per-entry precision
       would mean parsing `git log -L` line ranges, which breaks the first
       time a record moves. */
    "src/lib/registry.ts",
    "src/lib/icon-guide.ts",
    "src/lib/resources.ts",
    "src/lib/inspiration.ts",
    "src/lib/tools.ts",
    "src/lib/templates.ts",

    /* Index pages: each is its own route file. */
    "src/app/page.tsx",
    "src/app/components/page.tsx",
    "src/app/patterns/page.tsx",
    "src/app/templates/page.tsx",
    "src/app/tools/page.tsx",
    "src/app/icons/page.tsx",
    "src/app/resources/page.tsx",
    "src/app/inspiration/page.tsx",
    "src/app/categories/page.tsx",
    "src/app/pro/page.tsx",
    "src/app/privacy/page.tsx",
  ];

  for (const key of keys) {
    const date = dateFor(dates, key);
    if (date) out[key] = date;
    else missing.push(key);
  }

  const sorted = Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k]]));
  fs.writeFileSync(OUT, `${JSON.stringify(sorted, null, 2)}\n`);

  console.log(`content-dates: wrote ${Object.keys(sorted).length} entries to src/lib/content-dates.json`);
  if (missing.length > 0) {
    console.log(
      `content-dates: ${missing.length} not yet committed, will fall back to the build date:\n  ${missing.join("\n  ")}`,
    );
  }
}

main();

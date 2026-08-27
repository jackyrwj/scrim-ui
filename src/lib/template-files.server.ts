import * as fs from "node:fs";
import * as path from "node:path";
import { getTemplate } from "./templates";

/**
 * Reading a template off disk.
 *
 * Server only — same reasoning as lib/licenses.server.ts, and the same guard,
 * since this walks the filesystem.
 *
 * The file LIST is public and the file CONTENTS are not. That split is
 * deliberate: a buyer deciding whether the price is worth it needs to see the
 * shape of what they are getting, and a directory listing is a far better
 * answer to "what's in it?" than a feature bullet. Nothing in a path name is
 * the thing being sold.
 */

if (typeof window !== "undefined") {
  throw new Error("lib/template-files.server.ts was imported into client code.");
}

export type TemplateFile = {
  /** Path relative to the template root, e.g. "app/api/chat/route.ts". */
  path: string;
  bytes: number;
  lines: number;
};

/** Directories that are never part of a template, whatever is in them. */
const SKIP = new Set(["node_modules", ".next", ".git", ".turbo", "dist"]);

/* The lockfile is a build artifact of this repo's install, not of the
   buyer's — shipping it pins them to whatever resolved here on the day. */
const SKIP_FILES = new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lockb",
  ".DS_Store",
  /* Written by `next build`/`tsc`, regenerated on the buyer's first run.
     tsconfig.tsbuildinfo is also 130KB of nothing. */
  "next-env.d.ts",
  "tsconfig.tsbuildinfo",
]);

function templateRoot(slug: string): string | null {
  const entry = getTemplate(slug);
  if (!entry || entry.status !== "published") return null;
  /* Resolved from the registry's `dir`, never from the caller's string — this
     path goes to readFileSync, and a slug is user input. */
  return path.join(process.cwd(), "templates", entry.dir);
}

function walk(root: string, dir: string, out: string[]) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walk(root, full, out);
    else if (item.isFile() && !SKIP_FILES.has(item.name) && !item.name.endsWith(".tsbuildinfo"))
      out.push(path.relative(root, full));
  }
}

/** Every file in the template, sorted so directories read together. */
export function listTemplateFiles(slug: string): TemplateFile[] {
  const root = templateRoot(slug);
  if (!root || !fs.existsSync(root)) return [];
  const paths: string[] = [];
  walk(root, root, paths);
  return paths
    .sort((a, b) => a.localeCompare(b))
    .map((rel) => {
      const content = fs.readFileSync(path.join(root, rel), "utf8");
      return { path: rel, bytes: Buffer.byteLength(content), lines: content.split("\n").length };
    });
}

/** The same files, with their contents. Only ever called behind a licence. */
export function readTemplateFiles(slug: string): { path: string; content: string }[] {
  const root = templateRoot(slug);
  if (!root || !fs.existsSync(root)) return [];
  const paths: string[] = [];
  walk(root, root, paths);
  return paths.sort((a, b) => a.localeCompare(b)).map((rel) => ({
    path: rel,
    content: fs.readFileSync(path.join(root, rel), "utf8"),
  }));
}

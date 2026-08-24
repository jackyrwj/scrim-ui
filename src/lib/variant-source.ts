import * as fs from "node:fs";
import * as path from "node:path";

/* ------------------------------------------------------------------ */
/* Per-variant source snippets.                                        */
/*                                                                     */
/* Each variant on a component page is a live demo — <DemoRunning />   */
/* and friends from src/showcase/<slug>/demos.tsx. The page could only */
/* ever offer the whole component file, so "give me the Failed state"  */
/* meant reading the source and reconstructing the props by hand.      */
/*                                                                     */
/* Rather than hand-writing ~100 snippets into the page configs (which */
/* would drift from the demos the moment either changed), the snippet  */
/* is extracted from the demo source itself at build time. Every       */
/* component page is statically generated, so this runs once per build */
/* and never on a request.                                             */
/*                                                                     */
/* Two things get read:                                                */
/*   page-config.tsx — to learn which demo component each variant id   */
/*                     renders. It is the only place that mapping      */
/*                     exists, and reading it beats a second copy of   */
/*                     it that could disagree.                         */
/*   demos.tsx       — for the demo function, plus the module-scope    */
/*                     helpers and imports it depends on, so what you  */
/*                     paste actually compiles.                        */
/*                                                                     */
/* Extraction is deliberately fail-soft: anything it cannot resolve    */
/* yields no snippet, and the page then shows no copy control for that */
/* variant. A missing button is a visible, harmless gap; a snippet     */
/* built from a wrong guess is a bug someone pastes into their app.    */
/* ------------------------------------------------------------------ */

const SHOWCASE = path.join(process.cwd(), "src", "showcase");

function read(slug: string, file: string): string | undefined {
  try {
    return fs.readFileSync(path.join(SHOWCASE, slug, file), "utf8");
  } catch {
    return undefined;
  }
}

/**
 * Skip over the string, template literal or comment that starts at `i`,
 * returning the index just past it. Returns `i` unchanged if none starts here.
 */
function skipNonCode(src: string, i: number): number {
  const c = src[i];
  const next = src[i + 1];

  if (c === "/" && next === "/") {
    const nl = src.indexOf("\n", i);
    return nl === -1 ? src.length : nl;
  }
  if (c === "/" && next === "*") {
    const end = src.indexOf("*/", i + 2);
    return end === -1 ? src.length : end + 2;
  }
  if (c === '"' || c === "'" || c === "`") {
    let j = i + 1;
    while (j < src.length) {
      if (src[j] === "\\") {
        j += 2;
        continue;
      }
      if (src[j] === c) return j + 1;
      j++;
    }
    return src.length;
  }
  return i;
}

/**
 * The index just past the end of the declaration starting at `start`.
 *
 * The two kinds end differently and conflating them is the trap: a function
 * ends at the close of its *body* brace — stopping at the first balanced
 * group would end it at the parameter list — while a `const` ends at the
 * first semicolon that is not inside brackets, and may open no bracket at all.
 *
 * Hand-rolled rather than a parser: the input is our own source, the shapes
 * are regular, and a real TS parse would pull a compiler into the build for
 * a job that is a bracket count.
 */
function endOfDeclaration(src: string, start: number, kind: "function" | "const"): number {
  let i = start;
  let depth = 0;

  if (kind === "function") {
    // Walk to the body brace, stepping over the parameter list and any
    // return-type annotation.
    while (i < src.length) {
      const skipped = skipNonCode(src, i);
      if (skipped !== i) {
        i = skipped;
        continue;
      }
      if (src[i] === "(") depth++;
      else if (src[i] === ")") depth--;
      else if (src[i] === "{" && depth === 0) break;
      i++;
    }
    depth = 0;
    while (i < src.length) {
      const skipped = skipNonCode(src, i);
      if (skipped !== i) {
        i = skipped;
        continue;
      }
      if (src[i] === "{") depth++;
      else if (src[i] === "}") {
        depth--;
        if (depth === 0) return i + 1;
      }
      i++;
    }
    return src.length;
  }

  while (i < src.length) {
    const skipped = skipNonCode(src, i);
    if (skipped !== i) {
      i = skipped;
      continue;
    }
    const c = src[i];
    if (c === "{" || c === "(" || c === "[") depth++;
    else if (c === "}" || c === ")" || c === "]") depth--;
    else if (c === ";" && depth === 0) return i + 1;
    i++;
  }
  return src.length;
}

type Decl = { name: string; text: string; index: number };

/** Every top-level `function` / `const` declaration in a demos file. */
function topLevelDeclarations(src: string): Decl[] {
  const decls: Decl[] = [];
  const re = /^(?:export\s+)?(function|const)\s+([A-Za-z_$][\w$]*)/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const end = endOfDeclaration(src, m.index, m[1] as "function" | "const");
    decls.push({ name: m[2], text: src.slice(m.index, end).trimEnd(), index: m.index });
    re.lastIndex = end;
  }
  return decls;
}

/** Identifiers mentioned in a chunk of source, as a set. */
function identifiersIn(text: string): Set<string> {
  const out = new Set<string>();
  // Strip strings first so prose inside them cannot pull in a helper.
  const bare = text.replace(/(["'`])(?:\\.|(?!\1)[\s\S])*?\1/g, '""');
  for (const m of bare.matchAll(/[A-Za-z_$][\w$]*/g)) out.add(m[0]);
  return out;
}

/** The import lines from `src` that bind at least one identifier in `used`. */
function neededImports(src: string, used: Set<string>): string[] {
  const out: string[] = [];
  for (const m of src.matchAll(/^import\s+[\s\S]*?from\s+"[^"]+";$/gm)) {
    const line = m[0];
    const bindings = line.slice(0, line.indexOf(" from "));
    const names = [...identifiersIn(bindings)].filter(
      (n) => n !== "import" && n !== "type" && n !== "as" && n !== "from",
    );
    if (names.some((n) => used.has(n))) out.push(line);
  }
  return out;
}

/** slug -> { variantId: demoComponentName }, read out of page-config.tsx. */
function variantDemoNames(slug: string): Record<string, string> {
  const src = read(slug, "page-config.tsx");
  if (!src) return {};
  const block = src.match(/variants:\s*\[([\s\S]*?)\n {2}\],/);
  if (!block) return {};
  const out: Record<string, string> = {};
  // Each entry is `{ id: "...", title, note, demo: <Name /> }`. Anything that
  // does not match that exact shape — a demo composed inline, say — is left
  // out rather than guessed at.
  for (const m of block[1].matchAll(
    /id:\s*"([^"]+)"[\s\S]*?demo:\s*<([A-Za-z_$][\w$]*)\s*\/>/g,
  )) {
    out[m[1]] = m[2];
  }
  return out;
}

/**
 * The pasteable source for one variant: its demo component, the module-scope
 * helpers and constants it reaches for (transitively), and the imports those
 * need. Returns undefined when any part of that cannot be resolved.
 */
export function variantSnippet(slug: string, variantId: string): string | undefined {
  const demoName = variantDemoNames(slug)[variantId];
  if (!demoName) return undefined;

  const src = read(slug, "demos.tsx");
  if (!src) return undefined;

  const decls = topLevelDeclarations(src);
  const byName = new Map(decls.map((d) => [d.name, d]));
  const target = byName.get(demoName);
  if (!target) return undefined;

  // Transitive closure over module-scope declarations, to a fixed point.
  const keep = new Set<string>([demoName]);
  for (let changed = true; changed; ) {
    changed = false;
    for (const name of [...keep]) {
      const decl = byName.get(name);
      if (!decl) continue;
      for (const id of identifiersIn(decl.text)) {
        if (byName.has(id) && !keep.has(id)) {
          keep.add(id);
          changed = true;
        }
      }
    }
  }

  const kept = decls.filter((d) => keep.has(d.name)).sort((a, b) => a.index - b.index);
  const used = new Set<string>();
  for (const d of kept) for (const id of identifiersIn(d.text)) used.add(id);

  const imports = neededImports(src, used);
  const body = kept.map((d) => d.text).join("\n\n");

  // Carry the "use client" directive through when the file has one. Every
  // demo file does, and a snippet that uses hooks is wrong without it in an
  // app-router project — the paste would fail at the first useState.
  const directive = /^"use client";/.test(src.trimStart()) ? '"use client";' : "";

  return [directive, imports.join("\n"), body].filter(Boolean).join("\n\n") + "\n";
}

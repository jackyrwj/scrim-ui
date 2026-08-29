import * as fs from "node:fs";
import * as path from "node:path";
import { components, patterns, getCategory } from "@/lib/registry";
import { SITE_URL } from "@/lib/site";

/**
 * The shadcn registry, served straight from src/lib/registry.ts.
 *
 * `npx shadcn@latest add https://scrimui.dev/r/prompt-input.json`
 *
 * A route rather than a checked-in registry.json plus a build step, because
 * the component list already has a source of truth and a second copy of it
 * would drift the first time someone adds a component. Everything here —
 * the name, the description, the category, the file itself — is read from
 * that source at build time.
 *
 * Prerendered: generateStaticParams plus dynamicParams=false means these are
 * flat files in the output, not a function anyone has to keep warm.
 */
export const dynamicParams = false;

/* Free components only. A Pro item served here would be the whole gate
   undone — /r/<slug>.json is a public, prerendered flat file with the source
   inlined in it. Pro items get a key-checked dynamic endpoint of their own;
   until then they are simply absent, and dynamicParams=false turns a request
   for one into a 404 rather than a half-answer. */
const published = components.filter((c) => c.status === "published" && c.tier !== "pro");

/**
 * Components and patterns share one flat namespace, because `shadcn add`
 * takes one name and does not know which of the two it is asking for. A slug
 * used twice would make one of them unreachable, silently — so it fails the
 * build instead.
 */
const collisions = patterns.filter((p) => published.some((c) => c.slug === p.slug));
if (collisions.length > 0) {
  throw new Error(
    `Pattern slugs collide with component slugs: ${collisions.map((p) => p.slug).join(", ")}.`,
  );
}

export function generateStaticParams() {
  return [
    { name: "registry.json" },
    { name: "all.json" },
    ...published.map((c) => ({ name: `${c.slug}.json` })),
    ...patterns.map((p) => ({ name: `${p.slug}.json` })),
  ];
}

/**
 * "Install everything", as one command on the homepage.
 *
 * The item's only payload is its dependency list: the CLI resolves each
 * dependency URL to the same /r/<slug>.json a single-component install would
 * fetch, so every free component lands in components/ui/ exactly as if it had
 * been added by name. `files` is optional in the item schema — the item itself
 * installs nothing. Pro items are deliberately absent; they install through
 * the key-checked endpoint, and a public collection cannot carry a key.
 */
function allItem() {
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: "all",
    type: "registry:block",
    title: "All free components",
    description: `Every free Scrim UI component — ${published.length} in total, from prompt inputs and streaming messages to tool calls and citations.`,
    author: `Scrim UI (${SITE_URL})`,
    categories: ["collection"],
    docs: `${SITE_URL}/components`,
    dependencies: [],
    registryDependencies: published.map((c) => `${SITE_URL}/r/${c.slug}.json`),
    files: [],
  };
}

/**
 * Every component is one file under src/showcase/<slug>/<slug>.tsx importing
 * nothing but React — verified, not assumed: a component that grew a
 * dependency would need it declared here, and this throws rather than ship a
 * registry entry that installs something broken.
 */
function readSource(slug: string) {
  const file = path.join(process.cwd(), "src", "showcase", slug, `${slug}.tsx`);
  const content = fs.readFileSync(file, "utf8");
  const bare = [...content.matchAll(/from "([^"]+)"/g)]
    .map((m) => m[1])
    .filter((s) => !s.startsWith(".") && !s.startsWith("@/") && s !== "react");
  if (bare.length > 0) {
    throw new Error(
      `${slug} imports ${bare.join(", ")}. Declare them in the registry item's "dependencies" before shipping it.`,
    );
  }
  return content;
}

/**
 * A pattern's source, with its imports pointed at the installed components.
 *
 * A pattern is a composition — the coding-agent screen is AgentStatus plus
 * ToolCall plus ApprovalRequest — and in this repo it reaches them by
 * relative path (`../../tool-call/tool-call`). That path is meaningless in
 * someone else's project, where the CLI will have put those files at
 * `components/ui/`. So the imports are rewritten and the same slugs become
 * the item's registryDependencies: `shadcn add ai-chat` then installs the
 * screen *and* the three components it is built from.
 *
 * Anything left over — another relative import, or a bare package — throws,
 * on the same principle as readSource: better a failed build than a registry
 * entry that installs something that cannot compile.
 */
function readPatternSource(slug: string): { content: string; deps: string[] } {
  const file = path.join(process.cwd(), "src", "showcase", "patterns", slug, `${slug}.tsx`);
  const original = fs.readFileSync(file, "utf8");

  const deps = new Set<string>();
  const content = original.replace(
    /from "\.\.\/\.\.\/([a-z0-9-]+)\/\1"/g,
    (_match, dep: string) => {
      deps.add(dep);
      return `from "@/components/ui/${dep}"`;
    },
  );

  const unresolved = [...content.matchAll(/from "([^"]+)"/g)]
    .map((m) => m[1])
    .filter((s) => s !== "react" && !s.startsWith("@/components/ui/"));
  if (unresolved.length > 0) {
    throw new Error(
      `Pattern ${slug} imports ${unresolved.join(", ")}, which will not resolve in a consumer's project. Rewrite the import or declare it on the registry item.`,
    );
  }

  const missing = [...deps].filter((d) => !published.some((c) => c.slug === d));
  if (missing.length > 0) {
    throw new Error(
      `Pattern ${slug} depends on ${missing.join(", ")}, which ${missing.length === 1 ? "is" : "are"} not a published component. Publish it before publishing the pattern.`,
    );
  }

  return { content, deps: [...deps] };
}

function patternItem(slug: string) {
  const entry = patterns.find((p) => p.slug === slug)!;
  const { content, deps } = readPatternSource(slug);
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: entry.slug,
    type: "registry:block",
    title: entry.name,
    description: entry.description,
    author: `Scrim UI (${SITE_URL})`,
    categories: ["pattern"],
    docs: `${SITE_URL}/patterns/${entry.slug}`,
    dependencies: [],
    registryDependencies: deps.map((d) => `${SITE_URL}/r/${d}.json`),
    files: [
      {
        path: `src/showcase/patterns/${entry.slug}/${entry.slug}.tsx`,
        content,
        type: "registry:block",
        target: `components/blocks/${entry.slug}.tsx`,
      },
    ],
  };
}

function item(slug: string) {
  const entry = published.find((c) => c.slug === slug)!;
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: entry.slug,
    type: "registry:ui",
    title: entry.name,
    description: entry.description,
    author: `Scrim UI (${SITE_URL})`,
    categories: [entry.category],
    docs: `${SITE_URL}/components/${entry.slug}`,
    dependencies: [],
    registryDependencies: [],
    files: [
      {
        path: `src/showcase/${entry.slug}/${entry.slug}.tsx`,
        content: readSource(entry.slug),
        type: "registry:ui",
        target: `components/ui/${entry.slug}.tsx`,
      },
    ],
  };
}

function index() {
  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "scrim-ui",
    homepage: SITE_URL,
    items: [
      {
        name: "all",
        type: "registry:block",
        title: "All free components",
        description: `Every free Scrim UI component — ${published.length} in total, from prompt inputs and streaming messages to tool calls and citations.`,
        categories: ["collection"],
        registryDependencies: published.map((c) => `${SITE_URL}/r/${c.slug}.json`),
        files: [],
      },
      ...published.map((c) => ({
        name: c.slug,
        type: "registry:ui",
        title: c.name,
        description: c.description,
        categories: [getCategory(c.category)?.slug ?? c.category],
        files: [
          {
            path: `src/showcase/${c.slug}/${c.slug}.tsx`,
            type: "registry:ui",
            target: `components/ui/${c.slug}.tsx`,
          },
        ],
      })),
      ...patterns.map((p) => ({
        name: p.slug,
        type: "registry:block",
        title: p.name,
        description: p.description,
        categories: ["pattern"],
        files: [
          {
            path: `src/showcase/patterns/${p.slug}/${p.slug}.tsx`,
            type: "registry:block",
            target: `components/blocks/${p.slug}.tsx`,
          },
        ],
      })),
    ],
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const slug = name.replace(/\.json$/, "");
  /* dynamicParams=false already 404s an unlisted slug in a production build,
     but `item()` would throw on one in dev — and a Pro slug is exactly the
     request most worth answering deliberately rather than with a 500. */
  const known =
    slug === "registry" ||
    slug === "all" ||
    published.some((c) => c.slug === slug) ||
    patterns.some((p) => p.slug === slug);
  if (!known) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }
  const body =
    slug === "registry"
      ? index()
      : slug === "all"
        ? allItem()
        : patterns.some((p) => p.slug === slug)
          ? patternItem(slug)
          : item(slug);
  return Response.json(body, {
    headers: { "cache-control": "public, max-age=0, must-revalidate" },
  });
}

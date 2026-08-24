import * as fs from "node:fs";
import * as path from "node:path";
import { components, getCategory } from "@/lib/registry";
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

const published = components.filter((c) => c.status === "published");

export function generateStaticParams() {
  return [{ name: "registry.json" }, ...published.map((c) => ({ name: `${c.slug}.json` }))];
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
    items: published.map((c) => ({
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
  };
}

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const slug = name.replace(/\.json$/, "");
  const body = slug === "registry" ? index() : item(slug);
  return Response.json(body, {
    headers: { "cache-control": "public, max-age=0, must-revalidate" },
  });
}

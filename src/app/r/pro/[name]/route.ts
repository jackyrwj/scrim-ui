import * as fs from "node:fs";
import * as path from "node:path";
import { components, getComponent } from "@/lib/registry";
import { checkLicense } from "@/lib/licenses.server";
import { getTemplate, publishedTemplates } from "@/lib/templates";
import { readTemplateFiles } from "@/lib/template-files.server";
import { SITE_URL } from "@/lib/site";

/**
 * The shadcn registry for Pro items, served against a licence key.
 *
 * The key rides in the query string here, and only here. /api/pro/source
 * takes a POST precisely to keep it out of URLs — but the shadcn CLI does one
 * thing, `fetch(url)`, so a query parameter is the only place a key can go if
 * `npx shadcn add` is to work at all. That is the same trade every paid
 * registry makes; the mitigation is that the key is revocable and buys
 * nothing but source the buyer already owns.
 *
 * Kept apart from /r/[name] rather than folded into it: that route is
 * prerendered to flat files at build time, and a key check cannot live in a
 * file that was written before the request existed.
 */

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const slug = name.replace(/\.json$/, "");
  const key = new URL(request.url).searchParams.get("key");

  if (slug === "registry") {
    const check = await checkLicense(key);
    if (!check.valid) return json({ error: check.error }, 401);
    const pro = components.filter((c) => c.status === "published" && c.tier === "pro");
    return json({
      $schema: "https://ui.shadcn.com/schema/registry.json",
      name: "scrim-ui-pro",
      homepage: SITE_URL,
      items: [
        ...publishedTemplates.map((t) => ({
          name: `template-${t.slug}`,
          type: "registry:block",
          title: `${t.name} template`,
          description: t.description,
          categories: ["template"],
          files: [],
        })),
        ...pro.map((c) => ({
        name: c.slug,
        type: "registry:ui",
        title: c.name,
        description: c.description,
        categories: [c.category],
        files: [
          {
            path: `src/showcase/${c.slug}/${c.slug}.tsx`,
            type: "registry:ui",
            target: `components/ui/${c.slug}.tsx`,
          },
        ],
      })),
      ],
    });
  }

  /* Templates are namespaced so a template can never collide with a
     component slug — and so `npx shadcn add .../template-ai-chat.json` reads
     as what it is at the call site. */
  if (slug.startsWith("template-")) {
    const template = getTemplate(slug.slice("template-".length));
    if (!template || template.status !== "published") return json({ error: "Not found." }, 404);
    const templateCheck = await checkLicense(key);
    if (!templateCheck.valid) return json({ error: templateCheck.error }, 401);
    return json({
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: `template-${template.slug}`,
      type: "registry:block",
      title: `${template.name} template`,
      description: template.description,
      author: `Scrim UI (${SITE_URL})`,
      docs: `${SITE_URL}/templates/${template.slug}`,
      files: readTemplateFiles(template.slug).map((file) => ({
        path: `templates/${template.dir}/${file.path}`,
        content: file.content,
        /* registry:file needs an explicit target — unlike registry:ui, there
           is no components/ui convention to fall back on. */
        type: "registry:file",
        /* Namespaced under the template's own directory, and this is not
           cosmetic. A template is a standalone application, not files to
           merge into a project: eight of these land at the repo root, so an
           un-namespaced target means `shadcn add` offers to overwrite the
           buyer's package.json, tsconfig.json, next.config.ts and
           app/page.tsx with a different app's. shadcn asks before it
           clobbers, but "say no to eight prompts" is not an install, and one
           mis-clicked yes costs someone their dependency list.

           This is also why the item declares no `dependencies`: shadcn would
           install them into the OUTER project, where nothing imports them.
           The template's own package.json ships in the payload and is the
           right place for them — `cd` in and install. */
        target: `${template.dir}/${file.path}`,
      })),
    });
  }

  const entry = getComponent(slug);
  if (!entry || entry.status !== "published" || entry.tier !== "pro") {
    return json({ error: "Not found." }, 404);
  }

  const check = await checkLicense(key);
  if (!check.valid) return json({ error: check.error }, 401);

  let content: string;
  try {
    content = fs.readFileSync(
      path.join(process.cwd(), "src", "showcase", entry.slug, `${entry.slug}.tsx`),
      "utf8",
    );
  } catch {
    return json({ error: "Source unavailable." }, 500);
  }

  return json({
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
        content,
        type: "registry:ui",
        target: `components/ui/${entry.slug}.tsx`,
      },
    ],
  });
}

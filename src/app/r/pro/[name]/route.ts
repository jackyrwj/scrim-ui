import { components, getComponent } from "@/lib/registry";
import { checkProAccess } from "@/lib/pro-access.server";
import { getTemplate, publishedTemplates } from "@/lib/templates";
import { ProArtifactError, readProComponent, readProTemplate } from "@/lib/pro-artifacts.server";
import { SITE_URL } from "@/lib/site";

/**
 * The shadcn registry for Pro items, served against an API token.
 *
 * The token rides in the query string here. The shadcn CLI does one thing,
 * `fetch(url)`, so a query parameter is the only place a credential can go if
 * `npx shadcn add` is to work at all. That is the same trade every paid
 * registry makes; the mitigation is that the token is revocable from the
 * dashboard and buys nothing but source the buyer already owns.
 *
 * Kept apart from /r/[name] rather than folded into it: that route is
 * prerendered to flat files at build time, and a token check cannot live in a
 * file that was written before the request existed.
 */

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

function artifactJson(error: unknown) {
  if (error instanceof ProArtifactError) return json({ error: error.message }, error.status);
  console.error("[pro-registry] Unexpected artifact error:", error);
  return json({ error: "Could not load Pro source." }, 500);
}

export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const slug = name.replace(/\.json$/, "");
  const token = new URL(request.url).searchParams.get("token");

  if (slug === "registry") {
    const check = await checkProAccess({ token });
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

  /* Templates are namespaced so they can never collide with a component
     slug — and so `npx shadcn add .../template-ai-chat.json` reads as what
     it is at the call site. */
  if (slug.startsWith("template-")) {
    const template = getTemplate(slug.slice("template-".length));
    if (!template || template.status !== "published") return json({ error: "Not found." }, 404);
    const templateCheck = await checkProAccess({ token });
    if (!templateCheck.valid) return json({ error: templateCheck.error }, 401);
    try {
      const files = await readProTemplate(template.slug);
      return json({
        $schema: "https://ui.shadcn.com/schema/registry-item.json",
        name: `template-${template.slug}`,
        type: "registry:block",
        title: `${template.name} template`,
        description: template.description,
        author: `Scrim UI (${SITE_URL})`,
        docs: `${SITE_URL}/templates/${template.slug}`,
        files: files.map((file) => ({
          path: `templates/${template.dir}/${file.path}`,
          content: file.content,
          /* registry:file needs an explicit target — unlike registry:ui, there
             is no components/ui convention to fall back on. */
          type: "registry:file",
          /* Namespaced under the template's own directory so installing an app
             never overwrites the buyer's existing project root. */
          target: `${template.dir}/${file.path}`,
        })),
      });
    } catch (error) {
      return artifactJson(error);
    }
  }

  const entry = getComponent(slug);
  if (!entry || entry.status !== "published" || entry.tier !== "pro") {
    return json({ error: "Not found." }, 404);
  }

  const check = await checkProAccess({ token });
  if (!check.valid) return json({ error: check.error }, 401);

  try {
    const content = await readProComponent(entry.slug);
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
  } catch (error) {
    return artifactJson(error);
  }
}

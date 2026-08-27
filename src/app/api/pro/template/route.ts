import { getTemplate } from "@/lib/templates";
import { readTemplateFiles } from "@/lib/template-files.server";
import { checkLicense } from "@/lib/licenses.server";

/**
 * A whole template's source, against a licence.
 *
 * The same contract as /api/pro/source, one directory wider: the template
 * page renders its file LIST from the server (public — see
 * lib/template-files.server.ts) and never the contents, so a locked page has
 * nothing in it to un-hide.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const { slug, key } = (body ?? {}) as { slug?: unknown; key?: unknown };

  const entry = typeof slug === "string" ? getTemplate(slug) : undefined;
  if (!entry || entry.status !== "published") {
    return Response.json({ error: "Unknown template." }, { status: 404 });
  }

  const check = await checkLicense(key);
  if (!check.valid) {
    return Response.json({ error: check.error }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  return Response.json(
    { files: readTemplateFiles(entry.slug) },
    { headers: { "cache-control": "no-store" } },
  );
}

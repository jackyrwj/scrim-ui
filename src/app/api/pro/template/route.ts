import { getTemplate } from "@/lib/templates";
import { checkProAccess } from "@/lib/pro-access.server";
import { proArtifactErrorResponse, readProTemplate } from "@/lib/pro-artifacts.server";

/**
 * A whole template's source, against Pro access.
 *
 * The same contract as /api/pro/source, one directory wider: the template
 * page renders its file LIST from the public metadata catalog and never the
 * contents, so a locked page has nothing in it to un-hide.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const { slug } = (body ?? {}) as { slug?: unknown };

  const entry = typeof slug === "string" ? getTemplate(slug) : undefined;
  if (!entry || entry.status !== "published") {
    return Response.json({ error: "Unknown template." }, { status: 404 });
  }

  const check = await checkProAccess();
  if (!check.valid) {
    return Response.json({ error: check.error }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  try {
    return Response.json(
      { files: await readProTemplate(entry.slug) },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return proArtifactErrorResponse(error);
  }
}

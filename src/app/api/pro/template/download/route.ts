import { getTemplate } from "@/lib/templates";
import { checkProAccess } from "@/lib/pro-access.server";
import { proArtifactErrorResponse, readProTemplateZip } from "@/lib/pro-artifacts.server";

/**
 * The whole template as one archive.
 *
 * The reason this exists next to the shadcn command rather than instead of
 * it: a template is a standalone application, and the natural thing to do
 * with one is unzip it and run it. `shadcn add` is the right shape for a
 * component landing in an existing project, and the wrong shape for an app
 * that brings its own package.json — it still works, and it is still offered,
 * but it should not be the only way out of this page.
 *
 * POST, and the key in the body, exactly like /api/pro/template — a GET would
 * put the licence in a URL, where it reaches the referrer header, the browser
 * history and every log between here and there. The registry endpoint has to
 * accept a key in the query because `npx shadcn` can only fetch a URL; a
 * browser download has no such excuse, so the client fetches the bytes and
 * saves them from a blob.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const { slug, key } = (body ?? {}) as { slug?: unknown; key?: unknown };

  const entry = typeof slug === "string" ? getTemplate(slug) : undefined;
  if (!entry || entry.status !== "published") {
    return Response.json({ error: "Unknown template." }, { status: 404 });
  }

  const check = await checkProAccess({ key });
  if (!check.valid) {
    return Response.json(
      { error: check.error },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const zip = await readProTemplateZip(entry.slug);
    return new Response(zip, {
      headers: {
        "content-type": "application/zip",
        "content-length": String(zip.byteLength),
        /* The client saves from a blob and names the file itself, so this is a
           fallback for anyone calling the endpoint directly. */
        "content-disposition": `attachment; filename="${entry.dir}.zip"`,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    return proArtifactErrorResponse(error);
  }
}

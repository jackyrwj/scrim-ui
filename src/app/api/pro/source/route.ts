import * as fs from "node:fs";
import * as path from "node:path";
import { getComponent } from "@/lib/registry";
import { checkLicense } from "@/lib/licenses.server";

/**
 * The source of one Pro component, handed over only against a good licence.
 *
 * This is the actual gate. The component page never renders locked source —
 * not even blurred, not even inside a client component, because anything a
 * server component hands a client component travels in the RSC payload. The
 * page ships the preview and the prose; the code arrives here or not at all.
 *
 * POST rather than GET with a query string so the key stays out of URLs, and
 * therefore out of access logs, referrers and browser history.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const { slug, key } = (body ?? {}) as { slug?: unknown; key?: unknown };

  /* The slug is looked up in the registry rather than trusted into a path —
     it lands in fs.readFileSync, and "../../.." is the oldest trick there
     is. An unknown slug is 404 whether or not the key was good. */
  const entry = typeof slug === "string" ? getComponent(slug) : undefined;
  if (!entry || entry.status !== "published") {
    return Response.json({ error: "Unknown component." }, { status: 404 });
  }
  if (entry.tier !== "pro") {
    /* Free source is on the page already; serving it here too would give the
       endpoint two meanings and a second thing to keep in sync. */
    return Response.json({ error: "This component is free — its source is on the page." }, { status: 400 });
  }

  const check = await checkLicense(key);
  if (!check.valid) {
    return Response.json({ error: check.error }, { status: 401, headers: { "cache-control": "no-store" } });
  }

  const filename = `${entry.slug}.tsx`;
  let source: string;
  try {
    source = fs.readFileSync(
      path.join(process.cwd(), "src", "showcase", entry.slug, filename),
      "utf8",
    );
  } catch {
    return Response.json({ error: "Source unavailable." }, { status: 500 });
  }

  return Response.json(
    { filename, source },
    { headers: { "cache-control": "no-store" } },
  );
}

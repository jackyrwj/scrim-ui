import { checkLicense } from "@/lib/licenses.server";
import { withinRateLimit } from "@/lib/license-store.server";

/**
 * "Is this key good?" — asked by the dialog, the /pro form, and every locked
 * surface on first paint.
 *
 * Rate limited by IP, because a licence key is a bearer token with no second
 * factor and this endpoint will happily answer the question as fast as it is
 * asked. Twenty a minute is far above any human pasting a key and far below
 * anything that makes a 78-bit keyspace worth attacking.
 */
export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "";

  if (!(await withinRateLimit(ip))) {
    return Response.json(
      { valid: false, error: "Too many attempts. Wait a minute and try again." },
      { status: 429, headers: { "cache-control": "no-store" } },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const key = (body as { key?: unknown } | null)?.key;
  const result = await checkLicense(key);
  return Response.json(result, {
    status: result.valid ? 200 : 401,
    headers: { "cache-control": "no-store" },
  });
}

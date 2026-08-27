import { findLicensesByEmail } from "@/lib/license-store.server";
import { sendRecoveryEmail } from "@/lib/email.server";
import { withinRateLimit } from "@/lib/license-store.server";

/**
 * "I lost my key."
 *
 * Without this every lost key is an email to a human, and with no accounts
 * there is nothing else a customer can do. It is also why the store keeps an
 * email -> keys index at all.
 *
 * The response is identical whether or not the address bought anything. An
 * endpoint that answers "no licence for that address" is a free tool for
 * checking who your customers are, and the honest version helps nobody: a
 * customer who mistyped their address is no better off being told the truth
 * than being told to check their inbox.
 */
export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "";
  const headers = { "cache-control": "no-store" };

  /* Tighter than verify: this one sends mail, so abuse costs reputation. */
  if (!(await withinRateLimit(`recover:${ip}`, 5))) {
    return Response.json(
      { error: "Too many requests. Wait a minute and try again." },
      { status: 429, headers },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const email = (body as { email?: unknown } | null)?.email;

  if (typeof email !== "string" || !email.includes("@")) {
    return Response.json({ error: "Enter the email address you paid with." }, { status: 400, headers });
  }

  try {
    const records = await findLicensesByEmail(email);
    if (records.length > 0) await sendRecoveryEmail(email, records.map((r) => r.key));
  } catch (error) {
    /* Logged, not surfaced — see above: the reply is the same either way. */
    console.error("[recover] Lookup failed:", error);
  }

  return Response.json({ sent: true }, { headers });
}

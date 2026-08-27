import { findLicenseByOrder } from "@/lib/license-store.server";

/**
 * The key for a just-completed Checkout Session, so the success page can hand
 * it over without the customer waiting on an email.
 *
 * The session id is the authorisation here, which deserves justifying: it is
 * a 66-character unguessable token that Stripe puts in the buyer's own
 * redirect URL and gives to nobody else. This is the pattern Stripe's
 * fulfilment guide uses. Two mitigations keep it honest — the lookup expires
 * an hour after the licence was issued, so a session id sitting in someone's
 * browser history a week later is worthless, and the response is never
 * cached.
 *
 * The webhook, not this route, is what issues the key. This only reads. A
 * customer who closes the tab too early loses nothing: the email is already
 * sent and /pro will send it again.
 */

const WINDOW_MS = 60 * 60 * 1000;

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id") ?? "";
  const headers = { "cache-control": "no-store" };

  if (!sessionId.startsWith("cs_")) {
    return Response.json({ error: "Not a session id." }, { status: 400, headers });
  }

  const record = await findLicenseByOrder("stripe", sessionId);
  if (!record) {
    /* Not an error — the webhook may simply not have landed yet, and the page
       polls. Saying "pending" keeps that distinct from "no such order". */
    return Response.json({ status: "pending" }, { status: 202, headers });
  }

  if (Date.now() - new Date(record.createdAt).getTime() > WINDOW_MS) {
    return Response.json({ status: "expired" }, { status: 410, headers });
  }

  return Response.json({ status: "ready", key: record.key, email: record.email }, { headers });
}

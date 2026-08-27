import { generateLicenseKey } from "@/lib/license-key";
import { findLicenseByOrder, saveLicense, type LicenseRecord } from "@/lib/license-store.server";
import { sendLicenseEmail } from "@/lib/email.server";
import { purchaseFromEvent, verifyStripeSignature } from "@/lib/payments/stripe.server";

/**
 * Where a payment becomes a licence.
 *
 * Four things this endpoint has to get right, in the order they can go wrong:
 *
 * 1. RAW BODY. The signature covers the exact bytes Stripe sent. `request.text()`
 *    before any parsing — `request.json()` here would re-serialise the payload
 *    and every signature would fail, in a way that looks like a wrong secret.
 *
 * 2. VERIFY BEFORE READING. Nothing in the body is trusted until the HMAC
 *    checks out. An unsigned POST to this URL must not be able to mint a key,
 *    which is the entire threat model: the endpoint is public and its address
 *    is guessable.
 *
 * 3. IDEMPOTENCY. Stripe retries for up to three days and explicitly does not
 *    promise to deliver an event only once. Keyed on the Checkout Session id,
 *    a retry returns the licence already issued instead of minting a second
 *    one — otherwise every network blip costs an extra key and a second email.
 *
 * 4. STATUS CODES AS CONTROL FLOW. A 500 makes Stripe retry, and that is a
 *    feature: if the store is unreachable we would rather fail and be asked
 *    again than take the money and lose the key. But anything permanent — a
 *    bad signature, an event we do not handle — must be a 2xx/4xx so Stripe
 *    stops asking. Retrying forever on an event we will never handle is how
 *    an endpoint ends up disabled for repeated failures.
 */

const SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(request: Request) {
  const rawBody = await request.text();

  const verified = verifyStripeSignature(rawBody, request.headers.get("stripe-signature"), SECRET);
  if (!verified.ok) {
    console.warn(`[webhook] Rejected: ${verified.reason}`);
    return Response.json({ error: verified.reason }, { status: 400 });
  }

  const purchase = purchaseFromEvent(verified.event);
  if (!purchase) {
    /* Signed, genuine, and not a paid checkout — an event type we subscribed
       to but do not act on. 200, or Stripe retries it for three days. */
    return Response.json({ received: true, ignored: verified.event.type });
  }

  try {
    const existing = await findLicenseByOrder(purchase.provider, purchase.orderId);
    if (existing) {
      return Response.json({ received: true, licenseIssued: false, reason: "already issued" });
    }

    const record: LicenseRecord = {
      key: generateLicenseKey(),
      email: purchase.email,
      plan: "pro",
      provider: purchase.provider,
      orderId: purchase.orderId,
      createdAt: new Date().toISOString(),
      activations: 0,
    };

    /* Store first, then email. The store is the record; the email is a
       delivery mechanism that the success page already duplicates. Emailing
       first would risk a customer holding a key the server has never heard of. */
    await saveLicense(record);
    await sendLicenseEmail(record.email, record.key);

    console.log(`[webhook] Issued a licence for ${purchase.orderId} (livemode=${purchase.livemode})`);
    return Response.json({ received: true, licenseIssued: true });
  } catch (error) {
    /* The one case worth a 500: the money arrived and we could not record it.
       Stripe will come back, and idempotency makes the retry safe. */
    console.error("[webhook] Could not issue a licence:", error);
    return Response.json({ error: "Could not issue the licence." }, { status: 500 });
  }
}

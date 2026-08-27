/**
 * Stripe, verified by hand.
 *
 * No `stripe` package. The whole integration is a Payment Link (created in
 * the dashboard, zero code) plus this file, and the only thing the SDK would
 * have done for us is the HMAC below — twelve lines against a dependency
 * that pulls in the entire API surface for a site that never calls the API.
 *
 * Everything here follows Stripe's "verify webhook signatures manually"
 * procedure, which is worth stating precisely because getting it subtly
 * wrong still looks like it works:
 *
 *   1. Split `Stripe-Signature` on "," then "=" — `t` is the timestamp, `v1`
 *      is the signature. Ignore every other scheme: `v0` is sent on test
 *      events, and honouring unknown schemes is a downgrade attack.
 *   2. signed_payload = timestamp + "." + the RAW request body.
 *   3. HMAC-SHA256, keyed with the whsec_ secret.
 *   4. Constant-time compare, and reject timestamps outside a tolerance.
 *
 * There can be more than one v1 signature at once: rolling an endpoint
 * secret keeps the old one alive for up to 24 hours and Stripe signs with
 * both. Checking only the first is how a secret roll takes checkout down.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

if (typeof window !== "undefined") {
  throw new Error("lib/payments/stripe.server.ts was imported into client code.");
}

/** Stripe's own libraries default to five minutes. */
const TOLERANCE_SECONDS = 300;

export type VerifiedEvent = {
  id: string;
  type: string;
  livemode?: boolean;
  data: { object: Record<string, unknown> };
};

export type VerifyOutcome =
  | { ok: true; event: VerifiedEvent }
  | { ok: false; reason: string };

function safeEqualHex(a: string, b: string): boolean {
  /* timingSafeEqual throws on a length mismatch, which would itself leak the
     length, so the guard has to come first. */
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

export function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
): VerifyOutcome {
  if (!secret) return { ok: false, reason: "STRIPE_WEBHOOK_SECRET is not set." };
  if (!header) return { ok: false, reason: "Missing Stripe-Signature header." };

  let timestamp = "";
  const signatures: string[] = [];
  for (const part of header.split(",")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (name === "t") timestamp = value;
    else if (name === "v1") signatures.push(value);
  }

  if (!timestamp || signatures.length === 0) {
    return { ok: false, reason: "Malformed Stripe-Signature header." };
  }

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > TOLERANCE_SECONDS) {
    /* The timestamp is inside the signed payload, so an attacker cannot move
       it — but a captured request could be replayed verbatim without this. */
    return { ok: false, reason: "Timestamp outside tolerance." };
  }

  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`, "utf8").digest("hex");
  if (!signatures.some((candidate) => safeEqualHex(candidate, expected))) {
    return { ok: false, reason: "No signature matched." };
  }

  try {
    return { ok: true, event: JSON.parse(rawBody) as VerifiedEvent };
  } catch {
    return { ok: false, reason: "Body was signed but is not JSON." };
  }
}

export type Purchase = {
  provider: "stripe";
  /** The Checkout Session id. Idempotency key and success-page lookup both. */
  orderId: string;
  email: string;
  clientReferenceId: string | null;
  metadataUserId: string | null;
  metadataProductKey: string | null;
  paymentIntentId: string | null;
  customerId: string | null;
  invoiceId: string | null;
  mode: string | null;
  amountSubtotal: number | null;
  amountTotal: number | null;
  currency: string | null;
  livemode: boolean;
};

export type PurchaseContract = {
  amountSubtotal: number;
  currency: string;
  productKey: string;
};

export type ContractOutcome = { ok: true } | { ok: false; reason: string };

/**
 * A genuine Stripe signature proves who sent an event, not what was bought.
 * Keep fulfilment tied to the authenticated account and product that created
 * the server-side Checkout Session.
 *
 * `amount_subtotal`, rather than `amount_total`, is the advertised $49 price:
 * automatic tax may legitimately make the final total higher. A total below
 * the subtotal is rejected as well, so a discount cannot silently turn into a
 * full-price Pro entitlement.
 */
export function verifyPurchaseContract(
  purchase: Purchase,
  expected: PurchaseContract,
): ContractOutcome {
  if (purchase.mode !== "payment") {
    return { ok: false, reason: "Checkout is not a one-time payment." };
  }
  if (purchase.amountSubtotal !== expected.amountSubtotal) {
    return { ok: false, reason: "Checkout subtotal does not match." };
  }
  if (purchase.currency?.toLowerCase() !== expected.currency.toLowerCase()) {
    return { ok: false, reason: "Checkout currency does not match." };
  }
  if (purchase.amountTotal === null || purchase.amountTotal < expected.amountSubtotal) {
    return { ok: false, reason: "Checkout total is below the Pro price." };
  }
  if (!purchase.clientReferenceId || purchase.metadataUserId !== purchase.clientReferenceId) {
    return { ok: false, reason: "Checkout is not tied to an authenticated account." };
  }
  if (purchase.metadataProductKey !== expected.productKey) {
    return { ok: false, reason: "Checkout product metadata does not match." };
  }
  return { ok: true };
}

function objectId(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "id" in value && typeof value.id === "string") {
    return value.id;
  }
  return null;
}

/**
 * A completed one-time purchase, or null if this event is not one.
 *
 * `checkout.session.completed` fires for every finished session, including
 * ones where payment is still pending (a delayed method like a bank debit),
 * so `payment_status` has to be checked as well — fulfilling on the event
 * alone hands out licences for money that has not arrived.
 */
export function purchaseFromEvent(event: VerifiedEvent): Purchase | null {
  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return null;
  }
  const session = event.data.object;
  if (session.payment_status !== "paid") return null;

  const details = session.customer_details as { email?: string } | undefined;
  const email = details?.email ?? (session.customer_email as string | undefined) ?? "";
  const id = typeof session.id === "string" ? session.id : "";
  if (!id || !email) return null;

  const metadata = session.metadata as Record<string, unknown> | null | undefined;

  return {
    provider: "stripe",
    orderId: id,
    email,
    clientReferenceId:
      typeof session.client_reference_id === "string" ? session.client_reference_id : null,
    metadataUserId: typeof metadata?.user_id === "string" ? metadata.user_id : null,
    metadataProductKey:
      typeof metadata?.product_key === "string" ? metadata.product_key : null,
    paymentIntentId: objectId(session.payment_intent),
    customerId: objectId(session.customer),
    invoiceId: objectId(session.invoice),
    mode: typeof session.mode === "string" ? session.mode : null,
    amountSubtotal: typeof session.amount_subtotal === "number" ? session.amount_subtotal : null,
    amountTotal: typeof session.amount_total === "number" ? session.amount_total : null,
    currency: typeof session.currency === "string" ? session.currency : null,
    livemode: Boolean(event.livemode ?? session.livemode ?? false),
  };
}

export type Refund = { paymentIntentId: string };

/** Only a fully refunded charge revokes access; partial refunds do not. */
export function refundFromEvent(event: VerifiedEvent): Refund | null {
  if (event.type !== "charge.refunded") return null;
  const charge = event.data.object;
  if (charge.refunded !== true) return null;
  const paymentIntentId = objectId(charge.payment_intent);
  return paymentIntentId ? { paymentIntentId } : null;
}

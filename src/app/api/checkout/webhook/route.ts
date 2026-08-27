import {
  fulfilPurchase,
  PRO_PRODUCT_KEY,
  refundByPaymentIntent,
} from "@/lib/account-store.server";
import { databaseConfigured } from "@/lib/db.server";
import { sendAccountPurchaseEmail } from "@/lib/email.server";
import {
  purchaseFromEvent,
  refundFromEvent,
  verifyPurchaseContract,
  verifyStripeSignature,
} from "@/lib/payments/stripe.server";
import { PRO_PLAN } from "@/lib/pro";
import { checkoutContainsPrice, stripeApiConfigured } from "@/lib/stripe-client.server";

const SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const verified = verifyStripeSignature(rawBody, request.headers.get("stripe-signature"), SECRET);

  if (!verified.ok) {
    console.warn(`[webhook] Rejected: ${verified.reason}`);
    return Response.json({ error: verified.reason }, { status: 400 });
  }

  const refund = refundFromEvent(verified.event);
  if (refund) {
    if (!databaseConfigured()) {
      return Response.json({ error: "Account database is not configured." }, { status: 500 });
    }
    try {
      const revoked = await refundByPaymentIntent(refund.paymentIntentId);
      return Response.json({ received: true, accessRevoked: revoked });
    } catch (error) {
      console.error("[webhook] Could not process refund:", error);
      return Response.json({ error: "Could not process the refund." }, { status: 500 });
    }
  }

  const purchase = purchaseFromEvent(verified.event);
  if (!purchase) {
    return Response.json({ received: true, ignored: verified.event.type });
  }

  if (!databaseConfigured() || !stripeApiConfigured()) {
    console.error("[webhook] DATABASE_URL, STRIPE_SECRET_KEY, or STRIPE_PRICE_ID is missing.");
    return Response.json({ error: "Account checkout is not configured." }, { status: 500 });
  }

  const contract = verifyPurchaseContract(purchase, {
    amountSubtotal: PRO_PLAN.priceCents,
    currency: PRO_PLAN.currency,
    productKey: PRO_PRODUCT_KEY,
  });
  if (!contract.ok) {
    console.warn(`[webhook] Ignored paid checkout ${purchase.orderId}: ${contract.reason}`);
    return Response.json({ received: true, ignored: "checkout contract mismatch" });
  }

  try {
    const hasExpectedPrice = await checkoutContainsPrice(
      purchase.orderId,
      process.env.STRIPE_PRICE_ID!,
    );
    if (!hasExpectedPrice) {
      console.warn(`[webhook] Ignored paid checkout ${purchase.orderId}: Price id does not match.`);
      return Response.json({ received: true, ignored: "checkout price mismatch" });
    }

    const newlyGranted = await fulfilPurchase({
      userId: purchase.clientReferenceId!,
      email: purchase.email,
      checkoutSessionId: purchase.orderId,
      paymentIntentId: purchase.paymentIntentId,
      customerId: purchase.customerId,
      invoiceId: purchase.invoiceId,
      amountSubtotal: purchase.amountSubtotal!,
      amountTotal: purchase.amountTotal!,
      currency: purchase.currency!,
      livemode: purchase.livemode,
    });

    if (newlyGranted) await sendAccountPurchaseEmail(purchase.email);
    console.log(
      `[webhook] ${newlyGranted ? "Granted" : "Confirmed"} account access for ${purchase.orderId}`,
    );
    return Response.json({ received: true, accessGranted: newlyGranted });
  } catch (error) {
    console.error("[webhook] Could not grant account access:", error);
    return Response.json({ error: "Could not grant account access." }, { status: 500 });
  }
}

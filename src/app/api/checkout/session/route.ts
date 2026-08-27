import { hasActiveEntitlement, PRO_PRODUCT_KEY, upsertAccountUser } from "@/lib/account-store.server";
import { getViewer } from "@/lib/auth.server";
import { databaseConfigured } from "@/lib/db.server";
import { PRO_PLAN } from "@/lib/pro";
import { SITE_URL } from "@/lib/site";
import { getStripe, priceMatchesPlan, stripeApiConfigured } from "@/lib/stripe-client.server";

export async function POST() {
  const viewer = await getViewer();
  if (!viewer) return Response.redirect(`${SITE_URL}/sign-in`, 303);
  if (!databaseConfigured() || !stripeApiConfigured()) {
    return Response.json({ error: "Account checkout is not configured." }, { status: 503 });
  }
  if (await hasActiveEntitlement(viewer.id)) {
    return Response.redirect(`${SITE_URL}/dashboard`, 303);
  }

  await upsertAccountUser(viewer.id, viewer.email);
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID!;
  if (!(await priceMatchesPlan({
    priceId,
    amount: PRO_PLAN.priceCents,
    currency: PRO_PLAN.currency,
  }))) {
    console.error("[checkout] STRIPE_PRICE_ID is not the active one-time US$49 Pro price.");
    return Response.json({ error: "The Pro price is misconfigured." }, { status: 503 });
  }
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: viewer.id,
    customer_email: viewer.email,
    customer_creation: "always",
    automatic_tax: { enabled: true },
    allow_promotion_codes: false,
    invoice_creation: { enabled: true },
    metadata: {
      user_id: viewer.id,
      product_key: PRO_PRODUCT_KEY,
      advertised_price_cents: String(PRO_PLAN.priceCents),
    },
    success_url: `${SITE_URL}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/pro?checkout=cancelled`,
  });
  if (!session.url) {
    return Response.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
  }
  return Response.redirect(session.url, 303);
}

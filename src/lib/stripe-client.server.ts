import Stripe from "stripe";

if (typeof window !== "undefined") {
  throw new Error("lib/stripe-client.server.ts was imported into client code.");
}

let client: Stripe | null = null;

export function stripeApiConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

export function getStripe(): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("STRIPE_SECRET_KEY is not configured.");
  if (!client) client = new Stripe(secret);
  return client;
}

export async function checkoutContainsPrice(
  sessionId: string,
  expectedPriceId: string,
): Promise<boolean> {
  const stripe = getStripe();
  const items = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 10 });
  return (
    items.data.length === 1 &&
    items.data[0]?.price?.id === expectedPriceId &&
    items.data[0]?.quantity === 1
  );
}

export async function priceMatchesPlan({
  priceId,
  amount,
  currency,
}: {
  priceId: string;
  amount: number;
  currency: string;
}): Promise<boolean> {
  const price = await getStripe().prices.retrieve(priceId);
  return (
    price.active &&
    price.type === "one_time" &&
    price.unit_amount === amount &&
    price.currency.toLowerCase() === currency.toLowerCase()
  );
}

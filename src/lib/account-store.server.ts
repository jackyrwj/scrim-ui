import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getSql } from "./db.server";

if (typeof window !== "undefined") {
  throw new Error("lib/account-store.server.ts was imported into client code.");
}

export const PRO_PRODUCT_KEY = "scrim-ui-pro";

type PurchaseInput = {
  userId: string;
  email: string;
  checkoutSessionId: string;
  paymentIntentId: string | null;
  customerId: string | null;
  invoiceId: string | null;
  amountSubtotal: number;
  amountTotal: number;
  currency: string;
  livemode: boolean;
};

export type DashboardPurchase = {
  id: number;
  amountTotal: number;
  currency: string;
  status: "paid" | "refunded";
  createdAt: string;
  hasInvoice: boolean;
};

export type DashboardData = {
  hasPro: boolean;
  purchases: DashboardPurchase[];
};

export type ApiTokenSummary = {
  id: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function upsertAccountUser(
  userId: string,
  email: string,
  customerId: string | null = null,
): Promise<void> {
  const sql = getSql();
  await sql`
    INSERT INTO app_users (id, email, stripe_customer_id)
    VALUES (${userId}, ${email.trim().toLowerCase()}, ${customerId})
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, app_users.stripe_customer_id),
      updated_at = NOW()
  `;
}

export async function hasActiveEntitlement(
  userId: string,
  productKey = PRO_PRODUCT_KEY,
): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    SELECT 1
    FROM entitlements
    WHERE user_id = ${userId} AND product_key = ${productKey} AND status = 'active'
    LIMIT 1
  `;
  return rows.length > 0;
}

/** One SQL statement: the order ledger and entitlement move atomically. */
export async function fulfilPurchase(input: PurchaseInput): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    WITH account AS (
      INSERT INTO app_users (id, email, stripe_customer_id)
      VALUES (${input.userId}, ${input.email.trim().toLowerCase()}, ${input.customerId})
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, app_users.stripe_customer_id),
        updated_at = NOW()
      RETURNING id
    ), purchase AS (
      INSERT INTO purchases (
        user_id,
        stripe_checkout_session_id,
        stripe_payment_intent_id,
        stripe_customer_id,
        stripe_invoice_id,
        email,
        product_key,
        amount_subtotal,
        amount_total,
        currency,
        livemode,
        status
      ) VALUES (
        ${input.userId},
        ${input.checkoutSessionId},
        ${input.paymentIntentId},
        ${input.customerId},
        ${input.invoiceId},
        ${input.email.trim().toLowerCase()},
        ${PRO_PRODUCT_KEY},
        ${input.amountSubtotal},
        ${input.amountTotal},
        ${input.currency.toLowerCase()},
        ${input.livemode},
        'paid'
      )
      ON CONFLICT (stripe_checkout_session_id) DO NOTHING
      RETURNING id
    ), entitlement AS (
      INSERT INTO entitlements (user_id, product_key, status, source_purchase_id)
      SELECT ${input.userId}, ${PRO_PRODUCT_KEY}, 'active', id FROM purchase
      ON CONFLICT (user_id, product_key) DO UPDATE SET
        status = 'active',
        source_purchase_id = EXCLUDED.source_purchase_id,
        revoked_at = NULL,
        updated_at = NOW()
      RETURNING 1
    )
    SELECT (SELECT COUNT(*) FROM entitlement)::int AS granted
  `;
  return Number(rows[0]?.granted ?? 0) > 0;
}

export async function refundByPaymentIntent(paymentIntentId: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    WITH refunded AS (
      UPDATE purchases
      SET status = 'refunded', updated_at = NOW()
      WHERE stripe_payment_intent_id = ${paymentIntentId} AND status <> 'refunded'
      RETURNING id, user_id, product_key
    ), revoked AS (
      UPDATE entitlements AS entitlement
      SET status = 'revoked', revoked_at = NOW(), updated_at = NOW()
      FROM refunded
      WHERE entitlement.user_id = refunded.user_id
        AND entitlement.product_key = refunded.product_key
        AND entitlement.source_purchase_id = refunded.id
        AND NOT EXISTS (
          SELECT 1 FROM purchases AS other_purchase
          WHERE other_purchase.user_id = refunded.user_id
            AND other_purchase.product_key = refunded.product_key
            AND other_purchase.status = 'paid'
        )
      RETURNING 1
    )
    SELECT (SELECT COUNT(*) FROM revoked)::int AS revoked
  `;
  return Number(rows[0]?.revoked ?? 0) > 0;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const sql = getSql();
  const [entitlements, purchases] = await Promise.all([
    sql`
      SELECT 1 FROM entitlements
      WHERE user_id = ${userId} AND product_key = ${PRO_PRODUCT_KEY} AND status = 'active'
      LIMIT 1
    `,
    sql`
      SELECT id, amount_total, currency, status, created_at, stripe_invoice_id
      FROM purchases
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 20
    `,
  ]);

  return {
    hasPro: entitlements.length > 0,
    purchases: purchases.map((row) => ({
      id: Number(row.id),
      amountTotal: Number(row.amount_total),
      currency: String(row.currency),
      status: row.status === "refunded" ? "refunded" : "paid",
      createdAt: new Date(String(row.created_at)).toISOString(),
      hasInvoice: Boolean(row.stripe_invoice_id),
    })),
  };
}

export async function getInvoiceForUser(
  userId: string,
  purchaseId: number,
): Promise<string | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT stripe_invoice_id
    FROM purchases
    WHERE id = ${purchaseId} AND user_id = ${userId}
    LIMIT 1
  `;
  return typeof rows[0]?.stripe_invoice_id === "string" ? rows[0].stripe_invoice_id : null;
}

export async function listApiTokens(userId: string): Promise<ApiTokenSummary[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, token_prefix, created_at, last_used_at
    FROM api_tokens
    WHERE user_id = ${userId} AND revoked_at IS NULL
    ORDER BY created_at DESC
  `;
  return rows.map((row) => ({
    id: String(row.id),
    prefix: String(row.token_prefix),
    createdAt: new Date(String(row.created_at)).toISOString(),
    lastUsedAt: row.last_used_at ? new Date(String(row.last_used_at)).toISOString() : null,
  }));
}

export async function createApiToken(
  userId: string,
): Promise<{ token: string; summary: ApiTokenSummary }> {
  if (!(await hasActiveEntitlement(userId))) {
    throw new Error("An active Pro entitlement is required.");
  }

  const sql = getSql();
  const id = randomUUID();
  const token = `scrim_pat_${randomBytes(32).toString("base64url")}`;
  const prefix = `${token.slice(0, 18)}…`;
  const rows = await sql`
    INSERT INTO api_tokens (id, user_id, token_hash, token_prefix)
    VALUES (${id}, ${userId}, ${hashToken(token)}, ${prefix})
    RETURNING id, token_prefix, created_at, last_used_at
  `;
  const row = rows[0];
  return {
    token,
    summary: {
      id: String(row.id),
      prefix: String(row.token_prefix),
      createdAt: new Date(String(row.created_at)).toISOString(),
      lastUsedAt: null,
    },
  };
}

export async function revokeApiToken(userId: string, tokenId: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    UPDATE api_tokens
    SET revoked_at = NOW()
    WHERE id = ${tokenId} AND user_id = ${userId} AND revoked_at IS NULL
    RETURNING 1
  `;
  return rows.length > 0;
}

export async function verifyApiToken(token: string): Promise<boolean> {
  if (!token.startsWith("scrim_pat_")) return false;
  const sql = getSql();
  const rows = await sql`
    SELECT token.id
    FROM api_tokens AS token
    JOIN entitlements AS entitlement
      ON entitlement.user_id = token.user_id
      AND entitlement.product_key = ${PRO_PRODUCT_KEY}
      AND entitlement.status = 'active'
    WHERE token.token_hash = ${hashToken(token)} AND token.revoked_at IS NULL
    LIMIT 1
  `;
  const id = rows[0]?.id;
  if (typeof id !== "string") return false;
  void sql`UPDATE api_tokens SET last_used_at = NOW() WHERE id = ${id}`.catch(() => {});
  return true;
}

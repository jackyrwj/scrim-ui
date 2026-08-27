/**
 * Licence checking, server side.
 *
 * The one question every gated surface asks — "is this key good?" — and the
 * only place that knows how it is answered. Phase 1 answered it from a
 * comma-separated environment variable; it now answers it from the store,
 * which is exactly the swap that seam was left here for. Every caller (the
 * API routes, the registry endpoint, the dialog behind them) is unchanged
 * apart from an `await`.
 *
 * The `window` guard below stands in for the `server-only` package: importing
 * this from a client component would inline the store's credentials into the
 * browser bundle, which is the one mistake that would make the whole gate
 * decorative. A thrown error at import time is loud enough, and the project
 * keeps its dependency list short on purpose.
 */

import { normalizeKey } from "./license-key";
import { findLicense, recordActivation, storeConfigured } from "./license-store.server";

if (typeof window !== "undefined") {
  throw new Error("lib/licenses.server.ts was imported into client code — the key list must never ship to the browser.");
}

export type LicenseCheck = { valid: true; plan: string } | { valid: false; error: string };

export async function checkLicense(key: unknown): Promise<LicenseCheck> {
  const normalized = normalizeKey(key);
  if (!normalized) return { valid: false, error: "Enter a licence key." };

  if (!storeConfigured() && !process.env.SCRIM_PRO_LICENSE_KEYS) {
    /* Said plainly rather than as "invalid key": an unconfigured deploy and a
       wrong key are different problems, and conflating them is how a
       misconfiguration gets debugged as a customer complaint. */
    return { valid: false, error: "Licence checks are not configured on this deployment." };
  }

  const record = await findLicense(normalized);
  if (!record) return { valid: false, error: "That key was not recognised." };
  if (record.revoked) {
    /* A refund is not a mistake the customer made, so it does not get the
       error a typo gets. */
    return { valid: false, error: "This licence has been refunded or revoked." };
  }

  /* Bookkeeping, not authorisation — never awaited into the answer. A Redis
     hiccup must not be the reason a paying customer cannot read their source. */
  void recordActivation(record).catch(() => {});

  return { valid: true, plan: record.plan || "pro" };
}

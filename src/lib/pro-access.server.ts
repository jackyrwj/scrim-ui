import { auth } from "@clerk/nextjs/server";
import { hasActiveEntitlement, verifyApiToken } from "./account-store.server";
import { clerkConfigured } from "./auth.server";
import { databaseConfigured } from "./db.server";
import { checkLicense } from "./licenses.server";

if (typeof window !== "undefined") {
  throw new Error("lib/pro-access.server.ts was imported into client code.");
}

export type ProAccessCheck =
  | { valid: true; mode: "account" | "token" | "license" }
  | { valid: false; error: string };

/** Secure authorization at the data boundary, with legacy keys as fallback. */
export async function checkProAccess({
  key,
  token,
}: {
  key?: unknown;
  token?: unknown;
}): Promise<ProAccessCheck> {
  if (clerkConfigured() && databaseConfigured()) {
    const { userId } = await auth();
    if (userId && (await hasActiveEntitlement(userId))) {
      return { valid: true, mode: "account" };
    }
  }

  if (databaseConfigured() && typeof token === "string" && (await verifyApiToken(token))) {
    return { valid: true, mode: "token" };
  }

  const legacy = await checkLicense(key);
  return legacy.valid
    ? { valid: true, mode: "license" }
    : { valid: false, error: legacy.error };
}

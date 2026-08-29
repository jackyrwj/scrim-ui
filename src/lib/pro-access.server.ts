import { auth } from "@clerk/nextjs/server";
import { hasActiveEntitlement, verifyApiToken } from "./account-store.server";
import { clerkConfigured } from "./auth.server";
import { databaseConfigured } from "./db.server";

if (typeof window !== "undefined") {
  throw new Error("lib/pro-access.server.ts was imported into client code.");
}

export type ProAccessCheck =
  | { valid: true; mode: "account" | "token" }
  | { valid: false; error: string };

/** Secure authorization at the data boundary: account session or CLI token. */
export async function checkProAccess({
  token,
}: {
  token?: unknown;
} = {}): Promise<ProAccessCheck> {
  if (clerkConfigured() && databaseConfigured()) {
    const { userId } = await auth();
    if (userId && (await hasActiveEntitlement(userId))) {
      return { valid: true, mode: "account" };
    }
  }

  if (databaseConfigured() && typeof token === "string" && (await verifyApiToken(token))) {
    return { valid: true, mode: "token" };
  }

  return {
    valid: false,
    error: "Pro access requires a signed-in account with Pro, or a valid API token.",
  };
}

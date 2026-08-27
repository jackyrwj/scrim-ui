import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

if (typeof window !== "undefined") {
  throw new Error("lib/db.server.ts was imported into client code.");
}

let client: NeonQueryFunction<false, false> | null = null;

export function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Lazy so a first build can succeed before the Marketplace database exists. */
export function getSql(): NeonQueryFunction<false, false> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured.");
  if (!client) client = neon(url);
  return client;
}

/**
 * Where issued licences live.
 *
 * Upstash Redis over its REST API, which is a deliberate choice on two
 * counts. It is reached with plain `fetch`, so the store adds no dependency
 * to a project that has kept its list to five — and licence checking is
 * literally a key lookup, on the hot path of every unlock, which is the one
 * shape a key-value store is unambiguously better at than SQL.
 *
 * When Upstash is not configured the store falls back to the
 * SCRIM_PRO_LICENSE_KEYS allowlist that Phase 1 shipped with, so local
 * development and the current deployment keep working unchanged. The
 * fallback is read-only on purpose: a webhook that "succeeds" while dropping
 * the key it just issued would take a customer's money and give them
 * nothing, so writes throw instead, Stripe sees a 500, and Stripe retries.
 */

if (typeof window !== "undefined") {
  throw new Error("lib/license-store.server.ts was imported into client code.");
}

export type LicenseRecord = {
  key: string;
  email: string;
  plan: string;
  /** Which processor issued it — the field that makes a later move off Stripe legible. */
  provider: string;
  /** The processor's order/session id. Also the idempotency key. */
  orderId: string;
  createdAt: string;
  /** Bumped on every successful verify. Not a limit, a signal: a key with
   *  4,000 activations across the world is one that got posted somewhere. */
  activations: number;
  lastSeenAt?: string;
  revoked?: boolean;
};

const REST_URL = process.env.UPSTASH_REDIS_REST_URL ?? "";
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

export function storeConfigured(): boolean {
  return Boolean(REST_URL && REST_TOKEN);
}

/** One Redis command. Upstash takes the command as a JSON array. */
async function command<T>(...args: (string | number)[]): Promise<T | null> {
  const response = await fetch(REST_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${REST_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Redis ${args[0]} failed: ${response.status} ${await response.text()}`);
  }
  const data = (await response.json()) as { result?: T };
  return data.result ?? null;
}

const licenseKey = (key: string) => `license:${key}`;
const emailKey = (email: string) => `email:${email.trim().toLowerCase()}`;
const orderKey = (provider: string, orderId: string) => `order:${provider}:${orderId}`;

/* ------------------------------------------------------------------ reads */

export async function findLicense(key: string): Promise<LicenseRecord | null> {
  if (!storeConfigured()) {
    const allowed = (process.env.SCRIM_PRO_LICENSE_KEYS ?? "")
      .split(",")
      .map((k) => k.trim().toUpperCase())
      .filter(Boolean);
    if (!allowed.includes(key)) return null;
    return {
      key,
      email: "",
      plan: "pro",
      provider: "env",
      orderId: "",
      createdAt: new Date(0).toISOString(),
      activations: 0,
    };
  }
  const raw = await command<string>("GET", licenseKey(key));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LicenseRecord;
  } catch {
    /* A record we cannot parse is a record we cannot trust to be a licence. */
    return null;
  }
}

/** The licence issued for a processor order, if any. Used for both
 *  idempotency in the webhook and instant delivery on the success page. */
export async function findLicenseByOrder(
  provider: string,
  orderId: string,
): Promise<LicenseRecord | null> {
  if (!storeConfigured()) return null;
  const key = await command<string>("GET", orderKey(provider, orderId));
  return key ? findLicense(key) : null;
}

export async function findLicensesByEmail(email: string): Promise<LicenseRecord[]> {
  if (!storeConfigured()) return [];
  const keys = (await command<string[]>("SMEMBERS", emailKey(email))) ?? [];
  const records = await Promise.all(keys.map(findLicense));
  return records.filter((r): r is LicenseRecord => r !== null && !r.revoked);
}

/* ----------------------------------------------------------------- writes */

function requireStore() {
  if (!storeConfigured()) {
    throw new Error(
      "No licence store is configured (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN). " +
        "Refusing to issue a licence that cannot be saved.",
    );
  }
}

export async function saveLicense(record: LicenseRecord): Promise<void> {
  requireStore();
  await command("SET", licenseKey(record.key), JSON.stringify(record));
  if (record.email) await command("SADD", emailKey(record.email), record.key);
  if (record.orderId) await command("SET", orderKey(record.provider, record.orderId), record.key);
}

/**
 * Counts a successful verification.
 *
 * Deliberately fire-and-forget at the call site: this is bookkeeping, and a
 * Redis hiccup must never be the reason a paying customer cannot read the
 * source they bought.
 */
export async function recordActivation(record: LicenseRecord): Promise<void> {
  if (!storeConfigured()) return;
  await command(
    "SET",
    licenseKey(record.key),
    JSON.stringify({
      ...record,
      activations: (record.activations ?? 0) + 1,
      lastSeenAt: new Date().toISOString(),
    }),
  );
}

export async function revokeLicense(key: string): Promise<boolean> {
  requireStore();
  const record = await findLicense(key);
  if (!record) return false;
  await command("SET", licenseKey(key), JSON.stringify({ ...record, revoked: true }));
  return true;
}

/* ----------------------------------------------------------- rate limiting */

/**
 * A key is guessable in principle, so /api/license/verify is a brute-force
 * surface. One counter per IP per minute, expiring on its own. Silently
 * allows when there is no store — the alternative, failing closed with no
 * Redis, would lock every customer out of a working site.
 */
export async function withinRateLimit(ip: string, limit = 20): Promise<boolean> {
  if (!storeConfigured() || !ip) return true;
  try {
    const bucket = `rl:verify:${ip}:${Math.floor(Date.now() / 60_000)}`;
    const count = (await command<number>("INCR", bucket)) ?? 0;
    if (count === 1) await command("EXPIRE", bucket, 120);
    return count <= limit;
  } catch {
    return true;
  }
}

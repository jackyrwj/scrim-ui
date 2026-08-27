/**
 * Spend limits for the public demo.
 *
 * This file exists only in the demo overlay. The template you buy has no
 * rate limiter, because the template runs on YOUR key for YOUR users — this
 * one runs on my key for strangers, and that is a different problem.
 *
 * Upstash Redis over its REST API, reached with plain `fetch`. Same store the
 * main site uses for licences, no new dependency, and two counters is all
 * this needs.
 *
 * FAILS CLOSED, which is the opposite of the licence limiter on the main
 * site, and the difference is worth stating. There, a Redis outage that
 * blocked verification would lock paying customers out of source they already
 * own — so it fails open. Here, a Redis outage that skips the check leaves an
 * AI gateway key answering the open internet with no ceiling. A demo that is
 * down for twenty minutes costs a few visitors; a demo with no cap costs
 * whatever someone with a loop decides it costs.
 */

const REST_URL = process.env.UPSTASH_REDIS_REST_URL ?? "";
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

/** Requests per IP per minute. Stops a loop before it becomes a bill. */
const PER_MINUTE = 5;
/** Requests per IP per day. Stops a patient loop. */
const PER_DAY = 25;

export type LimitResult =
  | { ok: true }
  | { ok: false; status: number; message: string };

function configured(): boolean {
  return Boolean(REST_URL && REST_TOKEN);
}

async function incr(bucket: string, ttl: number): Promise<number> {
  const response = await fetch(REST_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${REST_TOKEN}`,
      "content-type": "application/json",
    },
    /* Upstash pipelines an array of commands in one round trip, so the
       counter and its expiry cost the same as the counter alone. EXPIRE is
       unconditional rather than only-on-first-INCR: setting it again on an
       existing key is a no-op that costs nothing, and the alternative is a
       key that lost its TTL to a race and never counts down again. */
    body: JSON.stringify([
      ["INCR", bucket],
      ["EXPIRE", bucket, ttl, "NX"],
    ]),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Redis ${response.status}`);
  const results = (await response.json()) as { result?: number }[];
  return results[0]?.result ?? 0;
}

/**
 * The caller's IP, as far as it can be known.
 *
 * `x-forwarded-for` is a client-supplied header everywhere except behind a
 * proxy that overwrites it — which Vercel does. Taking the FIRST entry is
 * correct there and only there; on a host that appends instead of replacing,
 * the first entry is whatever the client typed and this becomes trivially
 * bypassable. If you deploy this somewhere else, read your platform's docs
 * before trusting this line.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip")?.trim() ?? "";
}

export async function checkLimit(req: Request): Promise<LimitResult> {
  if (!configured()) {
    /* Unconfigured in development is fine — you are spending your own key on
       your own machine. Unconfigured in production means the ceiling this
       whole file exists to enforce is not there, and serving anyway would be
       a silent decision to have no limit at all. */
    if (process.env.NODE_ENV !== "production") return { ok: true };
    return {
      ok: false,
      status: 503,
      message: "The demo is not configured right now. Try again later.",
    };
  }

  const ip = clientIp(req);
  if (!ip) {
    return { ok: false, status: 503, message: "The demo could not verify the request." };
  }

  try {
    const minute = Math.floor(Date.now() / 60_000);
    const day = Math.floor(Date.now() / 86_400_000);
    const [burst, daily] = await Promise.all([
      incr(`demo:m:${ip}:${minute}`, 120),
      incr(`demo:d:${ip}:${day}`, 172_800),
    ]);

    if (burst > PER_MINUTE) {
      return {
        ok: false,
        status: 429,
        message: "That is a lot of messages at once. Wait a minute and try again.",
      };
    }
    if (daily > PER_DAY) {
      return {
        ok: false,
        status: 429,
        message:
          "You have used up today's demo messages. The template itself has no limit — " +
          "it runs on your own API key.",
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      status: 503,
      message: "The demo is briefly unavailable. Try again in a moment.",
    };
  }
}
